import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/ui';

const roleDashboards: Record<string, string> = {
  BRAND: '/dashboard/brand',
  CREATOR: '/dashboard/creator',
  FREELANCER: '/dashboard/freelancer',
  TALENT_MANAGER: '/dashboard/manager',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const path = roleDashboards[user.role] || '/dashboard/brand';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  return <LoadingScreen label="Opening your dashboard..." />;
}
