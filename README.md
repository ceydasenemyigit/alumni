# Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D.svg)](http://localhost:3000/api/swagger)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717.svg)](https://github.com/ceydasenemyigit/alumni)

---

## 📌 About the Project

The **Alumni Tracking System** is a web-based platform designed to maintain up-to-date academic and professional records of university graduates, foster communication among alumni, and strengthen ties between alumni and the university administration.

This project is developed as part of the Web Programming course at Istanbul University, evolving step-by-step with modern software engineering practices.

---

## 🛠️ Tech Stack

- **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) (RESTful API architecture)
- **API Documentation:** [Swagger UI](https://swagger.io/) & [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3)
- **Database:** [PostgreSQL](https://www.postgresql.org/) *(in-memory store for initial development)*
- **Containerization & Orchestration:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Version Control & Collaboration:** [Git](https://git-scm.com/) & [GitHub](https://github.com/)

---

## 📚 Interactive API Documentation (Swagger)

All endpoints are fully documented according to the **OpenAPI 3.0.3** standard. Once the application is running, you can access the interactive Swagger UI and raw OpenAPI JSON at:

- **Swagger UI Dashboard:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
- **OpenAPI 3.0 JSON Spec:** [http://localhost:3000/api/swagger.json](http://localhost:3000/api/swagger.json)

---

## 📡 API Endpoints Overview

### 1. System & Health Check

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/health` | Returns system health, uptime, and timestamp | JSON |

**Sample Response (`GET /api/health`):**
```json
{
  "status": "OK",
  "uptime": 42.15,
  "timestamp": "2026-09-30T21:00:00.000Z",
  "message": "System is healthy"
}
```

### 2. User Management (In-Memory CRUD)

Supports both `application/json` and `application/x-www-form-urlencoded` formats.

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/users` | List all users in the store | `200 OK` |
| `POST` | `/api/users` | Create a new user (supports JSON & Form format) | `201 Created` |
| `GET` | `/api/users/:id` | Retrieve user details by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/users/:id` | Full update / replacement of user info | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/users/:id` | Partial update of user info | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/users/:id` | Remove a user by ID | `200 OK` / `404 Not Found` |

#### Example: Create User (`POST /api/users`)
- **Headers:** `Content-Type: application/json` or `Content-Type: application/x-www-form-urlencoded`
- **Request Body (JSON):**
  ```json
  {
    "name": "Emre Yılmaz",
    "email": "emre@example.com",
    "department": "Computer Engineering",
    "graduationYear": 2024
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "id": 3,
    "name": "Emre Yılmaz",
    "email": "emre@example.com",
    "department": "Computer Engineering",
    "graduationYear": 2024,
    "createdAt": "2026-09-30T21:00:00.000Z"
  }
  ```

### 3. Basic / Introductory Routes

| Method | Endpoint | Description | Sample Output |
|---|---|---|---|
| `GET` | `/` | Root verification / health | `"ok"` |
| `GET` | `/hello` | Basic greeting | `"Hello, World!"` |
| `GET` | `/hello/:name` | Personalized greeting | `/hello/emre` $\rightarrow$ `"Hello, Emre!"` |
| `GET` | `/sum/:number1/:number2` | Sum two numbers | `/sum/5/3` $\rightarrow$ `"8"` |
| `GET` | `/home` | Temporary main page | `"temporary one main page"` |
| `GET` | `/about` | Temporary about page | `"temp. about page"` |

---

## 📂 Project Structure

```text
alumni/
├── index.js                 # Express server, route definitions, and middleware
├── swagger.json             # OpenAPI 3.0.3 specification for Swagger UI
├── test.js                  # Automated test suite (15 assertions)
├── package.json             # NPM dependencies, metadata, and scripts
├── package-lock.json        # Locked dependency tree
├── .gitignore               # Git ignored patterns (node_modules, .env, etc.)
├── README.md                # Comprehensive project documentation
├── docker-compose.yml       # Docker Compose service definitions (planned)
└── Dockerfile               # Backend Dockerfile (planned)
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18 or higher) & [NPM](https://www.npmjs.com/)
- [Postman](https://www.postman.com/) *(optional, for interactive manual testing)*

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ceydasenemyigit/alumni.git
cd alumni
npm install
```

### 2. Run the Application

- **Production Mode:**
  ```bash
  npm start
  # or: node index.js
  ```
- **Development Mode (Auto-restart on change):**
  ```bash
  npm run dev
  ```

Server will start on `http://localhost:3000`.

### 3. Run Automated Tests

To run the complete automated test suite verifying all 15 endpoints:

```bash
npm test
```

---

## 📮 Testing with Postman & cURL

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Create User via cURL (JSON)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Caner Demir","email":"caner@example.com","department":"Computer Science","graduationYear":2025}'
```

### 3. Create User via Form URL-Encoded
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Selin+Yildiz&email=selin%40example.com&department=Management&graduationYear=2024"
```

### 4. Update User (`PUT` & `PATCH`)
```bash
# Partial update (PATCH)
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"department":"Artificial Intelligence"}'

# Full update (PUT)
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Emre Yilmaz Updated","email":"emre.updated@example.com"}'
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

---

## 📄 License

This project is developed for educational purposes and is distributed under the MIT License.