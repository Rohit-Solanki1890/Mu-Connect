import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-12 sm:p-16 shadow-2xl">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Stay Close with CloseNet
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            Connect with friends and family, share moments, join interest-based rooms, blog your stories, and play games together — all in one modern, real-time platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register"><Button size="lg" className=" text-purple-600 hover: font-semibold">Get Started Now</Button></Link>
            <Link to="/feed"><Button size="lg" variant="secondary" className="bg-white/20 border-2 border-white text-white hover:bg-white/30 font-semibold">Explore Feed</Button></Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Choose CloseNet?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Realtime Rooms</h3>
              <p className="text-gray-600 dark:text-gray-400">Chat, screenshare, and play games together live with friends and family.</p>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Express Yourself</h3>
              <p className="text-gray-600 dark:text-gray-400">Post updates and publish long-form blogs to share your thoughts.</p>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fun & Games</h3>
              <p className="text-gray-600 dark:text-gray-400">Play interactive games with your loved ones anytime, anywhere.</p>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Build Your Network</h3>
              <p className="text-gray-600 dark:text-gray-400">Discover and connect with people who share your interests.</p>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Stay Updated</h3>
              <p className="text-gray-600 dark:text-gray-400">Get instant notifications for messages, posts, and room activity.</p>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Dark Mode</h3>
              <p className="text-gray-600 dark:text-gray-400">Enjoy a comfortable viewing experience with full dark mode support.</p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent rounded-2xl p-8 sm:p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sign Up</h3>
            <p className="text-gray-600 dark:text-gray-400">Create your account in seconds and start connecting.</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 text-white rounded-full font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Find People</h3>
            <p className="text-gray-600 dark:text-gray-400">Discover friends and family on the platform.</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500 text-white rounded-full font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connect & Share</h3>
            <p className="text-gray-600 dark:text-gray-400">Start chatting, posting, and creating memories together.</p>
          </div>
        </div>
      </section>

      {/* About CloseNet Section */}
      <section className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 sm:p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About CloseNet</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              CloseNet is a modern social platform designed specifically for friends and family to stay connected. Whether you're planning family game nights, catching up with old friends, or building a community around shared interests, CloseNet provides all the tools you need.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Built with real-time communication at its core, CloseNet brings people together through chat rooms, social posts, blogs, and interactive games. Every feature is designed with close connections in mind.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">For Friends & Family</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect with the people who matter most</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Real-time Chat</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instant messaging and group conversations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Interactive Games</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fun activities to enjoy together</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Knowledge Sharing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blog, discuss, and learn from each other</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white p-8 sm:p-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Connect?</h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of people staying close with friends and family. Start your CloseNet journey today!
        </p>
        <Link to="/register"><Button size="lg" className=" text-purple-600 hover: font-semibold">Create Your Account</Button></Link>
      </section>
    </div>
  );
}



