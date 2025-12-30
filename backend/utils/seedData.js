const User = require('../models/User');
const Post = require('../models/Post');
const Blog = require('../models/Blog');
const Room = require('../models/Room');

module.exports = async function seedData() {
  try {
    const usersCount = await User.countDocuments();
    if (usersCount > 0) return; // Seed only if empty

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@closenet.app', password: 'password123', role: 'admin', isEmailVerified: true, college: 'CloseNet', year: 'Founder', branch: 'All' },
      { name: 'Rehan', email: 'rehan@closenet.app', password: 'password123', isEmailVerified: true, college: 'CloseNet Family', year: 'Member', branch: 'All' },
      { name: 'Aisha', email: 'aisha@closenet.app', password: 'password123', isEmailVerified: true, college: 'CloseNet Family', year: 'Member', branch: 'All' }
    ]);

    const [admin, rehan, aisha] = users;

    const posts = await Post.insertMany([
      { author: rehan._id, content: 'Welcome to CloseNet! So excited to be connected with friends and family here.', tags: ['welcome', 'closenet'] },
      { author: aisha._id, content: 'Who\'s in for game night this weekend? 🎮', tags: ['gaming', 'hangout'] }
    ]);

    const blogs = await Blog.insertMany([
      { author: rehan._id, title: 'Creating Memories with Loved Ones', content: 'Technology helps us stay connected with those we care about...', category: 'Lifestyle', tags: ['family', 'connection'] },
      { author: aisha._id, title: 'Fun Weekend Activities', content: 'Here are some great ways to spend time with friends...', category: 'Lifestyle', tags: ['friends', 'activities'] }
    ]);

    const rooms = await Room.insertMany([
      // Family Rooms
      { name: 'Family Chat', description: 'Our family hangout - share daily updates and memories', category: 'Family', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }, { user: aisha._id, role: 'member' }] },
      { name: 'Family Game Night', description: 'Every weekend - trivia, word games, and board games', category: 'Family', creator: rehan._id, members: [{ user: rehan._id, role: 'admin' }, { user: aisha._id, role: 'member' }] },
      { name: 'Birthday Planning', description: 'Plan and celebrate birthdays together', category: 'Family', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }, { user: aisha._id, role: 'member' }] },

      // Friends Rooms
      { name: 'Weekend Hangout', description: 'Plans for the weekend - movies, hiking, cafe meetups', category: 'Friends', creator: aisha._id, members: [{ user: aisha._id, role: 'admin' }, { user: rehan._id, role: 'member' }] },
      { name: 'Movie Club', description: 'Watch movies together and discuss our favorites', category: 'Friends', creator: rehan._id, members: [{ user: rehan._id, role: 'admin' }, { user: aisha._id, role: 'member' }] },
      { name: 'Coffee Talks', description: 'Random conversations about life, dreams, and adventures', category: 'Friends', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }, { user: aisha._id, role: 'member' }] },

      // Gaming Rooms
      { name: 'Gaming Squad', description: 'Online multiplayer games - join us for fun sessions', category: 'Gaming', creator: rehan._id, members: [{ user: rehan._id, role: 'admin' }, { user: aisha._id, role: 'member' }] },
      { name: 'Retro Games', description: 'Nostalgic gaming - classics and throwbacks', category: 'Gaming', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }] },

      // Hobbies Rooms
      { name: 'Cooking & Recipes', description: 'Share recipes, cooking tips, and food photos', category: 'Hobbies', creator: aisha._id, members: [{ user: aisha._id, role: 'admin' }, { user: rehan._id, role: 'member' }, { user: admin._id, role: 'member' }] },
      { name: 'Travel Plans', description: 'Plan trips, share travel stories and recommendations', category: 'Travel', creator: rehan._id, members: [{ user: rehan._id, role: 'admin' }, { user: aisha._id, role: 'member' }, { user: admin._id, role: 'member' }] },
      { name: 'Photography', description: 'Share photos and photography tips', category: 'Hobbies', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }] },

      // Sports & Health
      { name: 'Fitness Buddies', description: 'Workout routines, fitness goals, and motivation', category: 'Sports', creator: rehan._id, members: [{ user: rehan._id, role: 'admin' }, { user: aisha._id, role: 'member' }] },

      // General
      { name: 'General Chat', description: 'General hangout for everyone', category: 'General', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }, { user: aisha._id, role: 'member' }] },
    ]);

    console.log('✅ Seed data created:', { users: users.length, posts: posts.length, blogs: blogs.length, rooms: rooms.length });
  } catch (error) {
    console.error('Seed data error:', error);
  }
};



