import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const SignUp = ({ onAuthSuccess, roleToRoute }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Ordinary", // Ordinary or Agent
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, form);
      const newUser = { _id: data._id, name: data.name, email: data.email, role: data.role };
      onAuthSuccess(newUser, data.token);
      navigate(roleToRoute[newUser.role] || "/home");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed. Please try again.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: "26rem" }} className="p-4 shadow-sm">
        <Card.Title className="mb-3">Create an Account</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Account Type</Form.Label>
            <Form.Select name="role" value={form.role} onChange={handleChange}>
              <option value="Ordinary">Citizen / User</option>
              <option value="Agent">Agent</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" className="w-100">
            Sign Up
          </Button>
        </Form>
        <div className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </Card>
    </Container>
  );
};

export default SignUp;
