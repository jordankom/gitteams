import React from 'react';

type Props = {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    as?: 'input' | 'textarea';
    type?: React.HTMLInputTypeAttribute;
    rows?: number;
    error?: string;
};

export default function FormField({
                                      id, label, value, onChange,
                                      placeholder, required, as = 'input', type = 'text', rows = 3, error
                                  }: Props) {
    const common = {
        id,
        className: `form-control ${error ? 'is-invalid' : ''}`,
        placeholder,
        required,
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    };
    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">{label}</label>
            {as === 'textarea' ? (
                <textarea {...(common as any)} rows={rows} />
            ) : (
                <input {...(common as any)} type={type} />
            )}
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}
