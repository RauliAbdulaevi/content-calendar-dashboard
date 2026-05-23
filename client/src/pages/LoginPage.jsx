import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(form);
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to plan, schedule, and manage your social media calendar."
      footerText="Do not have an account?"
      footerLink="/register"
      footerLinkText="Create one"
      variant="login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Your password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
