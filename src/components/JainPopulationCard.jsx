import React from 'react';
import { Users, Landmark, MapPin, Sparkles } from 'lucide-react';
import { getJainDemographics, extractCityName } from '../services/jainPopulationService';

export default function JainPopulationCard({ originAddress, destinationAddress }) {
  const destDemo = getJainDemographics(destinationAddress);
  const originDemo = getJainDemographics(originAddress);

  if (!destDemo && !originDemo) return null;

  // Primary focal point is Destination (End Location)
  const targetDemo = destDemo || originDemo;
  const destinationCity = extractCityName(destinationAddress);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-50/50 to-white border border-amber-300/80 rounded-2xl p-5 shadow-card space-y-4 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Jain Population at Destination: {targetDemo.name}
            </h3>
            <p className="text-xs text-amber-800">
              Demographic Insights & Derasars for End Location
            </p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          Ahimsa Parmo Dharma 🪔
        </span>
      </div>

      {/* Main Metric Banner for Destination */}
      <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Destination ({targetDemo.name}, {targetDemo.state})
            </span>
          </div>

          <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            {targetDemo.percent} Share
          </span>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">
              Est. Jain Population
            </span>
            <div className="text-xl font-black text-slate-900">
              {targetDemo.jainPopulation}
            </div>
            <span className="text-[10px] text-amber-800 font-medium">In {targetDemo.name} Region</span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">
              Jain Temples / Derasars
            </span>
            <div className="text-xl font-black text-amber-900">
              {targetDemo.templesCount}
            </div>
            <span className="text-[10px] text-amber-800 font-medium">Active Sacred Temples</span>
          </div>

        </div>

        {/* Famous Tirth Site */}
        {targetDemo.famousTirth && (
          <div className="p-2.5 bg-amber-50/40 rounded-lg border border-amber-200/50 text-xs text-slate-700 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
              𛍕 Prominent Tirth & Pilgrimage Site:
            </span>
            <p className="font-semibold text-slate-900">
              {targetDemo.famousTirth}
            </p>
          </div>
        )}
      </div>

      {/* Origin City Context (Secondary) */}
      {originDemo && originDemo.name !== targetDemo.name && (
        <div className="flex items-center justify-between p-2.5 bg-white/70 rounded-xl border border-amber-200/50 text-xs text-slate-600">
          <span>Starting Point (<strong>{originDemo.name}</strong>):</span>
          <span className="font-bold text-amber-900">{originDemo.jainPopulation} Jains ({originDemo.percent})</span>
        </div>
      )}

    </div>
  );
}
