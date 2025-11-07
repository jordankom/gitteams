import React from 'react';

export default function MetaStat({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="d-flex flex-column">
            <span className="text-muted small">{label}</span>
            <span className="fw-semibold">{value ?? '-'}</span>
        </div>
    );
}
