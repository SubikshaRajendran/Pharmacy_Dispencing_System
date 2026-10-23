const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');

const verifyPrescriptionDetails = async (extractedData) => {
  const flags = [];
  let status = 'Verified';
  let doctorRecord = null;

  if (extractedData.isRedColorDetected) {
    flags.push(`[Red Color OCR]: Extracted Doctor ID '${extractedData.doctorId}' from RED font text region`);
  }

  if (!extractedData.doctorId) {
    flags.push('Missing Doctor ID in prescription document');
    status = 'Needs Review';
  } else {
    // Search verified doctor in DB
    doctorRecord = await Doctor.findOne({ doctorId: extractedData.doctorId.toLowerCase() });

    if (!doctorRecord) {
      flags.push(`Doctor ID '${extractedData.doctorId}' is not found in system database`);
      status = 'Rejected';
    } else if (doctorRecord.verificationStatus !== 'verified' || doctorRecord.status !== 'active') {
      flags.push(`Doctor '${doctorRecord.name}' (${doctorRecord.doctorId}) account is inactive or unverified`);
      status = 'Rejected';
    } else {
      // Validate Doctor Name match
      if (extractedData.doctorName && !doctorRecord.name.toLowerCase().includes(extractedData.doctorName.toLowerCase()) && !extractedData.doctorName.toLowerCase().includes(doctorRecord.name.toLowerCase())) {
        flags.push(`Prescription doctor name '${extractedData.doctorName}' differs from registered doctor record '${doctorRecord.name}'`);
        status = 'Needs Review';
      }
    }
  }

  // Check medicines against inventory
  const structuredMedicines = [];

  for (const item of extractedData.medicines) {
    const dbMed = await Medicine.findOne({
      name: { $regex: new RegExp(item.name.split(' ')[0], 'i') }
    });

    if (dbMed) {
      const inStock = dbMed.totalStock >= (item.quantity || 1);
      structuredMedicines.push({
        name: dbMed.name,
        dosage: item.dosage || 'Standard Dosage',
        frequency: item.frequency || 'As directed',
        duration: item.duration || '7 Days',
        quantity: item.quantity || 1,
        matchedMedicineId: dbMed._id,
        price: dbMed.price,
        inStock: inStock
      });

      if (!inStock) {
        flags.push(`Medicine '${dbMed.name}' has insufficient stock (Requested: ${item.quantity}, Available: ${dbMed.totalStock})`);
        if (status === 'Verified') status = 'Needs Review';
      }
    } else {
      structuredMedicines.push({
        name: item.name,
        dosage: item.dosage || 'Standard Dosage',
        frequency: item.frequency || 'As directed',
        duration: item.duration || '7 Days',
        quantity: item.quantity || 1,
        price: 15.0,
        inStock: false
      });
      flags.push(`Medicine '${item.name}' not found in active catalog`);
      if (status === 'Verified') status = 'Needs Review';
    }
  }

  return {
    doctorId: doctorRecord ? doctorRecord.doctorId : extractedData.doctorId,
    doctorName: doctorRecord ? doctorRecord.name : extractedData.doctorName,
    doctorRecord: doctorRecord ? { id: doctorRecord.doctorId, name: doctorRecord.name, hospital: doctorRecord.hospitalName } : null,
    status: status,
    flags: flags,
    structuredMedicines: structuredMedicines
  };
};

module.exports = { verifyPrescriptionDetails };
