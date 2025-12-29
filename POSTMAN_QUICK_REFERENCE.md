# 🧪 Quick API Testing Reference

## Essential Variables to Set in Postman

After registering a user, you'll get:
```
TOKEN = eyJhbGc... (copy entire token)
USER_ID = 507f1f77bcf86cd799439011
```

To test with another user:
```
RECIPIENT_ID = 507f1f77bcf86cd799439012 (another user's ID)
```

---

## ✅ Critical Tests to Run First

### Test 1: Authentication Persistence (YOUR BUG FIX)
```
1. POST /api/auth/register (create account)
2. Copy token from response
3. POST /api/auth/login (with same credentials)
4. GET /api/auth/me (verify token still works)
5. Close Postman, open again
6. Set token in Authorization header again
7. GET /api/auth/me (should NOT ask for login)
✅ If all 7 steps work → Bug is FIXED
```

### Test 2: Send Message & Receive
```
1. Create 2 user accounts
2. Follow user 2 from user 1
3. POST /api/messages/send/{{RECIPIENT_ID}} (from user 1)
4. GET /api/messages/conversations (from user 1)
5. GET /api/messages/{{RECIPIENT_ID}} (view history)
6. Switch to user 2 token
7. GET /api/messages/unread/count (should show 1)
✅ If message appears → Messaging works
```

### Test 3: Follow/Unfollow
```
1. Create 2 users
2. POST /api/users/{{USER_2_ID}}/follow (from user 1)
3. GET /api/users/{{USER_1_ID}}/followers (should show user 2)
4. GET /api/users/{{USER_1_ID}}/followerCount (should be 1)
5. POST /api/users/{{USER_2_ID}}/unfollow
6. GET /api/users/{{USER_1_ID}}/followerCount (should be 0)
✅ If counts update → Follow system works
```

---

## 🔴 Tests for Known Issues

### Re-Login Bug (NOW FIXED)
```
BEFORE FIX:
- Navigate to /messages → Get redirected to /login
- Navigate to /feed → Get redirected to /login

AFTER FIX:
- Navigate to /messages → Shows loading, then messages load
- Navigate to /feed → Shows loading, then feed loads
- No more re-login prompts!
```

---

## 📊 Expected Data Flow

```
Frontend                Backend                Database
Register ──POST───→ /api/auth/register ──→ Create User ✅
   ↓                                           ↓
Store Token          JWT Generated        Store in MongoDB
   ↓                                           ↓
Login ──POST───→ /api/auth/login ────→ Find User ✅
   ↓                                           ↓
Add Token to Header  Return JWT
   ↓                                           
Send Message ──POST───→ /api/messages/send ──→ Create Message ✅
   ↓                                           ↓
Show in Chat         Emit Socket Event    Store in MongoDB
```

---

## 🚨 Error Codes & Fixes

| Status | Meaning | Fix |
|--------|---------|-----|
| 200 | Success ✅ | All good |
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Check token is valid & in Authorization header |
| 404 | Not Found | Check user/message IDs exist |
| 409 | Conflict | Usually means you already followed/liked |
| 500 | Server Error | Check backend logs in terminal |

---

## 🔑 Authorization Header Template

Copy this and replace {{TOKEN}} with your actual token:

```
Authorization: Bearer {{TOKEN}}
```

Or in Postman:
1. Click "Authorization" tab
2. Select "Bearer Token" type
3. Paste token in "Token" field
4. It will automatically add to headers

---

## 📋 All Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/register | Create new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Verify current user |
| GET | /api/users/:id | Get profile |
| PUT | /api/users/:id | Update profile |
| GET | /api/users | Search users |
| POST | /api/users/:id/follow | Follow user |
| POST | /api/users/:id/unfollow | Unfollow user |
| GET | /api/users/:id/followers | Get followers |
| GET | /api/users/:id/following | Get following |
| POST | /api/messages/send/:recipientId | Send message |
| GET | /api/messages/conversations | Get all chats |
| GET | /api/messages/:userId | Get chat history |
| GET | /api/messages/unread/count | Unread count |
| DELETE | /api/messages/:id | Delete message |
| POST | /api/posts | Create post |
| GET | /api/posts/feed | Get feed |
| POST | /api/posts/:id/like | Like post |
| POST | /api/posts/:id/unlike | Unlike post |

---

## ✨ Testing Workflow

```
Day 1 - Auth & Users:
  ✓ Register & Login
  ✓ Get Profile
  ✓ Search Users
  ✓ Update Profile

Day 2 - Follow System:
  ✓ Follow/Unfollow
  ✓ Get Followers/Following

Day 3 - Messaging:
  ✓ Send Message
  ✓ Get Conversations
  ✓ Get History
  ✓ Unread Count

Day 4 - Posts:
  ✓ Create Post
  ✓ Get Feed
  ✓ Like/Unlike

Day 5 - Socket.io:
  ✓ Real-time Messages
  ✓ Online Status
  ✓ Typing Indicators
```

---

## 🎯 After Running Tests

If all endpoints work:
1. ✅ Post in README that API is tested
2. ✅ Screenshot passing Postman tests
3. ✅ Document any bugs found
4. ✅ Create GitHub issues for bugs
5. ✅ Deploy to production

If bugs found:
1. Check backend error logs
2. Verify MongoDB connection
3. Check token expiration
4. Test with fresh user registration
5. Clear browser cache & try again
