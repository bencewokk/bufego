import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/_main";
import { BuffetListPage } from "./pages/_buffets";
import { BuffetDetailsPage } from "./pages/BuffetDetailsPage";
import { RegisterPage } from "./pages/_register";
import { LoginPage } from "./pages/_login";
import { DashboardPage } from "./pages/_dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/buffets" element={<BuffetListPage />} />
        <Route path="/buffet/:id" element={<BuffetDetailsPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;