export const dashboard = async (req, res) => {
  res.json({ message: "Welcome to dashboard! ", user: req.user });
};
