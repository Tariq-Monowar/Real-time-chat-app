import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { verify } from "jsonwebtoken";

import generateToken from "../config/genereteToken";

const prisma = new PrismaClient();

interface RegisterUserRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    pic?: string;
  };
}

interface AuthUserRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

  
// Register User
export const registerUser = async (
  req: RegisterUserRequest,
  res: Response
): Promise<void> => {
  const { name, email, password, pic } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please enter all required fields" });
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Password encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the hashed password
        pic: pic || undefined,
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

// Authenticate User
export const authUser = async (
  req: AuthUserRequest,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Compare entered password with hashed password
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};


export const allUsers = async (req: any, res: Response) => {
  const searchQuery = req.query.search
    ? {
        OR: [
          { name: { contains: req.query.search.toLowerCase() } },
          { email: { contains: req.query.search.toLowerCase() } },
        ],
      }
    : {};

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [searchQuery, { id: { not: req.id || "" } }],
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};


 


export const checkAuthStatus = async (req: Request, res: Response) => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  try {
   

    const token = req.headers.authorization as string
    
    verify(token, JWT_SECRET, async (err: any, decodedToken: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      console.log('user', decodedToken);
      
      // Find user by userId using Prisma
      const userInfo = await prisma.user.findUnique({
        where: {
          id: decodedToken.id,  // Assuming decodedToken contains userId
        },
      });

      if (!userInfo) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(userInfo);
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

// export const logout = (req: Request, res: Response) => {
//   try {
//     res.clearCookie("token");
//     res.status(200).json({ message: "Logged out successfully" });
//   } catch (error) {
//     res.status(400).json(error);
//   }
// };