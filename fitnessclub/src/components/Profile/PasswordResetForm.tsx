import React, { useState } from "react";
import { apiFetch } from "../../api";

const PasswordResetForm: React.FC = () => {
  const [form, setForm] = useState({ email: "", newPassword: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Password reset successful!");
    } catch (err: any) {
      setMessage("Reset failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="input"
      />
      <input
        name="newPassword"
        type="password"
        value={form.newPassword}
        onChange={handleChange}
        placeholder="New Password"
        className="input"
      />
      <button type="submit" className="btn">
        Reset Password
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default PasswordResetForm;
