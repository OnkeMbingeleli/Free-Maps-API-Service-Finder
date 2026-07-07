import { useState } from 'react';

// Voice search via the browser's built-in Web Speech API — free, no key
// (blueprint §6 Waze-on-Google-Maps table).
export default function VoiceSearch({ onResult }) {
  const [listening, setListening] = useState(false);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function startListening() {
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-ZA';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult?.(transcript);
    };
    recognition.start();
  }

  return (
    <button onClick={startListening} className="voice-search-btn">
      {listening ? '🎙️ Listening…' : '🎤 Voice Search'}
    </button>
  );
}
