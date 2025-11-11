import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api/axios';

export type Project = {
    id: string;
    title: string;
    org: string;
    description?: string | null;
    minPeople?: number;
    maxPeople?: number;
    createdAt?: string;
};

type Props = {
    projects: Project[];
    onDeleted?: (id: string) => void;
};

export default function ProjectTable({ projects, onDeleted }: Props) {
    const navigate = useNavigate();

    async function handleDelete(e: React.MouseEvent, p: Project) {
        // 🚫 empêche le clic sur la ligne d’ouvrir la page
        e.stopPropagation();
        const ok = confirm(`Supprimer définitivement le projet “${p.title}” ?`);
        if (!ok) return;

        try {
            await api.delete(`/projects/${p.id}`);
            alert('Projet supprimé ✅');
            onDeleted?.(p.id);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Erreur lors de la suppression');
        }
    }

    if (!projects || projects.length === 0) {
        return <p className="text-muted text-center fs-5">Aucun projet pour l’instant.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table align-middle table-hover">
                <thead>
                <tr>
                    <th>Titre</th>
                    <th>Organisation</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                </tr>
                </thead>
                <tbody>
                {projects.map((p) => (
                    <tr
                        key={p.id}
                        className="cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/projects/${p.id}`)}
                    >
                        <td className="fw-semibold">{p.title}</td>
                        <td>{p.org}</td>
                        <td className="text-muted">{p.description || 'aucune description'}</td>
                        <td className="text-end">
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => handleDelete(e, p)}
                            >
                                Supprimer
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
