
import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { peerService } from '../services/PeerService';
import { motion } from 'framer-motion';
import { Play, LogIn } from 'lucide-react';

export const Home: React.FC = () => {
  const { me, setLobbyId, updateGameState } = useGameStore();
  const [joinId, setJoinId] = useState('');

  const createLobby = (type: 'BLACKJACK' | 'DURAK' | 'ZONK') => {
    const id = peerService.myId;
    setLobbyId(id);
    updateGameState({ 
      gameType: type, 
      phase: 'LOBBY', 
      players: [{ ...me!, isHost: true }] 
    });
  };

  const handleJoin = () => {
    if (!joinId.trim()) return;
    setLobbyId(joinId);
    peerService.connectTo(joinId);
    // Отправляем пакет о вступлении будет в App.tsx через useEffect
  };

  return (
    <div className="p-6 flex flex-col h-screen max-w-[500px] mx-auto">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            METRO CASH
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Web P2P Casino</p>
        </div>
        <div className="bg-[#1a1a1e] px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
          <span className="text-emerald-400 font-mono font-bold">${me?.balance}</span>
        </div>
      </header>

      <div className="space-y-4 mb-8">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="ENTER ROOM ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
          />
          <button 
            onClick={handleJoin}
            className="bg-emerald-500 text-black p-3 rounded-2xl font-bold hover:bg-emerald-400 transition-colors"
          >
            <LogIn size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-10">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-[-10px]">Quick Create</p>
        {[
          { id: 'BLACKJACK', title: 'Blackjack', desc: 'Beat the Dealer', icon: '🃏' },
          { id: 'DURAK', title: 'Durak', desc: 'Classic Slavic Card Game', icon: '🃏' },
        ].map((game) => (
          <motion.button
            key={game.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => createLobby(game.id as any)}
            className="relative group overflow-hidden bg-gradient-to-br from-[#1a1a1e] to-[#121214] p-5 rounded-3xl border border-white/5 text-left shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{game.title}</h3>
                <p className="text-gray-400 text-xs">{game.desc}</p>
              </div>
              <span className="text-3xl">{game.icon}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <footer className="mt-auto py-6 text-center">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Nexus Prime v4.0 Architecture</p>
      </footer>
    </div>
  );
};
