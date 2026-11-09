# Event Registration System — Docker Assignment

## 1. Project description

The Event Registration System is a simple full-stack web application. An administrator can create events, participants can register for an event, and the administrator can view or remove registrations.

### Main features
- Create an event with a title, date, location and description.
- View all available events.
- Register a participant using their name and email.
- View participants registered for each event.
- Remove a participant registration.
- Delete an event.
- View total event and registration counts.

## 2. Technologies
- Frontend: HTML, CSS and JavaScript.
- Web server: Nginx.
- Backend: Python Flask REST API.
- Database: SQLite.
- Containers: Docker and Docker Compose.
- Image registry: Docker Hub.

## 3. Project structure

```text
event_registration_system_docker/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── docker-compose.hub.yml
├── .dockerignore
└── README.md
```

## 4. How the frontend communicates with the backend

The browser opens the frontend through Nginx at port `8080`. When JavaScript sends a request to `/api/...`, Nginx forwards it to the Flask backend container on port `5000`. Docker Compose provides a shared network, so Nginx can reach the backend using the service name `backend`.

## 5. Requirements

1. Install Docker Desktop (Windows/Mac) or Docker Engine and Docker Compose (Linux).
2. Start Docker.
3. Extract this project ZIP file.
4. Open a terminal in the extracted project folder.

Check Docker:

```bash
docker --version
docker compose version
```

## 6. Build and run the application locally

Run this command from the main project folder:

```bash
docker compose up --build -d
```

Open the application:

- Frontend: http://localhost:8080
- Backend health check: http://localhost:5000/health

### Test the application

1. Create an event, for example: `Django Training`.
2. Choose a date and enter a location.
3. Click **Create event**.
4. Select the event in the registration form.
5. Enter a participant name and email.
6. Click **Register participant**.
7. Click **View participants** on the event card to see the registration.

The event and participant data are stored in a Docker named volume, so the data remains available when containers are stopped and started again.

## 7. Useful Docker commands

See running containers:

```bash
docker compose ps
```

See logs:

```bash
docker compose logs
```

See backend logs only:

```bash
docker compose logs backend
```

Stop and remove containers:

```bash
docker compose down
```

Stop containers but keep the database volume:

```bash
docker compose down
```

The named volume is not deleted by the command above. To delete the database and all saved application data as well, use:

```bash
docker compose down -v
```

## 8. Create Docker Hub repositories

1. Open https://hub.docker.com/
2. Sign in or create a Docker Hub account.
3. Create a public repository named `event-frontend`.
4. Create another public repository named `event-backend`.

You should have two repositories:

- `YOUR_DOCKERHUB_USERNAME/event-frontend`
- `YOUR_DOCKERHUB_USERNAME/event-backend`

Replace `YOUR_DOCKERHUB_USERNAME` in the commands below with your actual Docker Hub username.

## 9. Build and tag the two Docker images

Run from the main project folder:

```bash
docker login
```

Build the backend image:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/event-backend:1.0 ./backend
```

Build the frontend image:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/event-frontend:1.0 ./frontend
```

Check the images:

```bash
docker images
```

## 10. Push images to Docker Hub

```bash
docker push YOUR_DOCKERHUB_USERNAME/event-backend:1.0
docker push YOUR_DOCKERHUB_USERNAME/event-frontend:1.0
```

Your repository links will be:

- `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/event-backend`
- `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/event-frontend`

Replace the username in both links with your real Docker Hub username.

## 11. Pull the published images

```bash
docker pull YOUR_DOCKERHUB_USERNAME/event-backend:1.0
docker pull YOUR_DOCKERHUB_USERNAME/event-frontend:1.0
```

## 12. Run the images pulled from Docker Hub

1. Open `docker-compose.hub.yml`.
2. Replace both instances of `YOUR_DOCKERHUB_USERNAME` with your real Docker Hub username.
3. Save the file.
4. Stop the locally built containers:

```bash
docker compose down
```

5. Start the published images:

```bash
docker compose -f docker-compose.hub.yml up -d
```

6. Open http://localhost:8080 and test creating an event and registering a participant.

Check the running containers:

```bash
docker compose -f docker-compose.hub.yml ps
```

Stop the published containers:

```bash
docker compose -f docker-compose.hub.yml down
```

## 13. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend status |
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create an event |
| DELETE | `/api/events/1` | Delete event with ID 1 |
| GET | `/api/events/1/registrations` | Get participants for event 1 |
| POST | `/api/events/1/registrations` | Register a participant for event 1 |
| DELETE | `/api/registrations/1` | Delete registration with ID 1 |
| GET | `/api/stats` | Get event and registration totals |

## 14. Evidence and screenshots required for submission

Take your own screenshots after running the project. Include:

1. The Event Registration System opened in the browser.
2. The event creation form filled in and a created event displayed.
3. A participant successfully registered.
4. The participants list displayed for an event.
5. `docker compose ps` showing both containers running.
6. Terminal showing both Docker images built.
7. Terminal showing successful Docker Hub push commands.
8. Docker Hub page showing the `event-frontend` repository and its `1.0` tag.
9. Docker Hub page showing the `event-backend` repository and its `1.0` tag.
10. Terminal showing successful pull commands and the application running from the published images.

## 15. Assignment submission checklist

- [ ] Frontend source code.
- [ ] Backend source code.
- [ ] Separate frontend and backend Dockerfiles.
- [ ] Docker Compose file.
- [ ] Build and run commands.
- [ ] Frontend-backend communication tested.
- [ ] Two Docker Hub repositories created.
- [ ] Both images pushed successfully.
- [ ] Both images pulled and tested.
- [ ] Docker Hub repository links included.
- [ ] Screenshots included.

## 16. Important note

This is a beginner-level learning project, not a production event platform. It does not include user accounts, payment processing, email notifications or advanced security features. The SQLite database is stored in a Docker named volume.
