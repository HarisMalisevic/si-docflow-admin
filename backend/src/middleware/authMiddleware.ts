/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.jwt; // Get the JWT from the cookie

    if (!token) {
        return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SESSION_SECRET!);
        req.user = decoded; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).send({ error: "Unauthorized: Invalid token" });
    }
};

export default authMiddleware;