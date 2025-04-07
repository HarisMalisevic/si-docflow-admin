import "./App.css";
import { Routes, Route } from "react-router";
import HomePage from "./components/HomePage";
import DocumentTypeViewer from "./components/DocumentTypeViewer";
import AppNavbar from "./components/Navbar";


function App() {
  return (
    <div>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/document-types" element={<DocumentTypeViewer />} />
        {/* Add more routes as needed */}
      </Routes>
    </div>
  );
}

export default App;