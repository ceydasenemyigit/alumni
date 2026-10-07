const express = require('express');
const path = require('path');
const cors = require('cors');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const userRoutes = require('./routes/userRoutes');
const apiUserRoutes = require('./routes/apiUserRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));

// Template Engine (EJS for MVC Views)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Swagger UI Documentation
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// MVC Web Routes (HTML Views)
app.use('/users', userRoutes);

// RESTful JSON API Routes
app.use('/api/users', apiUserRoutes);
app.use('/api/health', healthRoutes);

// --- Basic & Introductory Routes ---

// GET / - Root welcome / Home page
app.get('/', (req, res) => {
  if (req.query.ok !== undefined) {
    return res.send('ok');
  }
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, '../public', 'index.html'));
  }
  res.status(200).json({
    message: 'Alumni Tracking System API is running',
    healthCheck: '/api/health',
    swaggerDocs: '/api/swagger',
    webUsers: '/users',
    apiUsers: '/api/users'
  });
});

// GET /about - Temporary about page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'about.html'));
});

// GET /home - Temporary main page
app.get('/home', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, '../public', 'index.html'));
  }
  res.send('temporary one main page');
});

// GET /hello - Returns Hello World
app.get('/hello', (req, res) => {
  res.send('Hello World');
});

// GET /hello/:name - Returns Hello <Name>!
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  res.send(`Hello ${formattedName}!`);
});

// GET /sum/:number1/:number2 - Returns sum of two numbers
app.get('/sum/:number1/:number2', (req, res) => {
  const num1 = Number(req.params.number1);
  const num2 = Number(req.params.number2);

  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Lütfen geçerli sayılar giriniz');
  }

  const sum = num1 + num2;
  res.send(`toplam= ${sum}`);
});

module.exports = app;
