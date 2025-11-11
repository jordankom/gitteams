import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import type { ReactElement } from 'react';

type Props = { children: ReactElement };

export default function ProtectedRoute({ children }: Props) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
