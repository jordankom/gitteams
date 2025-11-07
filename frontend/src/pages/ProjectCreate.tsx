import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormField from '../components/FormField';
import NumberField from '../components/NumberField';
import FormSelect from '../components/FormSelect';
import { getUserName } from '../utils/auth';
import api from '../services/api/axios';

type OrgOption = { value: string; label: string };

export default function ProjectCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        org: '',
        description: '',
        minPeople: '' as number | '',
        maxPeople: '' as number | '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [orgs, setOrgs] = useState<OrgOption[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    // 🔄 Charger les organisations GitHub de l'utilisateur connecté
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingOrgs(true);
            setLoadError(null);
            try {
                const { data } = await api.get('/github/orgs'); // { orgs: [{login}] }
                if (!mounted) return;
                const options = (data.orgs ?? []).map((o: any) => ({
                    value: o.login,
                    label: o.login,
                }));
                setOrgs(options);
            } catch (err: any) {
                const msg = err?.response?.data?.message || 'Impossible de charger les organisations';
                setLoadError(msg);
            } finally {
                setLoadingOrgs(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // ✅ Validation simple côté client
    function validate() {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = 'Nom du projet requis';
        if (!form.org.trim()) e.org = 'Organisation requise';
        if (form.minPeople === '' || Number(form.minPeople) < 1) e.minPeople = 'Minimum ≥ 1';
        if (form.maxPeople === '' || Number(form.maxPeople) < 1) e.maxPeople = 'Maximum ≥ 1';
        if (form.minPeople !== '' && form.maxPeople !== '' && Number(form.minPeople) > Number(form.maxPeople)) {
            e.maxPeople = 'Maximum doit être ≥ Minimum';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    // 🚀 Soumission → POST /api/projects
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await api.post('/projects', {
                title: form.title,
                org: form.org,
                description: form.description?.trim() || undefined,
                minPeople: Number(form.minPeople),   // ✅ nombres
                maxPeople: Number(form.maxPeople),   // ✅ nombres
            });
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Erreur lors de la création du projet';
            setErrors((prev) => ({ ...prev, _submit: msg }));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userName={getUserName()} onLogout={() => navigate('/login')} />

            <main className="container py-4">
                <h1 className="h3 mb-4">Créer un projet</h1>

                <form onSubmit={handleSubmit} className="d-grid gap-4">
                    {/* Carte : Informations Générales */}
                    <section className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="h5 mb-3">Informations Générales</h2>

                            {errors._submit && (
                                <div className="alert alert-danger">{errors._submit}</div>
                            )}

                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <FormField
                                        id="title"
                                        label="Nom du Projet"
                                        value={form.title}
                                        onChange={(v) => set('title', v)}
                                        placeholder="Ex: Web Dev Capstone"
                                        required
                                        error={errors.title}
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    {loadingOrgs ? (
                                        <div className="mb-3">
                                            <label className="form-label">Organisation</label>
                                            <div className="form-control bg-body-secondary" aria-busy="true">
                                                Chargement des organisations…
                                            </div>
                                        </div>
                                    ) : loadError ? (
                                        <div className="alert alert-warning mb-3">
                                            {loadError}
                                        </div>
                                    ) : (
                                        <FormSelect
                                            id="org"
                                            label="Organisation"
                                            value={form.org}
                                            onChange={(v) => set('org', v)}
                                            options={orgs}
                                            required
                                            placeholder="Sélectionner une organisation"
                                            error={errors.org}
                                        />
                                    )}
                                </div>

                                <div className="col-12">
                                    <FormField
                                        id="description"
                                        label="Description (optionnelle)"
                                        as="textarea"
                                        rows={4}
                                        value={form.description}
                                        onChange={(v) => set('description', v)}
                                        placeholder="Entrez une description (sinon 'aucune description' sera affichée)"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Carte : Configuration des Équipes (placeholder pour l’instant) */}
                    <section className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="h5 mb-3">Configuration des Équipes</h2>

                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <NumberField
                                        id="minPeople"
                                        label="Minimum de personnes"
                                        value={form.minPeople}
                                        onChange={(v) => set('minPeople', v)}
                                        min={1}
                                        required
                                        error={errors.minPeople}
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <NumberField
                                        id="maxPeople"
                                        label="Maximum de personnes"
                                        value={form.maxPeople}
                                        onChange={(v) => set('maxPeople', v)}
                                        min={1}
                                        required
                                        error={errors.maxPeople}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="d-flex gap-2 justify-content-end">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/dashboard')}
                            disabled={submitting}
                        >
                            Annuler
                        </button>

                        <button type="submit" className="btn btn-success" disabled={submitting}>
                            {submitting ? 'Création…' : 'Valider'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
