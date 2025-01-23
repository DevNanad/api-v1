import jwt from "jsonwebtoken";
import { ValidationError } from "../modules/errors.module";
import { comparePasswords, hashPassword } from "../modules/auth.module";

const SECRET_KEY = process.env.JWT_SECRET;

// Register handler
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new ValidationError("Fields are required"));
    }

    // Check if user already exists
    const existingUser = await req.db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    // Create user
    const user = await req.db.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "success", user });
  } catch (error) {
    next(error);
  }
};

// Login handler
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    // Find user
    const user = await req.db.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password, Please try again!" });
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password, Please try again!" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    next(error);
  }
};
