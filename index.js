const app = require('./src/app');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Alumni Tracking System listening at http://localhost:${PORT}`);
    console.log(`🌐 MVC Web Directory: http://localhost:${PORT}/users`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api/swagger`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
