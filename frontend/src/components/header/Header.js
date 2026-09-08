import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {NavLink, useNavigate} from "react-router-dom";
import { useState } from "react";
import AuthModal from "../auth/AuthModal";

const Header = () => {
 const [authMode, setAuthMode] = useState(null);
 const [username, setUsername] = useState(() => localStorage.getItem("username"));
 const [authMessage, setAuthMessage] = useState(null);
 const navigate = useNavigate();

 const handleAuthenticated = (loggedInUsername) => {
    localStorage.setItem("username", loggedInUsername);
    localStorage.removeItem("userEmail");
    setUsername(loggedInUsername);
 };

 const handleRegistered = (message) => {
    setAuthMessage({ text: message, variant: "success" });
    setAuthMode("login");
 };

 const handleAccountExists = (message) => {
    setAuthMessage({ text: `${message} Please log in.`, variant: "warning" });
    setAuthMode("login");
 };

 const logout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/");
 };
 
return (
    <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
            <Navbar.Brand href="/" style={{"color":'gold'}}>
                <FontAwesomeIcon icon ={faVideoSlash}/>Gold
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        style={{maxHeight: '100px'}}
                        navbarScroll
                    >
                    <NavLink className ="nav-link" to="/">Home</NavLink>
                    <NavLink className ="nav-link" to="/watchList">Watch List</NavLink>      
                </Nav>
                {username ? <>
                    <Navbar.Text className="me-2">Signed in as {username}</Navbar.Text>
                    <Button variant="outline-info" onClick={logout}>Logout</Button>
                </> : <>
                    <Button variant="outline-info" className="me-2" onClick={() => { setAuthMessage(null); setAuthMode("login"); }}>Login</Button>
                    <Button variant="outline-info" onClick={() => { setAuthMessage(null); setAuthMode("register"); }}>Register</Button>
                </>}
            </Navbar.Collapse>
        </Container>
        <AuthModal
            show={Boolean(authMode)}
            mode={authMode}
            message={authMessage?.text}
            messageVariant={authMessage?.variant}
            onHide={() => { setAuthMessage(null); setAuthMode(null); }}
            onAuthenticated={handleAuthenticated}
            onRegistered={handleRegistered}
            onAccountExists={handleAccountExists}
        />
    </Navbar>
  )
}

export default Header
