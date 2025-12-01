const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id,
      airtableUserId: user.airtableUserId,
      profile: user.profile
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
