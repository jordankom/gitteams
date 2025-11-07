import React from 'react';

type Props = {
    id: string;
    label: string;
    value: number | '';
    onChange: (v: number | '') => void;
    min?: number;
    max?: number;
    required?: boolean;
    error?: string;
};

export default function NumberField({
                                        id, label, value, onChange, min, max, required, error
                                    }: Props) {
    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">{label}</label>
            <input
                id={id}
                type="number"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={value}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val === '' ? '' : Number(val));
                }}
                min={min}
                max={max}
                required={required}
                inputMode="numeric"
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}
