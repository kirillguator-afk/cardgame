
import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { peerService } from './services/PeerService';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameTable } from './pages/GameTable';

// Mock TG SDK
const WebApp = (window as any).Telegram?.WebApp;

export const App: React.FC = () => {
  const { me, setMe, lobbyId, gameState } = useGameStore();

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
      
      const user = WebApp.initDataUnsafe?.user;
      const player = {
        id: user?.id?.toString() || `guest-${Math.floor(Math.random()*1000)}`,
        name: user?.first_name || 'Incognito',
        balance: 5000,
        isHost: false,
        status: 'idle' as const
      };
      setMe(player);
      peerService.init(player.id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans select-none">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,30,1)_0%,rgba(5,5,5,1)_100%)] -z-10" />
      
      {!lobbyId && <Home />}
      {lobbyId && gameState.phase === 'LOBBY' && <Lobby />}
      {lobbyId && gameState.phase !== 'LOBBY' && <GameTable />}
    </div>
  );
};
