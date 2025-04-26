import React from "react";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "jwt-decode";
import { Navbar } from "../../components/landing/Navbar";

interface UserJwtPayload extends JwtPayload {
  email?: string;
  username?: string;
  role?: string;
}

const getUserInfo = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode<UserJwtPayload>(token);
    return decoded;
  } catch {
    return null;
  }
};

const UserDashboard: React.FC = () => {
  const user = getUserInfo();

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="p-8 text-center">Kérjük, jelentkezzen be a felhasználói felület eléréséhez.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-2 md:px-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-6 md:p-12">
          <h1 className="text-3xl font-extrabold mb-10 text-center text-[var(--primary)] tracking-tight">Felhasználói fiók</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Info Island: Email */}
            <div className="bg-[var(--background)] rounded-xl shadow p-6 flex flex-col items-center min-h-[120px]">
              <span className="text-lg font-semibold text-gray-600 mb-2">Email</span>
              <span className="text-xl font-bold text-gray-900 break-all">{user.email || user.username}</span>
            </div>
            {/* Info Island: Role */}
            <div className="bg-[var(--background)] rounded-xl shadow p-6 flex flex-col items-center min-h-[120px]">
              <span className="text-lg font-semibold text-gray-600 mb-2">Szerep</span>
              <span className="text-xl font-bold text-gray-900 capitalize">{user.role}</span>
            </div>
            {/* Placeholder for future info islands */}
            <div className="bg-[var(--background)] rounded-xl shadow p-6 flex flex-col items-center min-h-[120px] opacity-60 border-2 border-dashed border-gray-300">
              <span className="text-lg font-semibold text-gray-400 mb-2">További információ</span>
              <span className="text-md text-gray-400 text-center">Itt fog megjelenni a rendelési előzmény, kuponok, stb.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
