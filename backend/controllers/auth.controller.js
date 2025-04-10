import { Users } from "../models/user.model.js";
import Buffet from "../models/buffet.model.js"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Helytelen felhasználónév vagy jelszó" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Helytelen felhasználónév vagy jelszó" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res
      .status(200)
      .json({ message: "Felhasználó megtalálva", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Szerver hiba: " + error.message });
  }
};


export const buffetLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const buffet = await Buffet.findOne({ email: email.toLowerCase() });
    if (!buffet) {
      return res
        .status(404)
        .json({ message: "Helytelen email vagy jelszó" });
    }

    const isMatch = await bcrypt.compare(password, buffet.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Helytelen email vagy jelszó" });
    }

    const token = jwt.sign(
      { id: buffet._id, email: buffet.email, role: "buffet" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res
      .status(200)
      .json({ message: "Sikeres buffet bejelentkezés", buffet, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Szerver hiba: " + error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const registeredDate = `${year}-${month}-${day} ${hours}:${minutes}`;

    const existingUser = await Users.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A felhasználónév és email már létezik" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      accountCreated: registeredDate,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "Felhasználó sikeresen regisztrálva", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Szerver hiba: " + error.message });
  }
};
