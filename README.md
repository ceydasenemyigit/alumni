# Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Architecture](https://img.shields.io/badge/Architecture-MVC%20Pattern-blueviolet.svg)](#-mvc-architecture-overview)
[![Template Engine](https://img.shields.io/badge/Views-EJS-orange.svg)](https://ejs.co/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D.svg)](http://localhost:3000/api/swagger)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717.svg)](https://github.com/ceydasenemyigit/alumni)

---

## 📌 About the Project

The **Alumni Tracking System** is a web-based platform designed to maintain academic and professional records of university graduates, support networking between alumni, and enhance communication with university management. Developed for the Web Programming course at Istanbul University, the project strictly adheres to the **Model-View-Controller (MVC)** architectural pattern while exposing both server-rendered web views and RESTful JSON APIs.

---

## 🏛️ MVC Architecture Overview

The application is structured following the **Model-View-Controller (MVC)** software design pattern to ensure high separation of concerns, testability, and clean code maintainability:

```
                      +-------------------+
                      |   Client Browser  |
                      |   / HTTP Client   |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                                     |
   (HTML View Requests)                  (JSON API Requests)
             v                                     v
+------------------------+             +------------------------+
|    UserController      |             |   ApiUserController    |
| (Web Views Controller) |             |  (REST API Controller) |
+-----------+------------+             +-----------+------------+
            |                                      |
            |           +--------------+           |
            +---------->|  UserModel   |<----------+
            |           |  (In-Memory) |           |
            |           +--------------+           |
            v                                      v
+------------------------+             +------------------------+
|      EJS Views         |             |     JSON Responses     |
| (HTML Template Render) |             |  (200, 201, 404, 400)  |
+------------------------+             +------------------------+
```

### 1. Model (`src/models/userModel.js`)
- Represents the user domain entity without requiring an external database connection.
- Stores data in-memory with unique auto-incrementing identifiers (`id`).
- Implements comprehensive **CRUD functions**:
  - `findAll(query)`: Retrieves all users with optional search and role filtering.
  - `findById(id)`: Fetches a single user by integer identifier.
  - `findByEmail(email)`: Validates email uniqueness.
  - `create(data)`: Validates required fields, checks for duplicate email, and creates a user record.
  - `update(id, data)`: Replaces/updates all user fields with validation.
  - `patch(id, data)`: Partially updates specific fields provided in the payload.
  - `delete(id)`: Removes a user from the in-memory collection.
- Encapsulates email regex validation and role normalization (`STUDENT`, `ALUMNI`, `ADMIN`).

### 2. View (`views/`)
- Server-side rendered HTML interfaces powered by the **EJS (Embedded JavaScript)** template engine.
- Organized into dedicated view folders:
  - `views/users/index.ejs`: Directory table listing all users with search, role filters, and action buttons.
  - `views/users/new.ejs`: User creation form for registering new alumni/students.
  - `views/users/show.ejs`: User profile detail view displaying all academic and contact information.
  - `views/users/edit.ejs`: Prefilled user update form.
  - `views/partials/header.ejs` & `footer.ejs`: Reusable responsive layout, navigation bar, and metadata.
  - `views/error.ejs`: Informative error rendering view.

### 3. Controller (`src/controllers/`)
- Separated into two distinct controllers depending on the consumer:
  - **`UserController.js`**: Handles browser navigation, processes web form submissions, calls `UserModel` methods, and renders EJS view templates.
  - **`ApiUserController.js`**: Handles RESTful HTTP requests (JSON / Form URL-Encoded / Multipart), calls `UserModel` methods, and returns structured JSON responses with HTTP status codes.
  - **`healthController.js`**: Provides real-time system diagnostics and health status metrics.

---

## 📂 Directories, Folders & Files Structure

```text
alumni/
├── index.js                     # Server entrypoint (listens on PORT)
├── package.json                 # Project dependencies, scripts, and metadata
├── package-lock.json            # Dependency tree lockfile
├── swagger.json                 # OpenAPI 3.0.3 specification for Swagger UI
├── test.js                      # Automated test suite (18 unit/integration tests)
├── .gitignore                   # Excluded files (node_modules, .env, etc.)
├── README.md                    # Project documentation (Architecture, API, Setup)
│
├── public/                      # Static client assets
│   ├── index.html               # Landing page / Quick API explorer
│   └── about.html               # About Project & Tech Stack page
│
├── src/                         # Application source code
│   ├── app.js                   # Express app setup, middlewares, view engine, routes
│   │
│   ├── models/                  # [M] MODEL LAYER
│   │   └── userModel.js         # In-memory User model with complete CRUD functions
│   │
│   ├── controllers/             # [C] CONTROLLER LAYER
│   │   ├── userController.js    # Web Controller rendering EJS views for /users
│   │   ├── apiUserController.js # API Controller serving JSON responses for /api/users
│   │   └── healthController.js  # System health check controller
│   │
│   └── routes/                  # ROUTING LAYER
│       ├── userRoutes.js        # Maps /users to UserController (Views)
│       ├── apiUserRoutes.js     # Maps /api/users to ApiUserController (REST API)
│       └── healthRoutes.js      # Maps /api/health to healthController
│
└── views/                       # [V] VIEW LAYER (EJS Templates)
    ├── error.ejs                # User-friendly error display template
    ├── partials/                # Reusable view components
    │   ├── header.ejs           # Navigation bar, styles, and HTML <head>
    │   └── footer.ejs           # Layout footer and quick links
    └── users/                   # User-specific MVC view templates
        ├── index.ejs            # User listing table view
        ├── new.ejs              # New user registration form
        ├── show.ejs             # Single user profile card view
        └── edit.ejs             # User edit form
```

---

## 📡 Routes & Endpoints Reference

### 1. MVC Web Routes (`/users` - HTML Views)

Handled by `UserController.js`:

| Method | URL Route | Description | View Rendered |
|---|---|---|---|
| `GET` | `/users` | List all users (with search & role filter) | `views/users/index.ejs` |
| `GET` | `/users/new` | Display user registration form | `views/users/new.ejs` |
| `POST` | `/users` | Create new user from form submission | Redirects to `/users/:id` |
| `GET` | `/users/:id` | Display detailed user profile | `views/users/show.ejs` |
| `GET` | `/users/:id/edit` | Display user edit form | `views/users/edit.ejs` |
| `PUT` / `POST` | `/users/:id` | Update user details from edit form | Redirects to `/users/:id` |
| `DELETE` / `POST` | `/users/:id/delete` | Delete user profile | Redirects to `/users` |

### 2. RESTful JSON API Routes (`/api/users` - JSON)

Handled by `ApiUserController.js`:

| Method | URL Route | Description | Payload Formats | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/users` | Retrieve all users | Query params (`role`, `search`) | `200 OK` |
| `POST` | `/api/users` | Create a new user | JSON / URL-Encoded / Form-Data | `201 Created` / `400` / `409` |
| `GET` | `/api/users/:id` | Get user by ID | Path parameter `:id` | `200 OK` / `404 Not Found` |
| `PUT` | `/api/users/:id` | Full update user | JSON / URL-Encoded / Form-Data | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/users/:id` | Partial update user | JSON / URL-Encoded / Form-Data | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/users/:id` | Delete user | Path parameter `:id` | `200 OK` / `404 Not Found` |

### 3. System & Introductory Routes

| Method | URL Route | Description | Response Type |
|---|---|---|---|
| `GET` | `/api/health` | System diagnostics & uptime | `application/json` (`status: "UP"`) |
| `GET` | `/api/swagger` | Interactive Swagger UI documentation | `text/html` |
| `GET` | `/api/swagger.json` | OpenAPI 3.0.3 specification | `application/json` |
| `GET` | `/` | Home page | HTML (or JSON for API clients) |
| `GET` | `/about` | About project & tech stack | HTML |
| `GET` | `/hello` | Hello World greeting | `text/plain` (`"Hello World"`) |
| `GET` | `/hello/:name` | Dynamic greeting | `text/plain` (`"Hello <Name>!"`) |
| `GET` | `/sum/:n1/:n2` | Sum two numbers | `text/plain` (`"toplam= <sum>"`) |

---

## 📚 Swagger Interactive Documentation

The application includes interactive documentation compliant with the **OpenAPI 3.0.3** standard. Both the MVC Web views (`/users`) and REST API endpoints (`/api/users`) are documented:

- **Swagger UI Dashboard:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
- **Raw OpenAPI JSON Spec:** [http://localhost:3000/api/swagger.json](http://localhost:3000/api/swagger.json)

---

## ⚙️ Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ceydasenemyigit/alumni.git
cd alumni
npm install
```

### 2. Running the Application

- **Production Mode:**
  ```bash
  npm start
  ```
- **Development Mode (Auto-restart on change):**
  ```bash
  npm run dev
  ```

Open [http://localhost:3000/users](http://localhost:3000/users) in your web browser to explore the MVC User Directory.

### 3. Running Automated Tests

Execute the comprehensive automated test suite verifying all 18 MVC and API endpoints:

```bash
npm test
```

---

## 📄 License

This project is developed for educational purposes for the Web Programming course at Istanbul University and is distributed under the MIT License.