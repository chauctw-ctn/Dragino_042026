const config = {
	port: Number(process.env.PORT) || 3000,
	mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/iot_system"
};

module.exports = config;
