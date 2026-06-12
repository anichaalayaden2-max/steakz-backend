import { Request, Response, NextFunction } from "express";

// AUTHORIZE MIDDLEWARE - Checks if the logged in user has the required role to access a route
export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    // If no user is found in the request, block access - user must be logged in first
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // If the user's role is not in the allowed roles list, block access - prevents staff from accessing features outside their role
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Allow the request to continue - user has the correct role
    next();
  };