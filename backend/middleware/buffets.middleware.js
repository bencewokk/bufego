// ez igy nem lesz jo TODO
export const isBuffet = (req, res, next) => {
  if (req.user && (req.user.role === 'buffet' || req.user.role === 'admin')) {
      return next();
  }
  
  return res.status(403).json({ message: 'Csak büfék és adminok férhetnek hozzá ehhez az endpointhoz' });    
}