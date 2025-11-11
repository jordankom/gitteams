import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/auth';

export function useLogout() {
    const navigate = useNavigate();
    return () => {
        clearSession();
        navigate('/login', { replace: true });
    };
}
