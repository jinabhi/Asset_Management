const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  pwd: String,
  empid: String,
  mgrid: String,
  employeeCategory: String,
  mobNum: String,
  doj: String,
  status: String,
});
module.exports = mongoose.model('users', LoginSchema);
