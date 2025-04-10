import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/_main";
import { BuffetListPage } from "./pages/buffets/_buffets";
import { RegisterPage } from "./pages/auth/_register";
import { LoginPage } from "./pages/auth/_login";
import { BuffetLoginPage } from "./pages/auth/_buffetLogin";  // import the buffet login page
import { AdminDashboard } from "./pages/admin/_dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/buffets" element={<BuffetListPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />        {/* Admin/User login */}
        <Route path="/buffet-login" element={<BuffetLoginPage />} />{/* Buffet login */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
