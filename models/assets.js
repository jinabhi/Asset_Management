const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema({
  assetid: String,
  assetName: String,
  assetStatus: String,
  issuedTo: String,
  issueDate: String,
});
module.exports = mongoose.model('assets', LoginSchema);
