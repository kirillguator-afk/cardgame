
import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { peerService } from '../services/PeerService';
import { motion } from 'framer-motion';
import { Play, LogIn, TrendingUp, Trophy, Target, Hash } from 'lucide-react';
import { logToTelegram } from '../services/TelegramLogger';

export const Home: React.FC = () => {
  const { me, setLobbyId, updateGameState } = useGameStore();
  const [joinId, setJoinId] = useState('');

  const createLobby = (type: 'BLACKJACK' | 'DURAK' | 'ZONK') => {
    const id = peerService.myId;
    if (!id) return;
    setLobbyId(id);
    updateGameState({ 
      gameType: type, 
      phase: 'LOBBY', 
      players: [{ ...me!, isHost: true }],
      bet: 100
    });
    logToTelegram(`🚀 <b>${me?.name}</b> (@${me?.username || 'no_user'}) создал лобби ${type}`);
  };

  return (
    <div className="p-6 flex flex-col h-screen max-w-[500px] mx-auto overflow-y-auto">
      <header className="flex flex-col gap-6 pt-4 mb-8">
        {/* Профиль игрока */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/5">
          <div className="relative">
            {me?.photo ? (
              <img src={me.photo} className="w-16 h-16 rounded-full border-2 border-emerald-500/50" alt="avatar" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-black">
                {me?.name[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-4 border-[#0a0a0c]" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-black tracking-tight">{me?.name}</h2>
            <p className="text-emerald-500/60 text-xs font-mono">@{me?.username || 'metro_player'}</p>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-bold uppercase">Balance</div>
            <div className="text-emerald-400 font-mono font-black text-xl">${me?.balance}</div>
          </div>
        </div>

        {/* Мини-статистика */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
            <Trophy size={14} className="mx-auto mb-1 text-gold-400 opacity-50" />
            <div className="text-[10px] text-gray-500 uppercase font-bold">Wins</div>
            <div className="text-sm font-mono font-bold">{me?.stats.wins}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
            <Target size={14} className="mx-auto mb-1 text-cyan-400 opacity-50" />
            <div className="text-[10px] text-gray-500 uppercase font-bold">Played</div>
            <div className="text-sm font-mono font-bold">{me?.stats.gamesPlayed}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
            <Hash size={14} className="mx-auto mb-1 text-emerald-400 opacity-50" />
            <div className="text-[10px] text-gray-500 uppercase font-bold">Winrate</div>
            <div className="text-sm font-mono font-bold">
              {me?.stats.gamesPlayed ? Math.round((me.stats.wins / me.stats.gamesPlayed) * 100) : 0}%
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="ROOM ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all font-mono text-xs uppercase"
            />
            <button 
              onClick={() => { setLobbyId(joinId); peerService.connectTo(joinId); }}
              className="bg-emerald-500 text-black px-6 rounded-2xl font-black"
            >
              <LogIn size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'BLACKJACK', title: 'Blackjack', desc: 'Beat the Metro Dealer', icon: '🃏', color: 'from-emerald-900/40' },
            { id: 'DURAK', title: 'Durak', desc: 'Slavic Underground Rules', icon: '⚔️', color: 'from-blue-900/40' },
          ].map((game) => (
            <motion.button
              key={game.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => createLobby(game.id as any)}
              className={`relative overflow-hidden bg-gradient-to-br ${game.color} to-[#121214] p-6 rounded-[2rem] border border-white/5 text-left shadow-xl group`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{game.title}</h3>
                  <p className="text-white/40 text-xs font-medium">{game.desc}</p>
                </div>
                <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">{game.icon}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <footer className="mt-auto py-8 text-center">
        <p className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-bold">Metro Network Protocol v4.0</p>
      </footer>
    </div>
  );
};
