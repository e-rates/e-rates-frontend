import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Ruler, User, Calendar, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface ParcelPopupProps {
    properties: any;
}

export const ParcelPopup: React.FC<ParcelPopupProps> = ({ properties }) => {
    const status = properties.status?.toLowerCase() || 'active';
    const paymentStatus = properties.payment_status || 'unpaid';
    const isPaidCurrentYear = properties.is_paid_current_year || false;
    const customProps = properties.custom_props || properties.props || {};

    // Format area
    const areaM2 = (properties.area_m2 || 0).toLocaleString();
    const areaAcres = properties.area_acres ||
        (properties.area_m2 ? (properties.area_m2 / 4046.86).toFixed(2) : '0.00');

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'active': return 'bg-blue-500 text-white';
            case 'inactive': return 'bg-gray-500 text-white';
            case 'pending': return 'bg-orange-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    };

    return (
        <>
            <style>{`
        .parcel-popup-clean .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 16px !important;
        }
        .parcel-popup-clean .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .parcel-popup-clean .leaflet-popup-tip {
          background: white;
          width: 12px;
          height: 12px;
          padding: 1px;
          margin: -6px auto 0;
        }
        .dark .parcel-popup-clean .leaflet-popup-tip {
          background: #111827; /* gray-900 */
        }
        .parcel-popup-clean a.leaflet-popup-close-button {
          color: #6b7280 !important;
          top: 12px !important;
          right: 12px !important;
          font-size: 16px !important;
          padding: 4px !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          background: rgba(255,255,255,0.5) !important;
        }
        .dark .parcel-popup-clean a.leaflet-popup-close-button {
          color: #9ca3af !important;
          background: rgba(0,0,0,0.2) !important;
        }
        
        /* Tooltip Styles */
        .parcel-tooltip {
          background: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-family: inherit !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          color: #1f2937 !important; /* gray-800 */
          backdrop-filter: blur(4px);
        }
        .parcel-tooltip::before {
          display: none !important; /* Hide the little arrow if present */
        }
        .dark .parcel-tooltip {
          background: rgba(17, 24, 39, 0.9) !important; /* gray-900 */
          color: #f3f4f6 !important; /* gray-100 */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>
            <div className="w-[280px] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900 font-sans text-sm ring-1 ring-black/5 dark:ring-white/10">
                {/* Header with Status */}
                <div className="relative p-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {properties.parcel_ref || 'Unknown'}
                            </h3>
                            {customProps.area_name &&
                                customProps.area_name !== 'No area name' &&
                                customProps.area_name !== 'N/A' && (
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                                        {customProps.area_name}
                                    </p>
                                )}
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(status)}`}>
                            {status}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 space-y-4">
                    {/* Owner & Plot */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="space-y-1">
                            <div className="flex items-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                                <User size={10} className="mr-1" /> Owner
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate text-xs">
                                {properties.owner_username || 'admin'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                                <MapPin size={10} className="mr-1" /> Plot No
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                                {customProps.Parcel_No || customProps.PARCEL_NO || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Payment Status Card */}
                    <div className={`rounded-xl p-3 border ${paymentStatus === 'paid'
                        ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30'
                        : paymentStatus === 'partial'
                            ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30'
                            : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase opacity-70 flex items-center">
                                <CreditCard size={12} className="mr-1.5" /> Payment
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${paymentStatus === 'paid' ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                paymentStatus === 'partial' ? 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                                    'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>{paymentStatus}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-xs font-medium opacity-80">2025 Paid</span>
                            <span className={`text-xs font-bold flex items-center ${isPaidCurrentYear ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {isPaidCurrentYear ? (
                                    <><CheckCircle2 size={14} className="mr-1" /> Yes</>
                                ) : (
                                    <><XCircle size={14} className="mr-1" /> No</>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Area Details - Only show if non-zero */}
                    {(parseFloat(areaAcres) > 0 || parseFloat(areaM2.replace(/,/g, '')) > 0) && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Area (m²)</div>
                                <div className="font-mono font-medium text-gray-700 dark:text-gray-300 text-xs">{areaM2}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Acres</div>
                                <div className="font-mono font-medium text-gray-700 dark:text-gray-300 text-xs">{areaAcres}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
