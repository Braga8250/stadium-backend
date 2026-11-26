const config = {
  // Online: read from environment. Local: fallback values
  db: process.env.MONGO_URI || "mongodb://localhost:27017/estadio",
  secret: process.env.JWT_SECRET || "supersecret",
  expiresPassword: 86400, // expires in 24 hours
  saltRounds: 10,
};

module.exports = config;
