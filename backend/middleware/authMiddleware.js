const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mediheal_secure_jwt_secret_key_2026_pharmacy_audit_system');

      if (decoded.role === 'doctor') {
        const doctor = await Doctor.findOne({ doctorId: decoded.id }).select('-password');
        if (!doctor) {
          return res.status(401).json({ message: 'Not authorized, doctor not found' });
        }
        if (doctor.status === 'inactive') {
          return res.status(403).json({ message: 'Doctor account is deactivated' });
        }
        req.user = {
          _id: doctor._id,
          id: doctor.doctorId,
          doctorId: doctor.doctorId,
          name: doctor.name,
          role: 'doctor',
          qualification: doctor.qualification,
          specialization: doctor.specialization,
          hospitalName: doctor.hospitalName,
          verificationStatus: doctor.verificationStatus
        };
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        if (user.status === 'inactive') {
          return res.status(403).json({ message: 'User account is deactivated' });
        }
        req.user = {
          _id: user._id,
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          deliveryAddress: user.deliveryAddress || null,
          role: user.role
        };
      }

      next();
    } catch (error) {
      console.error('Auth token validation error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
