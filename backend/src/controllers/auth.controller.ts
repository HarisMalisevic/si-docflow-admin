/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import db from "../database/db";
import passport from "passport";
import jwt from "jsonwebtoken";

class AuthController {
    static async googleLogin(req: Request, res: Response): Promise<void> {


        passport.authenticate("google", {
            scope: ["profile", "email"],
        })(req, res, (err: any) => {
            if (err) {
                res.status(500).send({ error: "Authentication failed" });
            }
        });

    }

    static async googleCallback(req: Request, res: Response): Promise<void> {

        // Obrada Googleovog odgovora
        // Validacija korisnika
        // Kreiranje sesije/JWT tokena
        // Preusmjeravanje na dashboard

        // Ovo se pozove iz googleAuthStrategy.ts done(err, user, info) - nakon što Google pozove callback
        passport.authenticate("google", { session: false }, (err: any, user: any, info: any) => {
            if (err || !user) {
                return res.status(401).send({ error: "Authentication failed" });
            }

            try {
                // Generate a JWT token for the authenticated user
                const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET!);
                console.log("User.id:", user.id, " - generated token: ", token);

                res.cookie("jwt", token, { httpOnly: true, secure: true, maxAge: 3600000 });
                // Token lasts for 1 hour, browser deletes if after expiration

                // Redirect to the dashboard or send a success response
                res.redirect("/");
            } catch (error) {
                res.status(500).send({ error: "Internal server error" });
            }
        })(req, res);
    }

    static async logout(req: Request, res: Response): Promise<void> {

        // Uništavanje sesije
        // Brisanje JWT cookija
        // Preusmjeravanje na login stranicu

        // Destroy the session if it exists
        req.logout((err) => {
            if (err) {
                return res.status(500).send({ error: "Failed to log out" });
            }

            // Clear the JWT cookie
            res.clearCookie("jwt", { httpOnly: true, secure: true });

            console.log("User logged out successfully.");

            // Redirect to the login page or send a success response
            res.redirect("/");
        });

    }
}

export default AuthController;