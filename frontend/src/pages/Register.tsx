import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthView } from '../creatoros-ui/components/AuthView';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  return <AuthView mode="register" onSubmit={async ({ email, password, role, profile }) => {
    await register(email, password, role || 'CREATOR', profile || {});
    navigate('/dashboard');
  }} />;
}
