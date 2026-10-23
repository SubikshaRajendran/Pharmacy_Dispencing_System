const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const logAudit = require('../utils/auditLogger');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'mediheal_secure_jwt_secret_key_2026_pharmacy_audit_system',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc Register User
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'user'
    });

    await logAudit({
      actorId: user._id.toString(),
      actorRole: 'user',
      actorName: user.name,
      action: 'USER_REGISTER',
      targetType: 'User',
      targetId: user._id.toString(),
      changeSummary: `New user registration for ${user.email}`
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      deliveryAddress: user.deliveryAddress || null,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login User / Pharmacist / Admin
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      await logAudit({
        actorId: 'anonymous',
        actorRole: 'unknown',
        action: 'FAILED_LOGIN_ATTEMPT',
        changeSummary: `Failed login attempt for email: ${email}`
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    await logAudit({
      actorId: user._id.toString(),
      actorRole: user.role,
      actorName: user.name,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      changeSummary: `Successful login as ${user.role}`
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      deliveryAddress: user.deliveryAddress || null,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Doctor Login
// @route POST /api/auth/doctor-login
const loginDoctor = async (req, res) => {
  try {
    const { doctorId, password } = req.body;

    if (!doctorId || !password) {
      return res.status(400).json({ message: 'Please provide Doctor ID and password' });
    }

    const doctor = await Doctor.findOne({ doctorId: doctorId.toLowerCase().trim() });
    if (!doctor || !(await doctor.matchPassword(password))) {
      await logAudit({
        actorId: doctorId,
        actorRole: 'doctor',
        action: 'FAILED_DOCTOR_LOGIN',
        changeSummary: `Failed doctor login for ID: ${doctorId}`
      });
      return res.status(401).json({ message: 'Invalid Doctor ID or password' });
    }

    if (doctor.status === 'inactive' || doctor.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'Doctor account is not active or verified' });
    }

    await logAudit({
      actorId: doctor.doctorId,
      actorRole: 'doctor',
      actorName: doctor.name,
      action: 'DOCTOR_LOGIN',
      targetType: 'Doctor',
      targetId: doctor._id.toString(),
      changeSummary: `Doctor ${doctor.name} logged in successfully`
    });

    res.json({
      _id: doctor._id,
      doctorId: doctor.doctorId,
      name: doctor.name,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      hospitalName: doctor.hospitalName,
      role: 'doctor',
      requiresPasswordReset: doctor.requiresPasswordReset,
      token: generateToken(doctor.doctorId, 'doctor')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Doctor Password Change
// @route POST /api/auth/doctor-change-password
const changeDoctorPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const doctor = await Doctor.findOne({ doctorId: req.user.doctorId });

    if (!doctor || !(await doctor.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    doctor.password = newPassword;
    doctor.requiresPasswordReset = false;
    await doctor.save();

    await logAudit({
      actorId: doctor.doctorId,
      actorRole: 'doctor',
      actorName: doctor.name,
      action: 'DOCTOR_PASSWORD_CHANGE',
      changeSummary: 'Doctor updated password on initial login'
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Current User Profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc Update Delivery Address for Logged-In User
// @route PUT /api/auth/address
const updateDeliveryAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: 'Please provide all required address fields' });
    }

    // Phone number validation: must contain at least 7 digits and valid phone characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return res.status(400).json({ message: 'Please enter a valid contact phone number with at least 7 digits' });
    }

    // Postal code validation: between 3 and 12 characters (alphanumeric/spaces/hyphens)
    const cleanPostal = postalCode.trim();
    if (cleanPostal.length < 3 || cleanPostal.length > 12) {
      return res.status(400).json({ message: 'Please enter a valid postal / ZIP code (3-12 characters)' });
    }

    user.deliveryAddress = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: cleanPostal,
      country: country.trim()
    };

    const updatedUser = await user.save();

    await logAudit({
      actorId: user._id.toString(),
      actorRole: user.role,
      actorName: user.name,
      action: 'UPDATE_DELIVERY_ADDRESS',
      targetType: 'User',
      targetId: user._id.toString(),
      changeSummary: `Updated delivery address: ${user.deliveryAddress.addressLine1}, ${user.deliveryAddress.city}, ${user.deliveryAddress.state}`
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      deliveryAddress: updatedUser.deliveryAddress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update User Profile (Name, Phone)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    const { name, phone } = req.body;

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (phone && phone.trim()) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return res.status(400).json({ message: 'Please enter a valid phone number (at least 7 digits)' });
      }
      user.phone = phone.trim();
    }

    const updatedUser = await user.save();

    await logAudit({
      actorId: user._id.toString(),
      actorRole: user.role,
      actorName: user.name,
      action: 'UPDATE_PROFILE',
      targetType: 'User',
      targetId: user._id.toString(),
      changeSummary: `User updated profile information: Name=${updatedUser.name}, Phone=${updatedUser.phone}`
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      deliveryAddress: updatedUser.deliveryAddress || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginDoctor,
  changeDoctorPassword,
  getMe,
  updateDeliveryAddress,
  updateProfile
};
