
import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { peerService } from './services/PeerService';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameTable } from './pages/GameTable';
import { initHostLogic } from './logic/GameCoordinator';
import { logToTelegram } from './services/TelegramLogger';

export const App: React.FC = () => {
  const { me, setMe, lobbyId, setLobbyId, gameState, updateGameState } = useGameStore();

  useEffect(() => {
    // 1. Инициализация логики синхронизации
    initHostLogic();

    const startSession = async () => {
      const WebApp = (window as any).Telegram?.WebApp;
      let userId, userName;

      // 2. Получение данных пользователя
      if (WebApp?.initDataUnsafe?.user) {
        WebApp.ready();
        WebApp.expand();
        userId = WebApp.initDataUnsafe.user.id.toString();
        userName = WebApp.initDataUnsafe.user.first_name;
      } else {
        userId = localStorage.getItem('mc_uid') || Math.random().toString(36).substr(2, 9);
        userName = localStorage.getItem('mc_name') || `Player_${userId.substr(0, 4)}`;
        localStorage.setItem('mc_uid', userId);
        localStorage.setItem('mc_name', userName);
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

      // 3. Обработка входа по ссылке
      const params = new URLSearchParams(window.location.search);
      const lobbyFromUrl = params.get('lobby');
      
      if (lobbyFromUrl && lobbyFromUrl !== myPeerId) {
        console.log('Connecting to lobby:', lobbyFromUrl);
        setLobbyId(lobbyFromUrl);
        peerService.connectTo(lobbyFromUrl);
        logToTelegram(`👤 <b>${userName}</b> подключается к игре\nID: <code>${lobbyFromUrl}</code>`);
      }
    };

    startSession();

    // 4. Глобальный обработчик новых соединений (для Хоста)
    peerService.onConnectionOpened = (conn) => {
      const state = useGameStore.getState();
      if (state.me?.id === state.lobbyId) {
        // Хост видит новое входящее соединение
        logToTelegram(`➕ Новый игрок в лобби Хоста <b>${state.me.name}</b>`);
      }
    };
  }, []);

  // Если данных о себе еще нет — показываем загрузку (не белый экран)
  if (!me) return (
    <div className="h-screen w-full bg-[#0a0a0c] flex items-center justify-center">
      <div className="text-emerald-500 font-mono animate-pulse font-bold">INITIALIZING METRO...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans select-none flex justify-center">
      <div className="w-full max-w-[500px] relative shadow-2xl">
        {!lobbyId && <Home />}
        {lobbyId && gameState.phase === 'LOBBY' && <Lobby />}
        {lobbyId && gameState.phase !== 'LOBBY' && <GameTable />}
      </div>
    </div>
  );
};
