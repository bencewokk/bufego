import Buffet from "../models/buffet.model.js";

export const getBuffets = async (req, res) => {
  const buffets = await Buffet.find();
  res.json(buffets);
};

export const getBuffetById = async (req, res) => {
  const buffet = await Buffet.findById(req.params.id);
  res.json(buffet);
};