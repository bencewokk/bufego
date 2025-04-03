import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FloatingBlob } from "../components/design/Blob";
import logoImage from '../assets/bufego.png';

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
        return <b>Sikeresen regisztráltál! ✅</b>;
      },
      error: (err) => {
        const errorMsg =
          err.response?.data?.message || "Hiba történt a regisztráció során.";
        return <b>{errorMsg}</b>;
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary)]">
      <FloatingBlob />
      <div className="absolute top-4 left-4">
        <a href="/" aria-label="Főoldal">
          <img src={logoImage} alt="BüféGO Logo" className="h-8 md:h-10" />
        </a>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Regisztráció
        </h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-[#c9c9c9] rounded mt-1 outline-none hover:border-[#9f9f9f] focus:border-[#9f9f9f] transition-all duration-300"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700">Felhasználónév</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border border-[#c9c9c9] rounded mt-1 outline-none hover:border-[#9f9f9f] focus:border-[#9f9f9f] transition-all duration-300"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700">Jelszó</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-[#c9c9c9] rounded mt-1 outline-none hover:border-[#9f9f9f] focus:border-[#9f9f9f] transition-all duration-300"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700">Jelszó megerősítése</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-[#c9c9c9] rounded mt-1 outline-none hover:border-[#9f9f9f] focus:border-[#9f9f9f] transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-orange-500 text-white py-2 rounded hover:bg-orange-600 cursor-pointer"
          >
            Regisztráció
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Már van fiókod?
          <a
            href="/login"
            className="text-orange-500 font-semibold ml-1 cursor-pointer"
          >
            Bejelentkezés
          </a>
        </p>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};
