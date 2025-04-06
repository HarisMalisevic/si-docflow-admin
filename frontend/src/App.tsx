import "./App.css";
import { Routes, Route } from "react-router";

import DocumentTypeViewer from "./components/DocumentTypeViewer";
import AppNavbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";

function App() {
  return (
    <div>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<div></div>} />
        <Route path="/document-types" element={<DocumentTypeViewer />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/logout" element={<LoginForm />} /> {/* Dodano */}
      </Routes>
    </div>
  );
}

export default App;
