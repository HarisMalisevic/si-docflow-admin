/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import db from "../database/db";
import passport from "passport";
import jwt from "jsonwebtoken";
import SSOProvider from "database/SSOProvider";
import configurePassport from "auth/passportConfig";
import { GOOGLE_API_NAME } from "../auth/googleAuthStrategy";

class AuthController {


    static async googleLogin(req: Request, res: Response): Promise<void> {

        passport.authenticate(GOOGLE_API_NAME, {
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
        passport.authenticate(GOOGLE_API_NAME, { session: false }, (err: any, user: any, info: any) => {
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

    static async ssoLogin(req: Request, res: Response): Promise<void> {
        const { sso_provider_name } = req.params;

        console.log("SSO Login:", sso_provider_name);

        const ssoProvider: SSOProvider = await db.sso_providers.findOne({
            where: { display_name: sso_provider_name }
        });

        if (!ssoProvider) {
            res.status(404).send({ error: "SSO provider not found" });
            return
        }

        try {

            passport.authenticate(ssoProvider.api_name, {
                scope: ["email"],
            })(req, res, (err: any) => {
                if (err) {
                    res.status(500).send({ error: "Authentication failed " + err });
                }
            });


        } catch (error) {
            console.error("Error in ssoLogin:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async ssoCallback(req: Request, res: Response): Promise<void> {
        const { sso_provider_name } = req.params;

        console.log("SSO Callback:", sso_provider_name);

        const ssoProvider: SSOProvider = await db.sso_providers.findOne({
            where: { api_name: sso_provider_name }
        });

        if (!ssoProvider) {
            res.status(404).send({ error: "SSO provider not found" });
            return;
        }

        passport.authenticate(ssoProvider.api_name, { session: false }, (err: any, user: any, info: any) => {
            if (err || !user) {
                return res.status(401).send({ error: "Authentication failed " + err });
            }

            try {
                // Generate a JWT token for the authenticated user
                const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET!);
                console.log("User.id:", user.id, " - generated token: ", token);

                res.cookie("jwt", token, { httpOnly: true, secure: true, maxAge: 3600000 });
                // Token lasts for 1 hour, browser deletes it after expiration

                // Redirect to the dashboard or send a success response
                res.redirect("/");
            } catch (error) {
                res.status(500).send({ error: "Internal server error" });
            }
        })(req, res);
    }

    static async profile(req: Request, res: Response): Promise<void> {
        try {
            const userId: number = (req.user as { id: number }).id;
    
            const user = await db.users.findOne({
                where: { id: userId },
                attributes: ["email", "sso_provider_id", "sso_id", "is_super_admin", "created_at"],
                include: [{
                    model: db.sso_providers,
                    as: "sso_provider",
                    attributes: ["display_name"]
                }]
            });
    
            if (!user) {
                res.status(404).send({ error: "User not found" });
                return;
            }
    
            res.send({
                email: user.email,
                ssoProvider: user.sso_provider.display_name,
                ssoId: user.sso_id,
                isSuperAdmin: user.is_super_admin,
                createdAt: user.created_at
            });
        } catch (err) {
            console.error("Error in profile route: ", err);
            res.status(500).send({ error: "Internal server error" });
        }
    }
}

export default AuthController;