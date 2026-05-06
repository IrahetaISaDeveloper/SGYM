import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StaffDashboard from './pages/StaffDashboard';
import ClientPanel from './pages/ClientPanel';
import MachineManagement from './pages/MachineManagement';
import RoutinePage from './pages/RoutinePage';

// Fallback Route Component
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gym-darker"><div className="text-neon-green">Cargando...</div></div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  const role = user.role?.toLowerCase();
  if (role === 'admin' || role === 'staff') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/client-panel" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gym-darker">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes - Staff/Admin */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'staff', 'Admin', 'Staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/machines" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'staff', 'Admin', 'Staff']}>
                    <MachineManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Routes - Member */}
              <Route 
                path="/client-panel" 
                element={
                  <ProtectedRoute allowedRoles={['member', 'admin', 'staff', 'Miembro', 'Admin', 'Staff']}>
                    <ClientPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Root / Catch-all */}
              <Route 
                path="/my-routine" 
                element={
                  <ProtectedRoute allowedRoles={['member', 'admin', 'staff', 'Miembro', 'Admin', 'Staff']}>
                    <RoutinePage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
