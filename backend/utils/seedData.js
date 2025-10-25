const User = require('../models/User');
const Post = require('../models/Post');
const Blog = require('../models/Blog');
const Room = require('../models/Room');

module.exports = async function seedData() {
  try {
    const usersCount = await User.countDocuments();
    if (usersCount > 0) return; // Seed only if empty

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@marwadi.edu', password: 'password123', role: 'admin', isEmailVerified: true, college: 'Marwadi University', year: 'Graduate', branch: 'CSE' },
      { name: 'Rehan', email: 'rehan@marwadi.edu', password: 'password123', isEmailVerified: true, college: 'Marwadi University', year: '2nd Year', branch: 'IT' },
      { name: 'Aisha', email: 'aisha@marwadi.edu', password: 'password123', isEmailVerified: true, college: 'Marwadi University', year: '3rd Year', branch: 'ECE' }
    ]);

    const [admin, rehan, aisha] = users;

    const posts = await Post.insertMany([
      { author: rehan._id, content: 'Welcome to Marwadi Connect Pro! Excited to connect with everyone.', tags: ['welcome', 'marwadi'] },
      { author: aisha._id, content: 'Anyone up for a study group on DSA?', tags: ['study', 'dsa'] }
    ]);

    const blogs = await Blog.insertMany([
      { author: rehan._id, title: 'Getting Started with React', content: 'React is a powerful UI library...', category: 'Technology', tags: ['react', 'frontend'] },
      { author: aisha._id, title: 'Balancing College Life', content: 'Time management is key...', category: 'Lifestyle', tags: ['college', 'life'] }
    ]);

    const rooms = await Room.insertMany([
      { name: 'General Chat', description: 'Hangout for everyone', category: 'General', creator: admin._id, members: [{ user: admin._id, role: 'admin' }, { user: rehan._id, role: 'member' }, { user: aisha._id, role: 'member' }] },
      { name: 'DSA Study Group', description: 'Solve DSA together', category: 'Study', creator: rehan._id, members: [{ user: rehan._id, role: 'admin' }, { user: aisha._id, role: 'member' }] }
    ]);

    console.log('✅ Seed data created:', { users: users.length, posts: posts.length, blogs: blogs.length, rooms: rooms.length });
  } catch (error) {
    console.error('Seed data error:', error);
  }
};



