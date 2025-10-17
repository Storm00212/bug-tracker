import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("Authentication Error:", err.message);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
//# sourceMappingURL=authMiddleware.js.map