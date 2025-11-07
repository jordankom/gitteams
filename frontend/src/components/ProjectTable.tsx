// frontend/src/components/ProjectTable.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export type Project = {
    id: string;
    title: string;
    description?: string | null;
    org: string;
};

export default function ProjectTable({ projects }: { projects: Project[] }) {
    // ✅ le hook est appelé **à l'intérieur** du composant
    const navigate = useNavigate();

    if (!projects || projects.length === 0) {
        return <p className="text-muted text-center">Aucun projet pour l’instant.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead>
                <tr>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Organisation</th>
                </tr>
                </thead>
                <tbody>
                {projects.map((p) => (
                    <tr
                        key={p.id}
                        role="button"
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="table-row-hover"
                    >
                        <td>{p.title}</td>
                        <td className="text-muted">{p.description || 'aucune description'}</td>
                        <td>{p.org}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
