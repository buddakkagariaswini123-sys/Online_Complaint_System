import { Link } from "react-router-dom";
import { Container, Button, Row, Col, Badge } from "react-bootstrap";

const Home = () => {
  return (
    <main className="landing-page"><Container>
      <div className="brand-bar"><div className="brand-mark">C</div><span>CivicConnect</span><Link to="/login" className="ms-auto text-decoration-none">Sign in</Link></div>
      <Row className="align-items-center hero-section"><Col lg={7}>
        <Badge pill className="hero-badge">A better way to be heard</Badge>
        <h1>Make your community <span>work better.</span></h1>
        <p className="lead">Register civic issues in minutes, get routed to the right team, and follow every step until it is resolved.</p>
        <div className="d-flex flex-wrap gap-3"><Link to="/signup"><Button className="hero-button">Register an issue <span>-&gt;</span></Button></Link><Link to="/login"><Button variant="light" className="secondary-button">Track my complaint</Button></Link></div>
        <div className="trust-line"><span>[ok]</span> Secure account &nbsp;&nbsp; <span>[ok]</span> Real-time status updates</div>
      </Col><Col lg={5} className="mt-5 mt-lg-0"><div className="hero-card"><div className="d-flex justify-content-between align-items-start"><div><small>COMPLAINT ID</small><h5>#CVC-2048</h5></div><Badge bg="success">In progress</Badge></div><div className="issue-icon">!</div><h4>Streetlight repair</h4><p>Ward 14 - Your case is with the electrical team.</p><div className="progress-track"><div /></div><div className="d-flex justify-content-between small"><span>Registered</span><span>Resolved</span></div></div></Col></Row>
      <Row className="feature-row text-center"><Col md={4}><div className="feature-icon">01</div><h5>Simple registration</h5><p>Share the location and details of an issue from one clear form.</p></Col><Col md={4}><div className="feature-icon">02</div><h5>Transparent tracking</h5><p>See your complaint status whenever you need an update.</p></Col><Col md={4}><div className="feature-icon">03</div><h5>Direct communication</h5><p>Chat with the assigned agent once your case is being handled.</p></Col></Row>
    </Container></main>
  );
};

export default Home;
