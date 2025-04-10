import axios from "axios";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import logoImage from '../../assets/bufego.png';
import { GeometricBackground } from "../../components/design/GeometricBackground";

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      password: formData.password,
    };

    const url = "http://localhost:3000/api/auth/login";

    toast.promise(axios.post(url, payload), {
      loading: "Bejelentkezás folyamatban...",
      success: (res) => {
        const token = res.data.token;
        localStorage.setItem("accessToken", token);
        window.location.href = "/admin";
        return <b>Sikeresen bejelentkeztél!</b>;
      },
      error: (err) => {
        const errorMsg =
          err.response?.data?.message || "Hiba történt a bejelentkezés során.";
        return <b>{errorMsg}</b>;
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] relative overflow-hidden">
      <GeometricBackground />
      
      <div className="absolute top-4 left-4">
        <a href="/" aria-label="Főoldal">
          <img src={logoImage} alt="BüféGO Logo" className="h-10 md:h-12" />
        </a>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 transition-all duration-300 hover:shadow-2xl z-10">
        <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-8">
          Bejelentkezés
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold uppercase tracking-wide hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
          >
            Bejelentkezés
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Nincs fiókod?{" "}
          <a
            href="/signup"
            className="text-[var(--primary)] font-semibold hover:underline transition-all"
          >
            Regisztráció
          </a>
        </p>
      </div>
      <Toaster position="top-center" />

      <style>{`
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