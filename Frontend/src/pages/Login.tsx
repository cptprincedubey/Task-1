import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../api/axios";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface ErrorResponse {
  message?: string;
  email?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { mutate, isPending, error, isError } = useMutation<LoginResponse, AxiosError<ErrorResponse>, LoginPayload>({
    mutationFn: async (payload) => {
      const res = await api.post("/auth/login", payload);
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate("/profile");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    mutate({ email, password });
  };

  const isUnverifiedError = error?.response?.status === 403;
  const unverifiedEmail = error?.response?.data?.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-10">
          <h1 className="text-white text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {isError && (
            isUnverifiedError ? (
              <div className="mb-5 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-xl px-4 py-4 animate-in slide-in-from-top">
                <p className="font-semibold mb-2">⏳ Email Not Verified</p>
                <p className="mb-4 text-sm">{error?.response?.data?.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    // Redirect to verify email page with email
                    navigate(`/?resendEmail=${unverifiedEmail}`);
                  }}
                  className="inline-block bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition"
                >
                  Resend Verification Email
                </button>
              </div>
            ) : (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-in slide-in-from-top">
                <p className="font-semibold mb-1">❌ Login Failed</p>
                <p>{error?.response?.data?.message ?? error?.message ?? "Invalid email or password. Please try again."}</p>
              </div>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormErrors({ ...formErrors, email: undefined });
                }}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border transition text-slate-800 text-sm focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 focus:ring-blue-200"
                }`}
                required
              />
              {formErrors.email && (
                <p className="text-red-600 text-xs mt-1.5 font-medium">⚠️ {formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormErrors({ ...formErrors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border transition text-slate-800 text-sm focus:outline-none focus:ring-2 ${
                  formErrors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 focus:ring-blue-200"
                }`}
                required
              />
              {formErrors.password && (
                <p className="text-red-600 text-xs mt-1.5 font-medium">⚠️ {formErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition duration-200 active:scale-95"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Create one
              </Link>
            </p>
            <p className="text-center text-xs text-slate-500">
              <Link to="/" className="text-slate-600 hover:underline">
                Need help? Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}