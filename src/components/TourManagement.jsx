import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Map, 
  X, 
  Loader2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Route
} from 'lucide-react';
import LocationList from './LocationList';
import { getToursApi, createTourApi, updateTourApi, updateTourStatusApi, deleteTourApi, getUsersApi } from '../services/apiService';
import { calculateRouteFree } from '../services/freeRoutingService';

export default function TourManagement({ currentUser, onLoadTourToMap }) {
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Create & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingTourId, setEditingTourId] = useState(null); // null if creating, tour ID if editing

  const [tourTitle, setTourTitle] = useState('');
  const [tourDesc, setTourDesc] = useState('');
  const [assignedUser, setAssignedUser] = useState(currentUser || '');
  const [tourStatus, setTourStatus] = useState('PLANNED');

  const [tourLocations, setTourLocations] = useState([
    { id: 'tloc-1', address: '', lat: null, lng: null },
    { id: 'tloc-2', address: '', lat: null, lng: null }
  ]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [expandedTourLegs, setExpandedTourLegs] = useState({});

  // Load tours & users on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tList, uList] = await Promise.all([
        getToursApi(),
        getUsersApi()
      ]);
      setTours(tList || []);
      setUsers(uList || []);
      if (!assignedUser && uList && uList.length > 0) {
        setAssignedUser(uList[0].name);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const reloadTours = async () => {
    const tList = await getToursApi();
    setTours(tList || []);
  };

  // Open modal for Creating a new tour
  const handleOpenCreateModal = () => {
    setEditingTourId(null);
    setTourTitle('');
    setTourDesc('');
    setAssignedUser(currentUser || (users[0]?.name || ''));
    setTourStatus('PLANNED');
    setTourLocations([
      { id: 'tloc-1', address: '', lat: null, lng: null },
      { id: 'tloc-2', address: '', lat: null, lng: null }
    ]);
    setErrorMsg(null);
    setShowModal(true);
  };

  // Open modal for Editing an existing tour
  const handleOpenEditModal = (tour) => {
    setEditingTourId(tour._id);
    setTourTitle(tour.title || '');
    setTourDesc(tour.description || '');
    setAssignedUser(tour.assignedUser || currentUser || '');
    setTourStatus(tour.status || 'PLANNED');

    if (tour.locations && tour.locations.length >= 2) {
      setTourLocations(tour.locations.map((loc, idx) => ({
        id: loc.id || `edit-loc-${idx}-${Date.now()}`,
        address: loc.address || '',
        lat: loc.lat || null,
        lng: loc.lng || null
      })));
    } else {
      setTourLocations([
        { id: 'tloc-1', address: '', lat: null, lng: null },
        { id: 'tloc-2', address: '', lat: null, lng: null }
      ]);
    }

    setErrorMsg(null);
    setShowModal(true);
  };

  // Create or Update Tour Submission
  const handleSaveTour = async (e) => {
    e.preventDefault();
    if (!tourTitle.trim()) {
      setErrorMsg('Please enter a tour title.');
      return;
    }

    const validLocs = tourLocations.filter(l => l.address && l.address.trim() !== '');
    if (validLocs.length < 2) {
      setErrorMsg('Please enter at least 2 locations for the tour.');
      return;
    }

    setIsCalculating(true);
    setErrorMsg(null);

    try {
      // Calculate tour distance, duration & leg breakdown
      const calcResult = await calculateRouteFree(validLocs, 'DRIVING');

      const tourPayload = {
        title: tourTitle.trim(),
        description: tourDesc.trim(),
        assignedUser,
        locations: calcResult.resolvedLocations || validLocs,
        result: {
          totalDistanceKm: calcResult.totalDistanceKm,
          totalDistanceMiles: calcResult.totalDistanceMiles,
          totalDurationFormatted: calcResult.totalDurationFormatted,
          totalDistanceMeters: calcResult.totalDistanceMeters,
          legs: calcResult.legs || []
        },
        status: tourStatus,
        travelMode: 'DRIVING'
      };

      if (editingTourId) {
        await updateTourApi(editingTourId, tourPayload);
      } else {
        await createTourApi({ ...tourPayload, startDate: new Date() });
      }

      await reloadTours();
      setShowModal(false);
    } catch (err) {
      console.error("Save tour error:", err);
      setErrorMsg(err.message || 'Failed to save tour.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Change tour status
  const handleUpdateStatus = async (tourId, newStatus) => {
    await updateTourStatusApi(tourId, newStatus);
    await reloadTours();
  };

  // Delete tour with instant UI update
  const handleDeleteTour = async (tourId) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      // Optimistic UI update
      setTours(prev => prev.filter(t => String(t._id) !== String(tourId)));
      try {
        await deleteTourApi(tourId);
      } catch (err) {
        console.warn("Delete API error, reloading tours:", err);
      }
      await reloadTours();
    }
  };

  // Toggle leg breakdown visibility for a tour card
  const toggleLegBreakdown = (tourId) => {
    setExpandedTourLegs(prev => ({ ...prev, [tourId]: !prev[tourId] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Briefcase className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Tour & Trip Management System
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create multi-destination field tours, view segment-by-segment waypoint distances, assign members, edit tour itineraries, and view on the map.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Tour</span>
        </button>
      </div>

      {/* Tour List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading tours from MongoDB...
        </div>
      ) : tours.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <Briefcase className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <p className="text-sm font-semibold text-slate-600">No tours created yet</p>
          <p className="text-xs text-slate-400">Click "Create New Tour" above to start managing field trips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tours.map((tour) => {
            const statusColors = {
              'PLANNED': 'bg-brand-50 text-brand-700 border-brand-200',
              'IN_PROGRESS': 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse',
              'COMPLETED': 'bg-emerald-50 text-emerald-800 border-emerald-200',
              'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-200'
            };

            const isLegsExpanded = expandedTourLegs[tour._id];
            const legs = tour.result?.legs || [];

            return (
              <div key={tour._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                
                {/* Header & Status */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {tour.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[tour.status] || 'bg-slate-100'}`}>
                      {tour.status}
                    </span>
                  </div>

                  {tour.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {tour.description}
                    </p>
                  )}
                </div>

                {/* Info & Waypoint Distance Summary */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Assigned Member:</span>
                    <span className="font-bold text-slate-900">👤 {tour.assignedUser}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Total Route Distance:</span>
                    <span className="font-bold text-brand-700">
                      {tour.result?.totalDistanceKm ? `${tour.result.totalDistanceKm} km` : 'N/A'} ({tour.result?.totalDurationFormatted || ''})
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{tour.locations?.length || 0} Waypoint Stops</span>
                    </div>

                    {/* Segment Leg Breakdown Toggle */}
                    {tour.locations && tour.locations.length >= 2 && (
                      <button
                        onClick={() => toggleLegBreakdown(tour._id)}
                        className="text-[11px] font-bold text-brand-700 hover:underline flex items-center space-x-0.5"
                      >
                        <span>{isLegsExpanded ? 'Hide Waypoints' : 'View Segment Distances'}</span>
                        {isLegsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Waypoint-by-Waypoint Distance Breakdown */}
                  {isLegsExpanded && (
                    <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                        Waypoint Distances:
                      </span>
                      {tour.locations.map((loc, idx) => {
                        const nextLoc = tour.locations[idx + 1];
                        const legInfo = legs[idx];
                        return (
                          <div key={idx} className="flex items-center justify-between text-slate-700 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                            <div className="min-w-0 pr-2 truncate">
                              <span className="font-bold text-slate-900">Stop {idx + 1}: </span>
                              <span>{loc.address.split(',')[0]}</span>
                            </div>
                            {nextLoc && (
                              <div className="text-right flex-shrink-0 font-semibold text-brand-700">
                                {legInfo ? `${legInfo.distanceText}` : 'Next →'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Status Dropdown */}
                  <select
                    value={tour.status}
                    onChange={(e) => handleUpdateStatus(tour._id, e.target.value)}
                    className="text-xs font-semibold bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="PLANNED">Status: Planned</option>
                    <option value="IN_PROGRESS">Status: In Progress</option>
                    <option value="COMPLETED">Status: Completed</option>
                    <option value="CANCELLED">Status: Cancelled</option>
                  </select>

                  <div className="flex items-center space-x-1">
                    {/* Load on Map */}
                    <button
                      onClick={() => onLoadTourToMap(tour.locations)}
                      className="p-1.5 text-brand-700 hover:bg-brand-50 rounded-lg transition-colors font-semibold text-xs flex items-center space-x-1"
                      title="Load Tour Route on Map"
                    >
                      <Map className="w-4 h-4" />
                      <span className="hidden sm:inline">Map</span>
                    </button>

                    {/* Edit Tour */}
                    <button
                      onClick={() => handleOpenEditModal(tour)}
                      className="p-1.5 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Tour Details & Waypoints"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Tour */}
                    <button
                      onClick={() => handleDeleteTour(tour._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Tour"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Tour Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingTourId ? 'Edit Tour / Trip' : 'Create New Tour / Trip'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveTour} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Tour Title *
                  </label>
                  <input
                    type="text"
                    value={tourTitle}
                    onChange={(e) => setTourTitle(e.target.value)}
                    placeholder="e.g., Sales Visit - West Coast"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Assign To Member *
                  </label>
                  <select
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    {users.map(u => (
                      <option key={u._id || u.name} value={u.name}>
                        {u.name} ({u.role || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Tour Status
                  </label>
                  <select
                    value={tourStatus}
                    onChange={(e) => setTourStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Description / Notes
                  </label>
                  <input
                    type="text"
                    value={tourDesc}
                    onChange={(e) => setTourDesc(e.target.value)}
                    placeholder="Optional itinerary details..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Tour Stops Input List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold uppercase text-slate-700 block">
                  Tour Destinations / Waypoints (Distance calculated automatically) *
                </label>
                <LocationList
                  locations={tourLocations}
                  onUpdateLocation={(idx, val) => {
                    const copy = [...tourLocations];
                    copy[idx] = val;
                    setTourLocations(copy);
                  }}
                  onAddLocation={() => {
                    if (tourLocations.length < 8) {
                      const copy = [...tourLocations];
                      copy.splice(copy.length - 1, 0, { id: `tloc-${Date.now()}`, address: '', lat: null, lng: null });
                      setTourLocations(copy);
                    }
                  }}
                  onRemoveLocation={(idx) => setTourLocations(tourLocations.filter((_, i) => i !== idx))}
                  onSwapLocations={() => setTourLocations([...tourLocations].reverse())}
                  onMoveLocationUp={(idx) => {
                    const copy = [...tourLocations];
                    const temp = copy[idx];
                    copy[idx] = copy[idx - 1];
                    copy[idx - 1] = temp;
                    setTourLocations(copy);
                  }}
                  onMoveLocationDown={(idx) => {
                    const copy = [...tourLocations];
                    const temp = copy[idx];
                    copy[idx] = copy[idx + 1];
                    copy[idx + 1] = temp;
                    setTourLocations(copy);
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md disabled:opacity-70"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calculating Distances & Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingTourId ? 'Save Changes' : 'Create Tour'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
