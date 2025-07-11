import React, { useState } from "react";
import { apiFetch, API_BASE_URL } from "../../api";

const ProfileUpdateForm: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage("Update failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="input"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="input"
      />
      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone"
        className="input"
      />
      <button type="submit" className="btn">
        Update Profile
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ProfileUpdateForm;
