import axios from "axios";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import logoImage from "../../assets/bufego.png";
import { FloatingBlob } from "../../components/design/Blob";
import { GeometricBackground } from "../../components/design/GeometricBackground";

export const BuffetLoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    // Point to the buffet login API endpoint
    const url = "http://localhost:3000/api/buffets/login";

    toast.promise(axios.post(url, payload), {
      loading: "Bejelentkezés folyamatban...",
      success: (res) => {
        const token = res.data.token;
        localStorage.setItem("accessToken", token);
        window.location.href = "/buffet-dashboard";
        return <b>Sikeresen bejelentkeztél!</b>;
      },
      error: (err) => {
        const errorMsg =
          err.response?.data?.message ||
          "Hiba történt a bejelentkezés során.";
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
          Buffet Bejelentkezés
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
