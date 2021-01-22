const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlSchema = new Schema({
  original: String,
  short: { type: Number, default: 1 },
});

urlSchema.pre('save', async function (next) {
  // find latest (highest 'short' index) url and use that number to add next one in the new url
  const latest = await this.constructor.findOne().sort('-short');
  this.short = latest ? latest.short + 1 : 0;
  next();
})

module.exports = mongoose.model('Url', urlSchema);