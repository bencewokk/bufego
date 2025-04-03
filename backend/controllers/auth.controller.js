import { Users } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Incorrect username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    return res.status(200).json({ message: "User found", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body; // ✅ Email is bekerül

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // ✅ Itt volt egy substring(-2) hiba
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const registeredDate = `${year}-${month}-${day} ${hours}:${minutes}`;

    // ✅ Ellenőrizni kell, hogy az email már létezik-e
    const existingUser = await Users.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      username: username.toLowerCase(),
      email: email.toLowerCase(), // ✅ Email mentése
      password: hashedPassword,
      accountCreated: registeredDate,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const dashboard = async (req, res) => {
  res.json({ message: "Welcome to dashboard! ", user: req.user });
};
