
import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { peerService } from './services/PeerService';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameTable } from './pages/GameTable';
import { initHostLogic } from './logic/GameCoordinator';

export const App: React.FC = () => {
  const { me, setMe, lobbyId, setLobbyId, gameState, updateGameState } = useGameStore();

  useEffect(() => {
    initHostLogic();

    const initConnection = async () => {
      const WebApp = (window as any).Telegram?.WebApp;
      let userId, userName;

      if (WebApp && WebApp.initDataUnsafe?.user) {
        WebApp.ready();
        userId = WebApp.initDataUnsafe.user.id.toString();
        userName = WebApp.initDataUnsafe.user.first_name;
      } else {
        // Fallback для GitHub Pages / Browser
        userId = localStorage.getItem('metro_user_id') || Math.random().toString(36).substr(2, 9);
        userName = localStorage.getItem('metro_user_name') || `User_${userId.substr(0, 4)}`;
        localStorage.setItem('metro_user_id', userId);
        localStorage.setItem('metro_user_name', userName);
      }

      const player = {
        id: userId,
        name: userName,
        balance: 5000,
        isHost: false,
        status: 'idle' as const
      };
      
      setMe(player);
      const myPeerId = await peerService.init(userId);

      // Проверка URL на наличие лобби: ?lobby=ID
      const params = new URLSearchParams(window.location.search);
      const lobbyFromUrl = params.get('lobby');
      if (lobbyFromUrl && lobbyFromUrl !== myPeerId) {
        setLobbyId(lobbyFromUrl);
        peerService.connectTo(lobbyFromUrl);
        // Ждем открытия соединения и шлем PLAYER_JOINED (логика в Coordinator)
      }
    };

    initConnection();

    peerService.onConnectionOpened = (conn) => {
      // Если я хост, уведомляю всех о новом игроке
      const state = useGameStore.getState();
      if (state.me?.id === state.lobbyId) {
        const newPlayer = { id: conn.peer, name: 'Joining...', balance: 5000, isHost: false, status: 'idle' as const };
        const updatedPlayers = [...state.gameState.players, newPlayer];
        updateGameState({ players: updatedPlayers });
        
        // Синхронизируем стейт с новым игроком
        setTimeout(() => {
          peerService.broadcast({
            type: 'SYNC_STATE',
            payload: { ...state.gameState, players: updatedPlayers },
            senderId: state.me!.id
          });
        }, 500);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans select-none flex justify-center">
      <div className="w-full max-w-[500px] relative">
        {!lobbyId && <Home />}
        {lobbyId && gameState.phase === 'LOBBY' && <Lobby />}
        {lobbyId && gameState.phase !== 'LOBBY' && <GameTable />}
      </div>
    </div>
  );
};
