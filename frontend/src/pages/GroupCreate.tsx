import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearSession, getUserName } from '../utils/auth';
import api from '../services/api/axios';
import ParticipantRow, { type Participant } from '../components/ParticipantRow';

type Project = {
    id: string;
    title: string;
};

export default function GroupCreate() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // Tableau des participants (au moins une ligne)
    const [participants, setParticipants] = useState<Participant[]>([
        { username: '', email: '' },
    ]);

    function handleLogout() {
        clearSession();
        navigate('/login', { replace: true });
    }

    // Charger le projet pour afficher son titre
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const { data } = await api.get(`/projects/${id}`);
                if (!mounted) return;
                const p = data?.project;
                setProject(p ? { id: p.id, title: p.title } : null);
            } catch (e: any) {
                const msg = e?.response?.data?.message || 'Erreur lors du chargement du projet';
                setErr(msg);
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    // Gestion lignes
    function addRow() {
        setParticipants((prev) => [...prev, { username: '', email: '' }]);
    }
    function updateRow(i: number, next: Participant) {
        setParticipants((prev) => prev.map((p, idx) => (idx === i ? next : p)));
    }
    function removeRow(i: number) {
        setParticipants((prev) => prev.filter((_, idx) => idx !== i));
    }

    // Validation simple
    function isValid() {
        if (!participants.length) return false;
        return participants.every((p) => p.username.trim() && p.email.trim());
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid()) return;

        // 🔗 Backend (à brancher plus tard) :
        // await api.post(`/projects/${id}/groups`, { participants });

        // Pour le moment (frontend only), on redirige vers la page détails du projet
        navigate(`/projects/${id}`);
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userName={getUserName()} onLogout={handleLogout} />

            <main className="container py-4 flex-grow-1">
                {/* Fil d'ariane */}
                <nav className="mb-3">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link to="/dashboard">Tableau de bord</Link></li>
                        <li className="breadcrumb-item">
                            {project ? <Link to={`/projects/${project.id}`}>{project.title}</Link> : 'Projet'}
                        </li>
                        <li className="breadcrumb-item active">Créer un groupe</li>
                    </ol>
                </nav>

                {/* Titre */}
                <header className="mb-3">
                    <h1 className="h4 mb-1">
                        Projet : {project ? project.title : (loading ? 'Chargement…' : 'Introuvable')}
                    </h1>
                    <p className="text-muted">
                        Ajoutez les participants au projet en entrant leur nom d’utilisateur et email GitHub.
                        Vous pouvez ajouter plusieurs paires.
                    </p>
                </header>

                {/* État de chargement/erreurs projet */}
                {loading ? (
                    <p className="text-muted">Chargement…</p>
                ) : err ? (
                    <div className="alert alert-danger">{err}</div>
                ) : !project ? (
                    <div className="alert alert-warning">Projet introuvable</div>
                ) : (
                    <form onSubmit={handleSubmit} className="card shadow-sm">
                        <div className="card-body">

                            {/* Lignes participants */}
                            {participants.map((p, idx) => (
                                <ParticipantRow
                                    key={idx}
                                    index={idx}
                                    value={p}
                                    onChange={(next) => updateRow(idx, next)}
                                    onRemove={() => removeRow(idx)}
                                    canRemove={participants.length > 1}
                                />
                            ))}

                            {/* Bouton ajouter une ligne */}
                            <button
                                type="button"
                                className="btn btn-outline-secondary mt-2"
                                onClick={addRow}
                            >
                                ➕ Ajouter un autre participant
                            </button>

                            <hr className="my-4" />

                            {/* Actions */}
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate(`/projects/${id}`)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!isValid()}
                                    title={!isValid() ? 'Renseignez toutes les lignes' : 'Valider'}
                                >
                                    Valider
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
