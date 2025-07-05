import React, { useState } from 'react';

export default function ShadowingForm({ onAdd }) {
  const [form, setForm] = useState({
    physician: '',
    specialty: '',
    date: '',
    hours: '',
    observations: '',
    reflections: ''
  });

  const [recording, setRecording] = useState(false);
  let recognitionRef = null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form }); // ✅ Removed the id field
    setForm({
      physician: '',
      specialty: '',
      date: '',
      hours: '',
      observations: '',
      reflections: ''
    });
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recording) {
      const recognition = new SpeechRecognition();
      recognitionRef = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();
      setRecording(true);
      alert("Recording started. Speak your reflection...");

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setForm(prev => ({ ...prev, reflections: prev.reflections + ' ' + transcript }));
        setRecording(false);
      };

      recognition.onerror = (err) => {
        alert("Speech recognition error: " + err.error);
        setRecording(false);
      };

      recognition.onend = () => {
        setRecording(false);
      };
    } else {
      if (recognitionRef) recognitionRef.stop();
      setRecording(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="physician" placeholder="Physician Name" value={form.physician} onChange={handleChange} className="input" required />
        <input name="specialty" placeholder="Specialty" value={form.specialty} onChange={handleChange} className="input" required />
        <input name="date" placeholder="Date(s)" value={form.date} onChange={handleChange} className="input" required />
        <input name="hours" placeholder="Hours" type="number" value={form.hours} onChange={handleChange} className="input" required />
      </div>

      <textarea name="observations" placeholder="Observations" value={form.observations} onChange={handleChange} className="input h-24" required />

      <div className="space-y-2">
        <label htmlFor="reflections" className="font-medium block">Reflections</label>
        <textarea name="reflections" placeholder="Reflections" value={form.reflections} onChange={handleChange} className="input h-24" required />
        <button
          type="button"
          onClick={toggleRecording}
          className={`${
            recording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
          } text-white px-3 py-1 rounded`}
        >
          {recording ? '🛑 Stop Recording' : '🎤 Record Reflection'}
        </button>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Entry</button>
    </form>
  );
}
