const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUser = process.env.MONGO_USER;
        const mongoPass = process.env.MONGO_PASS;
        const mongoHost = process.env.MONGO_HOST || 'agrilink.tech';
        const mongoPort = process.env.MONGO_PORT || '27017';
        const mongoDb = process.env.MONGO_DB || 'marketplace';

        let mongoUrl;
        if (mongoUser && mongoPass) {
            mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;
        } else {
            mongoUrl = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;
        }

        await mongoose.connect(mongoUrl);

        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
