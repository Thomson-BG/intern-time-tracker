import React from 'react';

interface GpsAccuracyModalProps {
  onDismiss?: () => void;
  accuracy?: number;
}

const GpsAccuracyModal: React.FC<GpsAccuracyModalProps> = ({ onDismiss, accuracy }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-start gap-3">
          <div className="bg-orange-500/20 rounded-full p-2 shrink-0">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-400 mb-2">
              📍 GPS Accuracy Issue Detected
            </h3>
            <p className="text-gray-300 mb-4">
              Your GPS location accuracy is not within the acceptable limits for clocking in/out.
            </p>
            
            <div className="bg-orange-800/50 rounded-xl p-4 mb-4 border border-orange-500/30">
              <h4 className="text-orange-300 font-semibold mb-2">🎯 Current Status:</h4>
              <p className="text-orange-200 text-sm">
                GPS Accuracy: <strong>{accuracy ? `${accuracy.toFixed(1)} meters` : 'Unknown'}</strong>
              </p>
              <p className="text-orange-200 text-sm mt-1">
                Required: <strong>Less than 50 meters</strong>
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-4">
              <h4 className="text-blue-400 font-semibold mb-2">🔧 How to Fix This:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 📶 Move to an area with better cellular/WiFi signal</li>
                <li>• 🌤️ Go outside or near a window for better GPS reception</li>
                <li>• 📱 Enable "High Accuracy" location mode in device settings</li>
                <li>• ⏱️ Wait a few moments for GPS to improve accuracy</li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <h4 className="text-red-400 font-semibold mb-2">⚠️ Why This Matters:</h4>
              <p className="text-gray-300 text-sm">
                Accurate location tracking ensures you're clocking in/out from the correct work location. 
                This helps maintain accurate time records and workplace security. 🏢✅
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                💡 <em>Try again in a few moments after improving your location signal</em>
              </div>
              {onDismiss && (
                <button 
                  onClick={onDismiss}
                  className="bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                >
                  🔄 Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpsAccuracyModal;