import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectTable, { type Project } from '../components/ProjectTable';
import { clearSession, getUserName } from '../utils/auth';
import api from '../services/api/axios';

/**
 * Dashboard
 * - Navbar persistante
 * - Récupère et affiche les projets de l'utilisateur connecté
 * - Message vide si aucun projet
 * - Bouton "+" pour créer un projet
 * - Responsive via Bootstrap
 */
export default function Dashboard() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    function handleLogout() {
        clearSession(); // supprime token + nom de l'utilisateur
        navigate('/login', { replace: true });
    }

    // 🔄 Charger les projets au montage
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const { data } = await api.get('/projects'); // { projects: [...] }
                if (!mounted) return;
                setProjects(data.projects ?? []);
            } catch (e: any) {
                const msg = e?.response?.data?.message || 'Erreur lors du chargement des projets';
                setErr(msg);
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            {/* ✅ Navbar persistante */}
            <Navbar userName={getUserName()} onLogout={handleLogout} />

            {/* ✅ Contenu principal */}
            <main className="container py-4 flex-grow-1">
                {loading ? (
                    <p className="text-muted">Chargement…</p>
                ) : err ? (
                    <div className="alert alert-danger">{err}</div>
                ) : projects.length === 0 ? (
                    <p className="text-muted text-center fs-5">Aucun projet pour l’instant.</p>
                ) : (
                    <ProjectTable projects={projects} />
                )}
            </main>

            {/* ✅ Bouton flottant + (en bas à droite) */}
            <button
                className="btn btn-primary btn-lg rounded-circle position-fixed bottom-0 end-0 m-4 shadow"
                style={{ width: 56, height: 56, lineHeight: '1' }}
                aria-label="Créer un nouveau projet"
                onClick={() => navigate('/projects/new')}
            >
                +
            </button>
        </div>
    );
}
