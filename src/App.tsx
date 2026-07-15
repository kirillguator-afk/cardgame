
import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { peerService } from './services/PeerService';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameTable } from './pages/GameTable';
import { initHostLogic } from './logic/GameCoordinator';
import { logToTelegram } from './services/TelegramLogger';
import { ProfileService } from './services/ProfileService';

export const App: React.FC = () => {
  const { me, setMe, lobbyId, setLobbyId, gameState, updateGameState } = useGameStore();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        
        // Обязательная инициализация TG
        if (tg) {
          tg.ready();
          tg.expand();
          tg.enableClosingConfirmation();
        }

        const user = tg?.initDataUnsafe?.user;
        const stats = ProfileService.getStats();

        const userData = {
          id: user?.id?.toString() || localStorage.getItem('mc_uid') || `guest_${Math.random().toString(36).substr(2, 5)}`,
          name: user?.first_name || localStorage.getItem('mc_name') || 'Underground Player',
          username: user?.username,
          photo: user?.photo_url,
          balance: 5000, // В будущем можно брать из API
          isHost: false,
          stats: stats,
          status: 'idle' as const
        };

        // Сохраняем для fallback
        localStorage.setItem('mc_uid', userData.id);
        localStorage.setItem('mc_name', userData.name);

        setMe(userData);
        initHostLogic();

        // Инициализация сети
        const myPeerId = await peerService.init(userData.id);
        
        // Проверка входа по ссылке
        const params = new URLSearchParams(window.location.search);
        const urlLobby = params.get('lobby');
        if (urlLobby && urlLobby !== myPeerId) {
          setLobbyId(urlLobby);
          peerService.connectTo(urlLobby);
          logToTelegram(`🔗 <b>${userData.name}</b> вошел по прямой ссылке`);
        }

        setIsReady(true);
      } catch (e) {
        console.error("Boot error:", e);
        setError(String(e));
      }
    };

    boot();
  }, []);

  if (error) {
    return (
      <div className="h-screen w-full bg-red-900/20 flex flex-col items-center justify-center p-10 text-center">
        <div className="text-red-500 font-bold mb-4">SYSTEM CRITICAL ERROR</div>
        <div className="text-white/60 text-xs font-mono">{error}</div>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-white/10 rounded-xl">REBOOT</button>
      </div>
    );
  }

  if (!isReady || !me) {
    return (
      <div className="h-screen w-full bg-[#0a0a0c] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <div className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] animate-pulse">
          ESTABLISHING CONNECTION...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans select-none flex justify-center">
      <div className="w-full max-w-[500px] relative shadow-2xl bg-[#0a0a0c]">
        {!lobbyId && <Home />}
        {lobbyId && gameState.phase === 'LOBBY' && <Lobby />}
        {lobbyId && gameState.phase !== 'LOBBY' && <GameTable />}
      </div>
    </div>
  );
};
