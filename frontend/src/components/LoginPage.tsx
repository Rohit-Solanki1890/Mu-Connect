import React from "react";

export default function LoginPage() {
  return (
    <div className="flex h-screen">
      {/* Left side with live GIF */}
      <div className="flex-1 bg-black relative">
        <img
          src="/assets/marwadi-live.gif"
          alt="Marwadi University Live"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-4xl font-bold animate-pulse">
            Welcome to Marwadi Connect
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <form className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
