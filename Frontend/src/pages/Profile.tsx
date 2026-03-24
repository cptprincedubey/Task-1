import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  name: string;
  email: string;
}

export default function Profile() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/auth/profile");
      return res.data;
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm font-medium tracking-wide">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-3 max-w-sm w-full mx-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xl">
            ✕
          </div>
          <h2 className="text-slate-800 font-bold text-lg">Something went wrong</h2>
          <p className="text-slate-500 text-sm text-center">Unable to load your profile. Please try again.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-lg transition duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Avatar initials
  const initials = data?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Banner with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 pt-8 pb-16 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 backdrop-blur">
              <span className="text-white text-xl">👤</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">My Profile</h1>
              <p className="text-blue-100 text-xs mt-0.5">View and manage your details</p>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl flex items-center justify-center border-4 border-white">
            <span className="text-white font-bold text-2xl">{initials}</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 space-y-6">
          {/* Name and Email */}
          <div className="text-center space-y-1">
            <h2 className="text-slate-800 text-2xl font-bold">{data?.name}</h2>
            <p className="text-slate-500 text-sm break-all">{data?.email}</p>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</p>
              <p className="text-slate-800 font-semibold mt-1.5">{data?.name}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</p>
              <p className="text-slate-800 font-semibold mt-1.5 break-all">{data?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 active:scale-95 mt-6"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}