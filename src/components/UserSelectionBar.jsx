import React, { useState, useEffect } from 'react';
import { User, UserPlus, Check, Database, Server } from 'lucide-react';
import { getUsersApi, getOrCreateUserApi } from '../services/apiService';

export default function UserSelectionBar({ currentUser, onUserChange, dbStatus }) {
  const [users, setUsers] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Field Agent');

  // Load existing users from backend/MongoDB
  useEffect(() => {
    async function loadUsers() {
      const list = await getUsersApi();
      setUsers(list || []);
      if (!currentUser && list && list.length > 0) {
        onUserChange(list[0].name);
      }
    }
    loadUsers();
  }, []);

  const handleSelectUser = (name) => {
    if (name === '__NEW__') {
      setIsAddingNew(true);
    } else {
      setIsAddingNew(false);
      onUserChange(name);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName || newUserName.trim() === '') return;

    const created = await getOrCreateUserApi(newUserName.trim(), newUserRole);
    if (created) {
      const updatedList = await getUsersApi();
      setUsers(updatedList || []);
      onUserChange(created.name);
      setNewUserName('');
      setIsAddingNew(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/90 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* User Selection */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <div className="p-1.5 bg-brand-50 text-brand-700 rounded-lg">
            <User className="w-4 h-4 stroke-[2.5]" />
          </div>
          
          <span className="font-semibold text-slate-700 whitespace-nowrap">
            Tracking Distance As:
          </span>

          {!isAddingNew ? (
            <div className="flex items-center space-x-2">
              <select
                value={currentUser || ''}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs transition-colors cursor-pointer"
              >
                {users.map(u => (
                  <option key={u._id || u.name} value={u.name}>
                    👤 {u.name} ({u.role || 'Member'})
                  </option>
                ))}
                <option value="__NEW__">➕ Add New Member...</option>
              </select>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name..."
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-medium"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Database className={`w-3.5 h-3.5 ${dbStatus?.mongoConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>MongoDB:</span>
            <span className={`font-bold ${dbStatus?.mongoConnected ? 'text-emerald-700' : 'text-slate-600'}`}>
              {dbStatus?.mongoConnected ? 'Connected' : 'Active (Local)'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Server className="w-3.5 h-3.5 text-brand-600" />
            <span>Express API:</span>
            <span className="font-bold text-brand-700">Port 5000</span>
          </div>
        </div>

      </div>
    </div>
  );
}
