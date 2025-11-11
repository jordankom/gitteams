import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { getUserName } from '../utils/auth';
import api from '../services/api/axios';

type Org = { id: string; login: string; avatar_url?: string };

export default function ProjectCreate() {
    const navigate = useNavigate();

    // Form state
    const [title, setTitle] = useState('');
    const [org, setOrg] = useState('');
    const [description, setDescription] = useState('');

    // nombres vides au départ ('' → pas de valeur par défaut affichée)
    const [minPeople, setMinPeople] = useState<number | ''>('');
    const [maxPeople, setMaxPeople] = useState<number | ''>('');

    // Orgs GitHub
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [errOrgs, setErrOrgs] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);

    // Déconnexion simple
    function handleLogout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        navigate('/login', { replace: true });
    }

    // 🔄 Charge la liste des organisations GitHub (GET /api/github/orgs)
    async function loadOrgs() {
        try {
            setLoadingOrgs(true);
            setErrOrgs(null);
            const { data } = await api.get('/github/orgs');
            const list: Org[] = Array.isArray(data.orgs) ? data.orgs : [];
            setOrgs(list);
            // choisir la 1ère si dispo
            if (list.length > 0) setOrg(list[0].login);
        } catch (e: any) {
            const status = e?.response?.status;
            setErrOrgs(
                e?.response?.data?.message ||
                (status === 401
                    ? 'Token GitHub invalide ou expiré.'
                    : 'Impossible de charger vos organisations GitHub.')
            );
            // 🔎 IMPORTANT: on n’expulse pas l’utilisateur.
            // On reste sur la page et on affiche l’erreur + un bouton Réessayer.
        } finally {
            setLoadingOrgs(false);
        }
    }

    useEffect(() => {
        loadOrgs();
    }, []);

    // ✅ validation locale
    function canSubmit() {
        if (!title.trim()) return false;
        if (!org.trim()) return false;
        const min = typeof minPeople === 'number' ? minPeople : NaN;
        const max = typeof maxPeople === 'number' ? maxPeople : NaN;
        if (!Number.isFinite(min) || min < 1) return false;
        if (!Number.isFinite(max) || max < 1) return false;
        if (max < min) return false;
        return true;
    }

    // 📨 création du projet (POST /api/projects)
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit()) return;

        try {
            setSubmitting(true);
            const min = typeof minPeople === 'number' ? minPeople : 0;
            const max = typeof maxPeople === 'number' ? maxPeople : 0;

            const { data } = await api.post('/projects', {
                title: title.trim(),
                org: org.trim(),
                description: description.trim() || null,
                minPeople: min,
                maxPeople: max,
            });

            alert('Projet créé ✅');
            navigate(`/projects/${data.project.id}`);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Erreur lors de la création du projet');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userName={getUserName()} onLogout={handleLogout} />

            <main className="container py-4 flex-grow-1" style={{ maxWidth: 900 }}>
                <h1 className="h4 mb-3">Créer un projet</h1>

                {/* Zone info chargement orgs */}
                {loadingOrgs ? (
                    <div className="alert alert-info">Chargement des organisations GitHub…</div>
                ) : errOrgs ? (
                    <div className="alert alert-warning d-flex align-items-center justify-content-between">
                        <div>{errOrgs}</div>
                        <button className="btn btn-sm btn-outline-secondary" onClick={loadOrgs}>
                            Réessayer
                        </button>
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="card shadow-sm">
                    <div className="card-body">
                        {/* Titre */}
                        <div className="mb-3">
                            <label className="form-label">Nom du projet *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex : HELHa 2025 - Projets GitHub"
                                required
                            />
                        </div>

                        {/* Organisation */}
                        <div className="mb-3">
                            <label className="form-label">Organisation GitHub *</label>
                            <select
                                className="form-select"
                                value={org}
                                onChange={(e) => setOrg(e.target.value)}
                                disabled={loadingOrgs || orgs.length === 0 || !!errOrgs}
                                required
                            >
                                {orgs.length === 0 ? (
                                    <option value="">Aucune organisation trouvée</option>
                                ) : (
                                    orgs.map((o) => (
                                        <option key={o.id} value={o.login}>
                                            {o.login}
                                        </option>
                                    ))
                                )}
                            </select>
                            <div className="form-text">
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                            <label className="form-label">Description (optionnel)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez le projet (facultatif)…"
                            />
                        </div>

                        {/* Min/Max */}
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label">Étudiants minimum *</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="form-control"
                                    value={minPeople}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setMinPeople(v === '' ? '' : Number(v));
                                    }}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Étudiants maximum *</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="form-control"
                                    value={maxPeople}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setMaxPeople(v === '' ? '' : Number(v));
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!canSubmit() || submitting || !!errOrgs}
                            >
                                {submitting ? 'Création…' : 'Valider'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
