/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AdminUser from "../modules/AdminUser/AdminUser.model";


class AuthMiddleware {
    static isLoggedIn(req: Request, res: Response, next: NextFunction): Promise<void> | void {
        const cookies = req.headers.cookie;
        const jwtCookie = cookies?.split("; ").find(cookie => cookie.startsWith("jwt="))?.split("=")[1];
        //console.log("Extracted JWT:", jwtCookie);

        if (typeof jwtCookie === "undefined" || jwtCookie === null) {
            res.status(401).send({ error: "Unauthorized: No jwtCookie provided" });
            return;
        }

        try {
            // Verify the jwtCookie
            const decoded = jwt.verify(jwtCookie, process.env.SESSION_SECRET!);
            req.user = decoded; // Attach user info to the request object
            next(); // Proceed to the next middleware or route handler
        } catch (err) {
            res.status(401).send({ error: "Unauthorized: Invalid jwtCookie" });
            return
        }
    };

    static async isSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userId = (req.user as { id: number }).id;

        if (!userId) {
            res.status(401).send({ error: "Unauthorized: No userID provided" });
            return
        }

        try {
            const adminUser = await AdminUser.findOne({ where: { id: userId } });

            if (!adminUser) {
                res.status(403).send({ error: "Forbidden: User not found" });
                return
            }

            if (!(adminUser instanceof AdminUser)) {
                res.status(403).send({ error: "Forbidden: Invalid user type" });
                return
            }

            if (!adminUser.is_super_admin) {
                res.status(403).send({ error: "Forbidden: Not a super admin" });
                return
            }

            next(); // Proceed to the next middleware or route handler
        } catch (err) {
            console.error("Error checking super admin status:", err);
            res.status(500).send({ error: "Internal Server Error" });
            return
        }
    }

}


export default AuthMiddleware;