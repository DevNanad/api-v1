import jwt from "jsonwebtoken";
import argon2 from "argon2";

//Compare password
export const comparePasswords = (password, hash) => {
  return argon2.verify(hash, password);
};

//Hash Password
export const hashPassword = (password) => {
  return argon2.hash(password);
};

//Protect incoming requests
export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401);
    res.json({ message: "Sorry you are not Authorized to access this API." });
    return;
  }

  //destructure the authorization token and split
  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401);
    res.json({ message: "Invalid token" });
    return;
  }

  try {
    const accesstoken = process.env.ACCESSTOKEN_SECRET;
    if (accesstoken) {
      const user = jwt.verify(token, accesstoken);
      //augment the request object
      req.user = user;
      next();
    }
  } catch (error) {
    res.status(403);
    res.json({ message: "Invalid token" });
  }
};
