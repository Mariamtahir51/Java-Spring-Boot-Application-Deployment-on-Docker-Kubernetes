import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import api from "../../api/axiosConfig";

const AuthModal = ({ show, mode, message, messageVariant, onHide, onAuthenticated, onRegistered, onAccountExists }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  const close = () => {
    setError("");
    onHide();
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post(`/api/v1/auth/${isRegistering ? "register" : "login"}`, { username, email, password });
      setPassword("");
      if (isRegistering) {
        onRegistered(response.data.message);
      } else {
        onAuthenticated(response.data.username);
        close();
      }
    } catch (requestError) {
      const errorMessage = requestError.response?.data?.detail || requestError.response?.data?.message || "Something went wrong. Please try again.";
      if (isRegistering && requestError.response?.status === 409) {
        setError("");
        onAccountExists(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={close} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isRegistering ? "Create an account" : "Login"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body>
          {message && <Alert variant={messageVariant}>{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {isRegistering && <Form.Group className="mb-3" controlId="auth-username">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" value={username} onChange={(event) => setUsername(event.target.value)} minLength="2" maxLength="30" required autoFocus />
          </Form.Group>}
          <Form.Group className="mb-3" controlId="auth-email">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus={!isRegistering} />
          </Form.Group>
          <Form.Group controlId="auth-password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
            {isRegistering && <Form.Text>Use at least 8 characters.</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant="info" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isRegistering ? "Register" : "Login"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AuthModal;
