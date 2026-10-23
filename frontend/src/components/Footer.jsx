import React from 'react';
import { Link } from 'react-router-dom';
import { Cross, ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-pharmacy-lime text-pharmacy-dark flex items-center justify-center font-bold text-lg">
                <Cross className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">MediHeal</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-6">
              MediHeal is your trusted online pharmacy platform for authentic prescription medicines, wellness supplements, and automated prescription verification.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <ShieldCheck className="w-5 h-5 text-pharmacy-lime" />
              <span>100% Certified Healthcare Products & Audit Verification</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Shop Categories</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link to="/?category=Personal%20Care" className="hover:text-pharmacy-lime transition">Personal Care</Link></li>
              <li><Link to="/?category=Diabetic%20Care" className="hover:text-pharmacy-lime transition">Diabetic Care</Link></li>
              <li><Link to="/?category=Supplement" className="hover:text-pharmacy-lime transition">Supplements</Link></li>
              <li><Link to="/?category=Devices" className="hover:text-pharmacy-lime transition">Medical Devices</Link></li>
              <li><Link to="/?category=Baby%20Care" className="hover:text-pharmacy-lime transition">Baby Care</Link></li>
              <li><Link to="/?category=Hair%20Care" className="hover:text-pharmacy-lime transition">Hair Care</Link></li>
            </ul>
          </div>

          {/* User & Roles */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Account & Portals</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link to="/login" className="hover:text-pharmacy-lime transition">Patient Login</Link></li>
              <li><Link to="/upload-prescription" className="hover:text-pharmacy-lime transition">Upload Prescription</Link></li>
              <li><Link to="/other-logins" className="hover:text-pharmacy-lime transition">Doctor Portal</Link></li>
              <li><Link to="/other-logins" className="hover:text-pharmacy-lime transition">Pharmacist Admin</Link></li>
              <li><Link to="/other-logins" className="hover:text-pharmacy-lime transition">System Admin</Link></li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Customer Support</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-pharmacy-lime shrink-0" />
                <span>+1 (800) 555-MEDI</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-pharmacy-lime shrink-0" />
                <span>support@mediheal.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-pharmacy-lime shrink-0 mt-0.5" />
                <span>100 MediHeal Plaza, Healthcare Hub</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MediHeal Pharmacy Prescription Inventory & Dispensing Audit System. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Audit Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
