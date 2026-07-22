import { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { MoreHorizontal } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const UserInfo = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/admin/users`, authHeader());
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load users");
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      {error && <div className="text-danger mb-2">{error}</div>}
      <Table hover responsive className="customer-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Registration date</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td><div className="customer-cell"><span className="customer-avatar">{u.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CU"}</span><strong>{u.name}</strong></div></td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td><span className="status-active">Active</span></td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
              <td><button type="button" className="row-menu" aria-label={`Actions for ${u.name}`}><MoreHorizontal size={18} /></button></td>
            </tr>
          ))}
        </tbody>
      </Table>
      {users.length === 0 && !error && <p className="text-muted">No users found.</p>}
    </div>
  );
};

export default UserInfo;
