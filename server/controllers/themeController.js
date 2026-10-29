const ThemeSetting = require('../models/themesModel');

// GET theme settings
const getThemeSettings = async (req, res) => {
  try {
    const settings = await ThemeSetting.findOne(); // Adjust query if specific criteria is needed
    if (!settings) {
      return res.status(404).json({ message: 'Theme settings not found' });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getThemeSettings };
