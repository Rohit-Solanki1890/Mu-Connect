# Marwadi Connect Pro

A comprehensive full-stack social platform designed specifically for Marwadi students, featuring real-time chat, blogs, social feed, mini-games, and more.

## Features

- 🔐 **Authentication**: JWT-based signup/login with email verification
- 👤 **User Profiles**: Complete profile management with light/dark mode
- 📱 **Social Feed**: X-like posts with likes, comments, and sharing
- 📝 **Blogs**: Medium-like blogging with rich text editor
- 💬 **Chat Rooms**: Discord-like real-time chat with voice/video calls
- 🎮 **Mini-Games**: Tic-tac-toe and quizzes playable in rooms
- 🔔 **Notifications**: Real-time notifications for all activities
- 👨‍💼 **Admin Panel**: Content and user management
- 🔍 **Search**: Search across users, posts, blogs, and rooms

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Socket.io client for real-time features
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- Multer for file uploads
- Bcrypt for password hashing

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd marwadi-connect-pro
   npm run install-all
   ```

2. **Environment Setup:**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit backend/.env with your MongoDB URI and JWT secret
   # Edit frontend/.env with your backend URL
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Access the dev server from other devices (phone, tablet, other PC)

1. Ensure your phone and your development PC are on the same Wi‑Fi / LAN.
2. Find your PC's LAN IP:
   - Windows: open Command Prompt -> run `ipconfig` -> look for "IPv4 Address" (e.g. 192.168.1.42)
   - macOS / Linux: run `ip addr` or `ifconfig`
3. Start the app:
   ```bash
   npm run dev
   ```
   (Frontend now runs with Vite --host so it will be reachable from the LAN.)
4. Open the app on your phone using the PC IP and port 3000:
   - Example: http://192.168.1.42:3000
5. API requests from the browser will default to the backend at port 5000 on the same host (e.g. http://192.168.1.42:5000/api). If your backend runs on a different host/port, set the frontend env variable:
   - Create file frontend/.env and add:
     VITE_API_URL=http://192.168.1.42:5000/api
6. Firewall: if you still cannot connect, allow port 3000 (and 5000 if calling backend directly) through your PC firewall.
7. If you need external (internet) access, use a tunnel like ngrok:
   ```bash
   ngrok http 3000
   ```

### Seed Data

The application comes with sample data including:
- Test users (students and admin)
- Sample posts and blogs
- Chat rooms
- Game data

To populate with seed data, the backend will automatically create sample data on first run.

## Project Structure

```
marwadi-connect-pro/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── socket/            # Socket.io handlers
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/:id` - Get blog by ID
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Chat Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.


# Mu-Connect
