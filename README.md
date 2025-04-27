# Real-Time Service Health Monitor Demo

A minimal full-stack demo that illustrates how a browser-based frontend can stay aware of backend service health in real time, with robust fallbacks and scalability.

---

## 🌐 Overview

- **Service Monitor**: Periodically pings `/health` endpoints of backend services and publishes status changes via RabbitMQ.
- **WebSocket Server**: Subscribes to RabbitMQ, broadcasts real-time health updates to all connected clients, and provides an initial snapshot.
- **Frontend App**: A Svelte-based app that maintains global service status, enables/disables UI features accordingly, and falls back to polling if WebSockets disconnect.
- **Mock Services**: Four example services (`auth`, `billing`, `notifications`, `analytics`) each exposing health and data endpoints.

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- Node.js v16+ & npm or yarn

### Launch Locally

```bash
git clone https://github.com/CodePerson2/Fastify_Status_Monitor.git
cd Fastify_Status_Monitor
docker-compose up --build
```

- **Frontend**: http://localhost:5173 (powered by Vite)
- **WebSocket API**: ws://localhost:4000/ws
- **RabbitMQ UI**: http://localhost:15672 (guest/guest)
- **Monitor HTTP Endpoint**: http://localhost:3001/statuses

---

## 🗂️ Architecture

```mermaid
graph TD
  subgraph Backend
    Monitor -- "/health" --> A["service-a (auth)"]
    Monitor -- "/health" --> B["service-b (billing)"]
    Monitor -- "/health" --> C["service-c (notifications)"]
    Monitor -- "/health" --> D["service-d (analytics)"]
    Monitor -- "publish status" --> RabbitMQ
    WS["ws-server"] --> RabbitMQ
    WS -- "WS" --> Frontend
  end

  Frontend -- "fetch /analytics" --> A
  Frontend -- "fetch /billing" --> B
  Frontend -- "fetch /notifications" --> C
  Frontend -- "fetch /analytics" --> D
```  

- **Docker Compose** orchestrates: RabbitMQ, 4 mock services, `monitor`, `ws-server`, and `svelte-health`.

---

## 🔧 Configuration

### Health URLs (Frontend)

```js
export const HEALTH_URLS = {
  auth:         { url: 'http://localhost:3001', dataEndpoint: '/analytics' },
  billing:      { url: 'http://localhost:3002', dataEndpoint: '/billing' },
  notifications:{ url: 'http://localhost:3003', dataEndpoint: '/notifications' },
  analytics:    { url: 'http://localhost:3004', dataEndpoint: '/analytics' },
};
```

- Replace `localhost` if running services on different hosts or domains.
- Ensure `VITE_WS_URL` in `docker-compose.yml` points to `ws://ws-server:4000/ws` or your custom WS endpoint.

### Docker Compose Snippet

```yaml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"        # AMQP
      - "15672:15672"      # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    healthcheck:
      test: ["CMD","rabbitmq-diagnostics","status"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ... service-a to service-d definitions ...

  monitor:
    build: ./monitor
    depends_on:
      rabbitmq:
        condition: service_healthy
    environment:
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672

  ws-server:
    build: ./ws-server
    ports:
      - "4000:4000"
    depends_on:
      - rabbitmq
    environment:
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672

  svelte-health:
    build: ./svelteHealth
    ports:
      - "5173:5173"
    depends_on:
      - ws-server
    environment:
      VITE_WS_URL: ws://ws-server:4000/ws
```

---

## 🛠️ How It Works

1. **Monitor Service**:
   - Checks each service’s `/health` every 500ms.
   - Publishes to `services.status` exchange only on state change.
2. **WebSocket Server**:
   - Fetches initial snapshot from `monitor` at startup.
   - Subscribes to `services.status` and broadcasts `statusUpdate` messages to clients.
3. **Frontend**:
   - Opens persistent WebSocket and stores statuses in a global Svelte store.
   - Enables/disables UI elements (service buttons, forms) based on real-time statuses.
   - On WS disconnect, falls back to polling `HEALTH_URLS` until restored.
   - Clicking a service button opens a modal and fetches mock data from `url + dataEndpoint`.

---

## 🚧 Robustness & Scaling

- **High Availability**: Deploy multiple `monitor` and `ws-server` instances behind a load balancer.
- **Self-Healing**: Use Kubernetes to auto-restart crashed containers.
- **Fallback**: Frontend polling prevents feature outage if WS or RabbitMQ is down.
- **Extensibility**: Add new services by registering them in `monitor` and `HEALTH_URLS`.