# Movies

A full-stack movie discovery application. Browse movies, watch trailers, read or add reviews, and create an account or sign in.

The frontend is built with React; the REST API uses Spring Boot and MongoDB.

## Features

- Browse the movie catalogue and open individual movie details.
- Watch trailers in the app.
- Read and submit reviews.
- Register and log in with email/password credentials (passwords are stored as BCrypt hashes).

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, React Router, Axios, Bootstrap, Material UI |
| Backend | Java 26, Spring Boot, Spring Data MongoDB |
| Database | MongoDB |

## Project structure

```text
movies/
├── backend/                 # Spring Boot REST API
│   ├── src/main/java/       # Controllers, services, and MongoDB models
│   ├── src/main/resources/  # Application configuration
│   ├── pom.xml
│   └── mvnw.cmd
├── frontend/                # React single-page application
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Java 26
- MongoDB running locally
- Node.js and npm

## Run locally

1. Start MongoDB. The backend is configured to use:

   ```text
   mongodb://localhost:27017/movie-api-db
   ```

2. Start the backend from the project root:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

   The API starts at `http://localhost:8081`.

3. In a second terminal, install frontend dependencies and start the React app:

   ```powershell
   cd frontend
   npm install
   npm start
   ```

   Open `http://localhost:3000` in your browser.

The backend permits requests from the local frontend at `http://localhost:3000`. The frontend API base URL is configured in `frontend/src/api/axiosConfig.js`.

## API overview

Base URL: `http://localhost:8081/api/v1`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/movies` | Return all movies. |
| `GET` | `/movies/{imdbId}` | Return a movie by IMDb ID. |
| `POST` | `/reviews` | Create a review. |
| `POST` | `/auth/register` | Create an account. |
| `POST` | `/auth/login` | Sign in to an existing account. |

### Request examples

Create a review:

```json
{
  "reviewBody": "A great film.",
  "imdbId": "tt3915174"
}
```

Register an account:

```json
{
  "username": "moviefan",
  "email": "moviefan@example.com",
  "password": "at-least-8-characters"
}
```

Log in:

```json
{
  "email": "moviefan@example.com",
  "password": "at-least-8-characters"
}
```

## Useful commands

```powershell
# Backend tests
cd backend
.\mvnw.cmd test

# Production frontend build
cd frontend
npm run build

# Frontend test runner
npm test
```

## Configuration

Backend settings are in `backend/src/main/resources/application.properties`:

- API port: `8081`
- MongoDB database: `movie-api-db`
- MongoDB URI: `mongodb://localhost:27017/movie-api-db`

To use a different database or port, update that file and, if the backend URL changes, update `frontend/src/api/axiosConfig.js` as well.
