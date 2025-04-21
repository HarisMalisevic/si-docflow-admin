import "./App.css";
import { Routes, Route } from "react-router";

import DocumentTypeViewer from "./components/DocumentTypeViewer";
import AppNavbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import HomeRedirect from "./components/HomeRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import SSOProviderCreate from "./components/SSOProviderCreate";
import DocumentLayoutCreate from "./components/DocumentLayoutCreate";
import HomePage from "./components/HomePage";
import AccessRightsViewer from "./components/AccessRightsViewer";
import DocumentLayoutViewer from "./components/DocumentLayoutViewer";
import DocumentLayoutEdit from "./components/DocumentLayoutEdit";

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
          path="/sso-providers"
          element={
            <ProtectedRoute>
              <SSOProviderCreate />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/logout" element={<LoginForm />} />
        
        <Route path="/document-layouts" element={<DocumentLayoutViewer />} />
        <Route path="/document-layouts/create" element={<DocumentLayoutCreate />} />
        <Route path="/document-layouts/edit/:id" element={<DocumentLayoutEdit />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/access-rights" element={<AccessRightsViewer />} />
        {/*redirect unknown routes*/}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}

export default App;