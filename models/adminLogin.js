const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema({
  uid: String,
  pwd: String,
});
module.exports = mongoose.model('Admin', LoginSchema);
