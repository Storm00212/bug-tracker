import { AuthService } from "../services/authService.js";
import { userSchema } from "../models/User.js";
/** Register a new user */
export const registerUser = async (req, res) => {
    try {
        const parse = userSchema.safeParse(req.body);
        if (!parse.success) {
            const errors = parse.error.issues.map((e) => e.message).join(", ");
            return res.status(400).json({ message: `Validation failed: ${errors}` });
        }
        const user = await AuthService.register(req.body);
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (err) {
        console.error("Register Error:", err.message);
        if (err.message === "Email already registered") {
            return res.status(409).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error during registration" });
    }
};
/** Login user */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.login(email, password);
        res.json({ message: "Login successful", token, user });
    }
    catch (err) {
        console.error("Login Error:", err.message);
        if (err.message === "Invalid credentials") {
            return res.status(401).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error during login" });
    }
};
//# sourceMappingURL=authController.js.map