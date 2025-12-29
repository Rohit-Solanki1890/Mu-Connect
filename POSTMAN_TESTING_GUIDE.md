# 📮 Postman API Testing Guide

## Setup Instructions

### 1. Import Environment Variables
Create a new Postman Environment with these variables:

```json
{
  "name": "Mu-Connect Dev",
  "values": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:5000",
      "enabled": true
    },
    {
      "key": "TOKEN",
      "value": "",
      "enabled": true
    },
    {
      "key": "USER_ID",
      "value": "",
      "enabled": true
    },
    {
      "key": "RECIPIENT_ID",
      "value": "",
      "enabled": true
    }
  ]
}
```

### 2. Authorization Setup
Add to request headers:
```
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": null
  }
}
```

**Save the token**: After receiving, copy the token and set `{{TOKEN}}` variable in Postman.

---

### 2. Login
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Expected Response:** Same as Register

---

### 3. Verify Authentication
```
GET {{BASE_URL}}/api/auth/me
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": null
  }
}
```

---

## 👥 User & Profile Endpoints

### 4. Get User Profile
```
GET {{BASE_URL}}/api/users/{{USER_ID}}
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "college": "MIT",
    "bio": "Software Developer",
    "profilePicture": "url-to-image",
    "followers": ["507f1f77bcf86cd799439012"],
    "following": [],
    "followerCount": 1,
    "followingCount": 0
  }
}
```

---

### 5. Update Profile
```
PUT {{BASE_URL}}/api/users/{{USER_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "John Updated",
  "college": "Stanford",
  "bio": "Updated bio",
  "profilePicture": "new-image-url"
}
```

---

## 🔗 Follow System Endpoints

### 6. Follow User
```
POST {{BASE_URL}}/api/users/{{RECIPIENT_ID}}/follow
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "message": "User followed successfully",
  "followerCount": 2
}
```

---

### 7. Unfollow User
```
POST {{BASE_URL}}/api/users/{{RECIPIENT_ID}}/unfollow
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "message": "User unfollowed successfully",
  "followerCount": 1
}
```

---

### 8. Get Followers List
```
GET {{BASE_URL}}/api/users/{{USER_ID}}/followers
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "followers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profilePicture": "url",
      "college": "Harvard"
    }
  ],
  "count": 1
}
```

---

### 9. Get Following List
```
GET {{BASE_URL}}/api/users/{{USER_ID}}/following
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "following": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Bob Smith",
      "email": "bob@example.com",
      "profilePicture": "url",
      "college": "Yale"
    }
  ],
  "count": 1
}
```

---

### 10. Get All Users (for discovery)
```
GET {{BASE_URL}}/api/users?search=john&college=MIT&page=1&limit=10
Authorization: Bearer {{TOKEN}}
```

