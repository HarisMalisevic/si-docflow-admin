/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../database/db";
import AdminUser from "../database/AdminUser";
import { RequestHandler } from "express-serve-static-core";


class AuthMiddleware {
    static isLoggedIn(req: Request, res: Response, next: NextFunction) {
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

    static async isSuperAdmin(req: Request, res: Response, next: NextFunction) {
        const userId = (req.user as { id: number }).id;

        if (!userId) {
            return res.status(401).send({ error: "Unauthorized: No userID provided" });
        }

        try {
            const adminUser = await AdminUser.findOne({ where: { id: userId } });

            if (!adminUser) {
                return res.status(403).send({ error: "Forbidden: User not found" });
            }

            if (!(adminUser instanceof AdminUser)) {
                return res.status(403).send({ error: "Forbidden: Invalid user type" });
            }

            if (!adminUser.is_super_admin) {
                return res.status(403).send({ error: "Forbidden: Not a super admin" });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (err) {
            console.error("Error checking super admin status:", err);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

}


export default AuthMiddleware;