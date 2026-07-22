import { useEffect, useState } from "react";
import axios from "axios";
import { Accordion, Badge, Form, Button, Row, Col } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const statusVariant = {
  Pending: "secondary",
  Assigned: "info",
  "In Progress": "warning",
  Resolved: "success",
  Cancelled: "dark",
  Reopened: "danger",
};

const AccordionAdmin = () => {
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [complaintsRes, agentsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/complaints`, authHeader()),
        axios.get(`${API_URL}/admin/agents`, authHeader()),
      ]);
      setComplaints(complaintsRes.data);
      setAgents(agentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load complaints");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (complaintId) => {
    const agentId = selectedAgent[complaintId];
    if (!agentId) return;

    const agent = agents.find((a) => a._id === agentId);
    setMessage("");
    setError("");

    try {
      await axios.post(
        `${API_URL}/complaints/${complaintId}/assign`,
        { agentId, agentName: agent?.name },
        authHeader()
      );
      setMessage("Complaint assigned successfully.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not assign complaint");
    }
  };

  return (
    <div>
      {error && <div className="text-danger mb-2">{error}</div>}
      {message && <div className="text-success mb-2">{message}</div>}

      <Accordion>
        {complaints.map((c, idx) => (
          <Accordion.Item eventKey={String(idx)} key={c._id}>
            <Accordion.Header>
              <div className="d-flex justify-content-between w-100 me-3">
                <span>
                  {c.name} - {c.userId?.name}
                </span>
                <Badge bg={statusVariant[c.status] || "secondary"}>{c.status}</Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <p className="mb-1">
                <strong>Address:</strong> {c.address}, {c.city}, {c.state} - {c.pincode}
              </p>
              <p className="mb-1">
                <strong>Filed by:</strong> {c.userId?.name} ({c.userId?.email})
              </p>
              <p className="mb-3">{c.comment}</p>

              <Row className="align-items-end">
                <Col md={6}>
                  <Form.Label className="small">Assign to Agent</Form.Label>
                  <Form.Select
                    value={selectedAgent[c._id] || ""}
                    onChange={(e) =>
                      setSelectedAgent({ ...selectedAgent, [c._id]: e.target.value })
                    }
                  >
                    <option value="">Select an agent...</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button onClick={() => handleAssign(c._id)} disabled={!selectedAgent[c._id]}>
                    Assign
                  </Button>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {complaints.length === 0 && !error && <p className="text-muted">No complaints found.</p>}
    </div>
  );
};

export default AccordionAdmin;
