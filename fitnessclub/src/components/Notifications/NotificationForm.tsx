import React, { useState } from "react";
import { apiFetch } from "../../api";

const NotificationForm: React.FC = () => {
  const [form, setForm] = useState({ email: "", subject: "", text: "" });
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/notify", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Notification sent!");
    } catch (err: any) {
      setMessage("Send failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Recipient Email"
        className="input"
      />
      <input
        name="subject"
        value={form.subject}
        onChange={handleChange}
        placeholder="Subject"
        className="input"
      />
      <textarea
        name="text"
        value={form.text}
        onChange={handleChange}
        placeholder="Message"
        className="input"
      />
      <button type="submit" className="btn">
        Send Notification
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default NotificationForm;
