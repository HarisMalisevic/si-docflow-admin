import "./App.css";
import { Routes, Route } from "react-router";

import DocumentTypeViewer from "./components/DocumentTypeViewer";
import AppNavbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import HomeRedirect from "./components/HomeRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import AddSSOProviderForm from "./components/AddSSOProviderForm"; // ✅ DODANO

function App() {
  return (
    <div>
      <ProtectedRoute>
        <AppNavbar />
      </ProtectedRoute>

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/document-types"
          element={
            <ProtectedRoute>
              <DocumentTypeViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sso-provider"
          element={
            <ProtectedRoute>
              <AddSSOProviderForm />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/logout" element={<LoginForm />} />
      </Routes>
    </div>
  );
}

export default App;