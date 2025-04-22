# Fastify_Status_Monitor

A minimal real-time status monitoring app built with Docker Compose, Fastify, RabbitMQ, and a Vite+Svelte frontend.

- **service-a** & **service-b**: Example services exposing a `/health` endpoint.
- **monitor**: Polls service health endpoints and publishes changes via RabbitMQ.
- **ws-server**: Fetches an initial status snapshot from `monitor`, consumes updates from RabbitMQ, and broadcasts to connected WebSocket clients.
- **frontend**: Vite+Svelte app that connects via WebSocket to `ws-server` to display live status updates.

---

## Architecture Overview

```mermaid
graph LR
  subgraph Docker Compose
    A[service-a & service-b] -->|HTTP /health| M[monitor]
    M -->|RabbitMQ fanout| W[ws-server]
    W -->|WebSocket| F[frontend]
  end
```  

1. **monitor** polls `/health` on `service-a` and `service-b` every 2 s and, on any change, publishes a JSON message to the `services.status` RabbitMQ exchange.
2. **ws-server**:
   - On startup, fetches the full status snapshot via HTTP from `http://monitor:3001/statuses`.
   - Exposes a WebSocket endpoint at `/ws` on port 4000.
   - On each new client connection, sends the stored snapshot and a welcome message.
   - Subscribes to the `services.status` exchange for live deltas and broadcasts them to all connected sockets.
3. **frontend** connects to `ws://ws-server:4000/ws`, renders the initial snapshot, and updates the UI live as new messages arrive.

---

## Prerequisites

- **Docker & Docker Compose** (v1.29+)
- **Node.js** v18 or later (for local dev outside Compose)

---

## Environment Variables (Compose)

| Name             | Description                                           | Default                                |
| ---------------- | ----------------------------------------------------- | -------------------------------------- |
| `RABBITMQ_URL`   | AMQP URL for RabbitMQ                                 | `amqp://guest:guest@rabbitmq:5672`     |
| `MONITOR_PORT`   | HTTP port for `monitor` snapshot endpoint             | `3001`                                 |
| `MONITOR_URL`    | Base URL for `monitor` when `ws-server` fetches snapshot | `http://monitor:3001`               |
| `WS_SERVER_PORT` | HTTP + WS port for `ws-server`                        | `4000`                                 |

---

## Quickstart with Docker Compose

1. Clone the repo:
   ```bash 
   git clone https://github.com/CodePerson2/Fastify_Status_Monitor-.git && cd Fastify_Status_Monitor 
   ```
2. Build and start all services:
   ```bash
    docker-compose up --build
    ```
3. Open the frontend in your browser:
   - by default Vite will serve at `http://localhost:5173`

You can also inspect RabbitMQ’s management UI at `http://localhost:15672` (guest/guest).

---

## Local Development (without Docker)

Install dependencies in each folder (`service-a`, `service-b`, `monitor`, `ws-server`, `frontend`):

```bash
npm install
```

Then start them individually:

```bash
# Run RabbitMQ locally or via Docker

env RABBITMQ_URL=amqp://guest:guest@localhost:5672 MONITOR_PORT=3001 npm start --prefix monitor

env RABBITMQ_URL=amqp://guest:guest@localhost:5672 WS_SERVER_PORT=4000 MONITOR_URL=http://localhost:3001 npm start --prefix ws-server

npm run dev --prefix frontend
```

Navigate to `http://localhost:5173` to view the dashboard.

---

