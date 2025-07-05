import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/shadowtrack-logo.png';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Check your email to confirm your account.');
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setErrorMsg(error.message);
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'What is ShadowTrack?',
      answer: 'ShadowTrack helps pre-meds log their shadowing hours, reflect on experiences, and generate professional activity descriptions for medical school applications.',
    },
    {
      question: 'What do I get when I sign up?',
      answer: 'You get a clean interface to add/edit/delete shadowing entries, AI-generated summaries, insights into your strengths, and downloadable logs for AMCAS or TMDSAS.',
    },
    {
      question: 'Is it really AI-assisted?',
      answer: 'Yes! ShadowTrack uses GPT-4 to help you write compelling activity descriptions and analyze personal strengths based on your reflections.',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="ShadowTrack logo" className="h-20 w-20 mb-2" />
          <h1 className="text-3xl font-bold text-indigo-700">ShadowTrack</h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            Built by a fellow pre-med. Track shadowing hours, write reflections, and get AI help.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
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
          {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="text-center text-gray-500 my-4">or</div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Continue with Google
        </button>

        {/* Login Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Log in
          </span>
        </p>

        {/* FAQ Accordion */}
        <div className="mt-6">
          <h2 className="text-md font-semibold text-gray-700 mb-2">📘 FAQ</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded">
                <button
                  className="w-full text-left px-3 py-2 font-medium hover:bg-gray-100"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                </button>
                {openIndex === index && (
                  <div className="px-3 pb-3 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Credits */}
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
