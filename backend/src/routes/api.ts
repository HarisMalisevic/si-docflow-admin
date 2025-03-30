import express, { Request, Response } from "express";
const ROUTER = express.Router();

ROUTER.get("/hello", (req: Request, res: Response) => {
    res.json({ message: "Hello from API!", requestUrl: req.url });
});

export default ROUTER;