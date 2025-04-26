import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

export const requireBuffet = (req, res, next) => {
  if (!req.user || req.user.role !== "buffet") {
    return res.status(403).json({ message: "Csak büfé bejelentkezéssel elérhető." });
  }
  next();
};
