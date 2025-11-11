import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { getUserName } from '../utils/auth';
import api from '../services/api/axios';

// Type minimal pour une organisation GitHub
type Org = { id: string; login: string; avatar_url?: string };

export default function ProjectNew() {
    const navigate = useNavigate();

    // Champs du formulaire
    const [title, setTitle] = useState('');
    const [org, setOrg] = useState('');
    const [description, setDescription] = useState('');
    const [minPeople, setMinPeople] = useState("");
    const [maxPeople, setMaxPeople] = useState("");

    // Orgs GitHub
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [errOrgs, setErrOrgs] = useState<string | null>(null);

    // Soumission
    const [submitting, setSubmitting] = useState(false);

    // Déconnexion classique
    function handleLogout() {
        // on laisse ta logique globale de logout (si tu veux rester sur la page, enlève navigate)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        navigate('/login', { replace: true });
    }

    // --- CHANGEMENT ICI ---
    // Factorise le chargement des organisations pour pouvoir "Réessayer"
    async function loadOrgs() {
        try {
            setLoadingOrgs(true);
            setErrOrgs(null);

            const { data } = await api.get('/github/orgs'); // GET /api/github/orgs
            const list: Org[] = Array.isArray(data.orgs) ? data.orgs : [];
            setOrgs(list);
            setOrg(list[0]?.login ?? ''); // sélectionne la première par défaut (si dispo)
        } catch (e: any) {
            const status = e?.response?.status;
            const message =
                e?.response?.data?.message ||
                (status === 401
                    ? 'Votre token GitHub est invalide ou expiré.'
                    : 'Impossible de charger vos organisations GitHub.');

            // ✅ On reste sur la page : on n’efface pas la session et on ne redirige pas
            setErrOrgs(message);
            setOrgs([]);     // on vide la liste pour que le select affiche "Aucune organisation"
            setOrg('');      // on réinitialise la valeur sélectionnée
        } finally {
            setLoadingOrgs(false);
        }
    }

    useEffect(() => {
        loadOrgs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Validation simple côté front
    function canSubmit() {
        if (!title.trim()) return false;
        if (!org.trim()) return false;                                   // besoin d’une org valide
        if (!Number.isFinite(minPeople) || minPeople < 1) return false;
        if (!Number.isFinite(maxPeople) || maxPeople < 1) return false;
        if (maxPeople < minPeople) return false;
        if (errOrgs) return false;                                       // ✅ bloque si token invalide
        return true;
    }

    // Création du projet
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit()) return;

        try {
            setSubmitting(true);
            const { data } = await api.post('/projects', {
                title: title.trim(),
                org: org.trim(),
                description: description.trim() || null,
                minPeople,
                maxPeople,
            });
            alert('Projet créé ✅');
            navigate(`/projects/${data.project.id}`);
        } catch (e: any) {
            const status = e?.response?.status;
            const msg =
                e?.response?.data?.message ||
                (status === 401
                    ? 'Session expirée — veuillez vous reconnecter.'
                    : 'Erreur lors de la création du projet');

            alert(msg);

            // ⚠️ Ici, on conserve ton comportement de déconnexion uniquement si la création renvoie 401
            // Si tu veux aussi rester sur la page en cas de 401 à la création, supprime ces 2 lignes.
            if (status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                navigate('/login', { replace: true });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userName={getUserName()} onLogout={handleLogout} />

            <main className="container py-4 flex-grow-1" style={{ maxWidth: 900 }}>
                <h1 className="h4 mb-3">Créer un projet</h1>

                {/* Info orgs */}
                {loadingOrgs ? (
                    <div className="alert alert-info">Chargement des organisations GitHub…</div>
                ) : errOrgs ? (
                    // ✅ On affiche l’erreur à la place de la liste, sans redirection
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

                        {/* Organisation GitHub */}
                        <div className="mb-3">
                            <label className="form-label">Organisation GitHub *</label>
                            <select
                                className="form-select"
                                value={org}
                                onChange={(e) => setOrg(e.target.value)}
                                disabled={loadingOrgs || orgs.length === 0 || !!errOrgs}   // ✅ disabled si erreur
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

                        {/* Tailles min / max */}
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label">Étudiants minimum *</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="form-control"
                                    value={minPeople}
                                    onChange={(e) => setMinPeople(Number(e.target.value))}
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
                                    onChange={(e) => setMaxPeople(Number(e.target.value))}
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
                                disabled={!canSubmit() || submitting}
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
