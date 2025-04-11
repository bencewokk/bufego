import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/_main";
import { BuffetListPage } from "./pages/buffets/_buffets";
import { RegisterPage } from "./pages/auth/_register";
import { LoginPage } from "./pages/auth/_login";
import { BuffetLoginPage } from "./pages/auth/_buffetLogin";
import { AdminDashboard } from "./pages/admin/_dashboard";
import { BuffetDashboard } from "./pages/buffetDashboard/_buffetDashboard";
import { BuffetDetails } from "./pages/buffets/_details";
import { BuffetTouch } from "./pages/buffetDashboard/_buffetTouch"; 
import { About } from "./components/landing/About";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/buffets" element={<BuffetListPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/buffet-login" element={<BuffetLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/buffet-dashboard" element={<BuffetDashboard />} />
        <Route path="/buffet-dashboard/touch" element={<BuffetTouch />} />
        <Route path="/buffet/:id" element={<BuffetDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
