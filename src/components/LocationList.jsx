import React from 'react';
import { ArrowUpDown, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import LocationSearch from './LocationSearch';

export default function LocationList({
  locations,
  onUpdateLocation,
  onAddLocation,
  onRemoveLocation,
  onSwapLocations,
  onMoveLocationUp,
  onMoveLocationDown
}) {
  const maxLocations = 8;

  return (
    <div className="space-y-4">
      {locations.map((loc, index) => {
        const isFirst = index === 0;
        const isLast = index === locations.length - 1;
        
        let label = `WAYPOINT ${index}`;
        let badgeColor = "bg-brand-500";
        if (isFirst) {
          label = "FROM";
          badgeColor = "bg-emerald-500";
        } else if (isLast) {
          label = "TO";
          badgeColor = "bg-rose-500";
        }

        return (
          <div key={loc.id || index} className="relative group">
            <div className="flex items-start space-x-2">
              
              {/* Location Input Component */}
              <div className="flex-1">
                <LocationSearch
                  id={`location-input-${index}`}
                  label={label}
                  value={loc.address}
                  onChange={(val) => onUpdateLocation(index, { ...loc, address: val, lat: null, lng: null })}
                  onSelectPlace={(placeData) => onUpdateLocation(index, { ...loc, ...placeData })}
                  onRemove={() => onRemoveLocation(index)}
                  isRemovable={locations.length > 2 && !isFirst && !isLast}
                  placeholder={
                    isFirst 
                      ? "Enter starting point, city, address or landmark..." 
                      : isLast 
                        ? "Enter destination location..." 
                        : `Enter intermediate stop ${index}...`
                  }
                  badgeColor={badgeColor}
                  showCurrentLocation={isFirst}
                />
              </div>

              {/* Reorder controls for intermediate waypoints */}
              {locations.length > 2 && (
                <div className="flex flex-col space-y-1 pt-6">
                  {!isFirst && (
                    <button
                      type="button"
                      onClick={() => onMoveLocationUp(index)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isLast && (
                    <button
                      type="button"
                      onClick={() => onMoveLocationDown(index)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Swap Button between From & To when 2 stops, or Swap All button */}
            {isFirst && locations.length === 2 && (
              <div className="flex justify-center my-2">
                <button
                  type="button"
                  onClick={onSwapLocations}
                  className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-full transition-all shadow-2xs group"
                  title="Swap From and To locations"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-600 transition-transform duration-200 group-hover:rotate-180" />
                  <span>Swap ⇅</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Location & Reverse Route Controls */}
      <div className="flex items-center justify-between pt-1">
        {locations.length < maxLocations && (
          <button
            type="button"
            onClick={onAddLocation}
            className="flex items-center space-x-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200/80 transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Waypoint</span>
          </button>
        )}

        {locations.length > 2 && (
          <button
            type="button"
            onClick={onSwapLocations}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
            title="Reverse full route order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Reverse Route ⇅</span>
          </button>
        )}
      </div>
    </div>
  );
}
