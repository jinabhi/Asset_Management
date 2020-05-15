const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema({
  transferid: String,
  fromempid: String,
  trmgrid: String,
  transferassetid: String,
  transferassetName: String,
  toempid: String,
  transferDate: String,
  transferStatus: String,
});
module.exports = mongoose.model('transfer', LoginSchema);
