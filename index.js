const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middlewares (supports JSON and form urlencoded data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Documentation
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// In-memory user data store (no database yet)
let users = [
  {
    id: 1,
    name: "Emre Yılmaz",
    email: "emre@example.com",
    department: "Computer Engineering",
    graduationYear: 2024,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Ceyda Yılmaz",
    email: "ceyda@example.com",
    department: "Software Engineering",
    graduationYear: 2023,
    createdAt: new Date().toISOString()
  }
];
let nextUserId = 3;

// --- LAB 2: API & USER CRUD ROUTES ---

// 1. GET /api/health -> System health status in JSON format
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'System is healthy'
  });
});

// 2. GET /api/users -> List all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 3. POST /api/users -> Create user (in-memory store, supports JSON and form urlencoded)
app.post('/api/users', (req, res) => {
  const { name, email, department, graduationYear } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const newUser = {
    id: nextUserId++,
    name,
    email,
    department: department || '',
    graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// 4. GET /api/users/:id -> Get user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: `User with id ${req.params.id} not found.` });
  }

  res.json(user);
});

// 5. PUT /api/users/:id -> Full update of user information by ID
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `User with id ${id} not found.` });
  }

  const { name, email, department, graduationYear } = req.body;
  if (!name && !email) {
    return res.status(400).json({ error: 'At least name or email is required for update.' });
  }

  users[index] = {
    ...users[index],
    name: name || users[index].name,
    email: email || users[index].email,
    department: department !== undefined ? department : users[index].department,
    graduationYear: graduationYear !== undefined ? parseInt(graduationYear, 10) : users[index].graduationYear,
    updatedAt: new Date().toISOString()
  };

  res.json(users[index]);
});

// 6. PATCH /api/users/:id -> Partial update of user information by ID
app.patch('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: `User with id ${id} not found.` });
  }

  const { name, email, department, graduationYear } = req.body;

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (department !== undefined) user.department = department;
  if (graduationYear !== undefined) user.graduationYear = parseInt(graduationYear, 10);
  user.updatedAt = new Date().toISOString();

  res.json(user);
});

// 7. DELETE /api/users/:id -> Delete user by ID
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `User with id ${id} not found.` });
  }

  const deletedUser = users.splice(index, 1)[0];
  res.json({ message: `User with id ${id} deleted successfully.`, user: deletedUser });
});

// --- LAB 1: BASIC EXPRESS INTRODUCTORY ROUTES ---

// GET / -> "ok"
app.get('/', (req, res) => {
  if (req.query.home !== undefined || req.query.main !== undefined) {
    return res.send('temporary one main page');
  }
  res.send('ok');
});

// Explicit ok route for verification
app.get('/ok', (req, res) => {
  res.send('ok');
});

// GET /hello -> "Hello, World!"
app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

// GET /hello/:name -> Formatted greeting (e.g. /hello/emre -> "Hello, Emre!")
app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  res.send(`Hello, ${formattedName}!`);
});

// GET /sum/:number1/:number2 -> Returns the sum of two numbers
app.get('/sum/:number1/:number2', (req, res) => {
  const num1 = Number(req.params.number1);
  const num2 = Number(req.params.number2);

  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Please provide valid numbers.');
  }

  const result = num1 + num2;
  res.send(result.toString());
});

// GET /home (or /main, /alumni) -> "temporary one main page"
app.get(['/home', '/main', '/alumni'], (req, res) => {
  res.send('temporary one main page');
});

// GET /about -> "temp. about page"
app.get('/about', (req, res) => {
  res.send('temp. about page');
});

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api/swagger`);
  });
}

module.exports = app;
