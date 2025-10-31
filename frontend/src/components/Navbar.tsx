import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar: React.FC = () => {
    return (
        <nav className="navbar navbar-dark bg-primary mb-4">
            <div className="container">
                <span className="navbar-brand mb-0 h1">Git-Teams</span>
            </div>
        </nav>
    );
};

export default Navbar;
