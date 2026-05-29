import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/dashboard", { replace: true });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start with a user account, then plan your own content calendar."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log in"
      variant="register"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span className="auth-label-text"><UserRound size={14} /> Name</span>
          <input name="name" value={form.name} onChange={updateField} placeholder="Your name" />
        </label>
        <label>
          <span className="auth-label-text"><Mail size={14} /> Email</span>
          <input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
        </label>
        <label>
          <span className="auth-label-text"><LockKeyhole size={14} /> Password</span>
          <input name="password" type="password" value={form.password} onChange={updateField} placeholder="At least 6 characters" />
        </label>
        <label>
          <span className="auth-label-text"><LockKeyhole size={14} /> Confirm Password</span>
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} placeholder="Repeat password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}
