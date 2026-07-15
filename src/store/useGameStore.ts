
import { create } from 'zustand';
import { GameState, Player } from '../types/game';

interface MetroState {
  me: Player | null;
  gameState: GameState;
  lobbyId: string | null;
  setMe: (player: Player) => void;
  updateGameState: (update: Partial<GameState>) => void;
  setLobbyId: (id: string | null) => void;
}

export const useGameStore = create<MetroState>((set) => ({
  me: null,
  lobbyId: null,
  gameState: {
    gameType: null,
    phase: 'LOBBY',
    players: [],
    currentTurnId: null,
    table: [],
    deckCount: 0,
    bet: 100,
  },
  setMe: (player) => set({ me: player }),
  updateGameState: (update) => 
    set((state) => ({ gameState: { ...state.gameState, ...update } })),
  setLobbyId: (id) => set({ lobbyId: id }),
}));
