import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Route as RouteIcon, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Database
} from 'lucide-react';

export default function DistanceResult({ result, unit, locations, travelMode, currentUser }) {
  const [copied, setCopied] = useState(false);
  const [showLegs, setShowLegs] = useState(false);
  const [shared, setShared] = useState(false);

  if (!result) return null;

  const displayDistance = unit === 'mi' ? `${result.totalDistanceMiles} mi` : `${result.totalDistanceKm} km`;
  const displayDuration = result.totalDurationFormatted;

  const originAddress = result.legs && result.legs[0] ? result.legs[0].from : (locations[0]?.address || 'Location A');
  const destinationAddress = result.legs && result.legs.length > 0 
    ? result.legs[result.legs.length - 1].to 
    : (locations[locations.length - 1]?.address || 'Location B');

  // Copy result details to clipboard
  const handleCopy = () => {
    const summaryText = `GeoMetrics Distance Analysis:
User / Agent: ${currentUser || 'Default User'}
From: ${originAddress}
To: ${destinationAddress}
Distance: ${displayDistance}
Estimated Travel Time: ${displayDuration} (${travelMode.toLowerCase()})`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Generate external Google Maps route URL
  const getGoogleMapsUrl = () => {
    const origin = encodeURIComponent(locations[0]?.address || originAddress);
    const destination = encodeURIComponent(locations[locations.length - 1]?.address || destinationAddress);
    
    let modeParam = 'driving';
    if (travelMode === 'WALKING') modeParam = 'walking';
    if (travelMode === 'BICYCLING') modeParam = 'bicycling';
    if (travelMode === 'TRANSIT') modeParam = 'transit';

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${modeParam}`;

    if (locations.length > 2) {
      const waypoints = locations.slice(1, -1).map(loc => encodeURIComponent(loc.address)).join('|');
      url += `&waypoints=${waypoints}`;
    }

    return url;
  };

  // Handle Share route link
  const handleShare = () => {
    const shareData = {
      title: 'GeoMetrics Route Analysis',
      text: `Route by ${currentUser || 'User'} from ${originAddress} to ${destinationAddress} (${displayDistance}, ${displayDuration})`,
      url: getGoogleMapsUrl()
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(getGoogleMapsUrl()).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4 animate-in fade-in">
      
      {/* Result Header & Saved Badge */}
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-brand-50 text-brand-700 rounded-lg">
            <RouteIcon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Route Analysis Result
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs">
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Saved to MongoDB for: </span>
          <span className="underline decoration-emerald-400">{currentUser || 'User'}</span>
        </div>
      </div>

      {/* Prominent Distance & Duration Cards */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Distance Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600">Total Distance</span>
            <RouteIcon className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {displayDistance}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {result.totalDistanceMeters ? `${(result.totalDistanceMeters).toLocaleString()} meters` : ''}
          </p>
        </div>

        {/* Travel Time Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600">Travel Time</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {displayDuration}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Mode: {travelMode.toLowerCase()}
          </p>
        </div>

      </div>

      {/* Location Addresses Summary */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
        
        {/* Origin */}
        <div className="flex items-start space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-slate-500 text-[10px] uppercase block">From</span>
            <p className="font-medium text-slate-900 truncate" title={originAddress}>
              {originAddress}
            </p>
          </div>
        </div>

        {/* Multi-stop Waypoints indicator */}
        {locations.length > 2 && (
          <div className="pl-1 text-[11px] text-brand-700 font-semibold flex items-center space-x-1 py-0.5">
            <span>• {locations.length - 2} Intermediate stop(s)</span>
          </div>
        )}

        {/* Destination */}
        <div className="flex items-start space-x-2 pt-1 border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0"></span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-slate-500 text-[10px] uppercase block">To</span>
            <p className="font-medium text-slate-900 truncate" title={destinationAddress}>
              {destinationAddress}
            </p>
          </div>
        </div>

      </div>

      {/* Per-leg Breakdown for multi-stop routes */}
      {result.legs && result.legs.length > 1 && (
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowLegs(!showLegs)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Segment Breakdown ({result.legs.length} legs)</span>
            {showLegs ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showLegs && (
            <div className="p-3 pt-0 border-t border-slate-100 space-y-2 text-xs divide-y divide-slate-100">
              {result.legs.map((leg, idx) => {
                const legDist = unit === 'mi' 
                  ? `${(leg.distanceValueMeters / 1609.34).toFixed(1)} mi` 
                  : leg.distanceText;
                return (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-slate-700">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-900">Leg {idx + 1}: </span>
                      <span className="text-slate-600 truncate">{leg.from.split(',')[0]} → {leg.to.split(',')[0]}</span>
                    </div>
                    <div className="text-right flex-shrink-0 font-medium">
                      <span className="text-brand-700 font-semibold">{legDist}</span>
                      <span className="text-slate-500 text-[11px] block">{leg.durationText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        
        {/* Copy Result */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center space-x-1.5 py-2 px-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
          title="Copy result details to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Share Route */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center space-x-1.5 py-2 px-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
          title="Share route link"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span>{shared ? 'Link Copied' : 'Share'}</span>
        </button>

        {/* Open in Google Maps */}
        <a
          href={getGoogleMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 py-2 px-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all shadow-2xs"
          title="Open route in official Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
          <span>Maps</span>
        </a>

      </div>

    </div>
  );
}
