const Tesseract = require('tesseract.js');
const jimpModule = require('jimp');
const Jimp = jimpModule.Jimp || jimpModule;
const fs = require('fs');
const path = require('path');
const Medicine = require('../models/Medicine');

// Disable SSL certificate restriction for Tesseract.js language data CDN fetch in Node development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Red Pixel Mask Generator using Jimp v1 API
const createRedPixelMask = async (inputPath) => {
  try {
    if (!fs.existsSync(inputPath)) return null;

    const ext = path.extname(inputPath).toLowerCase();
    if (ext === '.pdf') return null;

    const image = await Jimp.read(inputPath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let redPixelCount = 0;

    // Scan every pixel and isolate RED text (high R, low G, low B)
    image.scan(0, 0, width, height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];

      const isRed = red > 120 && (red - green > 25) && (red - blue > 25);

      if (isRed) {
        redPixelCount++;
        this.bitmap.data[idx + 0] = 0;
        this.bitmap.data[idx + 1] = 0;
        this.bitmap.data[idx + 2] = 0;
        this.bitmap.data[idx + 3] = 255;
      } else {
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
        this.bitmap.data[idx + 3] = 255;
      }
    });

    if (redPixelCount < 5) return null;

    // Scale up 3x for maximum OCR character clarity
    image.resize({ w: width * 3, h: height * 3 });

    const outputPath = path.join(path.dirname(inputPath), `redmask-${path.basename(inputPath)}`);
    await image.write(outputPath);
    return outputPath;
  } catch (err) {
    console.error('Red pixel masking error:', err.message);
    return null;
  }
};

// Full image preprocessor using Jimp v1 API
const preprocessImageForOcr = async (inputPath) => {
  try {
    if (!fs.existsSync(inputPath)) return inputPath;
    const ext = path.extname(inputPath).toLowerCase();
    if (ext === '.pdf') return inputPath;

    const image = await Jimp.read(inputPath);
    image.resize({ w: image.bitmap.width * 2, h: image.bitmap.height * 2 });
    image.greyscale();
    image.contrast(0.2);

    const outputPath = path.join(path.dirname(inputPath), `ocrprep-${path.basename(inputPath)}`);
    await image.write(outputPath);
    return outputPath;
  } catch (err) {
    console.error('Image preprocessing warning:', err.message);
    return inputPath;
  }
};

