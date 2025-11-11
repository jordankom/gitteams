import  { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import ProjectHeader from '../components/ProjectHeader';
import ProjectMetaGrid from '../components/ProjectMetaGrid';
import GroupsSection from '../components/GroupsSection';

import { getUserName } from '../utils/auth';
import api from '../services/api/axios';
import type { Project } from '../types/project';
import type { Group } from '../components/GroupList';

import { useLogout } from '../hooks/useLogout';

export default function ProjectDetails() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // ✅ le hook doit être appelé ici, pas en haut du fichier
    const logout = useLogout();

    const [project, setProject] = useState<Project | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Lien copié dans le presse-papiers ✅');
        } catch {
            alert('Impossible de copier le lien');
        }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);

                const { data } = await api.get(`/projects/${id}`);
                if (!mounted) return;

                setProject(data.project ?? null);
                setGroups(Array.isArray(data.groups) ? data.groups : []);
            } catch (e: any) {
                const msg = e?.response?.data?.message || 'Erreur lors du chargement du projet';
                setErr(msg);
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    async function handleDelete() {
        if (!project) return;
        const ok = confirm(
            `Supprimer définitivement le projet “${project.title}” ?\nCette action est irréversible.`
        );
        if (!ok) return;
        try {
            await api.delete(`/projects/${project.id}`);
            alert('Projet supprimé ✅');
            navigate('/dashboard');
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Erreur lors de la suppression du projet');
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            {/* ✅ on passe le vrai handler de logout */}
            <Navbar userName={getUserName()} onLogout={logout} />

            <main className="container py-4 flex-grow-1">
                <Breadcrumbs
                    items={[
                        { label: 'Tableau de bord', to: '/dashboard' },
                        { label: project ? project.title : 'Projet' },
                    ]}
                />

                {loading ? (
                    <p className="text-muted">Chargement…</p>
                ) : err ? (
                    <div className="alert alert-danger">{err}</div>
                ) : !project ? (
                    <div className="alert alert-warning">Projet introuvable.</div>
                ) : (
                    <>
                        <ProjectHeader project={project} onCopyLink={copyToClipboard} />
                        <ProjectMetaGrid project={project} />
                        <GroupsSection groups={groups} />

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Retour
                            </button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                Supprimer le projet
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
