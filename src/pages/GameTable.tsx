
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { PlayingCard } from '../components/PlayingCard';
import { motion, AnimatePresence } from 'framer-motion';
import { peerService } from '../services/PeerService';

export const GameTable: React.FC = () => {
  const { gameState, me } = useGameStore();
  
  // Разделяем игроков на "меня" и "других" для позиционирования
  const others = gameState.players.filter(p => p.id !== me?.id);
  const myData = gameState.players.find(p => p.id === me?.id);

  const sendAction = (type: string) => {
    const action = { type, payload: { playerId: me?.id } };
    if (me?.id === peerService.myId) {
       // Если я хост - обрабатываю локально (в будущем)
    } else {
       // Если клиент - шлю хосту
       peerService.send(peerService.myId, { type: 'ACTION', payload: action, senderId: me!.id });
    }
  };

  return (
    <div className="h-screen w-full felt-gradient relative overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex justify-between items-center z-10">
        <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
          POT: <span className="text-white">${gameState.bet * gameState.players.length}</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          {gameState.gameType} // PHASE: {gameState.phase}
        </div>
      </div>

      {/* Opponents Area */}
      <div className="flex-1 flex justify-around items-start p-4">
        {others.map((player) => (
          <div key={player.id} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-black">
               <div className="w-full h-full flex items-center justify-center font-bold text-xs">{player.name[0]}</div>
            </div>
            <div className="flex -space-x-10 scale-75 origin-top">
              {player.cards?.map((_, idx) => (
                <PlayingCard key={idx} suit="" value="" index={idx} isHidden />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Center Table (Dealer) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-32 border border-white/5 rounded-[100px] flex items-center justify-center">
           {/* Dealer Cards */}
           <div className="flex -space-x-8">
             {gameState.table.map((card, idx) => (
               <PlayingCard key={idx} suit={card.suit} value={card.value} index={idx} />
             ))}
           </div>
        </div>
      </div>

      {/* Player Area */}
      <div className="p-6 pb-10 flex flex-col items-center gap-6 z-20">
        {/* My Cards */}
        <div className="flex -space-x-6 mb-4">
          <AnimatePresence>
            {myData?.cards?.map((card, idx) => (
              <PlayingCard key={idx} suit={card.suit} value={card.value} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-sm">
          <button 
            onClick={() => sendAction('HIT')}
            className="flex-1 action-button py-4 bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20"
          >
            Hit
          </button>
          <button 
            onClick={() => sendAction('STAND')}
            className="flex-1 action-button py-4 bg-emerald-600/80 backdrop-blur-md border border-emerald-500/20 hover:bg-emerald-500"
          >
            Stand
          </button>
        </div>

        <div className="text-xs text-white/40 font-mono">
          SCORE: {myData?.points || 0}
        </div>
      </div>
    </div>
  );
};
