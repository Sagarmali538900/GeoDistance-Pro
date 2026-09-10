import React, { useState, useEffect } from 'react';
import { Users, User, Clock, Route, Calendar, ArrowRight, Search, X, RefreshCw, Globe } from 'lucide-react';
import { getUsersApi, getUserHistoryApi, getAllHistoryApi, getToursApi } from '../services/apiService';

export default function MembersDirectory({ onSelectRouteForMap }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewAllTeamHistory, setViewAllTeamHistory] = useState(false);
  const [teamHistory, setTeamHistory] = useState([]);

  const [userHistory, setUserHistory] = useState([]);
  const [userTours, setUserTours] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMembers = async () => {
    const list = await getUsersApi();
    setUsers(list || []);
  };

  const loadAllTeamHistory = async () => {
    setViewAllTeamHistory(true);
    setSelectedUser(null);
    setLoadingHistory(true);
    try {
      const allHist = await getAllHistoryApi();
      setTeamHistory(allHist || []);
    } catch (e) {
      console.warn("Failed to load team history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load all users on mount
  useEffect(() => {
    loadMembers();
  }, []);

  // When a user card is clicked, load their distance history & tours from MongoDB
  const handleUserClick = async (user) => {
    setViewAllTeamHistory(false);
    setSelectedUser(user);
    setLoadingHistory(true);
    try {
      const [history, tours] = await Promise.all([
        getUserHistoryApi(user.name),
        getToursApi(user.name)
      ]);
      setUserHistory(history || []);
      setUserTours(tours || []);
    } catch (e) {
      console.warn("Failed to load user history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Team Members & User History Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse all team members or view complete team-wide distance calculations saved in MongoDB.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={loadAllTeamHistory}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs ${
              viewAllTeamHistory 
                ? 'bg-brand-600 text-white' 
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View All Team History</span>
          </button>

          <button
            onClick={loadMembers}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
            title="Refresh Member List"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter team member name..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 shadow-2xs font-medium"
        />
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?.name === user.name;
          const calcCount = user.calculationsCount || 0;

          return (
            <div
              key={user._id || user.name}
              onClick={() => handleUserClick(user)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-brand-50/80 border-brand-300 shadow-md ring-2 ring-brand-500/20' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-card hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {user.name}
                    </h3>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                      {calcCount} Logged
                    </span>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-slate-500 mt-0.5">
                    {user.role || 'Field Agent'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Active'}
                  </span>
                </div>
                <span className="font-bold text-brand-700 hover:underline">
                  View History →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW ALL TEAM HISTORY PANEL */}
      {viewAllTeamHistory && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-600 text-white rounded-xl">
                <Globe className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  All Team-Wide Distance Calculations ({teamHistory.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time distance calculations recorded by every team member in MongoDB
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewAllTeamHistory(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading team calculations from MongoDB...
            </div>
          ) : teamHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No calculations recorded by any team member yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {teamHistory.map((item, idx) => {
                const fromLoc = item.locations[0]?.address || 'Origin';
                const toLoc = item.locations[item.locations.length - 1]?.address || 'Destination';
                const distKm = item.result?.totalDistanceKm ? `${item.result.totalDistanceKm} km` : 'N/A';
                const dur = item.result?.totalDurationFormatted || 'N/A';

                return (
                  <div
                    key={item._id || idx}
                    className="p-3 bg-slate-50 hover:bg-brand-50/60 border border-slate-200 rounded-xl text-xs space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          👤 {item.userName}
                        </span>
                        <span>• {new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {distKm} • {dur}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 font-medium text-slate-800">
                      <span className="truncate max-w-[45%]" title={fromLoc}>{fromLoc.split(',')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[45%]" title={toLoc}>{toLoc.split(',')[0]}</span>
                    </div>

                    {onSelectRouteForMap && (
                      <button
                        onClick={() => onSelectRouteForMap(item.locations)}
                        className="text-[11px] font-bold text-brand-700 hover:underline pt-1 block"
                      >
                        Load Route on Map →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Member History Drawer / Modal */}
      {selectedUser && !viewAllTeamHistory && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5 animate-in fade-in">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedUser.name}'s Distance & Trip History
                </h3>
                <p className="text-xs text-slate-500">
                  Calculations saved in MongoDB for {selectedUser.name}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading distance history from MongoDB...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Distance Calculations History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Route className="w-4 h-4 text-brand-600" />
                    <span>Calculated Routes ({userHistory.length})</span>
                  </div>
                </div>

                {userHistory.length === 0 ? (
                  <div className="p-5 bg-slate-50 rounded-xl text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-600">No distance calculations recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {userHistory.map((item, idx) => {
                      const fromLoc = item.locations[0]?.address || 'Origin';
                      const toLoc = item.locations[item.locations.length - 1]?.address || 'Destination';
                      const distKm = item.result?.totalDistanceKm ? `${item.result.totalDistanceKm} km` : 'N/A';
                      const dur = item.result?.totalDurationFormatted || 'N/A';

                      return (
                        <div
                          key={item._id || idx}
                          className="p-3 bg-slate-50 hover:bg-brand-50/60 border border-slate-200 rounded-xl text-xs space-y-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                            <span className="font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                              {distKm} • {dur}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 font-medium text-slate-800">
                            <span className="truncate max-w-[45%]" title={fromLoc}>{fromLoc.split(',')[0]}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[45%]" title={toLoc}>{toLoc.split(',')[0]}</span>
                          </div>

                          {onSelectRouteForMap && (
                            <button
                              onClick={() => onSelectRouteForMap(item.locations)}
                              className="text-[11px] font-bold text-brand-700 hover:underline pt-1 block"
                            >
                              Load Route on Map →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assigned Tours */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Assigned Tours / Trips ({userTours.length})</span>
                </div>

                {userTours.length === 0 ? (
                  <div className="p-5 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs font-semibold text-slate-600">No assigned tours found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {userTours.map((tour, idx) => (
                      <div
                        key={tour._id || idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{tour.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tour.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            tour.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'
                          }`}>
                            {tour.status}
                          </span>
                        </div>

                        <p className="text-slate-600 text-[11px]">
                          {tour.locations?.length || 0} Stops • Total: {tour.result?.totalDistanceKm ? `${tour.result.totalDistanceKm} km` : 'N/A'}
                        </p>

                        {onSelectRouteForMap && tour.locations && (
                          <button
                            onClick={() => onSelectRouteForMap(tour.locations)}
                            className="text-[11px] font-bold text-brand-700 hover:underline pt-1 block"
                          >
                            Load Tour on Map →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
