import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Container, Card, Badge, Row, Col, Spinner } from "react-bootstrap";
import ChatWindow from "../common/ChatWindow";

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

const Status = ({ user }) => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/complaints/${id}`, authHeader());
        setComplaint(data);

        try {
          const { data: assignmentData } = await axios.get(
            `${API_URL}/complaints/${id}/assignment`,
            authHeader()
          );
          setAssignment(assignmentData);
        } catch {
          // Not assigned yet - that's fine, just no chat available
          setAssignment(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not load complaint");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={assignment ? 6 : 12}>
          <Card className="p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 className="mb-0">{complaint.name}</h4>
              <Badge bg={statusVariant[complaint.status] || "secondary"}>{complaint.status}</Badge>
            </div>
            <p className="text-muted mb-1">
              {complaint.address}, {complaint.city}, {complaint.state} - {complaint.pincode}
            </p>
            <p>{complaint.comment}</p>
            {assignment && (
              <p className="small text-muted mb-0">
                Assigned agent: <strong>{assignment.agentName}</strong>
              </p>
            )}
          </Card>
        </Col>
        {assignment && (
          <Col md={6}>
            <ChatWindow assignedComplaintId={assignment._id} user={user} />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Status;
