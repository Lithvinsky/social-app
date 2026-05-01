import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { login } from "../api/services/authService.js";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/authSlice.js";
import BrandMark from "../components/BrandMark.jsx";

// FIXED: refactored login logic
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);
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
      const data = await login({ email, password });
      dispatch(setAuth({ user: data.user, accessToken: data.accessToken }));
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-14 relative">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-orbit-glyph/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <div className="relative z-[1] flex w-full max-w-[420px] flex-col items-center gap-4">
        <div className="flex justify-center px-2">
          <BrandMark size="auth" clickable={false} />
        </div>

        <div className="w-full overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 shadow-orbit ring-1 ring-brand/10 backdrop-blur-xl">
          <div
            className="h-1.5 w-full bg-gradient-to-r from-lavender-light via-brand-muted to-brand"
            aria-hidden
          />
          <div className="px-7 pb-8 pt-7 sm:px-9 sm:pb-10 sm:pt-8">
            <h1 className="text-2xl font-bold tracking-tight text-orbit-ink sm:text-[1.65rem]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-orbit-muted">
              Enter your details to sign in to Orbit.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-semibold text-orbit-ink"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="input-auth"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-orbit-ink"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  className="input-auth"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error ? (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-brand to-brand-hover py-3.5 text-base font-semibold text-white shadow-orbit transition hover:opacity-[0.97] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <div className="relative my-8">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden
              >
                <div className="w-full border-t border-surface-muted" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-orbit-muted">
                <span className="bg-white/90 px-3">New here?</span>
              </div>
            </div>

            <p className="text-center text-sm text-orbit-muted">
              <Link
                to="/register"
                className="font-semibold text-brand transition hover:text-brand-hover hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
