import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShadowingForm from './components/ShadowingForm';
import ShadowingList from './components/ShadowingList';
import ShadowingTable from './components/ShadowingTable';
import Login from './components/Login';
import Signup from './components/Signup';
import ProButton from './components/ProButton';
import { supabase } from './supabaseClient';
import logo from './assets/shadowtrack-logo.png';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        fetchEntries(session.user.id);
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchEntries(session.user.id);
      } else {
        setUser(null);
        setEntries([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchEntries = async (userId) => {
    const { data, error } = await supabase
      .from('shadowing_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setEntries(data);
    } else {
      console.error('❌ Fetch error:', error.message);
    }
  };

  const addEntry = async (entry) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Cannot add entry: Supabase user not found');
      return;
    }

    const newEntry = { ...entry, user_id: user.id };
    const { data, error } = await supabase
      .from('shadowing_entries')
      .insert([newEntry])
      .select('*');

    if (!error && data.length > 0) {
      setEntries([data[0], ...entries]);
    } else {
      console.error('❌ Insert error:', error?.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEntries([]);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL entries?")) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return alert("User not found");

    const { error } = await supabase
      .from('shadowing_entries')
      .update({ deleted: true })
      .eq('user_id', user.id);

    if (!error) {
      setEntries(entries.map(e => ({ ...e, deleted: true })));
    } else {
      console.error('❌ Clear all error:', error.message);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <img src={logo} alt="ShadowTrack logo" className="h-12 w-12" />
                      <h1 className="text-3xl font-bold">ShadowTrack</h1>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Built by a fellow pre-med. Log your shadowing hours, write reflections, and get AI-generated summaries ready for AMCAS or TMDSAS.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ProButton />
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Log Out
                    </button>
                  </div>
                </div>

                <ShadowingForm onAdd={addEntry} />
                <ShadowingList
                  entries={entries}
                  setEntries={setEntries}
                  fetchEntries={() => fetchEntries(user?.id)}
                />
                <ShadowingTable entries={entries.filter(e => !e.deleted)} />
              </div>
            ) : (
              <Login onLogin={setUser} />
            )
          }
        />

        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
