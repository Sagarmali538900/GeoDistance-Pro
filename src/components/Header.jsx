import React from 'react';
import { 
  Navigation, 
  Car, 
  Footprints, 
  Bike, 
  Bus, 
  History,
  ShieldCheck,
  Users,
  Briefcase,
  Calculator
} from 'lucide-react';

export default function Header({ 
  activeTab,
  setActiveTab,
  unit, 
  setUnit, 
  travelMode, 
  setTravelMode, 
  onToggleHistory,
  historyCount
}) {
  const travelModes = [
    { id: 'DRIVING', label: 'Driving', icon: Car },
    { id: 'TRANSIT', label: 'Transit', icon: Bus },
    { id: 'WALKING', label: 'Walking', icon: Footprints },
    { id: 'BICYCLING', label: 'Bicycling', icon: Bike },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Navigation className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  GeoMetrics
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Enterprise Distance & Tour Management
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-white text-brand-700 shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Distance Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'members' 
                  ? 'bg-white text-brand-700 shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Members & History</span>
            </button>

            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tours' 
                  ? 'bg-white text-brand-700 shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Tour Management</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Unit Toggle (km / miles) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setUnit('km')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  unit === 'km' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                KM
              </button>
              <button
                onClick={() => setUnit('mi')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  unit === 'mi' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                MILES
              </button>
            </div>

            {/* History Toggle */}
            <button
              onClick={onToggleHistory}
              className="relative p-2 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              title="Recent Search History"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>

            {/* MongoDB Badge */}
            <div 
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              title="Connected to MongoDB database"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">MongoDB Connected</span>
            </div>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${
              activeTab === 'calculator' ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-600'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${
              activeTab === 'members' ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members</span>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${
              activeTab === 'tours' ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-600'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tours</span>
          </button>
        </div>

      </div>
    </header>
  );
}
