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
import ApiEndpoints from "./components/ApiEndpoints";
import ApiEndpointsCreate from "./components/ApiEndpointsCreate";
import ProcessingRuleViewer from "./components/ProcessingRuleViewer";
import ProcessingRuleDestinationViewer from "./components/ProcessingRuleDestinationViewer";
import FTPEndPointsViewer from "./components/FTPEndpointsViewer";
import FTPEndpointsCreate from "./components/FTPEndpointsCreate";
import LogsViewer from "./components/LogsViewer";
import ProcessingRequestsBillingLogsViewer from "./components/ProcessingRequestsBillingLogsViewer";
import WindowsAppInstanceManager from "./components/WindowsAppInstanceManager";
import CommandInitiatorUI from "./components/CommandInitiatorUI";
import LocalStorageFolder from "./components/LocalStorageFolder";

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
        <Route
          path="/document-layouts/create"
          element={<DocumentLayoutCreate />}
        />
        <Route
          path="/document-layouts/edit/:id"
          element={<DocumentLayoutEdit />}
        />
        <Route path="/home" element={<HomePage />} />
        <Route path="/access-rights" element={<AccessRightsViewer />} />
        <Route path="/api-endpoints" element={<ApiEndpoints />} />
        <Route path="/api-endpoints/create" element={<ApiEndpointsCreate />} />
        <Route
          path="/api-endpoints/edit/:id"
          element={<ApiEndpointsCreate />}
        />
        <Route
          path="/processing-rules/:id/destinations"
          element={<ProcessingRuleDestinationViewer />}
        />
        <Route path="/processing-rules" element={<ProcessingRuleViewer />} />
        <Route path="/ftp-endpoints" element={<FTPEndPointsViewer />} />
        <Route path="/ftp-endpoints/create" element={<FTPEndpointsCreate />} />
        <Route path="/ftp-endpoints/edit/:id" element={<FTPEndpointsCreate />} />
        <Route path="/client-transaction-logs" element={<LogsViewer />} />
        <Route path="/processing-requests-billing-logs" element={<ProcessingRequestsBillingLogsViewer />} />
        <Route path="/app-instance-manager" element={<WindowsAppInstanceManager />} />
        <Route path="/remote-command/initiate" element={<CommandInitiatorUI />} />
        <Route path="/local-storage-folder" element={<LocalStorageFolder />} />
        {/*redirect unknown routes*/}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
