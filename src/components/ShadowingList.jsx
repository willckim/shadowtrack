import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ShadowingList({ entries, setEntries }) {
  const [expandedId, setExpandedId] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [descriptions, setDescriptions] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [insights, setInsights] = useState({});
  const [analyzing, setAnalyzing] = useState(null);
  const [tone, setTone] = useState({});
  const [tuning, setTuning] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [viewingTrash, setViewingTrash] = useState(false);

  const visibleEntries = entries.filter(e => viewingTrash ? e.deleted : !e.deleted);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id) => {
    const deleted = entries.find((e) => e.id === id);
    const { error } = await supabase
      .from('shadowing_entries')
      .update({ deleted: true })
      .eq('id', id);

    if (!error) {
      setEntries(entries.map((entry) => (entry.id === id ? { ...entry, deleted: true } : entry)));
      setLastDeleted(deleted);
    } else {
      console.error('❌ Delete error:', error.message);
    }
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;

    const { error, data } = await supabase
      .from('shadowing_entries')
      .update({ deleted: false })
      .eq('id', lastDeleted.id)
      .select();

    if (!error && data) {
      setEntries(entries.map((e) => (e.id === lastDeleted.id ? data[0] : e)));
      setLastDeleted(null);
    }
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

  const handleEmptyTrash = async () => {
    if (!window.confirm("This will permanently delete all trashed entries. Continue?")) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return alert("User not found");

    const { error } = await supabase
      .from('shadowing_entries')
      .delete()
      .eq('user_id', user.id)
      .eq('deleted', true);

    if (!error) {
      setEntries(entries.filter(e => !e.deleted));
    } else {
      console.error('❌ Empty trash error:', error.message);
    }
  };

  const handleRestore = async (id) => {
    const { error, data } = await supabase
      .from('shadowing_entries')
      .update({ deleted: false })
      .eq('id', id)
      .select();

    if (!error && data) {
      setEntries(entries.map((entry) => (entry.id === id ? data[0] : entry)));
    }
  };

  const generateDescription = async (entry) => {
    setGenerating(entry.id);

    const prompt = `
You are helping a pre-med student write a 700-character activity description for a medical school application.
Based on this shadowing experience, write a compelling, professional summary.

Physician: ${entry.physician}
Specialty: ${entry.specialty}
Date(s): ${entry.date}
Hours: ${entry.hours}
Observations: ${entry.observations}
Reflections: ${entry.reflections}

Format it to fit AMCAS or TMDSAS character limits.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content || "Failed to generate description.";

    setDescriptions(prev => ({ ...prev, [entry.id]: output }));
    setGenerating(null);
  };

  const analyzeInsight = async (entry) => {
    if (insights[entry.id]) {
      setInsights(prev => {
        const newState = { ...prev };
        delete newState[entry.id];
        return newState;
      });
      return;
    }

    setAnalyzing(entry.id);

    const prompt = `
You are helping a pre-med student identify their strengths based on a shadowing experience.

Read this:
Observations: ${entry.observations}
Reflections: ${entry.reflections}

Return 2–3 character traits the student demonstrated (e.g., empathy, curiosity, resilience), and explain briefly how each was shown. Be concise.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content || "Insight analysis failed.";

    setInsights(prev => ({ ...prev, [entry.id]: output }));
    setAnalyzing(null);
  };

  const tuneTone = async (entry) => {
    const selectedTone = tone[entry.id];
    if (!selectedTone || !descriptions[entry.id]) return;

    setTuning(entry.id);

    const prompt = `
Rewrite the following activity description in a more "${selectedTone}" tone, while keeping it professional and under 700 characters.

Description:
${descriptions[entry.id]}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await res.json();
    const newOutput = data.choices?.[0]?.message?.content || "Failed to tune tone.";

    setDescriptions(prev => ({ ...prev, [entry.id]: newOutput }));
    setTuning(null);
  };

  const handleToggleDescription = (entry) => {
    if (descriptions[entry.id]) {
      setDescriptions((prev) => {
        const newState = { ...prev };
        delete newState[entry.id];
        return newState;
      });
    } else {
      generateDescription(entry);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-2">
        <button
          onClick={() => setViewingTrash(!viewingTrash)}
          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          {viewingTrash ? '🔙 Back to Active Entries' : '🗑 View Trash'}
        </button>

        {viewingTrash && visibleEntries.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="text-sm px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            🧹 Empty Trash
          </button>
        )}
      </div>

      {visibleEntries.length === 0 ? (
        <p className="text-center text-gray-500">
          {viewingTrash ? 'Trash is empty.' : 'No shadowing entries yet.'}
        </p>
      ) : (
        visibleEntries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const hasDescription = !!descriptions[entry.id];

          return (
            <div key={entry.id} className="bg-white rounded-lg shadow transition-all duration-200">
              <div
                onClick={() => toggleExpand(entry.id)}
                className="flex items-center justify-between cursor-pointer px-4 py-3 border-b hover:bg-gray-50"
              >
                <div className="text-left">
                  <p className="font-semibold">{entry.physician} ({entry.specialty})</p>
                  <p className="text-sm text-gray-600">{entry.date} • {entry.hours} hours</p>
                </div>
                <span className="text-2xl text-gray-400">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-3">
                  <div>
                    <p><span className="font-medium">Observations:</span> {entry.observations}</p>
                    <p className="mt-1"><span className="font-medium">Reflections:</span> {entry.reflections}</p>
                  </div>

                  {!viewingTrash ? (
                    <>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => handleToggleDescription(entry)}
                          className={`${hasDescription ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded shadow`}
                          disabled={generating === entry.id}
                        >
                          {generating === entry.id
                            ? 'Generating...'
                            : hasDescription
                            ? 'Hide Description'
                            : 'Generate Activity Description'}
                        </button>

                        <button
                          onClick={() => analyzeInsight(entry)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          disabled={analyzing === entry.id}
                        >
                          {analyzing === entry.id
                            ? 'Analyzing...'
                            : insights[entry.id]
                            ? 'Hide Insight'
                            : '🧠 Analyze My Insight'}
                        </button>
                      </div>

                      {hasDescription && (
                        <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap space-y-2">
                          <div>
                            <strong>Generated Description:</strong><br />
                            {descriptions[entry.id]}
                          </div>
                          <button
                            onClick={() => handleCopy(descriptions[entry.id], entry.id)}
                            className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
                          >
                            {copiedId === entry.id ? "Copied!" : "Copy to Clipboard"}
                          </button>

                          <div className="flex items-center gap-2 mt-2">
                            <select
                              value={tone[entry.id] || ''}
                              onChange={(e) =>
                                setTone((prev) => ({ ...prev, [entry.id]: e.target.value }))
                              }
                              className="border px-2 py-1 rounded text-sm"
                            >
                              <option value="">Select Tone</option>
                              <option value="confident">Confident</option>
                              <option value="humble">Humble</option>
                              <option value="emotional">Emotional</option>
                              <option value="professional">Professional</option>
                            </select>
                            <button
                              onClick={() => tuneTone(entry)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                              disabled={!tone[entry.id] || tuning === entry.id}
                            >
                              {tuning === entry.id ? "Tuning..." : "🎨 Tune Tone"}
                            </button>
                          </div>
                        </div>
                      )}

                      {insights[entry.id] && (
                        <div className="bg-yellow-100 p-3 rounded text-sm whitespace-pre-wrap space-y-2">
                          <strong>AI Insight Analysis:</strong><br />
                          {insights[entry.id]}
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        🗑 Delete Entry
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(entry.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      ↩️ Restore Entry
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {!viewingTrash && lastDeleted && (
        <div className="text-center">
          <button
            onClick={handleUndo}
            className="text-blue-600 text-sm underline mt-2"
          >
            ↩️ Undo last delete
          </button>
        </div>
      )}

      {!viewingTrash && visibleEntries.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={handleClearAll}
            className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
          >
            🧹 Clear All Entries
          </button>
        </div>
      )}
    </div>
  );
}
