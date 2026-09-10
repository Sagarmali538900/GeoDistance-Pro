import React from 'react';
import { Users, Landmark, Heart, MapPin, Sparkles } from 'lucide-react';
import { getJainDemographics } from '../services/jainPopulationService';

export default function JainPopulationCard({ originAddress, destinationAddress }) {
  const originDemo = getJainDemographics(originAddress);
  const destDemo = getJainDemographics(destinationAddress);

  if (!originDemo && !destDemo) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border border-amber-200/80 rounded-2xl p-4 shadow-card space-y-4 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
            <Users className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
              Jain Community Demographics & Tirth Info
            </h3>
            <p className="text-[11px] text-amber-800/80">
              Population estimates & temples along selected locations
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300/60">
          Ahimsa Parmo Dharma 🪔
        </span>
      </div>

      {/* Grid for Origin and Destination Jain Population */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* Origin Location Jain Demographics */}
        {originDemo && (
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 truncate max-w-[70%]" title={originDemo.name}>
                📍 {originDemo.name}
              </span>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {originDemo.percent}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Jain Population</span>
                <span className="font-bold text-slate-900">{originDemo.jainPopulation}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Jain Temples</span>
                <span className="font-bold text-amber-800">{originDemo.templesCount}</span>
              </div>
            </div>

            {originDemo.famousTirth && (
              <p className="text-[11px] text-slate-600 pt-1 border-t border-amber-100/60">
                <strong className="text-amber-900">Famous Tirth:</strong> {originDemo.famousTirth}
              </p>
            )}
          </div>
        )}

        {/* Destination Location Jain Demographics */}
        {destDemo && (
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 truncate max-w-[70%]" title={destDemo.name}>
                🏁 {destDemo.name}
              </span>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {destDemo.percent}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Jain Population</span>
                <span className="font-bold text-slate-900">{destDemo.jainPopulation}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Jain Temples</span>
                <span className="font-bold text-amber-800">{destDemo.templesCount}</span>
              </div>
            </div>

            {destDemo.famousTirth && (
              <p className="text-[11px] text-slate-600 pt-1 border-t border-amber-100/60">
                <strong className="text-amber-900">Famous Tirth:</strong> {destDemo.famousTirth}
              </p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
