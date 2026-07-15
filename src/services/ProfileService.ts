
import { PlayerStats } from '../types/game';

const STATS_KEY = 'metro_cash_stats_v1';

export const ProfileService = {
  getStats(): PlayerStats {
    const saved = localStorage.getItem(STATS_KEY);
    return saved ? JSON.parse(saved) : { wins: 0, gamesPlayed: 0, totalEarned: 0 };
  },

  saveWin(amount: number) {
    const stats = this.getStats();
    stats.wins += 1;
    stats.gamesPlayed += 1;
    stats.totalEarned += amount;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },

  saveLoss() {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
};
