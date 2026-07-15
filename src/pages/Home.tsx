
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { peerService } from '../services/PeerService';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { me, setLobbyId, updateGameState } = useGameStore();

  const createLobby = (type: 'BLACKJACK' | 'DURAK' | 'ZONK') => {
    const id = peerService.myId;
    setLobbyId(id);
    updateGameState({ 
      gameType: type, 
      phase: 'LOBBY', 
      players: [{ ...me!, isHost: true }] 
    });
  };

  return (
    <div className="p-6 flex flex-col h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            METRO CASH
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Underground Casino System</p>
        </div>
        <div className="bg-[#1a1a1e] px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
          <span className="text-emerald-400 font-mono">${me?.balance}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
        {[
          { id: 'BLACKJACK', title: 'Blackjack', desc: 'Beat the Dealer', icon: '🃏' },
          { id: 'DURAK', title: 'Durak', desc: 'Classic Slavic Card Game', icon: '🃏' },
          { id: 'ZONK', title: 'Zonk', desc: 'High Stakes Dice', icon: '🎲' }
        ].map((game) => (
          <motion.button
            key={game.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => createLobby(game.id as any)}
            className="relative group overflow-hidden bg-gradient-to-br from-[#1a1a1e] to-[#121214] p-5 rounded-3xl border border-white/5 text-left"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{game.title}</h3>
                <p className="text-gray-400 text-sm">{game.desc}</p>
              </div>
              <span className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">{game.icon}</span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-emerald-500 group-hover:w-full transition-all duration-500" />
          </motion.button>
        ))}
      </div>

      <div className="mt-auto">
        <button className="w-full py-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-gray-400 text-sm font-medium">
          FIND PUBLIC LOBBY
        </button>
      </div>
    </div>
  );
};
