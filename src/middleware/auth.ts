import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// AUTHENTICATE MIDDLEWARE - Checks if the request has a valid JWT token before allowing access
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the request header - every protected request must include a token
    const authHeader = req.headers.authorization;

    // If no token is provided, block the request - prevents unauthorized access to protected routes
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract the token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    // Verify the token is valid and not expired - ensures the user is who they claim to be
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "steakz-secret");

    // Attach the decoded user info (id, role, branchId) to the request - used by controllers to identify the logged in user
    req.user = decoded;

    // Allow the request to continue to the controller
    next();
  } catch (error) {
    // If token is invalid or expired, block the request - protects the system from unauthorized access
    return res.status(401).json({ message: "Invalid token" });
  }
};