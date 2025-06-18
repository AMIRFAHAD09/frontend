import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-indigo-600">Welcome to ChatApp</h1>
        <p className="text-gray-600 mb-6">Connect. Chat. Share.</p>

        <div className="flex flex-col space-y-4">
          <Link to="/login">
            <button className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-xl hover:bg-indigo-50 transition">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
