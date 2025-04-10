import Buffet from "../models/buffet.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";


const saltRounds = 10;

export const getBuffets = async (req, res) => {
  const buffets = await Buffet.find();
  res.json(buffets);
};

export const getBuffetById = async (req, res) => {
  const buffet = await Buffet.findById(req.params.id);
  res.json(buffet);
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

export const addBuffet = async (req, res) => {
  console.log("Received request body:", req.body);
  const { name, location, openingHours, image, tags, email, password } = req.body;
 
  try {
    const existingBuffet = await Buffet.findOne({ email });

    if (existingBuffet) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "A megadott email címmel már rendelkezik egy büfé!" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newBuffet = new Buffet({ name, location, openingHours, image, tags, email, password: hashedPassword });
    console.log("Attempting to save new buffet:", newBuffet);
    await newBuffet.save();
    console.log("Buffet saved successfully");
    res.status(201).json(newBuffet);
  } catch (error) {
    console.error("Error saving buffet:", error);
    res.status(400).json({ message: error.message }); 
  }
}

export const updateBuffet = async (req, res) => {
  try {
    const { name, location, openingHours, image, tags } = req.body;
    const updatedBuffet = await Buffet.findByIdAndUpdate(
      req.params.id,
      { name, location, openingHours, image, tags },
      { new: true }
    );
    
    if (!updatedBuffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    res.json(updatedBuffet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBuffet = async (req, res) => {
  try {
    const deletedBuffet = await Buffet.findByIdAndDelete(req.params.id);
    
    if (!deletedBuffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    res.json({ message: "Buffet deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getBuffetInventory = async (req, res) => {
  try {
    const buffet = await Buffet.findById(req.params.id);
    if (!buffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    res.json(buffet.inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBuffetInventory = async (req, res) => {
  try {
    const { inventory } = req.body;
    const updatedBuffet = await Buffet.findByIdAndUpdate(
      req.params.id,
      { inventory },
      { new: true }
    );
    
    if (!updatedBuffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    res.json(updatedBuffet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addInventoryItem = async (req, res) => {
  try {
    const { name, available, category } = req.body;
    const buffet = await Buffet.findById(req.params.id);
    
    if (!buffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    buffet.inventory.push({ name, available, category });
    await buffet.save();
    
    res.status(201).json(buffet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const buffet = await Buffet.findById(req.params.id);
    
    if (!buffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    buffet.inventory = buffet.inventory.filter(item => item._id.toString() !== itemId);
    await buffet.save();
    
    res.json(buffet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const buffet = await Buffet.findById(req.params.id);
    
    if (!buffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    const itemIndex = buffet.inventory.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    buffet.inventory[itemIndex].available = !buffet.inventory[itemIndex].available;
    await buffet.save();
    
    res.json(buffet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};