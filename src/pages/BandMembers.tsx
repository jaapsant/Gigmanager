import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBand } from '../context/BandContext';
import { useAuth } from '../context/AuthContext';

export function BandMembers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    bandMembers, 
    instruments: unsortedInstruments, 
    addBandMember, 
    removeBandMember, 
    addInstrument, 
    removeInstrument,
    isInstrumentInUse,
    loading,
  } = useBand();

  // Sort instruments alphabetically
  const instruments = [...unsortedInstruments].sort((a, b) => a.localeCompare(b));

  const [newMember, setNewMember] = useState({ name: '', instrument: '' });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showInstrumentForm, setShowInstrumentForm] = useState(false);
  const [newInstrument, setNewInstrument] = useState('');
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newMember.name && newMember.instrument) {
      try {
        await addBandMember(newMember);
        setNewMember({ name: '', instrument: '' });
        setShowMemberForm(false);
      } catch (err) {
        setError('Failed to add band member. Please check your permissions.');
      }
    }
  };

  const handleInstrumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newInstrument.trim()) {
      try {
        await addInstrument(newInstrument);
        setNewInstrument('');
        setShowInstrumentForm(false);
      } catch (err) {
        setError('Failed to add instrument. Please check your permissions.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/gigs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Gigs
        </button>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Instruments Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Instruments</h2>
                <p className="text-sm text-gray-500 mt-1">Manage available instruments for the band</p>
              </div>
              {user?.emailVerified && (
                <button
                  onClick={() => setShowInstrumentForm(true)}
                  className="bg-white text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 border border-gray-300"
                >
                  <Music className="w-5 h-5 mr-2" />
                  Add Instrument
                </button>
              )}
            </div>

            {showInstrumentForm && (
              <form onSubmit={handleInstrumentSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instrument Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newInstrument}
                    onChange={(e) => setNewInstrument(e.target.value)}
                    placeholder="e.g., Piano"
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInstrumentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Instrument
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {instruments.map((instrument) => {
                const inUse = isInstrumentInUse(instrument);
                return (
                  <div
                    key={instrument}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                  >
                    <span className="text-gray-900">{instrument}</span>
                    {!inUse && user?.emailVerified && (
                      <button
                        onClick={() => removeInstrument(instrument)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200"
                        title="Remove instrument"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {inUse && (
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                        In use
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Band Members Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Band Members</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your band's roster</p>
              </div>
              {user?.emailVerified && (
                <button
                  onClick={() => setShowMemberForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Member
                </button>
              )}
            </div>

            {showMemberForm && (
              <form onSubmit={handleMemberSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instrument
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newMember.instrument}
                      onChange={(e) => setNewMember(prev => ({ ...prev, instrument: e.target.value }))}
                    >
                      <option value="">Select an instrument</option>
                      {instruments.map(instrument => (
                        <option key={instrument} value={instrument}>
                          {instrument}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMemberForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {bandMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.instrument}</p>
                  </div>
                  {user?.emailVerified && member.id !== user.uid && (
                    <button
                      onClick={() => removeBandMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200"
                      title="Remove member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}