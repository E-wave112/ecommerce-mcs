# E-Commerce Microservices

A microservices-based e-commerce backend built with Node.js, TypeScript, Express, MongoDB, and RabbitMQ.

## Architecture

```
Customer ──(REST)──> Order Service ──(REST)──> Payment Service ──(RabbitMQ)──> Worker
                          │                                                      │
                          ▼                                                      ▼
                      order_db                                            payment_db
                   (saves order)                                   (saves transaction)
```

**Services:**

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| Customer Service | 3001 | `customer_db` | Manages customer data, seeds a default customer |
| Product Service | 3002 | `product_db` | Manages product catalog, seeds sample products |
| Order Service | 3003 | `order_db` | Creates orders, forwards payment requests |
| Payment Service | 3004 | `payment_db` | Receives payments, publishes to RabbitMQ, worker saves transaction history |

**Infrastructure:**

| Component | Port | Purpose |
|-----------|------|---------|
| MongoDB | 27017 | Data store for all services (separate databases) |
| RabbitMQ | 5672 / 15672 | Message broker / Management UI |

## Tech Stack

- **Runtime:** Node.js 22 (Alpine)
- **Language:** TypeScript 5.9
- **Framework:** Express 5
- **Database:** MongoDB 8 (Mongoose 9)
- **Message Broker:** RabbitMQ 4
- **Logging:** Winston
- **Testing:** Jest, Supertest, mongodb-memory-server
- **Containerization:** Docker & Docker Compose

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run

```bash
docker-compose up --build
```

This starts MongoDB, RabbitMQ, and all 4 services. On first boot, the customer and product services automatically seed sample data.

### Verify

```bash
curl http://localhost:3001/health   # Customer Service
curl http://localhost:3002/health   # Product Service
curl http://localhost:3003/health   # Order Service
curl http://localhost:3004/health   # Payment Service
```

RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672) (guest / guest)

## API Reference

### Customer Service (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/customers` | List all customers |
| GET | `/customers/:id` | Get customer by ID |

### Product Service (port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get product by ID |

### Order Service (port 3003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/orders` | Create an order |
| GET | `/orders` | List all orders |
| GET | `/orders/:id` | Get order by ID |

**POST /orders** request body:
```json
{
  "customerId": "string",
  "productId": "string",
  "amount": 79.99
}
```

Response (`201`):
```json
{
  "customerId": "string",
  "orderId": "string",
  "productId": "string",
  "orderStatus": "pending"
}
```

### Payment Service (port 3004)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/payments` | Process a payment (called internally by Order Service) |

**POST /payments** request body:
```json
{
  "customerId": "string",
  "orderId": "string",
  "productId": "string",
  "amount": 79.99
}
```

## Process Flow

1. Client sends `POST /orders` with `customerId`, `productId`, and `amount`
2. Order Service saves the order (status: `pending`) and returns the order details
3. Order Service sends `POST /payments` to the Payment Service
4. Payment Service publishes the transaction to a RabbitMQ queue (`transaction_queue`)
5. A worker consumes the message and saves the transaction to the database

## Testing

Each service has automated tests using Jest + Supertest with an in-memory MongoDB instance (no Docker or external database required).

### Run all tests

```bash
cd customer-service && npm test
cd product-service && npm test
cd order-service && npm test
cd payment-service && npm test
```

### Test coverage

| Service | Tests | What's covered |
|---------|-------|----------------|
| Customer Service | 4 | Health check, list customers, get by ID, 404 |
| Product Service | 4 | Health check, list products, get by ID, 404 |
| Order Service | 6 | Health check, create order, missing fields (400), list orders, get by ID, 404 |
| Payment Service | 5 | Health check, process payment, missing fields (400), worker saves transaction, worker handles invalid message |

Tests mock external dependencies (MongoDB via `mongodb-memory-server`, `fetch` for inter-service calls, RabbitMQ channel) so they run in complete isolation.

## Environment Variables

Each service accepts these via `docker-compose.yml`:

| Variable | Service | Default |
|----------|---------|---------|
| `PORT` | All | 3001-3004 |
| `MONGO_URI` | All | `mongodb://localhost:27017/<service>_db` |
| `PAYMENT_SERVICE_URL` | Order | `http://localhost:3004` |
| `RABBITMQ_URI` | Payment | `amqp://localhost:5672` |
| `LOG_LEVEL` | All | `info` |

## Project Structure

```
ecommerce-mcs/
├── docker-compose.yml
├── customer-service/
│   ├── __tests__/       # Jest tests
│   └── src/
│       ├── index.ts
│       ├── config/      # db, logger
│       ├── models/      # Customer
│       ├── routes/      # GET /customers
│       └── seed/        # Seeds default customer
├── product-service/
│   ├── __tests__/       # Jest tests
│   └── src/
│       ├── index.ts
│       ├── config/      # db, logger
│       ├── models/      # Product
│       ├── routes/      # GET /products
│       └── seed/        # Seeds sample products
├── order-service/
│   ├── __tests__/       # Jest tests
│   └── src/
│       ├── index.ts
│       ├── config/      # db, logger
│       ├── models/      # Order
│       └── routes/      # POST/GET /orders
└── payment-service/
    ├── __tests__/       # Jest tests (routes + worker)
    └── src/
        ├── index.ts
        ├── config/      # db, logger, rabbitmq
        ├── models/      # Transaction
        ├── routes/      # POST /payments
        └── worker/      # RabbitMQ consumer
```
