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
      { id: user._id, username: user.username, email: user.email, role: user.role },
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


import multer from 'multer';
import path from 'path';

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter for image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Add this controller function
export const uploadBuffetImage = async (req, res) => {
  try {
    const buffet = await Buffet.findById(req.params.id);
    
    if (!buffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Construct the image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Update buffet with new image URL
    buffet.image = imageUrl;
    await buffet.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl
    });
    
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: error.message });
  }
};