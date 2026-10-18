import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthView } from '../creatoros-ui/components/AuthView';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  return <AuthView mode="login" onSubmit={async ({ email, password, role, profile }) => {
    if (role) await register(email, password, role, profile || {});
    else await login(email, password);
    navigate('/dashboard');
  }} />;
}
