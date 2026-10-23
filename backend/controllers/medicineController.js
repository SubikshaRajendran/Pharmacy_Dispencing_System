const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const StockTransaction = require('../models/StockTransaction');
const logAudit = require('../utils/auditLogger');

// @desc Get all medicines with filter & search
// @route GET /api/medicines
const getMedicines = async (req, res) => {
  try {
    const { category, search, activeOnly = 'true' } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.active = true;
    }

    if (category && category !== 'All Categories' && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const medicines = await Medicine.find(query).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single medicine with batch details
// @route GET /api/medicines/:id
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const batches = await MedicineBatch.find({ medicineId: medicine._id }).sort({ expiryDate: 1 });
    res.json({ medicine, batches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new medicine
// @route POST /api/medicines
const createMedicine = async (req, res) => {
  try {
    const { name, category, description, manufacturer, unit, price, discountPrice, isPrescriptionRequired, image } = req.body;

    const medicine = await Medicine.create({
      name,
      category,
      description,
      manufacturer,
      unit,
      price,
      discountPrice,
      isPrescriptionRequired,
      image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      totalStock: 0
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'CREATE_MEDICINE',
      targetType: 'Medicine',
      targetId: medicine._id.toString(),
      changeSummary: `Created new medicine: ${medicine.name}`
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update medicine details
// @route PUT /api/medicines/:id
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    Object.assign(medicine, req.body);
    await medicine.save();

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'UPDATE_MEDICINE',
      targetType: 'Medicine',
      targetId: medicine._id.toString(),
      changeSummary: `Updated medicine details for ${medicine.name}`
    });

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add new stock batch to medicine (FEFO)
// @route POST /api/medicines/:id/batches
const addMedicineBatch = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const { batchNumber, quantityReceived, expiryDate, costPrice, sellingPrice, supplier } = req.body;

    const batch = await MedicineBatch.create({
      medicineId: medicine._id,
      batchNumber,
      quantityReceived,
      remainingQuantity: quantityReceived,
      expiryDate,
      costPrice,
      sellingPrice,
      supplier
    });

    // Update total stock count on Medicine
    medicine.totalStock += Number(quantityReceived);
    if (sellingPrice && sellingPrice !== medicine.price) {
      medicine.price = sellingPrice;
    }
    await medicine.save();

    // Create Stock Transaction
    await StockTransaction.create({
      medicineId: medicine._id,
      batchId: batch._id,
      transactionType: 'RECEIPT',
      quantityChange: Number(quantityReceived),
      actorId: req.user.id,
      actorRole: req.user.role,
      reason: `Added stock batch ${batchNumber}`
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'ADD_STOCK_BATCH',
      targetType: 'MedicineBatch',
      targetId: batch._id.toString(),
      changeSummary: `Added batch ${batchNumber} (+${quantityReceived} units) to ${medicine.name}`
    });

    res.status(201).json({ medicine, batch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  addMedicineBatch
};
