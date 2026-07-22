import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Form, Button, Card } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// assignedComplaintId = the _id of the AssignedComplaint document
// (this is what Message.complaintId references, per the backend schema)
const ChatWindow = ({ assignedComplaintId, user }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/messages/${assignedComplaintId}`, authHeader());
      setMessages(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load messages");
    }
  };

  useEffect(() => {
    if (!assignedComplaintId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // simple polling
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedComplaintId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await axios.post(
        `${API_URL}/messages`,
        { complaintId: assignedComplaintId, message: text },
        authHeader()
      );
      setText("");
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send message");
    }
  };

  return (
    <Card className="p-3">
      <Card.Title>Chat</Card.Title>
      {error && <div className="text-danger small mb-2">{error}</div>}
      <div style={{ height: "260px", overflowY: "auto" }} className="border rounded p-2 mb-3 bg-light">
        {messages.length === 0 && <div className="text-muted small">No messages yet.</div>}
        {messages.map((m) => (
          <div
            key={m._id}
            className={`mb-2 d-flex ${m.name === user?.name ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`px-2 py-1 rounded ${
                m.name === user?.name ? "bg-primary text-white" : "bg-white border"
              }`}
              style={{ maxWidth: "75%" }}
            >
              <div className="fw-bold small">{m.name}</div>
              <div>{m.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <Form onSubmit={handleSend} className="d-flex gap-2">
        <Form.Control
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </Form>
    </Card>
  );
};

export default ChatWindow;
