import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Locate, X, Loader2, Navigation } from 'lucide-react';
import { searchPlacesFree, reverseGeocodeFree } from '../services/freeRoutingService';

export default function LocationSearch({
  id,
  label,
  value,
  onChange,
  onSelectPlace,
  onRemove,
  isRemovable = false,
  placeholder = "Search place, city, address, landmark, PIN code...",
  badgeColor = "bg-brand-600",
  showCurrentLocation = false
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);

  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle text input with 300ms debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      const results = await searchPlacesFree(val);
      setSuggestions(results);
      setIsSearching(false);
      setIsOpen(results.length > 0);
    }, 300);
  };

  // Handle selecting a place from dropdown
  const handleSelectSuggestion = (place) => {
    setQuery(place.formattedAddress);
    onChange(place.formattedAddress);
    setIsOpen(false);
    setSuggestions([]);
    if (onSelectPlace) {
      onSelectPlace({
        address: place.formattedAddress,
        lat: place.lat,
        lng: place.lng,
        name: place.name
      });
    }
  };

  // Handle GPS Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await reverseGeocodeFree(latitude, longitude);
          setQuery(result.address);
          onChange(result.address);
          if (onSelectPlace) {
            onSelectPlace({
              address: result.address,
              lat: latitude,
              lng: longitude,
              name: 'My Current Location'
            });
          }
        } catch (err) {
          const fallback = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setQuery(fallback);
          onChange(fallback);
          if (onSelectPlace) {
            onSelectPlace({ address: fallback, lat: latitude, lng: longitude });
          }
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Unable to retrieve GPS location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable GPS in browser.";
        }
        setLocateError(msg);
        setTimeout(() => setLocateError(null), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Clear single field
  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      {/* Label Bar */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
          <span>{label}</span>
        </label>
        
        {showCurrentLocation && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center space-x-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded-md transition-colors border border-brand-200/60"
            title="Use current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
            ) : (
              <Locate className="w-3 h-3 text-brand-600" />
            )}
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
          ) : (
            <MapPin className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-2xs placeholder:text-slate-400 font-medium transition-all"
          autoComplete="off"
        />

        <div className="absolute right-2 flex items-center space-x-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isRemovable && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove stop"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Free Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          {suggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectSuggestion(item)}
              className="p-2.5 hover:bg-brand-50/70 cursor-pointer flex items-start space-x-2.5 transition-colors group"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {item.formattedAddress}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Geolocation error notification */}
      {locateError && (
        <p className="text-[11px] font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {locateError}
        </p>
      )}
    </div>
  );
}
