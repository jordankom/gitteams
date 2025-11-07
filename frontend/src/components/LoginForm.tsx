import React, { useState } from 'react';
import api from '../services/api/axios';
import { setSession } from '../utils/auth';

type Props = { onSuccess?: () => void };

export default function LoginForm({ onSuccess }: Props) {
    const [form, setForm] = useState({ name: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 📝 Maj des champs
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    // 🚀 Soumission du login
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // 📡 Appel au backend
            const { data } = await api.post('/auth/login', {
                name: form.name,
                password: form.password,
            });
            // 💾 Stocke token + nom en session
            setSession(data.token, data.user.name);
            // ✅ Callback de succès (navigate vers /dashboard)
            onSuccess?.();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Erreur de connexion';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="card shadow-sm w-100 p-3 p-md-4"
            style={{ maxWidth: 480 }}
            aria-label="Formulaire de connexion"
        >
            <h2 className="h4 text-center mb-4">Connexion</h2>

            {/* 🔴 Affiche l'erreur s'il y en a une */}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
                <label htmlFor="name" className="form-label">Nom</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    placeholder="Entrez votre nom"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Entrez votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Connexion…' : 'Connexion'}
            </button>
        </form>
    );
}
