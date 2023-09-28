const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserEmailVerificationSchema = new Schema({
    userId: {
        type: String,
        required: true,
        ref: "users"
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires:3600        
    } 
});

const UserEmailVerification = mongoose.model('UserEmailVerification', UserEmailVerificationSchema);
module.exports = UserEmailVerification;