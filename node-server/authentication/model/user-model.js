const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
       type: String,
       required: true
    },
    password: {
        type: String,
        required: true
    }, 
    phone: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        default: "buyer" // buyer, seller, admin
    },
    is_verified: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;