import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Form, Button } from "react-bootstrap";
import ChatWindow from "../common/ChatWindow";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const statusOptions = ["Assigned", "In Progress", "Resolved"];

const statusVariant = {
  Assigned: "info",
  "In Progress": "warning",
  Resolved: "success",
};

const AgentHome = ({ user, onLogout }) => {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/complaints`, authHeader()); // Agent role returns AssignedComplaint[] populated with complaintId
      setAssignments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load assigned complaints");
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStatusChange = async (assignment, status) => {
    try {
      await axios.put(
        `${API_URL}/complaints/${assignment.complaintId._id}/status`,
        { status },
        authHeader()
      );
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">My Assigned Complaints</h2>
          {user && <div className="text-muted small">Logged in as {user.name}</div>}
        </div>
        <Button variant="outline-secondary" onClick={onLogout}>
          Logout
        </Button>
      </div>
      {error && <div className="text-danger mb-3">{error}</div>}

      <Row>
        <Col md={selected ? 6 : 12}>
          {assignments.length === 0 && <p className="text-muted">No complaints assigned to you yet.</p>}
          {assignments.map((a) => (
            <Card
              key={a._id}
              className={`mb-3 ${selected?._id === a._id ? "border-primary" : ""}`}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title className="mb-1">{a.complaintId?.name}</Card.Title>
                  <Badge bg={statusVariant[a.status] || "secondary"}>{a.status}</Badge>
                </div>
                <Card.Text className="text-muted small mb-1">
                  {a.complaintId?.city}, {a.complaintId?.state} - {a.complaintId?.pincode}
                </Card.Text>
                <Card.Text>{a.complaintId?.comment}</Card.Text>

                <div className="d-flex gap-2 align-items-center">
                  <Form.Select
                    size="sm"
                    style={{ width: "160px" }}
                    value={a.status}
                    onChange={(e) => handleStatusChange(a, e.target.value)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Form.Select>
                  <Button size="sm" variant="outline-primary" onClick={() => setSelected(a)}>
                    Open Chat
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>
        {selected && (
          <Col md={6}>
            <ChatWindow assignedComplaintId={selected._id} user={user} />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default AgentHome;
