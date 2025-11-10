import React from "react";
import { Link } from "react-router-dom";

type Crumb = { label: string; to?: string };

type Props = {
    items?: Crumb[];  // ← optionnel maintenant
};

export default function Breadcrumbs({ items }: Props) {
    const list = Array.isArray(items) ? items : [];  // ← garde-fou

    if (list.length === 0) {
        // Si rien à afficher, on ne rend rien (pas de <nav> vide)
        return null;
    }

    return (
        <nav className="mb-3">
            <ol className="breadcrumb mb-0">
                {list.map((it, i) => {
                    const isLast = i === list.length - 1;
                    return (
                        <li
                            key={i}
                            className={`breadcrumb-item ${isLast ? "active" : ""}`}
                            aria-current={isLast ? "page" : undefined}
                        >
                            {isLast || !it.to ? it.label : <Link to={it.to}>{it.label}</Link>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
