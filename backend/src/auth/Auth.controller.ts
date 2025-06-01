/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import DB from "../database";
import passport from "passport";
import jwt from "jsonwebtoken";
import SSOProvider from "modules/SSOProvider/SSOProvider.model";
import { GOOGLE_API_NAME } from "./SSO_DEFAULTS";
import AdminUser from "../modules/AdminUser/AdminUser.model";
import bcrypt from 'bcrypt';

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

        const ssoProvider: SSOProvider = await DB.sso_providers.findOne({
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

        const ssoProvider: SSOProvider = await DB.sso_providers.findOne({
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

            const user = await DB.admin_users.findOne({
                where: { id: userId },
                attributes: ["email", "sso_provider", "sso_id", "is_super_admin", "createdAt"],
                include: [{
                    model: DB.sso_providers,
                    as: "sso_provider_details",
                    attributes: ["display_name"],
                    required: false
                }]
            });

            if (!user) {
                res.status(404).send({ error: "User not found" });
                return;
            }

            res.send({
                email: user.email,
                ssoProvider: user.sso_provider_details ? user.sso_provider_details.display_name : '',
                ssoId: user.sso_id ?? '',
                isSuperAdmin: user.is_super_admin,
                createdAt: user.createdAt
            });
        } catch (err) {
            console.error("Error in profile route: ", err);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try{
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Missing required fields: email or password" });
                return;
            }

            const userProfile = await AdminUser.findOne({
                where: { email: email }
            });

            if (!userProfile) {
                res.status(404).json({ message: "No user profile found for the provided email address" });
                return;
            }

            if (!userProfile.password) {
                res.status(400).json({ message: "Password for this user profile has not been set" });
                return;
            }

            const isPasswordMatched = await bcrypt.compare(password, userProfile.password);

            if (!isPasswordMatched) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            const token = jwt.sign({ id: userProfile.id }, process.env.SESSION_SECRET!);
            console.log("User.id:", userProfile.id, " - generated token: ", token);

            res.cookie("jwt", token, { httpOnly: true, secure: true, maxAge: 3600000 });
            res.status(200).json({ message: "User successfully logged in" });
        } catch (error) {
            console.log("Login error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async register(req: Request, res: Response): Promise<void> {
        try{
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Missing required fields: email or password" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const existingProfile = await AdminUser.findOne({
                where: { email: email }
            });

            if (existingProfile && !existingProfile.sso_provider) {
                res.status(409).json({ message: "A user profile with this email address already exists" });
                return;
            }

            await AdminUser.create({
                email: email,
                password: hashedPassword,
                is_super_admin: false
            });

            res.status(200).json({ message: "User successfully registered" });
        } catch (error) {
            console.log("Error while registering: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default AuthController;