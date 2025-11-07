import React from 'react';

export type Participant = {
    username: string;
    email: string;
};

type Props = {
    index: number;
    value: Participant;
    onChange: (next: Participant) => void;
    onRemove: () => void;
    canRemove: boolean;
};

export default function ParticipantRow({ index, value, onChange, onRemove, canRemove }: Props) {
    return (
        <div className="row g-3 align-items-end mb-2">
            <div className="col-12 col-md-6">
                <label htmlFor={`username-${index}`} className="form-label">Nom d’utilisateur</label>
                <input
                    id={`username-${index}`}
                    type="text"
                    className="form-control"
                    placeholder="john-doe"
                    value={value.username}
                    onChange={(e) => onChange({ ...value, username: e.target.value })}
                    required
                />
            </div>

            <div className="col-12 col-md-5">
                <label htmlFor={`email-${index}`} className="form-label">Email GitHub</label>
                <input
                    id={`email-${index}`}
                    type="email"
                    className="form-control"
                    placeholder="john.doe@example.com"
                    value={value.email}
                    onChange={(e) => onChange({ ...value, email: e.target.value })}
                    required
                />
            </div>

            <div className="col-12 col-md-1 d-flex">
                <button
                    type="button"
                    className="btn btn-outline-secondary ms-md-2 w-100"
                    onClick={onRemove}
                    disabled={!canRemove}
                    title={canRemove ? 'Supprimer ce participant' : 'Au moins une ligne requise'}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}
