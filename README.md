# PeerQuests: Front-End Repository

This repository holds the backend source for the JJJ Practicum Team 7's application
"PeerQuests".

This repository hosts the Back-End codebase responsible for handling API requests and connecting to the [React.js application](https://github.com/Code-the-Dream-School/jj-practicum-team-7-front).

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [Key Features](#key-features)
3. [Quick Start](#quick-start)
4. [Authors](#authors)

## Technologies Used

Our back-end is powered by a robust set of tools and libraries, ensuring a scalable, secure, and efficient architecture:

- **Core Frameworks:**

  - `Node.js` - JavaScript runtime for building fast and scalable server-side applications.
  - `Express.js` - Lightweight and flexible web framework for building APIs and handling HTTP requests and routing.

- **Database Management:**

  - `MongoDB` - NoSQL database for storing application data.
  - `Mongoose` - Object Data Modeling (ODM) library for MongoDB, simplifying schema validation and database interactions.

- **Security and Authentication:**

  - `jsonwebtoken` - For generating JWT tokens.
  - `bcryptjs` - For hashing and securing passwords.
  - `cors` - Middleware for handling Cross-Origin Resource Sharing (CORS) in Express.js applications.
  - `Passport` - Authentication middleware for handling various authentication strategies.

- **API Documentation and Testing:**

  - `Postman` - API testing tool used for developing, testing, and debugging endpoints.

- **Development Tools:**

  - `Nodemon` - Automatically restarts the server during development when file changes are detected.
  - `ESLint` - A tool for identifying and fixing JavaScript code issues.
  - `Prettier` - A code formatter to enforce consistent code styling.

## Key Features

### Challenges

- **Create & Join Challenges**: Users can set personal goals and invite friends to participate.
- **Daily Check-Ins & Invites**: Track progress daily and respond to new invitations.
- **Manage Challenges**: Edit challenge details, send invites, or leave challenges with ease.

### Competition and Progress

- **Leaderboards**: View rankings within each challenge and across global standings.

### Authentication

- **Secure Sign-In**: Access the app quickly using email or Google authentication.

### User Experience

- **Responsive Interface**: Enjoy a smooth experience across desktop and mobile devices.


## Quick Start

### Setup

1. **Clone the Repository**: Create a folder to contain both the front-end and back-end repos. Clone this back-end and [our frontend](https://github.com/Code-the-Dream-School/jj-practicum-team-7-front) repositories to your local machine.
2. **Install Dependencies**: Run `npm install` to install all required dependencies for each repository separately.
3. **Start the Development Server**: Run `npm run dev` to start the development server on `localhost:5173` for the frontend or `localhost:8000` for the backend.
4. **Explore the Application**: Navigate through the application to explore its features.

### Environment Variables

To properly run this application, you need to set up environment variables. This is done by creating a `.env` file in the root directory of the backend folder with the following variables:

- **`MONGO_URI`**:  
  This is the connection string for your MongoDB database.
  ```bash
  MONGODB_URI=mongodb://username:password@localhost:27017/database_name
  ```

- **`JWT_SECRET`**:  
  This is the secret key used for signing JSON Web Tokens (JWT).
  ```bash
  JWT_SECRET=your_SECRET_key
  ```

- **`JWT_LIFETIME`**:  
  This defines the lifetime of the JSON Web Token (JWT).
  ```bash
  JWT_LIFETIME=2h
  ```
- **`GOOGLE_CLIENT_ID`**:  
  This defines the lifetime of the JSON Web Token (JWT).
  ```bash
  GOOGLE_CLIENT_ID=your_SECRET_key
  ```
- **`GOOGLE_CLIENT_SECRET`**:  
  This defines the lifetime of the JSON Web Token (JWT).
  ```bash
  GOOGLE_CLIENT_SECRET=your_SECRET_key
  ```
- **`VITE_FRONTEND_URL`**:  
  This defines the lifetime of the JSON Web Token (JWT).
  ```bash
  VITE_FRONTEND_URL=http://localhost:5173
  ```

## Authors

- Darya Pogas
- Romanna Bidnyk
- Natalia Sirtak

