import React from 'react';

type Props = {
    userName?: string;
    onLogout?: () => void;
};

export default function Navbar({ userName = 'Utilisateur', onLogout }: Props) {

    return (
        <nav className="navbar navbar-dark bg-dark">
            <div className="container-fluid">
                <span className="navbar-brand">Git-Teams</span>
                <div className="d-flex align-items-center ms-auto gap-3">
          <span className="text-white-50 small d-none d-sm-inline">
            {userName}
          </span>
                    <button
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={onLogout}
                    >
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
}