**Query Parameters:**
- `search`: Search by name or email
- `college`: Filter by college
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Expected Response:**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "college": "MIT",
      "profilePicture": "url",
      "followerCount": 5,
      "followingCount": 3
    }
  ],
  "total": 1
}
```

---

## 💬 Messaging Endpoints

### 11. Send Message
```
POST {{BASE_URL}}/api/messages/send/{{RECIPIENT_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "content": "Hey, how are you?",
  "image": null
}
```

**Expected Response:**
```json
{
  "message": {
    "_id": "507f1f77bcf86cd799439014",
    "sender": "507f1f77bcf86cd799439011",
    "recipient": "507f1f77bcf86cd799439012",
    "content": "Hey, how are you?",
    "image": null,
    "isRead": false,
    "readAt": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 12. Get Conversations List
```
GET {{BASE_URL}}/api/messages/conversations
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "conversations": [
    {
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Doe",
        "profilePicture": "url"
      },
      "lastMessage": "Hey, how are you?",
      "lastMessageTime": "2024-01-15T10:30:00Z",
      "unreadCount": 2,
      "isOnline": true
    }
  ]
}
```

---

### 13. Get Message History with User
```
GET {{BASE_URL}}/api/messages/{{RECIPIENT_ID}}?page=1&limit=30
Authorization: Bearer {{TOKEN}}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 30)

**Expected Response:**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "sender": "507f1f77bcf86cd799439011",
      "recipient": "507f1f77bcf86cd799439012",
      "content": "Hey, how are you?",
      "isRead": true,
      "readAt": "2024-01-15T10:32:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

### 14. Get Unread Message Count
```
GET {{BASE_URL}}/api/messages/unread/count
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "unreadCount": 5
}
```

---

### 15. Delete Message
```
DELETE {{BASE_URL}}/api/messages/{{MESSAGE_ID}}
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "message": "Message deleted successfully"
}
```

---

## 📝 Post Endpoints

### 16. Create Post
```
POST {{BASE_URL}}/api/posts
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "content": "This is my first post!",
  "image": "image-url-optional"
}
```

---

### 17. Get Feed Posts
```
GET {{BASE_URL}}/api/posts/feed?page=1&limit=10
Authorization: Bearer {{TOKEN}}
```

---

### 18. Get User Posts
```
GET {{BASE_URL}}/api/posts/user/{{USER_ID}}?page=1&limit=10
Authorization: Bearer {{TOKEN}}
```

---

### 19. Like Post
```
POST {{BASE_URL}}/api/posts/{{POST_ID}}/like
Authorization: Bearer {{TOKEN}}
```

---

### 20. Unlike Post
```
POST {{BASE_URL}}/api/posts/{{POST_ID}}/unlike
Authorization: Bearer {{TOKEN}}
```

---

## 🎮 Room Endpoints

### 21. Create Room
```
POST {{BASE_URL}}/api/rooms
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Study Group",
  "description": "For studying together"
}
```

---

### 22. Get All Rooms
```
GET {{BASE_URL}}/api/rooms?page=1&limit=10
Authorization: Bearer {{TOKEN}}
```

---

### 23. Join Room
```
POST {{BASE_URL}}/api/rooms/{{ROOM_ID}}/join
Authorization: Bearer {{TOKEN}}
```

---

### 24. Leave Room
```
POST {{BASE_URL}}/api/rooms/{{ROOM_ID}}/leave
Authorization: Bearer {{TOKEN}}
```

---

## 🔔 Notification Endpoints

### 25. Get Notifications
```
GET {{BASE_URL}}/api/notifications?page=1&limit=20
Authorization: Bearer {{TOKEN}}
```

---

### 26. Mark Notification as Read
```
PUT {{BASE_URL}}/api/notifications/{{NOTIFICATION_ID}}/read
Authorization: Bearer {{TOKEN}}
```

---

## 🧪 Testing Checklist

Use this checklist to test all functionality:

### Authentication Flow
- [ ] Register new user → Copy token to `{{TOKEN}}`
- [ ] Login with registered user → Copy token
- [ ] Verify token by calling `/api/auth/me` → Should return user data
- [ ] Use invalid token → Should return 401 Unauthorized
- [ ] No token → Should return 401 Unauthorized

### User Profiles
- [ ] Get your own profile
- [ ] Update profile fields
- [ ] Search for users
- [ ] Filter by college

### Follow System
- [ ] Follow a user → Follower count should increase
- [ ] Get followers list → Should show follower
- [ ] Get following list → Should show followed user
- [ ] Unfollow user → Follower count should decrease

### Messaging
- [ ] Send message to another user
- [ ] Get conversations list → Should show user
- [ ] Get message history with user
- [ ] Get unread count
- [ ] Delete a message → Should disappear from history

### Posts
- [ ] Create a post
- [ ] Get feed → Should include created post
- [ ] Like a post → Like count increases
- [ ] Unlike a post → Like count decreases

### Rooms
- [ ] Create a room
- [ ] Get all rooms
- [ ] Join a room
- [ ] Leave a room

### Real-Time Features (Socket.io)
- [ ] Open browser DevTools → Console
- [ ] Look for socket events: `message:new`, `user:online`, `typing:start`
- [ ] Send a message → Should see event in console
- [ ] Receive a message → Should see event

---

## 🐛 Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed"
}
```
**Fix**: Check your request body matches the schema.

### 401 Unauthorized
```json
{
  "error": "No token provided" OR "Invalid token"
}
```
**Fix**: Check your Authorization header and token validity.

### 404 Not Found
```json
{
  "error": "User not found"
}
```
**Fix**: Check the USER_ID or RECIPIENT_ID is correct.

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```
**Fix**: Check backend logs in terminal.

---

## 💡 Pro Tips

1. **Save Responses as Variables**: Right-click response → Set as variable
2. **Use Pre-request Scripts**: Set `{{USER_ID}}` automatically from login response
3. **Test Multiple Users**: Register 2-3 users, switch tokens between requests
4. **Check MongoDB**: Use MongoDB Compass to verify data is being saved
5. **Monitor Backend Logs**: Watch terminal for console.log outputs
6. **Test Socket Events**: Use browser DevTools when frontend runs

---

## 🚀 Quick Test Flow

1. Register a user (saves token automatically)
2. Call `/api/auth/me` to verify token works
3. Get your profile `/api/users/{{USER_ID}}`
4. Register another user in a new Postman tab
5. Follow that user (use their ID as `{{RECIPIENT_ID}}`)
6. Send them a message
7. Get your conversations list
8. Check unread message count

All should work without re-login required! ✅
