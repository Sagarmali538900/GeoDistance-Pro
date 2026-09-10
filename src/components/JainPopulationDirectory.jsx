import React, { useState } from 'react';
import { Users, Landmark, Search, MapPin, Sparkles, Navigation } from 'lucide-react';
import { getAllJainCenters, getJainDemographics } from '../services/jainPopulationService';

export default function JainPopulationDirectory({ onCalculateRouteToTirth }) {
  const [searchQuery, setSearchQuery] = useState('');
  const allCenters = getAllJainCenters();

  const filteredCenters = allCenters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.famousTirth && c.famousTirth.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-5 rounded-2xl border border-amber-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-bold text-amber-950">
              Jain Population & Tirth Directory
            </h2>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Demographic insights of Jain populations across major Indian cities, states, and sacred Jain Tirth pilgrimage sites.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, state, or Tirth..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Grid of Jain Population Centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCenters.map((center, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {center.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {center.state}
                  </span>
                </div>

                <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {center.percent} Share
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Jain Population</span>
                  <span className="font-extrabold text-slate-900">{center.jainPopulation}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">Jain Derasars</span>
                  <span className="font-extrabold text-amber-800">{center.templesCount}</span>
                </div>
              </div>

              {center.famousTirth && (
                <div className="text-xs space-y-0.5 pt-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Famous Tirth / Pilgrimage
                  </span>
                  <p className="text-slate-700 font-medium">
                    {center.famousTirth}
                  </p>
                </div>
              )}

            </div>

            {onCalculateRouteToTirth && (
              <button
                onClick={() => onCalculateRouteToTirth(center.name)}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 flex items-center justify-center space-x-1.5 transition-colors mt-2"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-700" />
                <span>Calculate Distance to {center.name}</span>
              </button>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
