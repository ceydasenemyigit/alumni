# Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Architecture](https://img.shields.io/badge/Architecture-MVC%20Pattern-blueviolet.svg)](#-mvc-architecture-overview)
[![Template Engine](https://img.shields.io/badge/Views-EJS-orange.svg)](https://ejs.co/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D.svg)](http://localhost:3000/api/swagger)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717.svg)](https://github.com/ceydasenemyigit/alumni)

---

## 📌 About the Project

The **Alumni Tracking System** is a web-based platform designed to maintain academic and professional records of university graduates, support networking between alumni, broadcast events and announcements, and enhance communication with university management. Developed for the Web Programming course at Istanbul University, the project strictly adheres to the **Model-View-Controller (MVC)** architectural pattern while exposing both server-rendered web views and RESTful JSON APIs.

---

## 🏛️ MVC Architecture Overview

The application is structured following the **Model-View-Controller (MVC)** software design pattern to ensure high separation of concerns, testability, and clean code maintainability across its core modules (**Users** and **Announcements**):

```
                                 +-------------------+
                                 |   Client Browser  |
                                 |   / HTTP Client   |
                                 +---------+---------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
          (HTML View Requests)                          (JSON API Requests)
                    v                                             v
+---------------------------------------+     +---------------------------------------+
|              CONTROLLERS              |     |            API CONTROLLERS            |
|  - UserController (views/users)       |     |  - ApiUserController (/api/users)     |
|  - AnnouncementController             |     |  - ApiAnnouncementController          |
|    (views/announcements)              |     |    (/api/announcements)               |
+-------------------+-------------------+     +-------------------+-------------------+
                    |                                             |
                    |           +---------------------+           |
                    +---------->|       MODELS        |<----------+
                    |           |  - userModel.js     |           |
                    |           |  - announcementModel|           |
                    |           +---------------------+           |
                    v                                             v
+---------------------------------------+     +---------------------------------------+
|               EJS VIEWS               |     |            JSON RESPONSES             |
|   Server-Side Rendered HTML Pages     |     |   Standardized REST JSON Payloads     |
|   (index, show, new, edit templates)  |     |   (200 OK, 201 Created, 400, 404)     |
+---------------------------------------+     +---------------------------------------+
```

### 1. Model Layer (`src/models/`)
- Encapsulates domain data logic and operations in-memory without requiring an external database:
  - **`userModel.js`**: Stores student and alumni profiles with fields (`id`, `email`, `first_name`, `last_name`, `role`, `department`, `graduation_year`, `is_verified`, `created_at`, `updated_at`). Provides `findAll`, `findById`, `findByEmail`, `create`, `update`, `patch`, and `delete`.
  - **`announcementModel.js`**: Stores university and community notices with fields (`id`, `title`, `content`, `author`, `category`, `createdAt`, `updatedAt`). Pre-seeded with initial data and provides full CRUD helpers: `getAll(query)`, `getById(id)`, `create(data)`, `update(id, data)`, and `delete(id)`.

### 2. View Layer (`views/`)
- Server-side rendered HTML interfaces powered by the **EJS (Embedded JavaScript)** template engine.
- Organized into modular subdirectories:
  - **`views/users/`**: `index.ejs` (directory list), `new.ejs` (creation form), `show.ejs` (profile details), `edit.ejs` (edit form).
  - **`views/announcements/`**: `index.ejs` (notices list with category filters), `new.ejs` (publish form), `show.ejs` (announcement details), `edit.ejs` (edit form).
  - **`views/partials/`**: `header.ejs` (responsive dark-themed navigation, badges) & `footer.ejs`.
  - **`views/error.ejs`**: Unified user-friendly error display template.

### 3. Controller Layer (`src/controllers/`)
- Separated into dual controllers for each domain resource:
  - **Web Controllers (`userController.js`, `announcementController.js`)**: Handle browser navigation, parse web forms, invoke models, and render EJS templates.
  - **API Controllers (`apiUserController.js`, `apiAnnouncementController.js`)**: Handle RESTful JSON/Form requests, validate input, call model methods, and return standard JSON responses with HTTP status codes (200, 201, 400, 404).
  - **`healthController.js`**: Provides real-time system diagnostics and health status metrics.

---

## 📂 Directories, Folders & Files Structure

```text
alumni/
├── index.js                          # Server entrypoint (listens on PORT)
├── package.json                      # Project dependencies, scripts, and metadata
├── package-lock.json                 # Dependency tree lockfile
├── swagger.json                      # OpenAPI 3.0.3 specification for Swagger UI
├── test.js                           # Automated test suite (30 unit/integration tests)
├── .gitignore                        # Excluded files (node_modules, .env, etc.)
├── README.md                         # Project documentation (Architecture, API, Setup)
│
├── public/                           # Static client assets
│   ├── index.html                    # Landing page / Quick API explorer
│   └── about.html                    # About Project & Tech Stack page
│
├── src/                              # Application source code
│   ├── app.js                        # Express app setup, middlewares, view engine, routes
│   │
│   ├── models/                       # [M] MODEL LAYER (In-Memory Data Stores)
│   │   ├── userModel.js              # User model with CRUD helper functions
│   │   └── announcementModel.js      # Announcement model with seed data & CRUD helpers
│   │
│   ├── controllers/                  # [C] CONTROLLER LAYER
│   │   ├── userController.js         # Web Controller rendering EJS views for /users
│   │   ├── apiUserController.js      # API Controller serving JSON for /api/users
│   │   ├── announcementController.js # Web Controller rendering EJS views for /announcements
│   │   ├── apiAnnouncementController.js # API Controller serving JSON for /api/announcements
│   │   └── healthController.js       # System health check controller
│   │
│   ├── routes/                       # ROUTING LAYER
│   │   ├── userRoutes.js             # Maps /users to userController (Views)
│   │   ├── apiUserRoutes.js          # Maps /api/users to apiUserController (REST API)
│   │   ├── announcementRoutes.js     # Maps /announcements to announcementController (Views)
│   │   ├── apiAnnouncementRoutes.js  # Maps /api/announcements to apiAnnouncementController (REST API)
│   │   └── healthRoutes.js           # Maps /api/health to healthController
│   │
│   └── docs/                         # DOCUMENTATION & SPECS
│       └── swaggerSpec.js            # Exports OpenAPI specification for Swagger UI
│
└── views/                            # [V] VIEW LAYER (EJS Templates)
    ├── error.ejs                     # User-friendly error display template
    ├── partials/                     # Reusable view components
    │   ├── header.ejs                # Navigation bar, category badges, styles, head
    │   └── footer.ejs                # Layout footer and quick links
    │
    ├── users/                        # User MVC view templates
    │   ├── index.ejs                 # User listing table view
    │   ├── new.ejs                   # New user registration form
    │   ├── show.ejs                  # Single user profile card view
    │   └── edit.ejs                  # User edit form
    │
    └── announcements/                # Announcement MVC view templates
        ├── index.ejs                 # Announcement listing table view with filters
        ├── new.ejs                   # Announcement publishing form
        ├── show.ejs                  # Single announcement detail view
        └── edit.ejs                  # Announcement edit form
```

---

## 📡 Routes & Endpoints Reference

### 1. Announcements MVC Web Routes (`/announcements` - HTML Views)

Handled by `announcementController.js`:

| Method | URL Route | Description | View Rendered |
|---|---|---|---|
| `GET` | `/announcements` | List all announcements (with search & category filter) | `views/announcements/index.ejs` |
| `GET` | `/announcements/new` | Display announcement creation form | `views/announcements/new.ejs` |
| `POST` | `/announcements` | Publish announcement from form submission | Redirects to `/announcements/:id` |
| `GET` | `/announcements/:id` | Display detailed announcement view | `views/announcements/show.ejs` |
| `GET` | `/announcements/:id/edit` | Display announcement edit form | `views/announcements/edit.ejs` |
| `PUT` / `POST` | `/announcements/:id` | Update announcement from form | Redirects to `/announcements/:id` |
| `DELETE` / `POST` | `/announcements/:id/delete` | Delete announcement | Redirects to `/announcements` |

### 2. Announcements RESTful JSON API (`/api/announcements` - JSON)

Handled by `apiAnnouncementController.js`:

| Method | URL Route | Description | Payload Formats | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/announcements` | Retrieve all announcements | Query params (`category`, `author`, `search`) | `200 OK` |
| `POST` | `/api/announcements` | Create a new announcement | JSON / URL-Encoded / Form-Data | `201 Created` / `400 Bad Request` |
| `GET` | `/api/announcements/:id` | Get announcement by ID | Path parameter `:id` | `200 OK` / `404 Not Found` |
| `PUT` | `/api/announcements/:id` | Full update announcement | JSON / URL-Encoded / Form-Data | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/announcements/:id` | Partial update announcement | JSON / URL-Encoded / Form-Data | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/announcements/:id` | Delete announcement | Path parameter `:id` | `200 OK` / `404 Not Found` |

### 3. Users MVC Web Routes (`/users` - HTML Views)

Handled by `userController.js`:

| Method | URL Route | Description | View Rendered |
|---|---|---|---|
| `GET` | `/users` | List all users (with search & role filter) | `views/users/index.ejs` |
| `GET` | `/users/new` | Display user registration form | `views/users/new.ejs` |
| `POST` | `/users` | Create new user from form submission | Redirects to `/users/:id` |
| `GET` | `/users/:id` | Display detailed user profile | `views/users/show.ejs` |
| `GET` | `/users/:id/edit` | Display user edit form | `views/users/edit.ejs` |
| `PUT` / `POST` | `/users/:id` | Update user details from edit form | Redirects to `/users/:id` |
| `DELETE` / `POST` | `/users/:id/delete` | Delete user profile | Redirects to `/users` |

### 4. Users RESTful JSON API Routes (`/api/users` - JSON)

Handled by `apiUserController.js`:

| Method | URL Route | Description | Payload Formats | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/users` | Retrieve all users | Query params (`role`, `search`) | `200 OK` |
| `POST` | `/api/users` | Create a new user | JSON / URL-Encoded / Form-Data | `201 Created` / `400` / `409` |
| `GET` | `/api/users/:id` | Get user by ID | Path parameter `:id` | `200 OK` / `404 Not Found` |
| `PUT` | `/api/users/:id` | Full update user | JSON / URL-Encoded / Form-Data | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/users/:id` | Partial update user | JSON / URL-Encoded / Form-Data | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/users/:id` | Delete user | Path parameter `:id` | `200 OK` / `404 Not Found` |

### 5. System & Introductory Routes

| Method | URL Route | Description | Response Type |
|---|---|---|---|
| `GET` | `/api/health` | System diagnostics & uptime | `application/json` (`status: "UP"`) |
| `GET` | `/api/swagger` | Interactive Swagger UI documentation | `text/html` |
| `GET` | `/api/swagger.json` | OpenAPI 3.0.3 specification | `application/json` |
| `GET` | `/` | Root landing page / Welcome API | `text/html` or `application/json` |
| `GET` | `/about` | Project description and tech stack | `text/html` |
| `GET` | `/hello` | Basic greeting | `text/plain` (`"Hello World"`) |
| `GET` | `/hello/:name` | Parameterized greeting | `text/plain` (`"Hello {Name}!"`) |
| `GET` | `/sum/:number1/:number2` | Arithmetic addition | `text/plain` (`"toplam= {sum}"`) |

---

## 🛠️ Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone & Install
```bash
git clone https://github.com/ceydasenemyigit/alumni.git
cd alumni
npm install
```

### 2. Run Application
```bash
# Production / Standard run
node index.js

# Development mode (with live reload)
npm run dev
```
The server will start on `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```
Runs the full suite of 30 automated integration and unit tests verifying all web views and REST endpoints.

---

## 📖 Interactive API Documentation

Once the server is running, navigate to:
- **Swagger UI**: [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
- **OpenAPI JSON**: [http://localhost:3000/api/swagger.json](http://localhost:3000/api/swagger.json)
- **Web UI Directory**: [http://localhost:3000/users](http://localhost:3000/users)
- **Announcements Board**: [http://localhost:3000/announcements](http://localhost:3000/announcements)