import React, { useState, useEffect } from 'react';
import { Plus, Users, History, Calendar, LayoutGrid, List, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GigCard } from '../components/GigCard';
import { useGigs } from '../context/GigContext';
import { useAuth } from '../context/AuthContext';
import { Gig } from '../types';
import { statusOptions } from '../data';

export function GigList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gigs, loading } = useGigs();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Set showHistory based on navigation state
  useEffect(() => {
    const state = location.state as { showHistory?: boolean } | null;
    if (state?.showHistory) {
      setShowHistory(true);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading gigs...</div>
      </div>
    );
  }

  // Split gigs into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { upcomingGigs, pastGigs } = gigs.reduce<{ upcomingGigs: Gig[]; pastGigs: Gig[] }>(
    (acc, gig) => {
      const gigDate = new Date(gig.date);
      gigDate.setHours(23, 59, 59, 999);

      if (gigDate >= today) {
        acc.upcomingGigs.push(gig);
      } else {
        acc.pastGigs.push(gig);
      }
      return acc;
    },
    { upcomingGigs: [], pastGigs: [] }
  );

  // Sort upcoming gigs by date ascending, past gigs by date descending
  upcomingGigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  pastGigs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderCompactView = (gigs: Gig[]) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gig
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            {!showHistory && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Status
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {gigs.map((gig) => {
            const hasUserAvailability = user && gig.memberAvailability[user.uid]?.status;
            return (
              <tr
                key={gig.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  !hasUserAvailability && !showHistory ? 'bg-yellow-50' : ''
                }`}
                onClick={() => navigate(`/gig/${gig.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(gig.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{gig.name}</div>
                  {gig.pay && (
                    <div className="text-sm text-gray-500">${gig.pay}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    gig.status === 'completed' 
                      ? 'bg-blue-100 text-blue-800'
                      : statusOptions.find(s => s.value === gig.status)?.color
                  }`}>
                    {gig.status === 'completed' ? 'Completed' : statusOptions.find(s => s.value === gig.status)?.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {gig.isWholeDay ? (
                    'All Day'
                  ) : (
                    gig.startTime && gig.endTime ? `${gig.startTime} - ${gig.endTime}` : ''
                  )}
                </td>
                {!showHistory && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasUserAvailability ? (
                      <span className={`text-sm ${
                        gig.memberAvailability[user.uid].status === 'available'
                          ? 'text-green-600'
                          : gig.memberAvailability[user.uid].status === 'unavailable'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {gig.memberAvailability[user.uid].status}
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Needed
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {gigs.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No {showHistory ? 'past' : 'upcoming'} gigs found
        </div>
      )}
    </div>
  );

  const renderGridView = (gigs: Gig[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gigs.map((gig) => (
        <GigCard key={gig.id} gig={gig} />
      ))}
      {gigs.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          No {showHistory ? 'past' : 'upcoming'} gigs found
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {showHistory ? 'Gig History' : 'Upcoming Gigs'}
          </h1>
          <div className="flex space-x-4">
            {!showHistory && (
              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium border ${
                    viewMode === 'grid'
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  } rounded-l-md flex items-center`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                    viewMode === 'compact'
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  } rounded-r-md flex items-center`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Compact
                </button>
              </div>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-white text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 border border-gray-300"
            >
              {showHistory ? (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Show Upcoming
                </>
              ) : (
                <>
                  <History className="w-5 h-5 mr-2" />
                  Show History
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/band-members')}
              className="bg-white text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 border border-gray-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Band Members
            </button>
            {user?.emailVerified && !showHistory && (
              <button
                onClick={() => navigate('/gigs/new')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Gig
              </button>
            )}
          </div>
        </div>

        {showHistory ? (
          renderCompactView(pastGigs)
        ) : (
          viewMode === 'grid' ? renderGridView(upcomingGigs) : renderCompactView(upcomingGigs)
        )}
      </div>
    </div>
  );
}