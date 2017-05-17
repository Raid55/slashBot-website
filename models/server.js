const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema;

const serverSchema = new Schema({
  id: String,
  icon: String,
  name: String,
  ownerid: String,
  isOn: Boolean,
  mods:{}
})

serverSchema.plugin(findOrCreate);
module.exports = serverSchema
