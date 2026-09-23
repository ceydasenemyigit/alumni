# Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717.svg)](https://github.com/ceydasenemyigit/alumni)

---

## 📌 About the Project

The **Alumni Tracking System** is a web-based platform designed to maintain up-to-date academic and professional records of university graduates, foster communication among alumni, and strengthen ties between alumni and the university administration.

This project is developed as part of the Web Programming course at Istanbul University, evolving step-by-step with modern software engineering practices.

---

## 🛠️ Tech Stack

- **Backend:** [Node.js](https://nodejs.org/) (Express.js / RESTful API architecture)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Containerization & Orchestration:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Version Control & Collaboration:** [Git](https://git-scm.com/) & [GitHub](https://github.com/)

---

## 🚀 Key Features

- **Alumni Profile Management:** Maintain graduate details including contact info, graduation year, major, career history, and current employment.
- **Search & Filter:** Search and filter alumni by graduation year, company, job title, industry, or location.
- **Authentication & Authorization:** Secure JWT-based authentication with role-based access control (Admin, Alumni, Student).
- **Announcements & Networking:** Share events, job openings, and university news with the alumni network.
- **Dockerized Environment:** Run the entire stack (Node.js API and PostgreSQL database) seamlessly using Docker Compose.

---

## 📂 Project Structure

```text
alumni/
├── docker-compose.yml       # Docker Compose service definitions (Node.js & PostgreSQL)
├── Dockerfile               # Dockerfile for backend container
├── README.md                # Project documentation
├── .env.example             # Template for environment variables
├── .gitignore               # Ignored files and directories
├── src/
│   ├── config/              # Database and environment configurations
│   ├── controllers/         # Request handlers and business logic
│   ├── models/              # PostgreSQL models and database schemas
│   ├── routes/              # Express API route declarations
│   ├── middlewares/         # Authentication and error handling middlewares
│   └── app.js               # Application entry point
└── package.json             # Dependencies and scripts
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/)
- *(Optional)* [Node.js](https://nodejs.org/) (v18 or higher) for local development outside Docker

### 1. Clone the Repository

```bash
git clone https://github.com/ceydasenemyigit/alumni.git
cd alumni
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=alumni_db

# JWT Secret Key
JWT_SECRET=supersecretkey
```

### 3. Run with Docker Compose

Build and launch the backend and database containers in detached mode:

```bash
docker compose up --build -d
```

To stop all running services:

```bash
docker compose down
```

---

## 🧪 Development Roadmap

Development proceeds incrementally throughout the semester:
1. Database schema design and PostgreSQL migrations
2. Node.js RESTful API endpoints and business logic implementation
3. User authentication and JWT authorization integration
4. Full container orchestration with Docker Compose and automated testing

---

## 👥 Contributors

- **Developers:** [@ceydasenemyigit](https://github.com/ceydasenemyigit) & [@bseyma](https://github.com/bseyma)

---

## 📄 License

This project is developed for educational purposes and is distributed under the MIT License.