import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}


export const isAuthenticated = (req :Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({ message: 'unauthorized'});
        
    }
    const token = authHeader .split(' ')[1];
    if (!token){
        return res.status (401).json({ message : 'unauthorized'});
    }
    try {
        const decode =jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decode;
        next();
    }
    catch (error){
        res.status(401).json({message :'unauthorized'});

    }


}
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Expecting header format: Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any) .user = decoded; // attach token payload (user info) to request
    next(); // move to next middleware or controller
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }

};
export const verifyFarmer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (req.user.role !== "farmer") {
    return res.status(403).json({ message: "Access denied. Farmers only" });
  }

  next()};