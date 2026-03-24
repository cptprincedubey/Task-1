import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../api/axios";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface ErrorResponse {
  message?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!name.trim()) {
      errors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { mutate, isPending, error, isError, isSuccess } = useMutation<void, AxiosError<ErrorResponse>, RegisterPayload>({
    mutationFn: async (payload) => {
      await api.post("/auth/register", payload);
    },
    onSuccess: () => {
      // Stay on page to show the verify email notice
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    mutate({ name, email, password });
  };

  // Post-registration success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              ✉️
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Check your email</h2>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <p className="text-slate-600 text-center mb-6">
              We sent a verification link to<br/>
              <span className="font-bold text-slate-800">{email}</span>
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700">
                <span className="font-semibold">📋 What's next?</span>
                <br/>
                Check your inbox and spam folder. Click the verification link to activate your account.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-2.5 rounded-xl transition duration-200 active:scale-95"
            >
              Continue to Login
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              Didn't receive email?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-slate-700 font-semibold hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
          <h1 className="text-white text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-blue-100 text-sm mt-1">Join us today — it's free</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {isError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-in slide-in-from-top">
              <p className="font-semibold mb-1">❌ Registration failed</p>
              <p>{error?.response?.data?.message ?? error?.message ?? "Please check your details and try again."}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormErrors({ ...formErrors, name: undefined });
                }}
                placeholder="Alice Smith"
                className={`w-full px-4 py-2.5 rounded-xl border transition text-slate-800 text-sm focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 focus:ring-blue-200"
                }`}
                required
              />
              {formErrors.name && (
                <p className="text-red-600 text-xs mt-1.5 font-medium">⚠️ {formErrors.name}</p>
              )}
            </div>

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
              <p className="text-xs text-slate-500 mt-2">At least 6 characters with lowercase letters</p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition duration-200 active:scale-95"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}