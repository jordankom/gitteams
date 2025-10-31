import { Container } from "react-bootstrap";
import AppNavbar from "../components/Navbar";

export default function Dashboard() {
    return (
        <>
            <AppNavbar />
            <Container className="mt-5">
                <h2>Bienvenue sur votre tableau de bord</h2>
                <p>Ici, vous verrez les informations principales de Git-Teams.</p>
            </Container>
        </>
    );
}
