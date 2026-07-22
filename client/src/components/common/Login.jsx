import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Login = ({ onAuthSuccess, roleToRoute }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      const loggedInUser = { _id: data._id, name: data.name, email: data.email, role: data.role };
      onAuthSuccess(loggedInUser, data.token);
      navigate(roleToRoute[loggedInUser.role] || "/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: "24rem" }} className="p-4 shadow-sm">
        <Card.Title className="mb-3">Login</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100">
            Login
          </Button>
        </Form>
        <div className="text-center mt-3">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
