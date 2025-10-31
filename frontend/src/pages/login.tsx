import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Navbar from "../components/Navbar";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // ⚙️ plus tard : appel à ton backend pour authentifier
        if (name && password) {
            navigate("/dashboard"); // redirection
        } else {
            alert("Veuillez entrer votre nom et mot de passe");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center"
                 style={{ minHeight: "100vh" }}>


                <div
                    className="card p-4 shadow-sm"
                    style={{ width: "100%", maxWidth: "400px" }}
                >
                <h3 className="mb-4 text-center">Connexion</h3>
                <form onSubmit={handleLogin}>
                    <InputField
                        label="Nom d'utilisateur"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <InputField
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary w-100" type="submit">
                        Se connecter
                    </button>
                </form>
            </div>
            </div>
        </>
    );
};

export default Login;
