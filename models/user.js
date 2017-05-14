const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: String,
  username: String,
  avatar: String,
  discriminator: String,
  mfa_enabled: Boolean,
  servers: [{
    id: String,
    icon: String,
    name: String
  }],
  session:{
    accessToken: String,
    refreshToken: String
  },
  updated: { type: Date, default: Date.now },
  created: Date
})

userSchema.plugin(findOrCreate);
module.exports = userSchema
