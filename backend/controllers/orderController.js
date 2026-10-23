const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const Prescription = require('../models/Prescription');
const StockTransaction = require('../models/StockTransaction');
const Notification = require('../models/Notification');
const logAudit = require('../utils/auditLogger');

// @desc Create Order (Buy Now / Checkout)
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, prescriptionId, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phone) {
      return res.status(400).json({ message: 'Please provide complete delivery address details' });
    }

    // Verify Prescription if attached
    let prescriptionDoc = null;
    if (prescriptionId) {
      prescriptionDoc = await Prescription.findById(prescriptionId);
      if (!prescriptionDoc || prescriptionDoc.status !== 'Verified') {
        return res.status(400).json({ message: 'Prescription must be verified before placing order' });
      }
    }

    let subtotal = 0;
    const processedItems = [];

    // Check stock & deduct using FEFO (First Expiry First Out) strategy
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine || !medicine.active) {
        return res.status(400).json({ message: `Medicine '${item.name}' is no longer available` });
      }

      if (medicine.totalStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for '${medicine.name}'. Requested: ${item.quantity}, Available: ${medicine.totalStock}`
        });
      }

      // Backend price calculation (never trust frontend prices)
      const itemPrice = medicine.discountPrice > 0 ? medicine.discountPrice : medicine.price;
      const itemSubtotal = Number((itemPrice * item.quantity).toFixed(2));
      subtotal += itemSubtotal;

      // Find available batches sorted by expiryDate ascending (FEFO)
      const batches = await MedicineBatch.find({
        medicineId: medicine._id,
        remainingQuantity: { $gt: 0 },
        expiryDate: { $gt: new Date() }
      }).sort({ expiryDate: 1 });

      let remainingToDeduct = item.quantity;
      let primaryBatchId = null;

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        const deductFromBatch = Math.min(batch.remainingQuantity, remainingToDeduct);
        batch.remainingQuantity -= deductFromBatch;
        await batch.save();

        if (!primaryBatchId) primaryBatchId = batch._id;

        // Record stock transaction for this batch
        await StockTransaction.create({
          medicineId: medicine._id,
          batchId: batch._id,
          transactionType: 'DISPENSE',
          quantityChange: -deductFromBatch,
          actorId: req.user.id,
          actorRole: req.user.role,
          reason: `Dispensed for Order checkout`
        });

        remainingToDeduct -= deductFromBatch;
      }

      // Update total stock count on Medicine
      medicine.totalStock -= item.quantity;
      await medicine.save();

      processedItems.push({
        medicineId: medicine._id,
        batchId: primaryBatchId,
        name: medicine.name,
        quantity: item.quantity,
        unitPrice: itemPrice,
        subtotal: itemSubtotal
      });
    }

    const deliveryCharge = subtotal > 50 ? 0 : 5.00;
    const totalAmount = Number((subtotal + deliveryCharge).toFixed(2));
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await Order.create({
      orderId,
      userId: req.user._id,
      prescriptionId: prescriptionDoc ? prescriptionDoc._id : null,
      items: processedItems,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryCharge,
      totalAmount,
      deliveryAddress,
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      statusHistory: [
        {
          status: 'Confirmed',
          note: 'Order successfully placed and payment received',
          updatedBy: 'System'
        }
      ]
    });

    // Create Notification
    await Notification.create({
      userId: req.user._id.toString(),
      title: 'Order Confirmed!',
      message: `Your order #${order.orderId} of $${totalAmount} has been placed successfully.`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    // Log Audit Trail
    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'PLACE_ORDER',
      targetType: 'Order',
      targetId: order._id.toString(),
      changeSummary: `Placed order #${order.orderId} for $${totalAmount} (${processedItems.length} items)`
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user's orders
// @route GET /api/orders/my
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order details by ID
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('prescriptionId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders (Pharmacist / Admin)
// @route GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Doctor's patient orders (Orders placed using Doctor's verified prescription)
// @route GET /api/orders/doctor
const getDoctorOrders = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user.doctorId.toLowerCase() }).select('_id');
    const prescriptionIds = prescriptions.map(p => p._id);

    const orders = await Order.find({ prescriptionId: { $in: prescriptionIds } })
      .populate('userId', 'name email phone')
      .populate('prescriptionId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update Order Status (Pharmacist / Admin)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingReference, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    if (trackingReference) order.trackingReference = trackingReference;

    order.statusHistory.push({
      status: orderStatus,
      note: note || `Order status updated to ${orderStatus}`,
      updatedBy: `${req.user.name} (${req.user.role})`
    });

    await order.save();

    // Create notification for patient
    await Notification.create({
      userId: order.userId.toString(),
      title: `Order Status: ${orderStatus}`,
      message: `Your order #${order.orderId} status is now: ${orderStatus}. ${trackingReference ? 'Tracking Code: ' + trackingReference : ''}`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'Order',
      targetId: order._id.toString(),
      changeSummary: `Updated order #${order.orderId} status to ${orderStatus}`
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  getDoctorOrders,
  updateOrderStatus
};
