# E-Commerce REST API Documentation

This repository contains the backend service and a frontend test console for a comprehensive E Commerce platform. The backend is built with Node.js, Express, Prisma ORM, and PostgreSQL. It features robust role based access control, data validation, and advanced query capabilities.

## Technology Stack

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* Zod (for request validation)
* JSON Web Tokens (for authentication)
* bcrypt (for password hashing)

## Core Features

* User Authentication and Authorization
* Role Based Access Control (Admin vs Regular User)
* Advanced Product Filtering, Sorting, Searching, and Pagination
* Relational Data Modeling (Products, Categories, Users, Reviews)
* Global Error Handling and Request Validation
* Automated Database Seeding

## Getting Started

### Prerequisites

* Node.js installed on your machine
* PostgreSQL server running locally or remotely

### Environment Setup

Create an environment variables file inside the backend directory. You can copy the provided example configuration.

DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your_secure_secret_key"
ADMIN_EMAIL="admin@test.dev"
ADMIN_PASSWORD="admin123"

### Installation and Database Initialization

Navigate to the backend directory and run the following commands to install dependencies, apply migrations, and populate the database with initial test data.

1. Install dependencies: `npm install`
2. Apply database migrations: `npx prisma migrate dev`
3. Seed the database: `npx ts node prisma/seed.ts`
4. Start the development server: `npm run dev`

The API will be available at `http://localhost:3000/api`

## API Endpoints Reference

All endpoints are prefixed with `/api`

### Authentication Endpoints

* `POST /auth/register`
  Registers a new user account.
  Body: `name`, `email`, `password`

* `POST /auth/login`
  Authenticates a user and returns a JSON Web Token.
  Body: `email`, `password`

### Category Endpoints

* `GET /categories`
  Retrieves a list of all product categories. Publicly accessible.

* `GET /categories/:id`
  Retrieves details of a specific category by its unique identifier.

* `POST /categories`
  Creates a new category. Requires an `ADMIN` role token.
  Body: `name`

* `PATCH /categories/:id`
  Updates an existing category. Requires an `ADMIN` role token.
  Body: `name`

* `DELETE /categories/:id`
  Removes a category from the database. Requires an `ADMIN` role token.

### Product Endpoints

* `GET /products`
  Retrieves a paginated list of products. Supports advanced query parameters for filtering and sorting. Publicly accessible.
  Query Parameters:
  * `search`: Filters products by matching text in title or description.
  * `categoryId`: Filters products belonging to a specific category.
  * `minPrice`: Filters products above a certain price.
  * `maxPrice`: Filters products below a certain price.
  * `sortBy`: Field to sort results by (default: `createdAt`).
  * `sortOrder`: Sort direction (asc or desc).
  * `page`: Page number for pagination.
  * `limit`: Number of items per page.

* `GET /products/:id`
  Retrieves detailed information for a single product.

* `POST /products`
  Adds a new product to the catalog. Requires an `ADMIN` role token.
  Body: `name`, `description`, `price`, `categoryId`

* `PATCH /products/:id`
  Modifies an existing product. Requires an `ADMIN` role token.

* `DELETE /products/:id`
  Deletes a product from the database. Requires an `ADMIN` role token.

## Error Handling Architecture

The application utilizes a global error handling middleware interceptor.

* Zod Validation Errors: Automatically intercepted and formatted as `400 Bad Request` with detailed field level error messages.
* Prisma Errors: Database constraints (like unique email violations) are caught and translated into user friendly `409 Conflict` or `404 Not Found` responses.
* Authentication Errors: Invalid or missing tokens trigger a `401 Unauthorized` response.
* Authorization Errors: Attempting to access restricted endpoints without proper roles returns a `403 Forbidden` response.

## Frontend Test Console

The repository also includes a React based frontend test console located in the frontend directory. This console allows you to interactively test authentication, view conditional administrative controls, and verify the advanced product filtering functionality.

To launch the test console, navigate to the frontend directory, install dependencies, and start the Vite development server.

1. `npm install`
2. `npm run dev`

The interface will provide one click autofill buttons to easily test the Admin and User roles configured during database seeding.
