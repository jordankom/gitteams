import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GroupCreatePublic from './pages/GroupCreatePublic.tsx';


// ✅ Pages
import Login from './pages/login.tsx';
import Dashboard from './pages/dashboard.tsx';
import ProjectCreate from './pages/ProjectCreate.tsx';
import ProjectDetails from './pages/ProjectDetails.tsx';
import GroupCreate from './pages/GroupCreate.tsx';
// ✅ Route protégée
import ProtectedRoute from './router/protectedRoute.tsx';

/**
 * Routes principales de l'application :
 * - /login : accessible sans authentification
 * - /dashboard, /projects/new : protégées par JWT
 * - * : redirige vers /login si route inconnue
 */
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirection par défaut */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Connexion */}
                <Route path="/login" element={<Login />} />

                {/* Tableau de bord (protégé) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Création de projet (protégée) */}
                <Route
                    path="/projects/new"
                    element={
                        <ProtectedRoute>
                            <ProjectCreate />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/projects/:id"
                    element={
                        <ProtectedRoute>
                            <ProjectDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id/groups/new"
                    element={
                        <ProtectedRoute>
                            <GroupCreate />
                        </ProtectedRoute>
                    }
                />
                <Route path="/creategroup/:id/:key" element={<GroupCreatePublic />} />

                {/* Toute route inconnue → redirection vers /login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
