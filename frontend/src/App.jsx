import { useEffect, useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { registerServiceWorker } from './offline/serviceWorker';
import MapContainer from './components/map/MapContainer';
import ChatThread from './components/forum/ChatThread';
import EmergencyModeToggle from './components/common/EmergencyModeToggle';
import VoiceSearch from './components/common/VoiceSearch';
import { supabase } from './config/supabaseClient';

export default function App() {
  const [services, setServices] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    loadServices();
    loadHazards();
  }, []);

  async function loadServices() {
    let query = supabase.from('services').select('*').eq('status', 'approved');
    if (emergencyMode) {
      query = query.in('type', ['clinic', 'hospital', 'police', 'shelter']);
    }
    const { data } = await query;
    setServices(data || []);
  }

  async function loadHazards() {
    const { data } = await supabase.from('hazards').select('*').neq('status', 'expired');
    setHazards(data || []);
  }

  function handleVoiceResult(transcript) {
    // naive keyword match against service type — swap for the
    // HuggingFace intent-classification step from blueprint §12D
    console.log('Voice query:', transcript);
  }

  return (
    <AuthProvider>
      <div className="app-shell">
        <header>
          <h1>Service Finder</h1>
          <VoiceSearch onResult={handleVoiceResult} />
          <EmergencyModeToggle onToggle={setEmergencyMode} />
        </header>
        <main>
          <MapContainer services={services} hazards={hazards} />
        </main>
        <aside>
          <ChatThread threadId="general" />
        </aside>
      </div>
    </AuthProvider>
  );
}
