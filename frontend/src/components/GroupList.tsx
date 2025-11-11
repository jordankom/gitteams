import React from 'react';

export type Participant = {
    username: string;
    email: string;
};

export type Group = {
    id?: string;
    number: number;                 // numéro du groupe (généré côté backend)
    participants: Participant[];    // membres du groupe
};

type Props = {
    groups: Group[];
};

export default function GroupList({ groups }: Props) {
    // Si aucun groupe, on affiche un message clair
    if (!groups || groups.length === 0) {
        return <p className="text-muted mb-0">Aucun groupe pour le moment.</p>;
    }

    const accordionId = 'groups-accordion';

    return (
        <div className="accordion accordion-flush" id={accordionId}>
            {groups.map((g, idx) => {
                const itemId = `group-${g.id ?? g.number}`;
                const headingId = `heading-${itemId}`;
                const collapseId = `collapse-${itemId}`;

                return (
                    <div className="accordion-item" key={itemId}>
                        <h2 className="accordion-header" id={headingId}>
                            <button
                                className="accordion-button collapsed d-flex align-items-center"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#${collapseId}`}
                                aria-expanded="false"
                                aria-controls={collapseId}
                            >
                                <span className="me-2 fw-semibold">Groupe #{g.number}</span>
                                <span className="badge bg-secondary ms-auto">
                  {g.participants?.length ?? 0} membre(s)
                </span>
                            </button>
                        </h2>

                        <div
                            id={collapseId}
                            className="accordion-collapse collapse"
                            aria-labelledby={headingId}
                            data-bs-parent={`#${accordionId}`}
                        >
                            <div className="accordion-body">
                                {(!g.participants || g.participants.length === 0) ? (
                                    <p className="text-muted mb-0">Aucun membre dans ce groupe.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle mb-0">
                                            <thead>
                                            <tr>
                                                <th style={{ width: 56 }}>#</th>
                                                <th>Nom GitHub</th>
                                                <th>Email</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {g.participants.map((p, i) => (
                                                <tr key={`${itemId}-p-${i}`}>
                                                    <td className="text-muted">{i + 1}</td>
                                                    <td>
                                                        <a
                                                            href={`https://github.com/${encodeURIComponent(p.username)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="link-primary"
                                                            title="Ouvrir le profil GitHub"
                                                        >
                                                            {p.username}
                                                        </a>
                                                    </td>
                                                    <td className="text-muted">{p.email}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
