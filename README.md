# Postman Clone Backend

A TypeScript-based backend for the Postman clone application, built with Express.js and MySQL using TypeORM.

## Features

- RESTful API endpoints for managing API request history
- Execute HTTP requests with Axios
- Store and retrieve request/response history
- Pagination support for history items
- Error handling and validation

## Prerequisites

- Node.js (v14 or later)
- MySQL (v5.7 or later)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=postman_clone
   ```

4. Create a MySQL database:
   ```sql
   CREATE DATABASE postman_clone;
   ```

5. Run migrations (if any):
   ```bash
   npm run migration:run
   ```

## Running the Server

- Development:
  ```bash
  npm run dev
  ```
  The server will be available at `http://localhost:5000`

- Production:
  ```bash
  npm run build
  npm start
  ```

## API Endpoints

### Execute API Request

Execute an API request without saving to history.

```http
POST /api/history/execute
Content-Type: application/json

{
  "method": "GET",
  "url": "https://api.example.com/data",
  "headers": {
    "Authorization": "Bearer token"
  },
  "body": {}
}
```

### Create History Entry

Make an API request and save it to history.

```http
POST /api/history
Content-Type: application/json

{
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get History

Get paginated list of history items.

```http
GET /api/history?limit=10&offset=0
```

### Get History by ID

Get detailed history entry by ID.

```http
GET /api/history/1
```

### Delete History

Delete a history entry by ID.

```http
DELETE /api/history/1
```

### Clear All History

Delete all history entries.

```http
DELETE /api/history
```

## Project Structure

```
src/
├── config/           # Configuration files
│   └── database.ts   # Database connection
├── controllers/      # Route controllers
│   └── historyController.ts
├── models/           # Database models
│   └── History.ts
├── routes/           # API routes
│   └── historyRoutes.ts
├── utils/            # Utility functions
│   └── apiClient.ts  # Axios client
├── app.ts            # Express app configuration
└── server.ts         # Server entry point
```

## Development

- Lint code:
  ```bash
  npm run lint
  ```

- Run tests:
  ```bash
  npm test
  ```

## License

MIT
