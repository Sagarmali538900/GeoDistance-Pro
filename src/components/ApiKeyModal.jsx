import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, HelpCircle, RefreshCw } from 'lucide-react';
import { getApiKey, saveCustomApiKey } from '../services/googleMapsLoader';

export default function ApiKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [inputKey, setInputKey] = useState(getApiKey() || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveCustomApiKey(inputKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onKeyUpdated();
      onClose();
      window.location.reload(); // Reload window to apply new key to Google Script loader cleanly
    }, 1000);
  };

  const handleClearKey = () => {
    saveCustomApiKey('');
    setInputKey('');
    onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-xl border border-brand-200/60">
              <Key className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Maps API Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Set or update your Google Maps API Key
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Google Maps API Key
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-20 py-2.5 text-sm bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono transition-all"
              />
              {inputKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="absolute right-2 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              <span>How to get an API Key:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-slate-600">
              <li>Visit <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noreferrer" className="text-brand-700 underline font-semibold inline-flex items-center space-x-0.5"><span>Google Cloud Console</span> <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline" /></a></li>
              <li>Enable <strong>Maps JavaScript API</strong>, <strong>Places API</strong> & <strong>Directions API</strong></li>
              <li>Create credentials → API Key & paste it above</li>
              <li>Alternatively, set <code className="bg-slate-200 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="bg-slate-200 px-1 py-0.5 rounded">.env</code></li>
            </ol>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved! Reloading...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save & Apply Key</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
