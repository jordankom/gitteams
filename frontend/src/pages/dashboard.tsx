import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectTable, { type Project } from '../components/ProjectTable';
import { clearSession, getUserName } from '../utils/auth';
import api from '../services/api/axios';

export default function Dashboard() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    function handleLogout() {
        clearSession();
        navigate('/login', { replace: true });
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const { data } = await api.get('/projects'); // GET /api/projects
                if (!mounted) return;
                setProjects(Array.isArray(data.projects) ? data.projects : []);
            } catch (e: any) {
                setErr(e?.response?.data?.message || 'Erreur lors du chargement des projets');
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // callback quand un projet est supprimé
    function handleDeleted(id: string) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userName={getUserName()} onLogout={handleLogout} />

            <main className="flex-grow-1 d-flex justify-content-center align-items-start py-5">
                <div className="container" style={{ maxWidth: '900px' }}>
                    {loading ? (
                        <p className="text-center text-muted">Chargement…</p>
                    ) : err ? (
                        <div className="alert alert-danger text-center">{err}</div>
                    ) : (
                        <ProjectTable projects={projects} onDeleted={handleDeleted} />
                    )}
                </div>
            </main>

            {/* Bouton flottant pour créer un projet */}
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
