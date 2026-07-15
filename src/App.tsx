
import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { peerService } from './services/PeerService';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameTable } from './pages/GameTable';
import { initHostLogic } from './logic/GameCoordinator';

const WebApp = (window as any).Telegram?.WebApp;

export const App: React.FC = () => {
  const { me, setMe, lobbyId, gameState, updateGameState } = useGameStore();

  useEffect(() => {
    initHostLogic(); // Запускаем слушатель сети

    if (WebApp) {
      WebApp.ready();
      WebApp.headerColor = '#0a0a0c';
      const user = WebApp.initDataUnsafe?.user;
      const player = {
        id: user?.id?.toString() || `guest-${Math.floor(Math.random()*1000)}`,
        name: user?.first_name || 'Player',
        balance: 5000,
        isHost: false,
        status: 'idle' as const
      };
      setMe(player);
      peerService.init(player.id);
    }

    // Обработка подключения новых игроков (для Хоста)
    peerService.onConnectionOpened = (conn) => {
      // Хост должен добавить игрока в список
      // В реальности тут нужно запросить данные игрока
      const currentPlayers = useGameStore.getState().gameState.players;
      updateGameState({
        players: [...currentPlayers, { 
          id: conn.peer, 
          name: 'New Player', 
          balance: 0, 
          isHost: false, 
          status: 'idle' 
        }]
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans select-none">
      {!lobbyId && <Home />}
      {lobbyId && gameState.phase === 'LOBBY' && <Lobby />}
      {lobbyId && gameState.phase !== 'LOBBY' && <GameTable />}
    </div>
  );
};
