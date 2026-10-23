import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  FileText, ShieldCheck, Pill, Activity, ArrowRight, 
  CheckCircle2, Sparkles, Stethoscope, Lock, Search, HeartPulse, ChevronRight 
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        
        {/* 1. Hero Section */}
        <section className="bg-pharmacy-dark text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Hero Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-pharmacy-lime font-medium border border-white/10">
                <Sparkles className="w-4 h-4" />
                <span>Integrated Pharmacy & Dispensing Audit System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Smart Prescription Management. <br />
                <span className="text-pharmacy-lime">Accurate Dispensing.</span> <br />
                Reliable Healthcare.
              </h1>

              <p className="text-gray-200 text-sm sm:text-base max-w-xl leading-relaxed">
                Upload printed prescriptions, verify registered doctors, review prescribed medicines, and manage pharmacy orders through one integrated platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="bg-pharmacy-brightLime text-pharmacy-dark text-sm font-bold px-8 py-3.5 rounded-full hover:bg-pharmacy-lime transition shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#workflow"
                  className="bg-transparent text-white border border-white/30 hover:bg-white/10 text-sm font-semibold px-7 py-3.5 rounded-full transition"
                >
                  How It Works
                </a>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-white/10 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-pharmacy-lime" />
                  <span>Verified Doctor Validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pharmacy-lime" />
                  <span>Automated OCR Extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-pharmacy-lime" />
                  <span>FEFO Inventory Audit</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md bg-white/5 p-3 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80"
                  alt="Pharmacist reviewing digital prescription audit records"
                  className="w-full h-80 object-cover rounded-2xl shadow-md border border-white/10"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 2. Core System Features Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-pharmacy-dark bg-pharmacy-lime/40 px-3 py-1 rounded-full uppercase tracking-wider">
              System Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">Four Core System Pillars</h2>
            <p className="text-xs text-gray-500 mt-2">
              Designed for end-to-end medical safety, verification accuracy, and auditable inventory control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-pharmacy-dark flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Printed Prescription Processing</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Extract medicine names, dosage, frequency, and duration from printed prescriptions automatically using Tesseract.js OCR.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Verified Doctor Validation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Validate extracted Doctor IDs (e.g. <code className="font-mono text-blue-700 font-bold">doc123</code>, <code className="font-mono text-blue-700 font-bold">doc476</code>) against the authorized doctor MongoDB database.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Inventory Management</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Track medicine batches, FEFO (First-Expiry-First-Out) stock levels, supplier details, and automated low-stock alerts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Dispensing Audit Trail</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Maintain immutable, searchable audit records of prescriptions, patient orders, inventory batch deductions, and staff permissions.
              </p>
            </div>

          </div>
        </section>

        {/* 3. How It Works Section */}
        <section id="workflow" className="bg-white py-16 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-pharmacy-dark bg-pharmacy-lime/40 px-3 py-1 rounded-full uppercase tracking-wider">
                Step-By-Step
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-3">How The System Works</h2>
              <p className="text-xs text-gray-500 mt-2">
                A seamless 6-step workflow connecting patient uploads to verified pharmacy dispensing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative">
              
              {[
                { step: '1', title: 'Upload Prescription', desc: 'Upload clear image or PDF document.' },
                { step: '2', title: 'Extract Details', desc: 'OCR extracts Doctor ID & medicines.' },
                { step: '3', title: 'Verify Doctor', desc: 'Check database for active Doctor ID.' },
                { step: '4', title: 'Review Medicines', desc: 'Confirm dosage, stock & unit price.' },
                { step: '5', title: 'Confirm Order', desc: 'Provide delivery address & checkout.' },
                { step: '6', title: 'Track Order', desc: 'Follow live dispatch & delivery.' }
              ].map(s => (
                <div key={s.step} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-full bg-pharmacy-dark text-pharmacy-lime font-bold text-xs flex items-center justify-center shadow-xs">
                    {s.step}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">{s.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-tight">{s.desc}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* 4. About Us Section */}
        <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-pharmacy-dark to-pharmacy-deep text-white rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold bg-pharmacy-lime text-pharmacy-dark px-3 py-1 rounded-full uppercase">
                About MediHeal System
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ensuring Dispensing Integrity & Patient Safety
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                MediHeal was built to resolve medication errors, fraudulent prescription claims, and unverified doctor credentials. By combining automated OCR extraction with database doctor verification and FEFO batch inventory control, MediHeal provides a trusted bridge between doctors, patients, and pharmacist administrators.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <Link
                to="/login"
                className="bg-pharmacy-brightLime text-pharmacy-dark font-bold text-xs px-8 py-4 rounded-full hover:bg-pharmacy-lime shadow-lg transition"
              >
                Access System Login
              </Link>
            </div>

          </div>
        </section>

        {/* 5. Contact Section */}
        <section id="contact" className="py-12 max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-bold text-gray-900">Need Technical or Pharmacist Assistance?</h3>
          <p className="text-xs text-gray-500 mt-1">Our customer support and pharmacist audit desk is available 24/7.</p>
          <p className="text-xs font-bold text-pharmacy-dark mt-3">Email: support@mediheal.com | Helpline: +1 (800) 555-MEDI</p>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
