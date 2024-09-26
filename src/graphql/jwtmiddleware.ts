import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      userId: number;
      role: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
