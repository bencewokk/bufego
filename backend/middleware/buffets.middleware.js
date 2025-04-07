export const isBuffet = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
      }
    
      return res.status(403).json({ message: 'Csak adminok férhetnek hozzá ehhez az endpointhoz' });    
}