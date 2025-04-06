import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomeRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("/api/auth/status", {
                    credentials: "include", // Include cookies in the request
                });
                const data = await response.json();

                if (data.loggedIn) {
                    navigate("/document-types"); // TODO: Zamijeniti sa homepage
                } else {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error checking login status:", error);
                navigate("/login");
            }
        };

        checkLoginStatus();
    }, [navigate]);

    return null; // Render nothing while redirecting
};

export default HomeRedirect;