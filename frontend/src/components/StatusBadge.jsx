import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Truck, PackageCheck } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let colorStyle = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = Clock;

  switch (status) {
    case 'Verified':
    case 'Confirmed':
    case 'Paid':
      colorStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'Dispatched':
      colorStyle = 'bg-blue-50 text-blue-800 border-blue-200';
      Icon = Truck;
      break;
    case 'Delivered':
      colorStyle = 'bg-teal-50 text-teal-800 border-teal-200';
      Icon = PackageCheck;
      break;
    case 'Processing':
    case 'Pending Verification':
    case 'Pending':
      colorStyle = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = Clock;
      break;
    case 'Needs Review':
      colorStyle = 'bg-purple-50 text-purple-800 border-purple-200';
      Icon = AlertTriangle;
      break;
    case 'Rejected':
    case 'Cancelled':
    case 'Failed':
      colorStyle = 'bg-rose-50 text-rose-800 border-rose-200';
      Icon = XCircle;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorStyle}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
