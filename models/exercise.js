const mongoose = require('mongoose');


const exerciseSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: String,
  description: String,
  duration: String,
  date: String
});

module.exports = mongoose.model('Exercise', exerciseSchema);