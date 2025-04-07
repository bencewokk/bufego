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
 const { name, location, openingHours, image, tags, email, password, } = req.body;
 const existingBuffet = await Buffet.findOne({ email });

 if (existingBuffet) {
   return res.status(400).json({ message: "A megadott email címmel már rendelkezik egy büfé!" });
 }

 try{
  const newBuffet = new Buffet({ name, location, openingHours, image, tags, email, password, });
  await newBuffet.save();
  res.status(201).json(newBuffet);
 } catch (error) {
  res.status(400).json({ message: error.message }); 
 }

 
}