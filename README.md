# Movies

Full-stack movie application with a React frontend and a Spring Boot/MongoDB backend.

## Project structure

```text
movies/
├── backend/       # Spring Boot REST API
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
├── frontend/      # React application
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Run locally

Start MongoDB on `mongodb://localhost:27017/movie-api-db`.

In one terminal, start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

In another terminal, start the frontend:

```powershell
cd frontend
npm start
```

The backend runs on `http://localhost:8081`; the frontend runs on `http://localhost:3000`. The existing API base URL and CORS configuration remain unchanged.
