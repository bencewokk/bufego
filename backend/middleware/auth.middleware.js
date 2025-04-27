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
    console.log("[AUTH] Decoded token:", user); // Log the decoded token for debugging
    next();
  });
};

// Optional authentication: sets req.user if token is present, but does not reject if missing
export const optionalAuthenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    req.user = undefined;
    return next();
  }
  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = undefined;
      return next();
    }
    req.user = user;
    console.log("[AUTH-OPTIONAL] Decoded token:", user);
    next();
  });
};

export const requireBuffet = (req, res, next) => {
  if (!req.user || req.user.role !== "buffet") {
    return res.status(403).json({ message: "Csak büfé bejelentkezéssel elérhető." });
  }
  next();
};
