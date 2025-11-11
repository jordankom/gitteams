type Option = { value: string; label: string };

type Props = {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Option[];
    required?: boolean;
    placeholder?: string;
    error?: string;
};

export default function FormSelect({
                                       id, label, value, onChange, options, required, placeholder = 'Sélectionner…', error,
                                   }: Props) {
    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">{label}</label>
            <select
                id={id}
                className={`form-select ${error ? 'is-invalid' : ''}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}
