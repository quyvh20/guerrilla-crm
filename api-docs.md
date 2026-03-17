# Guerrilla CRM - API Documentation

This document explicitly outlines the REST APIs for the advanced relational **Phase 1** schemas developed for the CRM.

## Base URL
All endpoints point to `/api`. The development server runs locally at: `http://localhost:3000/api`

## Endpoints

### 1. Customers

#### Create a Customer
- **Endpoint**: `POST /api/customers`
- **Description**: Creates a new customer profile.
- **Request Body** (JSON):
  ```json
  {
    "name": "Customer Name",       // required string
    "phone": "Phone Number",       // required unique string
    "intent": "purchase|support",  // optional string
    "budget": 1000                 // optional integer
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "uuid-v4",
    "name": "Customer Name",
    "phone": "Phone Number",
    "intent": "purchase|support",
    "budget": 1000,
    "status": "NEW",
    "health_score": 100,
    "last_contact_at": "0001-01-01T00:00:00Z",
    "created_at": "2026-03-14T12:00:00Z"
  }
  ```

#### Get Customer Details
- **Endpoint**: `GET /api/customers/:id`
- **Description**: Retrieves a specific customer and their preloaded historical data (`Interactions` and `ValueLedgers`).
- **Response** (200 OK):
  ```json
  {
    "id": "uuid-v4",
    "name": "Customer Name",
    "phone": "Phone Number",
    "intent": "purchase|support",
    "budget": 1000,
    "status": "NEW",
    "health_score": 100,
    "last_contact_at": "2026-03-14T12:05:00Z",
    "created_at": "2026-03-14T12:00:00Z",
    "interactions": [
      {
        "id": "uuid-v4",
        "customer_id": "uuid-v4",
        "channel": "email",
        "raw_content": "Content details...",
        "ai_summary": "Summary...",
        "sentiment": "positive",
        "sales_score": 90,
        "created_at": "2026-03-14T12:05:00Z"
      }
    ],
    "value_ledgers": [
       {
         "id": "uuid-v4",
         "customer_id": "uuid-v4",
         "activity": "consultation",
         "cost": 100,
         "impact": "high",
         "created_at": "2026-03-14T12:06:00Z"
       }
    ]
  }
  ```
- **Error Response** (404 Not Found):
  ```json
  {
    "error": "Customer not found"
  }
  ```

---

### 2. Interactions

#### Record an Interaction
- **Endpoint**: `POST /api/interactions`
- **Description**: Logs a new interaction (email, call, message) mapped to a specific customer. A transaction automatically updates the parent customer's `last_contact_at` timestamp.
- **Request Body** (JSON):
  ```json
  {
    "customer_id": "uuid-v4",        // required UUID matching a Customer
    "channel": "email|call|zalo",    // required string
    "raw_content": "Full text...",   // optional string
    "ai_summary": "Summary text",    // optional string
    "sentiment": "positive",         // optional string
    "sales_score": 90                // optional integer
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "uuid-v4",
    "customer_id": "uuid-v4",
    "channel": "email",
    "raw_content": "Full text...",
    "ai_summary": "Summary text",
    "sentiment": "positive",
    "sales_score": 90,
    "created_at": "2026-03-14T12:05:00Z"
  }
  ```

---

### 3. Value Ledgers (Financial/Effort Activity)

#### Record a Ledger Entry
- **Endpoint**: `POST /api/ledgers`
- **Description**: Creates a ledger tracking cost and tangible impact of activities provided to a customer.
- **Request Body** (JSON):
  ```json
  {
    "customer_id": "uuid-v4",       // required UUID matching a Customer
    "activity": "consultation",     // required string
    "cost": 100,                    // optional integer
    "impact": "high"                // optional string
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "uuid-v4",
    "customer_id": "uuid-v4",
    "activity": "consultation",
    "cost": 100,
    "impact": "high",
    "created_at": "2026-03-14T12:10:00Z"
  }
  ```
