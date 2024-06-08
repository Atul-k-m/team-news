const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'] // Email validation using regex
    },
    password: {
        type: String,
        required: true,
        minlength: 8, // Minimum length of 8 characters
        match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must be at least 8 characters long and contain both letters and numbers'] // Password validation: alphanumeric
    },
    defaultGenre: {
        type: String,
        default: 'World News',
    },
    theme: {
        type: String,
        default: 'Light',
    },
    language: {
        type: String,
        default: 'English',
    },
    country: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    }
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password') || user.isNew) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
