import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AssistantContextProvider } from './contexts/AssistantContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrandDashboard from './pages/BrandDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import TalentManagerDashboard from './pages/TalentManagerDashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Creators from './pages/Creators';
import CreatorProfile from './pages/CreatorProfile';
import Collaborations from './pages/Collaborations';
import Contracts from './pages/Contracts';
import Tasks from './pages/Tasks';
import Payments from './pages/Payments';
import Reviews from './pages/Reviews';
import Messages from './pages/Messages';
import AI from './pages/AI';
import Portfolio from './pages/Portfolio';
import Assistant from './components/Assistant';
import { LoadingScreen } from './components/ui';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen label="Loading your workspace..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen label="Checking your session..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/brand" element={<ProtectedRoute><BrandDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/creator" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/freelancer" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/manager" element={<ProtectedRoute><TalentManagerDashboard /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
      <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
      <Route path="/creators/:id" element={<ProtectedRoute><CreatorProfile /></ProtectedRoute>} />
      <Route path="/collaborations" element={<ProtectedRoute><Collaborations /></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssistantContextProvider>
          <AppRoutes />
          <Assistant />
        </AssistantContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
