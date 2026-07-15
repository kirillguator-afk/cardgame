
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { peerService } from '../services/PeerService';
import { motion } from 'framer-motion';
import { Copy, Play, Users } from 'lucide-react';

export const Lobby: React.FC = () => {
  const { gameState, lobbyId, me, updateGameState } = useGameStore();

  const isHost = me?.id === lobbyId;

  const copyId = () => {
    navigator.clipboard.writeText(lobbyId || '');
    // В ТГ можно добавить Haptic Feedback
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const startGame = () => {
    if (!isHost) return;
    // Инициализация игры Хостом
    updateGameState({ phase: 'DEALING' });
    // Тут будет вызов логики раздачи
  };

  return (
    <div className="p-6 flex flex-col h-screen max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full text-xs font-bold mb-2 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LOBBY ACTIVE
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter">{gameState.gameType}</h2>
      </div>

      <div className="glass rounded-3xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Users size={16} /> Players ({gameState.players.length}/4)
          </span>
          <button onClick={copyId} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-emerald-400">
            <Copy size={18} />
          </button>
        </div>
        
        <div className="space-y-3">
          {gameState.players.map((p) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              key={p.id} 
              className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold">
                {p.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{p.name} {p.id === me?.id && '(You)'}</div>
                <div className="text-[10px] text-gray-500">{p.isHost ? 'HOST' : 'PLAYER'}</div>
              </div>
              {p.isHost && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
            </motion.div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button 
          onClick={startGame}
          disabled={gameState.players.length < 1}
          className="mt-auto action-button py-5 bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <Play size={20} className="fill-current mr-2" /> START MISSION
        </button>
      ) : (
        <div className="mt-auto text-center text-gray-500 animate-pulse text-sm font-medium">
          WAITING FOR HOST TO START...
        </div>
      )}
    </div>
  );
};
