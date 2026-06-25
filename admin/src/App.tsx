import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { LocationProvider } from './location/LocationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Businesses } from './pages/Businesses';
import { ServiceProviders } from './pages/ServiceProviders';
import { EmergencyContacts } from './pages/EmergencyContacts';
import { Announcements } from './pages/Announcements';
import { Taxis } from './pages/Taxis';
import { BusTimes } from './pages/BusTimes';
import { Ads } from './pages/Ads';
import { VillageSettings } from './pages/VillageSettings';
import { Locations } from './pages/Locations';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <LocationProvider>
                  <Layout />
                </LocationProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/service-providers" element={<ServiceProviders />} />
            <Route path="/taxis" element={<Taxis />} />
            <Route path="/bus-times" element={<BusTimes />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/ads" element={<Ads />} />
            <Route path="/village" element={<VillageSettings />} />
            <Route path="/locations" element={<Locations />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
