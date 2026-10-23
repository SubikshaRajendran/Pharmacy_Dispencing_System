import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, XCircle, 
  ArrowRight, Stethoscope, RefreshCw, FileCheck 
} from 'lucide-react';

const UploadPrescription = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [error, setError] = useState('');

  const { addToCart, setAttachedPrescription } = useContext(CartContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a printed prescription document to upload');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const { data } = await API.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrescriptionData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process prescription. Please ensure valid document format.');
    } finally {
      setUploading(false);
    }
  };

  const handleProceedToBuy = () => {
    if (!prescriptionData || !prescriptionData.medicines || prescriptionData.medicines.length === 0) return;

    setAttachedPrescription(prescriptionData);

    // Add verified prescribed medicines to cart
    prescriptionData.medicines.forEach(med => {
      if (med.inStock) {
        addToCart({
          _id: med.matchedMedicineId || `rx-med-${Math.random()}`,
          name: med.name,
          price: med.price || 15.00,
          unit: med.dosage || 'Prescribed Dosage',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
        }, med.quantity || 1);
      }
    });

    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-pharmacy-dark bg-pharmacy-lime/40 px-3 py-1 rounded-full uppercase tracking-wider">
            Automated OCR & Verification
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Upload Printed Prescription</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Upload your printed prescription document. Tesseract.js OCR will extract doctor details and validate the Doctor ID against authorized database doctor records.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form Area */}
        {!prescriptionData ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
            
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition relative">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img src={previewUrl} alt="Prescription preview" className="max-h-60 mx-auto rounded-xl shadow-md border border-gray-200" />
                  <p className="text-xs font-semibold text-gray-700">{file.name}</p>
                  <span className="text-[10px] text-gray-400">Click or drag another file to replace</span>
                </div>
              ) : (
                <div className="space-y-3 pointer-events-none">
                  <div className="w-16 h-16 bg-pharmacy-dark/10 text-pharmacy-dark rounded-2xl mx-auto flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Drag & Drop prescription document here</h3>
                  <p className="text-xs text-gray-400">Supports PNG, JPG, JPEG, and PDF format (Max 5MB)</p>
                </div>
              )}
            </div>

            <button
              onClick={handleUploadSubmit}
              disabled={!file || uploading}
              className="w-full bg-pharmacy-dark text-white font-bold text-xs py-3.5 px-6 rounded-xl hover:bg-pharmacy-deep shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-pharmacy-lime" />
                  <span>Running Tesseract.js OCR & Verification...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-pharmacy-lime" />
                  <span>Process & Extract Prescription</span>
                </>
              )}
            </button>

          </div>
        ) : (
          /* Extraction & Verification Result Cards */
          <div className="space-y-6">
            
            {/* Status Header Banner */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pharmacy-dark text-pharmacy-lime rounded-2xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {prescriptionData.doctorName 
                      ? (prescriptionData.doctorName.toLowerCase().startsWith('dr.') ? prescriptionData.doctorName : `Dr. ${prescriptionData.doctorName}`) 
                      : 'Doctor Identified'}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">Doctor ID Match: <strong>{prescriptionData.doctorId || 'Unmatched'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={prescriptionData.status} />
              </div>
            </div>

            {/* OCR Extracted Structured Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Extracted Raw OCR Text Box */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pharmacy-dark" /> Tesseract OCR Raw Text Output
                </h4>
                <pre className="bg-gray-50 p-4 rounded-2xl text-[11px] text-gray-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-200">
                  {prescriptionData.extractedText || 'No text recognized from document.'}
                </pre>
              </div>

              {/* Verification Audit Summary */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Doctor DB Verification Audit
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Doctor ID Registry</span>
                    <span className={`font-bold ${
                      prescriptionData.status === 'Verified' ? 'text-emerald-700' :
                      prescriptionData.status === 'Rejected' ? 'text-rose-700' : 'text-purple-700'
                    }`}>
                      {prescriptionData.status === 'Verified'
                        ? `Verified (${prescriptionData.doctorId})`
                        : prescriptionData.status === 'Rejected'
                          ? `Rejected (${prescriptionData.doctorId || 'Unmatched'})`
                          : `Requires Review (${prescriptionData.doctorId || 'Missing'})`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Patient Record</span>
                    <span className="font-semibold text-gray-800">{prescriptionData.patientName || 'Patient'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Audit Status Notes</span>
                    <span className="font-medium text-gray-700 max-w-[200px] text-right">{prescriptionData.reviewNotes}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Structured Prescribed Medicines List Table */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Extracted & Matched Prescription Items</h4>

              {prescriptionData.medicines?.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 border border-gray-100 rounded-2xl bg-gray-50">
                  No catalog medicines matched in uploaded document. Pharmacist review required.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Medicine Name</th>
                        <th className="p-3">Dosage / Frequency</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {prescriptionData.medicines?.map((med, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-gray-900">{med.name}</td>
                          <td className="p-3 text-gray-600">{med.dosage} ({med.frequency})</td>
                          <td className="p-3 font-mono font-bold text-pharmacy-dark">{med.quantity}</td>
                          <td className="p-3 font-mono text-gray-800">${(med.price || 15).toFixed(2)}</td>
                          <td className="p-3">
                            {med.inStock ? (
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">In Stock</span>
                            ) : (
                              <span className="bg-rose-50 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Needs Review</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setPrescriptionData(null); setFile(null); setPreviewUrl(''); }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Upload Another Document
                </button>

                <button
                  onClick={handleProceedToBuy}
                  disabled={prescriptionData.status !== 'Verified' || !prescriptionData.medicines || prescriptionData.medicines.length === 0}
                  className="bg-pharmacy-dark text-white font-bold text-xs py-3 px-6 rounded-full hover:bg-pharmacy-deep shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Proceed to Buy Prescribed Items</span>
                  <ArrowRight className="w-4 h-4 text-pharmacy-lime" />
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default UploadPrescription;
