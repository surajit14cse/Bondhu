const checkPremium = (req, res, next) => {
  // Assuming req.user is set by auth middleware
  if (req.user && req.user.isPremium) {
    const now = new Date();
    if (req.user.premiumExpiry && new Date(req.user.premiumExpiry) > now) {
      return next();
    }
  }
  res.status(403).json({ error: 'Premium subscription required for this feature' });
};

module.exports = checkPremium;
