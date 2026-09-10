import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserSelectionBar from './components/UserSelectionBar';
import LocationList from './components/LocationList';
import DistanceResult from './components/DistanceResult';
import MapView from './components/MapView';
import RecentSearches from './components/RecentSearches';
import MembersDirectory from './components/MembersDirectory';
import TourManagement from './components/TourManagement';

import { calculateRouteFree } from './services/freeRoutingService';
import { checkServerStatus, saveCalculationHistoryApi } from './services/apiService';
import { 
  Calculator, 
  RotateCcw, 
  Loader2, 
  AlertCircle, 
  Navigation
} from 'lucide-react';

const INITIAL_LOCATIONS = [
  { id: 'start-1', address: '', lat: null, lng: null },
  { id: 'end-2', address: '', lat: null, lng: null }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'members' | 'tours'
  const [currentUser, setCurrentUser] = useState('Sagar Mali');
  const [dbStatus, setDbStatus] = useState({ status: 'online', mongoConnected: true });

  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [unit, setUnit] = useState('km'); // 'km' | 'mi'
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [directionsResult, setDirectionsResult] = useState(null);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Check server & MongoDB status on mount
  useEffect(() => {
    async function init() {
      const status = await checkServerStatus();
      setDbStatus(status);

      try {
        const savedHistory = localStorage.getItem('geometrics_recent_searches');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (e) {}
    }
    init();
  }, []);

  // Update location array item
  const handleUpdateLocation = (index, updatedItem) => {
    const newLocations = [...locations];
    newLocations[index] = updatedItem;
    setLocations(newLocations);
    if (errorMessage) setErrorMessage(null);
  };

  // Add intermediate waypoint
  const handleAddLocation = () => {
    if (locations.length >= 8) return;
    const newId = `stop-${Date.now()}`;
    const newLocations = [...locations];
    newLocations.splice(newLocations.length - 1, 0, { id: newId, address: '', lat: null, lng: null });
    setLocations(newLocations);
  };

  // Remove waypoint stop
  const handleRemoveLocation = (index) => {
    if (locations.length <= 2) return;
    setLocations(locations.filter((_, idx) => idx !== index));
  };

  // Swap locations order
  const handleSwapLocations = () => {
    setLocations([...locations].reverse());
  };

  // Move location up/down
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...locations];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setLocations(updated);
  };

  const handleMoveDown = (index) => {
    if (index >= locations.length - 1) return;
    const updated = [...locations];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setLocations(updated);
  };

  // Clear search form
  const handleClear = () => {
    setLocations(INITIAL_LOCATIONS);
    setDirectionsResult(null);
    setErrorMessage(null);
  };

  // Load external route onto map tab
  const handleLoadRouteToMap = (routeLocations) => {
    if (routeLocations && routeLocations.length >= 2) {
      const formatted = routeLocations.map((loc, i) => ({
        id: `map-loc-${i}-${Date.now()}`,
        address: loc.address,
        lat: loc.lat || null,
        lng: loc.lng || null
      }));
      setLocations(formatted);
      setActiveTab('calculator');
      handleCalculateRouteWithLocations(formatted);
    }
  };

  // Perform route calculation
  const handleCalculateRoute = async (e) => {
    if (e) e.preventDefault();
    await handleCalculateRouteWithLocations(locations);
  };

  const handleCalculateRouteWithLocations = async (locsToCalc) => {
    const validLocations = locsToCalc.filter(loc => loc.address && loc.address.trim() !== '');

    if (validLocations.length < 2) {
      setErrorMessage('Please specify both FROM and TO locations.');
      return;
    }

    setIsCalculating(true);
    setErrorMessage(null);

    try {
      const result = await calculateRouteFree(validLocations, travelMode);
      setDirectionsResult(result);

      if (result.resolvedLocations) {
        setLocations(result.resolvedLocations.map((loc, idx) => ({
          id: locsToCalc[idx]?.id || `loc-${idx}`,
          address: loc.address,
          lat: loc.lat,
          lng: loc.lng
        })));
      }

      // Save calculation to MongoDB database under current user name!
      await saveCalculationHistoryApi({
        userName: currentUser || 'Default User',
        locations: result.resolvedLocations || validLocations,
        result: {
          totalDistanceKm: result.totalDistanceKm,
          totalDistanceMiles: result.totalDistanceMiles,
          totalDurationFormatted: result.totalDurationFormatted,
          totalDistanceMeters: result.totalDistanceMeters,
          legs: result.legs
        },
        travelMode
      });

    } catch (err) {
      console.error("Calculation error:", err);
      setErrorMessage(err.message || 'Could not calculate route distance.');
      setDirectionsResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Top Header & Tab Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unit={unit}
        setUnit={setUnit}
        travelMode={travelMode}
        setTravelMode={setTravelMode}
        onToggleHistory={() => setShowHistoryPanel(!showHistoryPanel)}
        historyCount={history.length}
      />

      {/* User Selection & Database Status Bar */}
      <UserSelectionBar
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Route & Distance Calculator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Control Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-brand-600 stroke-[2.5]" />
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Route & Distance Planner
                    </h2>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {locations.length} Stops
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCalculateRoute} className="space-y-4">
                  <LocationList
                    locations={locations}
                    onUpdateLocation={handleUpdateLocation}
                    onAddLocation={handleAddLocation}
                    onRemoveLocation={handleRemoveLocation}
                    onSwapLocations={handleSwapLocations}
                    onMoveLocationUp={handleMoveUp}
                    onMoveLocationDown={handleMoveDown}
                  />

                  <div className="grid grid-cols-12 gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="col-span-9 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 group"
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Calculating Distance...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 text-brand-200 group-hover:scale-110 transition-transform" />
                          <span>Calculate Distance</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="col-span-3 flex items-center justify-center space-x-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </form>

              </div>

              {directionsResult && (
                <DistanceResult
                  result={directionsResult}
                  unit={unit}
                  locations={locations}
                  travelMode={travelMode}
                  currentUser={currentUser}
                />
              )}

              {showHistoryPanel && (
                <RecentSearches
                  history={history}
                  onSelectHistoryItem={(item) => {
                    if (item && item.locations) {
                      handleLoadRouteToMap(item.locations);
                      setShowHistoryPanel(false);
                    }
                  }}
                  onClearHistory={() => setHistory([])}
                  onClose={() => setShowHistoryPanel(false)}
                />
              )}

            </div>

            {/* Right Map (7 Cols) */}
            <div className="lg:col-span-7 h-full min-h-[450px] lg:min-h-[620px] sticky top-20">
              <MapView
                directionsResult={directionsResult}
                locations={locations}
              />
            </div>

          </div>
        )}

        {/* TAB 2: Team Members & User History */}
        {activeTab === 'members' && (
          <MembersDirectory
            onSelectRouteForMap={handleLoadRouteToMap}
          />
        )}

        {/* TAB 3: Tour Management System */}
        {activeTab === 'tours' && (
          <TourManagement
            currentUser={currentUser}
            onLoadTourToMap={handleLoadRouteToMap}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">GeoMetrics</span>
            <span>– Full-Stack Distance & Tour Management (MongoDB + Leaflet + Express)</span>
          </div>
          <div>
            Tracking active user: <strong className="text-slate-800 font-bold">{currentUser}</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}
