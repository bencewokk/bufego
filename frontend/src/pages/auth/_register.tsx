import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FloatingBlob } from "../../components/design/Blob";
import logoImage from '../../assets/bufego.png';

const GeometricBackground = () => (
  <div className="absolute inset-0 overflow-hidden opacity-10">
    <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-[var(--primary-light)] opacity-20 animate-float1"></div>
    <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-[var(--primary)] opacity-15 animate-float2"></div>
    <div className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-[var(--primary-dark)] opacity-10 animate-float3"></div>
    <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
  </div>
);

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("A jelszavak nem egyeznek!");
      return;
    }

    const url = "http://localhost:3000/api/auth/register";
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    toast.promise(axios.post(url, payload), {
      loading: "Regisztrálás folyamatban...",
      success: () => {
        window.location.href = "/login";
        return <b>Sikeresen regisztráltál!</b>;
      },
      error: (err) => {
        const errorMsg =
          err.response?.data?.message || "Hiba történt a regisztráció során.";
        return <b>{errorMsg}</b>;
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] relative overflow-hidden">
      <GeometricBackground />
      <FloatingBlob />
      
      <div className="absolute top-4 left-4">
        <a href="/" aria-label="Főoldal">
          <img src={logoImage} alt="BüféGO Logo" className="h-10 md:h-12" />
        </a>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 transition-all duration-300 hover:shadow-2xl z-10">
        <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-8">
          Regisztráció
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Felhasználónév
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Jelszó
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Jelszó megerősítése
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold uppercase tracking-wide hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
          >
            Regisztráció
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Már van fiókod?{" "}
          <a
            href="/login"
            className="text-[var(--primary)] font-semibold hover:underline transition-all"
          >
            Bejelentkezés
          </a>
        </p>
      </div>
      <Toaster position="top-center" />

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, -15px) rotate(3deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, 10px) rotate(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5px, -20px); }
        }
        .animate-float1 {
          animation: float1 15s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 18s ease-in-out infinite;
        }
        .animate-float3 {
          animation: float3 12s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};