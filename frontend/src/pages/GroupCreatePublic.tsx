import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ParticipantRow, { type Participant } from "../components/ParticipantRow";
import api from "../services/api/axios";

type Project = {
    id: string;
    title: string;
    org: string;
    description?: string | null;
    minPeople: number;
    maxPeople: number;
};

export default function GroupCreatePublic() {
    const navigate = useNavigate();
    // ✅ on lit l'id ET la clé directement dans le chemin
    const { id, key } = useParams<{ id: string; key: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([
        { username: "", email: "" },
    ]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                if (!id || !key) {
                    setErr("Lien invalide (id ou clé manquants)");
                    return;
                }

                // ✅ endpoint public sécurisé par clé dans le path
                const { data } = await api.get(`/public/projects/${id}/${key}`);
                if (!mounted) return;
                setProject(data.project);
            } catch (e: any) {
                setErr(e?.response?.data?.message || "Lien invalide ou projet introuvable");
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id, key]);

    function addRow() {
        setParticipants((p) => [...p, { username: "", email: "" }]);
    }
    function updateRow(i: number, next: Participant) {
        setParticipants((p) => p.map((x, idx) => (idx === i ? next : x)));
    }
    function removeRow(i: number) {
        setParticipants((p) => p.filter((_, idx) => idx !== i));
    }

    const isValid = () => {
        if (!project) return false;
        const n = participants.length;
        if (n < project.minPeople || n > project.maxPeople) return false;
        return participants.every((p) => p.username.trim() && p.email.trim());
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid() || !project || !id || !key) return;

        try {
            setSubmitting(true);
            const { data } = await api.post(
                `/public/projects/${id}/${key}/groups`,
                { participants }
            );

            alert(`✅ Groupe #${data.group.number} créé avec succès !`);
            navigate("/");
        } catch (e: any) {
            alert(e?.response?.data?.message || "Erreur lors de la création du groupe");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar />

            <main className="container py-4 flex-grow-1">
                {loading ? (
                    <p className="text-muted">Chargement…</p>
                ) : err ? (
                    <div className="alert alert-danger">{err}</div>
                ) : !project ? (
                    <div className="alert alert-warning">Projet introuvable</div>
                ) : (
                    <>
                        <nav className="mb-3">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/">Accueil</Link>
                                </li>
                                <li className="breadcrumb-item active">Créer un groupe</li>
                            </ol>
                        </nav>

                        <header className="mb-3">
                            <h1 className="h4 mb-1">Projet : {project.title}</h1>
                            <p className="text-muted mb-0">
                                {project.description || "aucune description"}
                            </p>
                            <p className="text-muted small mt-1">
                                Taille du groupe : {project.minPeople} à {project.maxPeople} participant(s)
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="card shadow-sm">
                            <div className="card-body">
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

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary mt-2"
                                    onClick={addRow}
                                >
                                    ➕ Ajouter un autre participant
                                </button>

                                <hr className="my-4" />

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate("/")}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!isValid() || submitting}
                                    >
                                        {submitting ? "Création…" : "Valider"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
