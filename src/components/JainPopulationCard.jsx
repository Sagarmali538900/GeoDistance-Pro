import React from 'react';
import { Users, Plane, Train, MapPin, Sparkles } from 'lucide-react';
import { getJainDemographics, extractCityName } from '../services/jainPopulationService';
import { getTransportInfo } from '../services/transportService';

export default function JainPopulationCard({ originAddress, destinationAddress }) {
  const destDemo = getJainDemographics(destinationAddress);
  const originDemo = getJainDemographics(originAddress);
  const destTransport = getTransportInfo(destinationAddress);

  if (!destDemo && !originDemo && !destTransport) return null;

  const targetDemo = destDemo || originDemo;
  const cityName = extractCityName(destinationAddress);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-50/40 to-white border border-amber-300/80 rounded-2xl p-5 shadow-card space-y-4 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <MapPin className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Destination Insights: {targetDemo?.name || cityName}
            </h3>
            <p className="text-xs text-amber-800">
              Transport Infrastructure & Jain Demographics for End Location
            </p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          Ahimsa Parmo Dharma 🪔
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-4">
        
        {/* Section 1: Nearest Airport & Biggest Railway Station */}
        {destTransport && (
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              🚇 Transport Connectivity (Destination: {destTransport.city})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Nearest Airport */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <span>Nearest Airport</span>
                  </div>
                  {destTransport.airport?.code && (
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      {destTransport.airport.code}
                    </span>
                  )}
                </div>

                <p className="font-extrabold text-slate-900 text-xs leading-snug">
                  {destTransport.airport?.name}
                </p>
                <p className="text-[11px] text-blue-800 font-medium">
                  {destTransport.airport?.distance} ({destTransport.airport?.type})
                </p>
              </div>

              {/* Biggest Railway Station */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                    <Train className="w-4 h-4 text-emerald-600" />
                    <span>Biggest Railway Station</span>
                  </div>
                  {destTransport.railway?.code && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {destTransport.railway.code}
                    </span>
                  )}
                </div>

                <p className="font-extrabold text-slate-900 text-xs leading-snug">
                  {destTransport.railway?.name}
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {destTransport.railway?.category}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Section 2: Jain Population & Derasars Metrics */}
        {targetDemo && (
          <div className="space-y-2 pt-2 border-t border-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-950 font-bold text-xs">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Jain Community Demographics</span>
              </div>
              <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {targetDemo.percent} Share
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                <span className="text-slate-500 text-[10px] font-semibold block mb-0.5">
                  Est. Jain Population
                </span>
                <div className="text-xl font-black text-slate-900">
                  {targetDemo.jainPopulation}
                </div>
                <span className="text-[10px] text-amber-800 font-medium">In {targetDemo.name}</span>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                <span className="text-slate-500 text-[10px] font-semibold block mb-0.5">
                  Jain Temples / Derasars
                </span>
                <div className="text-xl font-black text-amber-900">
                  {targetDemo.templesCount}
                </div>
                <span className="text-[10px] text-amber-800 font-medium">Active Sacred Derasars</span>
              </div>
            </div>

            {targetDemo.famousTirth && (
              <div className="p-2.5 bg-amber-50/40 rounded-lg border border-amber-200/50 text-xs text-slate-700 space-y-0.5 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  𛍕 Famous Tirth & Pilgrimage Site:
                </span>
                <p className="font-semibold text-slate-900">
                  {targetDemo.famousTirth}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
