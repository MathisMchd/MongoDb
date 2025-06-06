const mongoose = require('mongoose');


const potionSchema = new mongoose.Schema({
    name: String,
    price: Number,
    score: Number,
    ingredients: [mongoose.Schema.Types.Mixed],
    ratings: { strength: Number, flavor: Number },
    tryDate: Date,
    categories: [String],
    vendor_id: String
});

const Potion = mongoose.model('Potion', potionSchema);

module.exports = Potion;