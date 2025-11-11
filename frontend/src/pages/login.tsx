import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginForm from '../components/LoginForm';


export default function LoginPage() {
    const navigate = useNavigate();

    // 🔁 Si déjà connecté → redirige vers /dashboard
    //if (isAuthenticated()) {
        //return <Navigate to="/dashboard" replace />;
    //}

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar  />

            <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light py-4 py-md-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-10 col-md-8 col-lg-6 d-flex justify-content-center">
                            <LoginForm onSuccess={() => navigate('/dashboard')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
