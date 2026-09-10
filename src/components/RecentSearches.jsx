import React from 'react';
import { History, Trash2, ArrowRight, Clock, MapPin, X } from 'lucide-react';

export default function RecentSearches({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onClose
}) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-3 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Searches
            </h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="py-6 text-slate-400">
          <History className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-500">No search history yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Calculated routes will appear here for fast access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recent Searches ({history.length})
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center space-x-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg border border-red-200/60 transition-colors"
            title="Clear all recent searches"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear History</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {history.map((item, index) => {
          const fromLoc = item.locations[0]?.address || 'Start Location';
          const toLoc = item.locations[item.locations.length - 1]?.address || 'End Location';
          const totalKm = item.result?.totalDistanceKm ? `${item.result.totalDistanceKm} km` : 'N/A';
          const duration = item.result?.totalDurationFormatted || 'N/A';

          return (
            <div
              key={item.id || index}
              onClick={() => onSelectHistoryItem(item)}
              className="p-3 bg-slate-50 hover:bg-brand-50/60 border border-slate-200/80 hover:border-brand-200 rounded-xl cursor-pointer transition-all duration-150 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs group-hover:border-brand-200">
                  <span className="text-brand-700">{totalKm}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700">{duration}</span>
                </div>
              </div>

              {/* Route Summary */}
              <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium min-w-0">
                <span className="truncate max-w-[42%]" title={fromLoc}>{fromLoc.split(',')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                <span className="truncate max-w-[42%]" title={toLoc}>{toLoc.split(',')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
