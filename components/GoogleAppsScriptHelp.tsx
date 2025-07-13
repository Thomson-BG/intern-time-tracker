import React from 'react';

interface GoogleAppsScriptHelpProps {
  onDismiss?: () => void;
}

const GoogleAppsScriptHelp: React.FC<GoogleAppsScriptHelpProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-start gap-3">
          <div className="bg-red-500/20 rounded-full p-2 shrink-0">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-400 mb-2">
              🚨 Google Apps Script Update Required
            </h3>
            <p className="text-gray-300 mb-4">
              The check-in/check-out functionality is not working because the Google Apps Script needs to be updated with proper CORS headers.
            </p>
            
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <h4 className="text-white font-semibold mb-2">Quick Fix Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                <li>Go to <a href="https://script.google.com/home" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google Apps Script</a></li>
                <li>Find or create your time tracker project</li>
                <li>Replace ALL code with the content from <code className="bg-gray-700 px-1 rounded">FINAL_CORRECTED_GOOGLE_APPS_SCRIPT.js</code></li>
                <li>Save and deploy as web app with "Execute as: Me" and "Who has access: Anyone"</li>
                <li>Refresh this page after deployment</li>
              </ol>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-4">
              <h4 className="text-blue-400 font-semibold mb-2">📋 Need detailed instructions?</h4>
              <p className="text-gray-300 text-sm">
                Check the <code className="bg-gray-700 px-1 rounded">GOOGLE_APPS_SCRIPT_DEPLOYMENT.md</code> file in the repository for complete step-by-step instructions with screenshots.
              </p>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-4">
              <h4 className="text-amber-400 font-semibold mb-2">⚠️ Why is this happening?</h4>
              <p className="text-gray-300 text-sm">
                Web browsers block requests to external services (like Google Apps Script) unless they include proper CORS headers. The updated script includes these headers to allow the application to work properly.
              </p>
            </div>

            <div className="flex gap-3">
              <a 
                href="https://script.google.com/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-xl font-medium transition-colors"
              >
                Open Google Apps Script
              </a>
              {onDismiss && (
                <button 
                  onClick={onDismiss}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                >
                  I'll Fix This Later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAppsScriptHelp;