
import { peerService } from '../services/PeerService';
import { useGameStore } from '../store/useGameStore';
import { BlackjackEngine } from './BlackjackEngine';
import { logToTelegram } from '../services/TelegramLogger';

export const initHostLogic = () => {
  peerService.onDataReceived = (pkg) => {
    const state = useGameStore.getState();
    const isHost = state.me?.id === state.lobbyId;

    // СЦЕНАРИЙ ХОСТА
    if (isHost) {
      if (pkg.type === 'ACTION') {
        let currentGameState = { ...state.gameState };
        
        if (state.gameState.gameType === 'BLACKJACK') {
          currentGameState = BlackjackEngine.handleAction(currentGameState, pkg.payload);
        }
        
        // Валидируем и рассылаем новый стейт
        useGameStore.getState().updateGameState(currentGameState);
        peerService.broadcast({
          type: 'SYNC_STATE',
          payload: currentGameState,
          senderId: state.me!.id
        });
      }
    } 
    
    // СЦЕНАРИЙ КЛИЕНТА
    if (!isHost && pkg.type === 'SYNC_STATE') {
      useGameStore.getState().updateGameState(pkg.payload);
    }
  };
};
