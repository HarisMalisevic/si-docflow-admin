/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


class AuthMiddleware {
    static isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
        const cookies = req.headers.cookie;
        const jwtCookie = cookies?.split("; ").find(cookie => cookie.startsWith("jwt="))?.split("=")[1];
        console.log("Extracted JWT:", jwtCookie);

        if (!jwtCookie) {
            return res.status(401).send({ error: "Unauthorized: No jwtCookie provided" });
        }

        try {
            // Verify the jwtCookie
            const decoded = jwt.verify(jwtCookie, process.env.SESSION_SECRET!);
            req.user = decoded; // Attach user info to the request object
            next(); // Proceed to the next middleware or route handler
        } catch (err) {
            return res.status(401).send({ error: "Unauthorized: Invalid jwtCookie" });
        }
    };

}


export default AuthMiddleware;