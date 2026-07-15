
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
  const { me, setMe, lobbyId, setLobbyId, gameState } = useGameStore();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      console.log("System booting...");
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
        }

        const user = tg?.initDataUnsafe?.user;
        const stats = ProfileService.getStats();

        const userData = {
          id: user?.id?.toString() || localStorage.getItem('mc_uid') || `guest_${Math.random().toString(36).substr(2, 5)}`,
          name: user?.first_name || localStorage.getItem('mc_name') || 'Metro Player',
          username: user?.username,
          photo: user?.photo_url,
          balance: 5000,
          isHost: false,
          stats: stats,
          status: 'idle' as const
        };

        localStorage.setItem('mc_uid', userData.id);
        localStorage.setItem('mc_name', userData.name);
        
        setMe(userData);
        initHostLogic();

        // Показываем UI сразу после загрузки профиля, не дожидаясь PeerJS
        setIsReady(true);

        // Инициализация сети в фоне
        peerService.init(userData.id).then((myPeerId) => {
          const params = new URLSearchParams(window.location.search);
          const urlLobby = params.get('lobby');
          if (urlLobby && urlLobby !== myPeerId) {
            setLobbyId(urlLobby);
            peerService.connectTo(urlLobby);
            logToTelegram(`🔗 ${userData.name} вошел по ссылке`);
          }
        }).catch(err => {
          console.error("Network init failed, but UI is ready", err);
        });

      } catch (e) {
        console.error("Critical boot error:", e);
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    boot();
  }, []);

  if (error) {
    return (
      <div className="h-screen w-full bg-[#0a0a0c] flex flex-col items-center justify-center p-10 text-center">
        <div className="text-red-500 font-bold mb-2 font-mono text-xs">[BOOT_ERROR]</div>
        <div className="text-white/40 text-[10px] font-mono break-all mb-6">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold active:scale-95 transition-all"
        >
          RETRY SYSTEM BOOT
        </button>
      </div>
    );
  }

  // Если нет данных о игроке - значит мы еще в процессе boot
  if (!me || !isReady) {
    return (
      <div className="h-screen w-full bg-[#0a0a0c] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="mt-8 text-emerald-500/50 font-mono text-[9px] tracking-[0.4em] uppercase animate-pulse">
          Metro Cash OS v4.0
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans select-none flex justify-center">
      <div className="w-full max-w-[500px] relative bg-[#0a0a0c]">
        {!lobbyId && <Home />}
        {lobbyId && gameState.phase === 'LOBBY' && <Lobby />}
        {lobbyId && gameState.phase !== 'LOBBY' && <GameTable />}
      </div>
    </div>
  );
};
