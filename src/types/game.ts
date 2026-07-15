
export type GameType = 'DURAK' | 'BLACKJACK' | 'ZONK';

export interface Player {
  id: string; // Peer ID / TG ID
  name: string;
  photo?: string;
  balance: number;
  isHost: boolean;
  cards?: any[];
  points?: number;
  status: 'idle' | 'ready' | 'playing' | 'folded';
}

export interface GameState {
  gameType: GameType | null;
  phase: 'LOBBY' | 'DEALING' | 'ACTION' | 'RESULT';
  players: Player[];
  currentTurnId: string | null;
  table: any[];
  deckCount: number;
  lastAction?: string;
  bet: number;
}

export type NetworkPackage = {
  type: 'SYNC_STATE' | 'ACTION' | 'CHAT' | 'PLAYER_JOINED';
  payload: any;
  senderId: string;
};

export type PlayerAction = {
  type: 'HIT' | 'STAND' | 'PLAY_CARD' | 'ROLL_DICE' | 'JOIN';
  payload?: any;
};
