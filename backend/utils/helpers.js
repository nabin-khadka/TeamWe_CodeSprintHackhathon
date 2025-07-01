const crypto = require('crypto');

// Generate random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone format (Nepal +977 format)
const validatePhone = (phone) => {
    return phone.startsWith('+977') && phone.length === 13;
};

// Format error response
const formatErrorResponse = (error) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return `${field} already exists`;
    }
    return 'Internal server error';
};

module.exports = {
    generateToken,
    validateEmail,
    validatePhone,
    formatErrorResponse
};
