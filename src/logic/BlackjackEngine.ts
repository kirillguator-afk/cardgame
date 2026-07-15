
import { GameState, PlayerAction } from '../types/game';

export class BlackjackEngine {
  static createDeck() {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (let s of suits) {
      for (let v of values) {
        deck.push({ suit: s, value: v, score: this.getScore(v) });
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  }

  static getScore(value: string): number {
    if (['J', 'Q', 'K'].includes(value)) return 10;
    if (value === 'A') return 11;
    return parseInt(value);
  }

  static calculateTotal(cards: any[]) {
    let total = cards.reduce((acc, c) => acc + c.score, 0);
    let aces = cards.filter(c => c.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  }

  static handleAction(state: GameState, action: PlayerAction): GameState {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === action.payload.playerId);
    
    if (!player) return state;

    if (action.type === 'HIT') {
      // Логика выдачи карты (упрощенно)
      const deck = (newState as any).internalDeck || this.createDeck();
      const card = deck.pop();
      player.cards = [...(player.cards || []), card];
      player.points = this.calculateTotal(player.cards);
      
      if (player.points > 21) {
        player.status = 'folded';
        // Переход хода
      }
    }

    if (action.type === 'STAND') {
      player.status = 'ready';
      // Переход хода
    }

    return newState;
  }
}
