import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/_main";
import { BuffetListPage } from "./pages/buffets/_buffets";
import { RegisterPage } from "./pages/auth/_register";
import { LoginPage } from "./pages/auth/_login";
import { BuffetLoginPage } from "./pages/auth/_buffetLogin";
import { AdminDashboard } from "./pages/admin/_dashboard";
import { BuffetDashboard } from "./pages/_buffetDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/buffets" element={<BuffetListPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/buffet-login" element={<BuffetLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/buffet-dashboard" element={<BuffetDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
