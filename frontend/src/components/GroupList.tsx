import React from 'react';

export type Group = { id: string; name: string; membersCount: number };

export default function GroupList({ groups }: { groups: Group[] }) {
    if (!groups || groups.length === 0) {
        return <p className="text-muted">aucun groupe pour le moment</p>;
    }

    return (
        <div className="accordion" id="groupsAccordion">
            {groups.map((g, idx) => {
                const headingId = `group-h-${idx}`;
                const collapseId = `group-c-${idx}`;
                return (
                    <div className="accordion-item" key={g.id}>
                        <h2 className="accordion-header" id={headingId}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#${collapseId}`}
                                aria-expanded="false"
                                aria-controls={collapseId}
                            >
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <span>{g.name}</span>
                                    <small className="text-muted">{g.membersCount} membres</small>
                                </div>
                            </button>
                        </h2>
                        <div
                            id={collapseId}
                            className="accordion-collapse collapse"
                            aria-labelledby={headingId}
                            data-bs-parent="#groupsAccordion"
                        >
                            <div className="accordion-body">
                                {/* Contenu détaillé du groupe (à brancher plus tard) */}
                                <span className="text-muted">Détail du groupe à venir…</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
