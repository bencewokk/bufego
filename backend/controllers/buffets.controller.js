import Buffet from "../models/buffet.model.js";

export const getBuffets = async (req, res) => {
  const buffets = await Buffet.find();
  res.json(buffets);
};

export const getBuffetById = async (req, res) => {
  const buffet = await Buffet.findById(req.params.id);
  res.json(buffet);
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

    const newBuffet = new Buffet({ name, location, openingHours, image, tags, email, password });
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