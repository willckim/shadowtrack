import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/shadowtrack-logo.png';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFaq, setShowFaq] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      onLogin(data.user);
    }
  };

  const handleGoogleLogin = async () => {
    const redirectTo = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectTo}/`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="ShadowTrack logo" className="h-20 w-20 mb-2" />
          <h1 className="text-3xl font-bold text-indigo-700">ShadowTrack</h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            Built by a fellow pre-med. Track shadowing hours, write reflections, and get AI help.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        </form>

        {/* Divider */}
        <div className="text-center text-gray-500 my-4">or</div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Continue with Google
        </button>

        {/* FAQ Accordion */}
        <div className="mt-6">
          <button
            onClick={() => setShowFaq(!showFaq)}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            {showFaq ? '🙈 Hide How ShadowTrack Works' : '🧠 How does ShadowTrack work?'}
          </button>

          {showFaq && (
            <div className="mt-2 p-4 bg-gray-100 rounded text-sm text-gray-700 space-y-2">
              <p>✅ Log your shadowing hours with physician, specialty, and date.</p>
              <p>📝 Write your observations and reflections.</p>
              <p>🤖 Use AI to generate a professional summary (great for AMCAS/TMDSAS).</p>
              <p>🔍 Get insight analysis to uncover traits like empathy or curiosity.</p>
              <p>🗂 View, delete, and restore your entries anytime.</p>
            </div>
          )}
        </div>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>

        {/* Credits */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Made by William Kim • Powered by OpenAI •{' '}
          <a
            href="https://www.linkedin.com/in/william-c-kim/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-600"
          >
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  );
}
