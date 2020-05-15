const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema({
  reqid: String,
  reid: String,
  rmid: String,
  assetName: String,
  reqDate: String,
  reqStatus: String,
});
module.exports = mongoose.model('request', LoginSchema);
