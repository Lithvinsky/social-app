import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { register } from "../api/services/authService.js";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/authSlice.js";
import BrandMark from "../components/BrandMark.jsx";

// FIXED: improved component structure
export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      dispatch(setAuth({ user: data.user, accessToken: data.accessToken }));
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 flex justify-center px-2">
        <BrandMark to="/" size="auth" />
      </div>
      <div className="w-full max-w-sm glass-panel-strong p-8 sm:p-10 ring-1 ring-white/50 shadow-orbit">
        <h1 className="text-2xl font-bold text-orbit-ink mb-1 tracking-tight">
          Create account
        </h1>
        <p className="text-orbit-muted text-sm mb-6">
          Join Orbit
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-orbit-muted mb-1.5">
              Username
            </label>
            <input
              required
              minLength={3}
              className="w-full input-orbit"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-orbit-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full input-orbit"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-orbit-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full input-orbit"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white shadow-orbit hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-orbit-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand hover:text-brand-hover hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
