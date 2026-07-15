
import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { peerService } from '../services/PeerService';
import { motion } from 'framer-motion';
import { Play, LogIn, TrendingUp } from 'lucide-react';
import { logToTelegram } from '../services/TelegramLogger';

export const Home: React.FC = () => {
  const { me, setLobbyId, updateGameState } = useGameStore();
  const [joinId, setJoinId] = useState('');

  const createLobby = (type: 'BLACKJACK' | 'DURAK' | 'ZONK') => {
    const id = peerService.myId;
    if (!id) return;

    setLobbyId(id);
    const initialPlayers = [{ ...me!, isHost: true }];
    
    updateGameState({ 
      gameType: type, 
      phase: 'LOBBY', 
      players: initialPlayers,
      bet: 100
    });

    logToTelegram(`🚀 <b>${me?.name}</b> создал лобби <b>${type}</b>\nID: <code>${id}</code>`);
  };

  const handleJoin = () => {
    const cleanId = joinId.trim();
    if (!cleanId) return;
    setLobbyId(cleanId);
    peerService.connectTo(cleanId);
  };

  return (
    <div className="p-6 flex flex-col h-screen max-w-[500px] mx-auto relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      
      <header className="flex justify-between items-center mb-10 pt-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            METRO CASH
          </h1>
          <div className="flex items-center gap-2 text-[9px] text-emerald-500/70 font-bold uppercase tracking-[0.2em]">
             <TrendingUp size={10} /> System Online
          </div>
        </div>
        <div className="bg-[#1a1a1e] px-4 py-2 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-end">
          <span className="text-[9px] text-gray-500 font-bold">BALANCE</span>
          <span className="text-emerald-400 font-mono font-bold text-lg">${me?.balance}</span>
        </div>
      </header>

      <div className="space-y-4 mb-8">
        <label className="text-[10px] text-gray-500 font-bold uppercase ml-2">Join Private Table</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="PASTE ROOM ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all font-mono text-sm placeholder:text-white/10"
          />
          <button 
            onClick={handleJoin}
            className="bg-emerald-500 text-black px-6 rounded-2xl font-black hover:bg-emerald-400 transition-all active:scale-90"
          >
            <LogIn size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
         <p className="text-[10px] text-gray-500 font-bold uppercase ml-2">Start New Game</p>
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
            </motion.button>
          ))}
         </div>
      </div>

      <footer className="py-6 text-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-4" />
        <p className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-medium">Powered by Nexus Prime P2P</p>
      </footer>
    </div>
  );
};
