# Cricket Chat Backend

Node.js backend service for the Cricket Chat application with WebSocket support, JWT authentication, and MongoDB database integration.

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## 🚀 Getting Started

### Installation

1. Clone the repository (if you haven't already)
```bash
git clone https://github.com/Hmtgit7/cricket-chat.git
cd cricket-chat/server
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cricket-chat
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
CLIENT_URL=http://localhost:3000
```

4. Start the server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
server/
├── controllers/        # Route controllers
│   ├── auth.controller.js
│   ├── message.controller.js
│   └── user.controller.js
├── middleware/         # Express middleware
│   └── auth.middleware.js
├── models/             # Mongoose models
│   ├── message.model.js
│   └── user.model.js
├── routes/             # API routes
│   ├── auth.routes.js
│   ├── message.routes.js
│   └── user.routes.js
├── socket.js           # Socket.IO configuration
├── server.js           # Entry point
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── Dockerfile          # Docker configuration
└── package.json
```

## 🔑 API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user
- **PUT** `/api/auth/update-interest` - Update user's interest
- **POST** `/api/auth/logout` - Logout user

### Users

- **GET** `/api/users/me` - Get current user profile
- **GET** `/api/users` - Get all users
- **GET** `/api/users/search` - Search users by name or email
- **PUT** `/api/users/profile` - Update user profile

### Messages

- **GET** `/api/messages` - Get all messages
- **POST** `/api/messages` - Send a new message
- **PUT** `/api/messages/:messageId/status` - Update message status

## ⚡ Socket.IO Events

### Server Events (emitted to clients)

- `active_users` - List of active user IDs
- `recent_messages` - Recent chat messages
- `message_received` - New message received
- `message_status_updated` - Message status change
- `user_status_changed` - User online/offline status change
- `user_typing` - User is typing notification
- `error` - Error notification

### Client Events (received from clients)

- `new_message` - Client sends a new message
- `update_message_status` - Client updates message status
- `typing` - Client is typing
- `disconnect` - Client disconnects

## 🐳 Docker Deployment

The backend can be deployed using Docker:

```bash
# Build the Docker image
docker build -t cricket-chat-backend .

# Run the container
docker run -p 5000:5000 --env-file .env -d cricket-chat-backend
```

## 🔒 Role-Based Access Control

The backend enforces role-based access control through:

1. **Middleware Validation**: The `canWriteMessages` middleware checks the user's interest before allowing write access to message endpoints.

2. **Socket Authentication**: Socket connections validate the user's JWT token and check interest permissions before allowing message sending.

## 📝 License

This project is licensed under the MIT License.