const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 1. GET / -> "ok"
 * 5. GET / (or home page) -> "temporary one main page"
 * We support default "ok", and if queried with ?home or accessed via /home, /main, /alumni
 * it serves the temporary home page.
 */
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

// 2. GET /hello -> "Hello, World!"
app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

// 3. GET /hello/:name -> Formatted greeting (e.g. /hello/emre -> "Hello, Emre!")
app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  res.send(`Hello, ${formattedName}!`);
});

// 4. GET /sum/:number1/:number2 -> Returns the sum of two numbers
app.get('/sum/:number1/:number2', (req, res) => {
  const num1 = Number(req.params.number1);
  const num2 = Number(req.params.number2);

  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Please provide valid numbers.');
  }

  const result = num1 + num2;
  res.send(result.toString());
});

// 5. GET /home (or /main, /alumni) -> "temporary one main page"
app.get(['/home', '/main', '/alumni'], (req, res) => {
  res.send('temporary one main page');
});

// 6. GET /about -> "temp. about page"
app.get('/about', (req, res) => {
  res.send('temp. about page');
});

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
