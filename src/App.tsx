import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GigList } from './pages/GigList';
import { GigDetails } from './pages/GigDetails';
import { NewGig } from './pages/NewGig';
import { BandMembers } from './pages/BandMembers';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import { GigProvider } from './context/GigContext';
import { BandProvider } from './context/BandContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Header } from './components/Header';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  return (
    <GigProvider>
      <BandProvider>
        <Header />
        <EmailVerificationBanner />
        {children}
      </BandProvider>
    </GigProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AuthenticatedApp>
                  <Navigate to="/gigs" replace />
                </AuthenticatedApp>
              </PrivateRoute>
            }
          />
          <Route
            path="/gigs"
            element={
              <PrivateRoute>
                <AuthenticatedApp>
                  <GigList />
                </AuthenticatedApp>
              </PrivateRoute>
            }
          />
          <Route
            path="/gigs/new"
            element={
              <PrivateRoute requireVerification>
                <AuthenticatedApp>
                  <NewGig />
                </AuthenticatedApp>
              </PrivateRoute>
            }
          />
          <Route
            path="/gig/:id"
            element={
              <PrivateRoute>
                <AuthenticatedApp>
                  <GigDetails />
                </AuthenticatedApp>
              </PrivateRoute>
            }
          />
          <Route
            path="/band-members"
            element={
              <PrivateRoute>
                <AuthenticatedApp>
                  <BandMembers />
                </AuthenticatedApp>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <AuthenticatedApp>
                  <Profile />
                </AuthenticatedApp>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;