import "./App.css";
import { Routes, Route } from "react-router";

import DocumentTypeViewer from "./components/DocumentTypeViewer";
import AppNavbar from "./components/Navbar";

function App() {
  return (
    <div>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<div></div>} />
        <Route path="/document-types" element={<DocumentTypeViewer />} />
        {/* Add more routes as needed */}
      </Routes>
    </div>
  );
}

export default App;
