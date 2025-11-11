type Props = {
    /** Nom de l’utilisateur connecté (facultatif) */
    userName?: string;

    /** Fonction de déconnexion (facultative) */
    onLogout?: () => void;
};

/**
 * Barre de navigation réutilisable :
 * - Affiche le titre de l’application
 * - Si `userName` est fourni → affiche le nom de l’utilisateur
 * - Si `onLogout` est fourni → affiche le bouton "Déconnexion"
 */
export default function Navbar({ userName, onLogout }: Props) {
    return (
        <nav className="navbar navbar-dark bg-dark">
            <div className="container-fluid d-flex justify-content-between">
                {/* Logo / Nom de l'application */}
                <span className="navbar-brand">Git-Teams</span>

                {/* Bloc utilisateur (affiché seulement si nécessaire) */}
                {(userName || onLogout) && (
                    <div className="d-flex align-items-center ms-auto gap-3">
                        {/* ✅ Affiche le nom uniquement s’il existe */}
                        {userName && (
                            <span className="text-white-50 small d-none d-sm-inline">
                {userName}
              </span>
                        )}

                        {/* ✅ Bouton de déconnexion uniquement si onLogout est fourni */}
                        {onLogout && (
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={onLogout}
                            >
                                Déconnexion
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
