import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

interface CustomRequest extends Request {
  id?: number;
}

dotenv.config();

export const verifyUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization;
  const JWT_SECRET = process.env.JWT_SECRET as string;

  if (!token) {
    res.status(400).json({
      message: "Unauthorized user",
    });
    return;
  }

  try {
    const decodedToken = verify(token, JWT_SECRET) as { id: number };

    req.id = decodedToken.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
