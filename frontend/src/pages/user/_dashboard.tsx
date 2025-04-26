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
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-[var(--primary)]">Felhasználói fiók</h1>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-900">{user.email || user.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Szerep:</span>
              <span className="text-gray-900">{user.role}</span>
            </div>
            {/* Ide jöhetnek további felhasználói adatok vagy funkciók */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
