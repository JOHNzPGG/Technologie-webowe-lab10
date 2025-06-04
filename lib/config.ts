export const config = {
   port: process.env.PORT || 3100,
   supportedDevicesNum: 17,
   JwtSecret: "secret",
   databaseUrl: process.env.MONGODB_URI || 'mongodb+srv://twwai:KTp5wYwutrLHPLT@cluster0.ooees.mongodb.net/IoT?retryWrites=true&w=majority',
   // JwtSecret: process.env.JWT_SECRET || 'defaultSecretKey',
   //  databaseUrl: process.env.MONGODB_URI || 'ADRES MONGODB',
    tokenExpiration: '3h' as const,       // ważność tokena JWT
    tokenExpirationMs: 3 * 60 * 60 * 1000 // ważność tokena JWT ms
};