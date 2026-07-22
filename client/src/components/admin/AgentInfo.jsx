import { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const AgentInfo = () => {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/admin/agents`, authHeader());
        setAgents(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load agents");
      }
    };
    fetchAgents();
  }, []);

  return (
    <div>
      {error && <div className="text-danger mb-2">{error}</div>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.phone}</td>
              <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {agents.length === 0 && !error && <p className="text-muted">No agents found.</p>}
    </div>
  );
};

export default AgentInfo;
