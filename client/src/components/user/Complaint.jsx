import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card, Alert, Row, Col } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const Complaint = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    comment: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/complaints`, form, authHeader());
      setSuccess("Complaint submitted successfully. You can track it under My Complaints.");
      setTimeout(() => navigate("/home"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: "760px" }}><div className="form-heading"><div className="eyebrow">NEW REPORT</div><h2>Tell us what needs attention</h2><p>Give us the details and we will route your report to the appropriate team.</p></div>
      <Card className="p-4 p-md-5 form-card"><div className="form-step"><span>1</span><div><strong>Issue details</strong><small>Describe the problem clearly</small></div></div>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Complaint title</Form.Label>
            <Form.Control placeholder="e.g. Broken streetlight near park" name="name" value={form.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control placeholder="House / street / landmark" name="address" value={form.address} onChange={handleChange} required />
          </Form.Group>
          <Row>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control name="city" value={form.city} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control name="state" value={form.state} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type="number"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Describe the issue</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="What happened? Include helpful details for the team." maxLength={800} required
            />
            <div className="text-end text-muted small mt-1">{form.comment.length}/800</div>
          </Form.Group>
          <Button type="submit" className="w-100 primary-action" disabled={submitting}>
            {submitting ? "Submitting your report..." : "Submit complaint ->"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Complaint;
