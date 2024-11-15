import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, DollarSign, ArrowLeft, Edit2, Save, X, Car } from 'lucide-react';
import { statusOptions } from '../data';
import { AvailabilityStatus } from '../components/AvailabilityStatus';
import { AvailabilityOverview } from '../components/AvailabilityOverview';
import { AddToCalendar } from '../components/AddToCalendar';
import { Gig } from '../types';
import { useGigs } from '../context/GigContext';
import { useBand } from '../context/BandContext';
import { useAuth } from '../context/AuthContext';

export function GigDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { gigs, updateGig } = useGigs();
  const { bandMembers } = useBand();
  const { user } = useAuth();
  const gig = gigs.find((g) => g.id === id);
  
  // Allow editing if user created the gig and is email verified
  const canEditGig = user?.emailVerified && gig?.createdBy === user?.uid;

  const [isEditing, setIsEditing] = useState(false);
  const [editedGig, setEditedGig] = useState<Gig | null>(null);
  const [availabilityNotes, setAvailabilityNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  if (!gig) return <div>Gig not found</div>;
  if (!user) return <div>Please sign in</div>;

  const handleEdit = () => {
    setEditedGig(gig);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedGig(null);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (editedGig) {
      try {
        await updateGig(editedGig);
        setIsEditing(false);
        setEditedGig(null);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update gig');
      }
    }
  };

  const updateAvailability = async (status: 'available' | 'unavailable' | 'tentative', canDrive?: boolean) => {
    if (!user?.emailVerified) {
      setError('Email verification required to update availability');
      return;
    }

    try {
      const currentAvailability = gig.memberAvailability[user.uid] || {};
      const updatedAvailability = {
        ...gig.memberAvailability,
        [user.uid]: {
          ...currentAvailability,
          status,
          note: currentAvailability.note || '',
          canDrive: typeof canDrive === 'boolean' ? canDrive : currentAvailability.canDrive,
        },
      };

      const updatedGig = {
        ...gig,
        memberAvailability: updatedAvailability,
      };

      await updateGig(updatedGig);
      setError('');
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability');
    }
  };

  const updateNote = async (note: string) => {
    if (!user?.emailVerified) {
      setError('Email verification required to update notes');
      return;
    }

    try {
      const currentAvailability = gig.memberAvailability[user.uid] || {};
      const updatedAvailability = {
        ...gig.memberAvailability,
        [user.uid]: {
          ...currentAvailability,
          status: currentAvailability.status || 'tentative',
          note,
          canDrive: currentAvailability.canDrive || false,
        },
      };

      const updatedGig = {
        ...gig,
        memberAvailability: updatedAvailability,
      };

      await updateGig(updatedGig);
      setError('');
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    }
  };

  const toggleDriving = async () => {
    if (!user?.emailVerified) {
      setError('Email verification required to update driving status');
      return;
    }

    const currentAvailability = gig.memberAvailability[user.uid] || {};
    await updateAvailability(
      currentAvailability.status || 'tentative',
      !currentAvailability.canDrive
    );
  };

  const formatTime = () => {
    if (gig.isWholeDay) {
      return "All Day";
    }
    if (gig.startTime && gig.endTime) {
      return `${gig.startTime} - ${gig.endTime}`;
    }
    return "";
  };

  // Count available drivers
  const totalDrivers = Object.values(gig.memberAvailability).reduce((count, availability) => {
    if (availability.status === 'available' && availability.canDrive) {
      return count + 1;
    }
    return count;
  }, 0);

  // Group band members by instrument
  const membersByInstrument = bandMembers.reduce<Record<string, typeof bandMembers>>((acc, member) => {
    if (!acc[member.instrument]) {
      acc[member.instrument] = [];
    }
    acc[member.instrument].push(member);
    return acc;
  }, {});

  // Sort instruments and members within each group
  const sortedInstruments = Object.keys(membersByInstrument).sort();
  sortedInstruments.forEach(instrument => {
    membersByInstrument[instrument].sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleBack = () => {
    const gigDate = new Date(gig.date);
    gigDate.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (gigDate < today) {
      navigate('/gigs', { state: { showHistory: true } });
    } else {
      navigate('/gigs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBack}
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  className="text-3xl font-bold text-gray-900 w-full border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  value={editedGig?.name}
                  onChange={(e) => setEditedGig(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{gig.name}</h1>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <select
                  className={`px-4 py-2 rounded-full text-sm ${statusOptions.find(s => s.value === editedGig?.status)?.color}`}
                  value={editedGig?.status}
                  onChange={(e) => setEditedGig(prev => prev ? { ...prev, status: e.target.value as Gig['status'] } : null)}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`px-4 py-2 rounded-full text-sm ${
                  gig.status === 'completed' 
                    ? 'bg-blue-100 text-blue-800'
                    : statusOptions.find(s => s.value === gig.status)?.color
                }`}>
                  {gig.status === 'completed' ? 'Completed' : statusOptions.find(s => s.value === gig.status)?.label}
                </span>
              )}
              {canEditGig && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <AddToCalendar gig={gig} />
              {isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  {isEditing ? (
                    <input
                      type="date"
                      className="border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      value={editedGig?.date}
                      onChange={(e) => setEditedGig(prev => prev ? { ...prev, date: e.target.value } : null)}
                    />
                  ) : (
                    <span>{new Date(gig.date).toLocaleDateString()}</span>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  {isEditing ? (
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={editedGig?.isWholeDay}
                          onChange={(e) => setEditedGig(prev => prev ? {
                            ...prev,
                            isWholeDay: e.target.checked,
                            startTime: e.target.checked ? null : prev.startTime,
                            endTime: e.target.checked ? null : prev.endTime,
                          } : null)}
                        />
                        All Day
                      </label>
                      {!editedGig?.isWholeDay && (
                        <>
                          <input
                            type="time"
                            className="border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                            value={editedGig?.startTime || ''}
                            onChange={(e) => setEditedGig(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                          />
                          <span>-</span>
                          <input
                            type="time"
                            className="border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                            value={editedGig?.endTime || ''}
                            onChange={(e) => setEditedGig(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <span>{formatTime()}</span>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-3" />
                  {isEditing ? (
                    <input
                      type="number"
                      className="border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      value={editedGig?.pay || ''}
                      onChange={(e) => setEditedGig(prev => prev ? { ...prev, pay: e.target.value ? parseFloat(e.target.value) : null } : null)}
                      placeholder="Enter pay amount"
                    />
                  ) : (
                    gig.pay && <span>${gig.pay}</span>
                  )}
                </div>
              </div>

              {(gig.description || isEditing) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  {isEditing ? (
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editedGig?.description || ''}
                      onChange={(e) => setEditedGig(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={4}
                      placeholder="Enter gig description"
                    />
                  ) : (
                    <p className="text-gray-600">{gig.description}</p>
                  )}
                </div>
              )}

              {/* Band Availability Overview */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Band Availability</h3>
                  {totalDrivers > 0 && (
                    <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <Car className="w-4 h-4" />
                      <span className="ml-1 text-sm font-medium">{totalDrivers}</span>
                    </div>
                  )}
                </div>
                <AvailabilityOverview memberAvailability={gig.memberAvailability} />
              </div>
            </div>

            <div>
              {/* Your Availability Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Your Availability</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateAvailability('available', gig.memberAvailability[user.uid]?.canDrive)}
                        className={`p-2 rounded-full hover:bg-green-100 ${
                          gig.memberAvailability[user.uid]?.status === 'available' ? 'bg-green-100' : ''
                        }`}
                        title="Available"
                      >
                        <AvailabilityStatus status="available" />
                      </button>
                      <button
                        onClick={() => updateAvailability('unavailable', gig.memberAvailability[user.uid]?.canDrive)}
                        className={`p-2 rounded-full hover:bg-red-100 ${
                          gig.memberAvailability[user.uid]?.status === 'unavailable' ? 'bg-red-100' : ''
                        }`}
                        title="Unavailable"
                      >
                        <AvailabilityStatus status="unavailable" />
                      </button>
                      <button
                        onClick={() => updateAvailability('tentative', gig.memberAvailability[user.uid]?.canDrive)}
                        className={`p-2 rounded-full hover:bg-yellow-100 ${
                          gig.memberAvailability[user.uid]?.status === 'tentative' ? 'bg-yellow-100' : ''
                        }`}
                        title="Tentative"
                      >
                        <AvailabilityStatus status="tentative" />
                      </button>
                    </div>
                    {gig.memberAvailability[user.uid]?.status === 'available' && (
                      <button
                        onClick={toggleDriving}
                        className={`p-2 rounded-full hover:bg-blue-100 ${
                          gig.memberAvailability[user.uid]?.canDrive ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                        }`}
                        title="Available to drive"
                      >
                        <Car className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full mt-2 p-2 text-sm border rounded-md"
                    placeholder="Add a note about your availability..."
                    value={gig.memberAvailability[user.uid]?.note || ''}
                    onChange={(e) => updateNote(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              {/* Other Band Members Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Band Members</h3>
                <div className="space-y-6">
                  {sortedInstruments.map((instrument) => (
                    <div key={instrument} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">{instrument}</h4>
                      <div className="space-y-3">
                        {membersByInstrument[instrument].map((member) => (
                          member.id !== user.uid && (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{member.name}</span>
                              <div className="flex items-center space-x-2">
                                <AvailabilityStatus status={gig.memberAvailability[member.id]?.status} size="sm" />
                                {gig.memberAvailability[member.id]?.status === 'available' && 
                                 gig.memberAvailability[member.id]?.canDrive && (
                                  <Car className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}