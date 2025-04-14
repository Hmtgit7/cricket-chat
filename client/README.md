# Cricket Chat Frontend

React-based frontend for the Cricket Chat application with real-time messaging, role-based access control, and responsive design.

## 🛠️ Tech Stack

- **React.js** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Routing
- **Context API** - State management

## 📋 Prerequisites

- Node.js (v14 or higher)
- Backend service running (see the server directory)

## 🚀 Getting Started

### Installation

1. Clone the repository (if you haven't already)
```bash
git clone https://github.com/Hmtgit7/cricket-chat.git
cd cricket-chat/client
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
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server
```bash
npm start
```

The application should now be running at http://localhost:3000

## 🔍 Features

### Authentication

- User registration with name, email, and password
- Login with JWT authentication
- Secure token storage
- Auto-logout on token expiration

### Chat Functionality

- Real-time messaging with Socket.IO
- Interest-based access control
- Message status indicators
- Typing indicators
- Online status tracking

### UI Components

- Responsive design with Tailwind CSS
- Mobile-friendly interface
- Error handling and loading states
- Role-based UI elements

## 📁 Project Structure

```
client/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ChatHeader.jsx
│   │   ├── MessageInput.jsx
│   │   ├── MessageItem.jsx
│   │   └── UserList.jsx
│   ├── contexts/       # React Context providers
│   │   ├── AuthContext.js
│   │   └── ChatContext.js
│   ├── pages/          # Page components
│   │   ├── ChatRoom.jsx
│   │   ├── InterestSelection.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.js          # Main component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles (Tailwind)
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── Dockerfile          # Docker configuration
├── nginx.conf          # Nginx configuration for production
└── package.json
```

## 🌐 Available Routes

- `/register` - User registration page
- `/login` - User login page
- `/select-interest` - Interest selection page (after login)
- `/chat` - Main chat room
- `*` - Redirects to appropriate page based on authentication state

## 🔒 Role-Based Access Control Implementation

The frontend implements interest-based access control through:

1. **UI Restrictions**: The message input is disabled for "Watching Cricket" users with a clear message indicating their read-only status.

2. **Context-Based Logic**: The `ChatContext` provides access control logic that components can use to determine what actions are permitted.

3. **Route Protection**: `PrivateRoute` components ensure users are redirected based on their authentication and interest selection status.

## 🎨 Styling

The application uses Tailwind CSS for styling with custom components defined in `index.css`. The design is responsive and works well on both desktop and mobile devices.

## 🐳 Docker Deployment

The frontend can be deployed using Docker:

```bash
# Build the Docker image
docker build -t cricket-chat-frontend .

# Run the container
docker run -p 80:80 -d cricket-chat-frontend
```

## 🌐 Production Build

For production deployment:

```bash
# Create optimized production build
npm run build

# The build folder can be served by any static server
```

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📝 License

This project is licensed under the MIT License.