const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  password : String,
  created: {
    type: Date,
    "default": Date.now
  }
});

const User = mongoose.model('user', userSchema);

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/test', function(err) {
  if (err) {
    return log("~~~~~~~~~~~~~~~~~~~~~~   Error connecting to MongoDB! ~~~~~~~~~~~~~~~~");
  }
});

module.exports = User;

