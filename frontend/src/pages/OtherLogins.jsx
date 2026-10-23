import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Stethoscope, Pill, ShieldCheck, ArrowRight } from 'lucide-react';

const OtherLogins = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-pharmacy-dark bg-pharmacy-lime/40 px-3 py-1 rounded-full uppercase tracking-wider">
            Role Access Portals
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Staff & Practitioner Logins</h1>
          <p className="text-sm text-gray-500 mt-2">
            Select your professional role to access authorized medical dashboards and audit tools.
          </p>
        </div>

        {/* 3 Large Differentiated Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Doctor Login */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Doctor Portal</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Log in using your assigned Doctor ID to view prescriptions, review dispensed items, and track patient orders linked to your verified registration.
              </p>
            </div>

            <Link
              to="/doctor-login"
              className="mt-8 w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>Access Doctor Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Pharmacist Admin Login */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-pharmacy-dark flex items-center justify-center font-bold">
                <Pill className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pharmacist Admin</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Access the pharmacy operations center to add stock batches (FEFO strategy), review flagged prescription extractions, and manage order dispatches.
              </p>
            </div>

            <Link
              to="/pharmacist-login"
              className="mt-8 w-full bg-pharmacy-dark text-white font-semibold py-3 px-4 rounded-xl hover:bg-pharmacy-deep flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>Access Pharmacist Portal</span>
              <ArrowRight className="w-4 h-4 text-pharmacy-lime" />
            </Link>
          </div>

          {/* Card 3: Admin Login */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">System Admin</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Full administrative control over user accounts, doctor registration approvals, system-wide order histories, and searchable audit logs.
              </p>
            </div>

            <Link
              to="/admin-login"
              className="mt-8 w-full bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl hover:bg-purple-800 flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>Access Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default OtherLogins;
