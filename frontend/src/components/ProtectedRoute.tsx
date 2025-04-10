import React, { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch("/api/auth/status", {
                    credentials: "include", // Include cookies in the request
                });
                const data = await response.json();
                setIsAuthenticated(data.loggedIn);
            } catch (error) {
                console.error("Error checking authentication status:", error);
                setIsAuthenticated(false);
            }
        };

        checkAuthStatus();
    }, []);

    if (isAuthenticated === null) {
        // Optionally, show a loading spinner while checking authentication
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;