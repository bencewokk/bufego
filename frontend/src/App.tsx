import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/_main";
// Import future pages here as needed
import { BuffetListPage } from "./pages/_buffets";
import { RegisterPage } from "./pages/_register.tsx";
import { LoginPage } from "./pages/_login.tsx";
import { DashboardPage } from "./pages/_dashboard.tsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/buffets" element={<BuffetListPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;