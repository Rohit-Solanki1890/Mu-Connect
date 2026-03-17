# CloseNet

A comprehensive full-stack social platform designed for friends and family to stay connected, featuring real-time chat, blogs, social feed, mini-games, and more.

## Features

- 🔐 **Authentication**: JWT-based signup/login with email verification
- 👤 **User Profiles**: Complete profile management with light/dark mode
- 📱 **Social Feed**: X-like posts with likes, comments, and sharing
- � **Direct Messaging**: Instagram-like real-time messaging with typing indicators
- 👥 **Followers System**: Follow/unfollow users and build your network
- 👫 **People Discovery**: Search and discover users to connect with
- 📝 **Blogs**: Medium-like blogging with rich text editor
- 🎮 **Chat Rooms**: Discord-like real-time chat with voice/video calls
- 🎮 **Mini-Games**: Tic-tac-toe and quizzes playable in rooms
- 🔔 **Notifications**: Real-time notifications for all activities
- 🔍 **Advanced Search**: Search across posts, people, and rooms
- 👨‍💼 **Admin Panel**: Content and user management
- 🌓 **Dark Mode**: Full light/dark theme support

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
   cd closenet
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
closenet/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── messages/   # NEW: Messaging pages
│   │   │   ├── people/     # NEW: People discovery
│   │   │   ├── profile/    # Enhanced profiles
│   │   │   ├── blogs/
│   │   │   ├── feed/
│   │   │   ├── rooms/
│   │   │   └── ...
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── backend/                 # Node.js backend
│   ├── models/            # Mongoose models
│   │   ├── Message.js     # NEW: Direct messaging
│   │   ├── User.js        # Enhanced with followers
│   │   └── ...
│   ├── routes/            # Express routes
│   │   ├── messages.js    # NEW: Messaging routes
│   │   ├── users.js       # Enhanced with followers
│   │   └── ...
│   ├── socket/            # Socket.io handlers
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
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
- `POST /api/users/:id/unfollow` - Unfollow user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following list

### Direct Messages
- `GET /api/messages/conversations` - Get all message conversations
- `GET /api/messages/:userId` - Get message history with user
- `POST /api/messages/send/:recipientId` - Send new message
- `DELETE /api/messages/:messageId` - Delete message
- `GET /api/messages/unread/count` - Get unread message count

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
This will start both backend (port 5000) and frontend (port 3000) with hot-reload enabled.

### Available Commands
```bash
# Install all dependencies
npm run install-all

# Run development servers
npm run dev

# Run backend only
npm run server

# Run frontend only  
npm run client

# Build for production
npm run build
```

### Environment Variables

**Backend (.env):**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
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

## Key Features Breakdown

### 💬 Direct Messaging
- Real-time message delivery with Socket.io
- Message history with pagination
- Typing indicators
- Read receipts
- Online status tracking
- Access via `/messages` route

### 👥 Followers System
- Follow/unfollow users
- View followers and following lists
- Follower notifications
- Follower counts on profiles
- Follow recommendations

### 👫 People Discovery
- Search users by name, college, bio
- Browse user profiles
- Quick follow button
- Direct message button
- See follower/following counts
- Access via `/people` route

### 🔍 Advanced Search
- Search across **Posts**, **People**, and **Rooms**
- Filter results by type
- See result counts for each category
- Real-time search results
- Quick navigation to profiles and content
- Access via `/search` route

### 📱 Navigation
- **Top Navigation Bar**: Home | Feed | Messages | People | Rooms | Search
- **Sidebar (Desktop)**: Complete navigation with icons and descriptions
- **Mobile Responsive**: Optimized for all screen sizes

## API Response Examples

### Send Message
```bash
POST /api/messages/send/:recipientId
{
  "content": "Hey! How are you?"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "sender": { "name": "User", "profilePicture": "..." },
    "recipient": { ... },
    "content": "Hey! How are you?",
    "createdAt": "2025-12-29T10:30:00Z",
    "isRead": false
  }
}
```

### Follow User
```bash
POST /api/users/:id/follow

Response:
{
  "success": true,
  "message": "User followed successfully"
}
```

### Get Conversations
```bash
GET /api/messages/conversations

Response:
{
  "success": true,
  "data": [
    {
      "_id": "userId",
      "name": "John Doe",
      "profilePicture": "...",
      "bio": "...",
      "lastMessage": "Hello!",
      "lastMessageTime": "2025-12-29T10:30:00Z",
      "unreadCount": 2
    }
  ]
}
```

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Real-Time Features

### Socket.io Events
The application uses Socket.io for real-time communication:

**Messaging Events:**
- `message:send` - Send message via socket
- `message:receive` - Receive new message
- `message:typing` - Typing indicator
- `message:read` - Message read receipt
- `user:online-status` - User online/offline status

**Example Socket Connection:**
```javascript
import { useSocket } from './context/SocketContext';

const { socket } = useSocket();

// Listen for new messages
socket?.on('message:receive', (message) => {
  console.log('New message:', message);
});

// Send typing indicator
socket?.emit('message:typing', {
  recipientId: userId,
  senderId: currentUser._id,
  isTyping: true
});
```

## User Stories

### Send a Message
1. Click **"Messages"** in navigation
2. Select a conversation or create new one
3. Type your message
4. Press Enter or click Send
5. See real-time delivery and read receipts

### Follow a User
1. Click **"People"** in navigation
2. Search or browse users
3. Click **"Follow"** button
4. See follower count update
5. View their profile anytime

### Search Everything
1. Click **"Search"** in navigation
2. Type what you're looking for
3. Browse results by type (Posts/People/Rooms)
4. Click to open profiles or join
5. Filter results as needed

## Recent Updates (v1.1.0)

✨ **New Features Added:**
- ✅ Direct Messaging with real-time updates
- ✅ Followers/Following system
- ✅ People discovery and user search
- ✅ Advanced multi-category search
- ✅ Message notifications
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online status tracking
- ✅ Enhanced profile pages
- ✅ Updated navigation with People tab

🔧 **Technical Improvements:**
- ✅ New Message model in MongoDB
- ✅ Real-time Socket.io events
- ✅ Enhanced User model with followers
- ✅ Improved search across multiple types
- ✅ Better responsive design

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Messages not loading
- Check MongoDB connection
- Verify Socket.io is connected
- Check browser console for errors

### Search not working
- Ensure backend API is running
- Check if search query is valid
- Verify API endpoints are accessible

### Real-time features not working
- Check Socket.io connection status
- Verify CORS settings
- Look for network errors in console

## Performance Optimization

- **Database Indexing**: Messages and Users collections are indexed
- **Pagination**: Message history is paginated
- **Lazy Loading**: Images and profiles load on demand
- **Caching**: React Query handles smart caching

## Roadmap

- [ ] Video/Audio calls
- [ ] Group messaging
- [ ] Message reactions (emojis)
- [ ] Story feature (Instagram-like)
- [ ] User blocking
- [ ] Message forwarding
- [ ] AI-powered recommendations
- [ ] Mobile app (React Native)

## Contact & Social

- 📧 Email: hello@closenet.app
- 💬 Discord: [Join our server]
- 🐦 Twitter: @CloseNetApp
- 📱 Instagram: @CloseNetApp

---

Made with ❤️ for friends and family

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


# Close-Connect(Closenet)
