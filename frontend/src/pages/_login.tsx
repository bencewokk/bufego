import axios from "axios";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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
      success: <b>Sikeresen bejelentkeztél! ✅</b>,
      error: (err) => {
        const errorMsg =
          err.response?.data?.message || "Hiba történt a bejelentkezés során.";
        return <b>{errorMsg}</b>;
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary)]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Bejelentkezés
        </h2>
        <form className="mt-6" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="w-full mt-6 bg-orange-500 text-white py-2 rounded hover:bg-orange-600 cursor-pointer"
          >
            Bejelentkezés
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          "Nincs fiókod?"
          <a href="/signup" className="text-orange-500 font-semibold ml-1 cursor-pointer">
            Regisztráció
          </a>
        </p>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};
