import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="app-footer">
      <Container className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 py-3">
        <span>© {new Date().getFullYear()} Movie Gold</span>
        <span>Discover your next favorite movie.</span>
      </Container>
    </footer>
  );
};

export default Footer;
