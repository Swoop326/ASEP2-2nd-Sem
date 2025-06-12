const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },         // from dateFound input
  timeFound: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  item: { type: String, required: true },         // from itemName input
  prn: String,                                    // optional
  imageUrl: String                                // from Cloudinary
});

module.exports = mongoose.model('founditems', foundItemSchema);
