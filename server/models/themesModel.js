const mongoose = require('mongoose');

const ThemeSettingSchema = new mongoose.Schema({
    primary_color: String,
    secondary_color: String,
    button_color: String,
    logoo_url: String,
  },
  { collection: "theme_settings" }
);

module.exports = mongoose.model('ThemeSetting', ThemeSettingSchema);
