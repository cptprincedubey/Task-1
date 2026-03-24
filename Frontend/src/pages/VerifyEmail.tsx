import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../api/axios";

interface ErrorResponse {
  message?: string;
}

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setMessage("No verification token provided");
          setIsSuccess(false);
          setLoading(false);
          return;
        }

        const response = await api.get(`/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setIsSuccess(true);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        setMessage(
          axiosError.response?.data?.message || "Email verification failed. Token may be expired."
        );
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.message || "Failed to resend email");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {loading ? (
          // Loading State
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
              </div>
            </div>
            <p className="text-white font-semibold text-lg">Verifying your email...</p>
            <p className="text-blue-100 text-sm mt-2">Please wait while we confirm your account</p>
          </div>
        ) : isSuccess ? (
          // Success State
          <>
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl animate-bounce">
                ✓
              </div>
              <h1 className="text-white text-2xl font-bold">Email Verified!</h1>
              <p className="text-green-100 text-sm mt-2">Your account is now active</p>
            </div>
            
            <div className="px-8 py-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">✨ Success!</span>
                  <br/>
                  You can now log in with your email and password.
                </p>
              </div>
              
              <Link
                to="/login"
                className="w-full block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-xl transition duration-200 active:scale-95"
              >
                Continue to Login
              </Link>
              
              <p className="text-center text-xs text-slate-500 mt-4">
                <Link to="/login" className="text-slate-700 font-semibold hover:underline">
                  Go directly to login →
                </Link>
              </p>
            </div>
          </>
        ) : (
          // Error State
          <>
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                ⚠️
              </div>
              <h1 className="text-white text-2xl font-bold">Verification Failed</h1>
              <p className="text-red-100 text-sm mt-2">Your verification link may have expired</p>
            </div>
            
            <div className="px-8 py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">📋 Error Details:</span>
                  <br/>
                  {message}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-800 text-sm transition"
                  />
                </div>

                {resendSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                    ✓ Verification email sent! Check your inbox.
                  </div>
                )}

                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition duration-200 active:scale-95"
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "📧 Resend Verification Email"
                  )}
                </button>
              </div>

              <div className="mt-6 space-y-2 text-center text-sm">
                <p className="text-slate-600">
                  <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                    Create a new account
                  </Link>
                </p>
                <p className="text-slate-600">
                  <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                    Go to login
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
