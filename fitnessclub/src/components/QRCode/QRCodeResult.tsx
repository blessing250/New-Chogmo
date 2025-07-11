import React from 'react';
import { User, Package, Clock, CreditCard, X } from 'lucide-react';

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  activePackages: Array<{
    id: string;
    name: string;
    type: string;
    remaining: number;
    total: number;
  }>;
  paymentStatus: 'current' | 'overdue' | 'expired';
  lastVisit: string;
}

interface QRCodeResultProps {
  clientInfo: ClientInfo;
  onClose: () => void;
  onCheckIn: (packageId: string) => void;
}

const QRCodeResult: React.FC<QRCodeResultProps> = ({ clientInfo, onClose, onCheckIn }) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-500/20 text-green-400';
      case 'overdue':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl border border-orange-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Client Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Client Details */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{clientInfo.name}</h3>
              <p className="text-gray-400">{clientInfo.email}</p>
              <p className="text-gray-400">{clientInfo.phone}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Payment Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(clientInfo.paymentStatus)}`}>
                {clientInfo.paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Visit</p>
              <p className="text-white">{clientInfo.lastVisit}</p>
            </div>
          </div>
        </div>

        {/* Active Packages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-500" />
            Active Packages
          </h3>
          
          {clientInfo.activePackages.map((pkg) => (
            <div key={pkg.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-white">{pkg.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{pkg.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Sessions</p>
                  <p className="text-white font-semibold">{pkg.remaining}/{pkg.total}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(pkg.remaining / pkg.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {pkg.remaining > 0 ? `${pkg.remaining} sessions remaining` : 'No sessions remaining'}
                </span>
                <button
                  onClick={() => onCheckIn(pkg.id)}
                  disabled={pkg.remaining === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    pkg.remaining > 0
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Check In
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Close
          </button>
          <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors duration-200">
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeResult;