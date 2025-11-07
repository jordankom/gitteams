import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MetaStat from '../components/MetaStat';
import GroupList, { type Group } from '../components/GroupList';
import { getUserName, clearSession } from '../utils/auth';
import api from '../services/api/axios';

type Project = {
    id: string;
    title: string;
    org: string;
    description?: string | null;
    minPeople?: number ;
    maxPeople?: number ;
    createdAt?: string;
};

export default function ProjectDetails() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
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

                // 🔗 à implémenter côté backend plus tard : GET /api/projects/:id
                const { data } = await api.get(`/projects/${id}`);
                if (!mounted) return;

                const p: Project = data.project ?? null;
                const g: Group[] = data.groups ?? []; // si l’API renvoie déjà des groupes
                setProject(p);
                setGroups(Array.isArray(g) ? g : []);
            } catch (e: any) {
                const msg = e?.response?.data?.message || 'Erreur lors du chargement du projet';
                setErr(msg);
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userName={getUserName()} onLogout={handleLogout} />

            <main className="container py-4 flex-grow-1">
                {/* Fil d’ariane simple */}
                <nav className="mb-3">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link to="/dashboard">Tableau de bord</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {project ? project.title : 'Projet'}
                        </li>
                    </ol>
                </nav>

                {loading ? (
                    <p className="text-muted">Chargement…</p>
                ) : err ? (
                    <div className="alert alert-danger">{err}</div>
                ) : !project ? (
                    <div className="alert alert-warning">Projet introuvable.</div>
                ) : (
                    <>
                        {/* En-tête */}
                        <header className="mb-3">
                            <h1 className="h3 mb-1">{project.title}</h1>
                            {project.description ? (
                                <p className="text-muted small mb-0">{project.description}</p>
                            ) : (
                                <p className="text-muted small mb-0">aucune description</p>
                            )}
                        </header>

                        {/* Méta infos (responsive) */}
                        <section className="row g-3 mb-4">
                            <div className="col-12 col-md-4">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <MetaStat label="Étudiants minimum" value={project.minPeople ?? '-'} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <MetaStat label="Étudiants maximum" value={project.maxPeople ?? '-'} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <MetaStat label="Organisation" value={project.org} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Groupes inscrits */}
                        <section className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="h5 mb-3">Groupes Inscrits</h2>
                                <GroupList groups={groups} />
                            </div>
                        </section>

                        {/* Actions en bas à droite (Annuler / Valider) */}
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                                Annuler
                            </button>
                            <button className="btn btn-primary" onClick={() => {/* TODO: action */}}>
                                Valider
                            </button>
                        </div>

                        <button
                            className="btn btn-primary mb-3"
                            onClick={() => navigate(`/projects/${id}/groups/new`)}
                        >
                            Créer un groupe
                        </button>

                    </>
                )}
            </main>
        </div>
    );
}
