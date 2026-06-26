import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWTSECRETKEY,
    {
      expiresIn: "7d",
    }
  );
};