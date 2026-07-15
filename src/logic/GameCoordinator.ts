
import { peerService } from '../services/PeerService';
import { useGameStore } from '../store/useGameStore';
import { BlackjackEngine } from './BlackjackEngine';

export const initHostLogic = () => {
  peerService.onDataReceived = (pkg) => {
    const state = useGameStore.getState();
    
    // Если мы Хост, обрабатываем входящие действия игроков
    if (pkg.type === 'ACTION' && state.me?.id === state.lobbyId) {
      let newState = { ...state.gameState };
      
      if (state.gameState.gameType === 'BLACKJACK') {
        newState = BlackjackEngine.handleAction(newState, pkg.payload);
      }
      
      // Обновляем себя и рассылаем всем
      useGameStore.getState().updateGameState(newState);
      peerService.broadcast({
        type: 'SYNC_STATE',
        payload: newState,
        senderId: state.me!.id
      });
    }

    // Если мы Клиент, просто синхронизируем стейт от Хоста
    if (pkg.type === 'SYNC_STATE') {
      useGameStore.getState().updateGameState(pkg.payload);
    }
  };
};