const extractPrescriptionData = async (filePath) => {
  let extractedText = '';
  let redTextOutput = '';
  let isRedColorDetected = false;
  let redDoctorId = '';

  try {
    // 1. Process RED pixel mask for Doctor ID in red font
    const redMaskPath = await createRedPixelMask(filePath);
    if (redMaskPath && fs.existsSync(redMaskPath)) {
      const redOcrResult = await Tesseract.recognize(redMaskPath, 'eng', {
        logger: m => console.log(`[Red OCR]: ${m.status} (${Math.round((m.progress || 0) * 100)}%)`)
      });
      redTextOutput = redOcrResult.data.text || '';

      try { fs.unlinkSync(redMaskPath); } catch (e) {}

      const redDocMatch = redTextOutput.match(/doc\d{3}/i) || redTextOutput.match(/doc[a-z0-9]+/i) || redTextOutput.match(/\b(doc\w+)\b/i);
      if (redDocMatch) {
        redDoctorId = redDocMatch[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        isRedColorDetected = true;
        console.log(`[Red OCR Success]: Extracted Doctor ID '${redDoctorId}' from RED font!`);
      }
    }

    // 2. Perform OCR on enhanced prescription document
    let targetPath = filePath;
    const prepPath = await preprocessImageForOcr(filePath);
    if (prepPath && fs.existsSync(prepPath)) targetPath = prepPath;

    const fullOcrResult = await Tesseract.recognize(targetPath, 'eng', {
      logger: m => console.log(`[Full OCR]: ${m.status} (${Math.round((m.progress || 0) * 100)}%)`)
    });
    extractedText = fullOcrResult.data.text || '';

    if (prepPath !== filePath) {
      try { fs.unlinkSync(prepPath); } catch (e) {}
    }
  } catch (error) {
    console.error('OCR processing error:', error.message);
    extractedText = `[Prescription Document Received]`;
  }

  // Doctor ID parsing (Red text first, fallback to regex on full text)
  const docRegexMatch = extractedText.match(/doc\d{3}/i) || extractedText.match(/Doctor\s*ID[:\s]*([A-Za-z0-9]+)/i);
  const fallbackDoctorId = docRegexMatch ? (docRegexMatch[0].startsWith('doc') || docRegexMatch[0].startsWith('DOC') ? docRegexMatch[0].toLowerCase() : docRegexMatch[1].toLowerCase()) : '';

  const finalDoctorId = redDoctorId || fallbackDoctorId;

  // Doctor Name parsing
  const doctorNameMatch = extractedText.match(/(?:Dr\.|Doctor\s+Name)[:\s]*([A-Za-z\s.]+)/i);
  let extractedDoctorName = '';
  if (doctorNameMatch) {
    extractedDoctorName = doctorNameMatch[1].trim().split('\n')[0].replace(/Doctor\s*ID.*/i, '').replace(/Patient.*/i, '').trim();
  }

  // Patient Name parsing
  const patientNameMatch = extractedText.match(/(?:Patient\s+Name|Patient)[:\s]*([A-Za-z\s.]+)/i);
  let extractedPatientName = '';
  if (patientNameMatch) {
    extractedPatientName = patientNameMatch[1].trim().split('\n')[0].replace(/Patient\s*ID.*/i, '').replace(/Doctor.*/i, '').trim();
  }

  // Date parsing
  const dateMatch = extractedText.match(/(?:Date[:\s]*)?(\d{1,2}\s+[A-Za-z]+\s+\d{2,4}|\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
  const extractedDate = dateMatch ? new Date(dateMatch[1]) : new Date();

  // Match medicines & parse EXACT quantities (avoiding 500 from 500mg)
  let extractedMedicines = [];
  try {
    const activeMedicines = await Medicine.find({ active: true });
    const lines = extractedText.split('\n');

    const typosMap = {
      'amoicitin': 'Amoxicillin',
      'amoxicilin': 'Amoxicillin',
      'amoxillin': 'Amoxicillin',
      'paracetol': 'Paracetamol',
      'paracetam': 'Paracetamol',
      'cetrizine': 'Cetirizine',
      'ceterizine': 'Cetirizine'
    };

    activeMedicines.forEach(med => {
      const medNameKey = med.name.split(' ')[0].toLowerCase();
      
      lines.forEach(line => {
        let lineLower = line.toLowerCase();
        
        Object.keys(typosMap).forEach(typo => {
          lineLower = lineLower.replaceAll(typo, typosMap[typo].toLowerCase());
        });

        if (lineLower.includes(medNameKey)) {
          let parsedQty = 1;
          
          const unitQtyMatch = lineLower.match(/(\d+)\s*(tablets|capsules|pieces|pills|units)\b/i);
          const endQtyMatch = lineLower.match(/\|\s*(\d+)\s*$/) || lineLower.match(/:\s*(\d+)\s*$/);

          if (unitQtyMatch && unitQtyMatch[1]) {
            parsedQty = parseInt(unitQtyMatch[1], 10) || 1;
          } else if (endQtyMatch && endQtyMatch[1]) {
            parsedQty = parseInt(endQtyMatch[1], 10) || 1;
          }

          if (!extractedMedicines.some(m => m.name === med.name)) {
            extractedMedicines.push({
              name: med.name,
              dosage: med.unit || 'Standard Dosage',
              frequency: 'As directed on prescription',
              duration: '7 Days',
              quantity: parsedQty,
              matchedMedicineId: med._id,
              price: med.price,
              inStock: med.totalStock >= parsedQty
            });
          }
        }
      });
    });
  } catch (err) {
    console.error('Error matching database medicines:', err.message);
  }

  return {
    rawText: extractedText,
    doctorId: finalDoctorId,
    isRedColorDetected: isRedColorDetected,
    redTextExtracted: redTextOutput.trim(),
    doctorName: extractedDoctorName,
    patientName: extractedPatientName,
    prescriptionDate: extractedDate,
    medicines: extractedMedicines
  };
};

module.exports = { extractPrescriptionData };
