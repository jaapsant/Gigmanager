import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export function PrivateRoute({ 
  children, 
  requireVerification = false,
}: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (requireVerification && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Please verify your email address to access this feature. Check your inbox for the verification link.
            </p>
            <Link
              to="/gigs"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Return to Gigs List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}