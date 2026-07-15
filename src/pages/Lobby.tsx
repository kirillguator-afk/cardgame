
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';
import { Share2, Play, Users, ArrowLeft } from 'lucide-react';
import { BlackjackEngine } from '../logic/BlackjackEngine';
import { peerService } from '../services/PeerService';

export const Lobby: React.FC = () => {
  const { gameState, lobbyId, me, setLobbyId, updateGameState } = useGameStore();

  const isHost = me?.id === lobbyId;

  const copyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?lobby=${lobbyId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const startGame = () => {
    if (!isHost) return;
    
    // Хост инициализирует колоду и раздает карты
    const deck = BlackjackEngine.createDeck();
    const updatedPlayers = gameState.players.map(p => ({
      ...p,
      cards: [deck.pop(), deck.pop()],
      status: 'playing' as const
    }));

    const dealerCards = [deck.pop(), deck.pop()];
    
    const nextState = {
      ...gameState,
      phase: 'ACTION' as const,
      players: updatedPlayers,
      table: dealerCards,
      internalDeck: deck // Сохраняем колоду (только у хоста в локальном стейте)
    };

    updateGameState(nextState);
    peerService.broadcast({
      type: 'SYNC_STATE',
      payload: nextState,
      senderId: me!.id
    });
  };

  return (
    <div className="p-6 flex flex-col h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setLobbyId(null)} className="p-2 bg-white/5 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold tracking-tight">Game Room</h2>
      </div>

      <div className="glass rounded-[2rem] p-8 mb-8 text-center">
        <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Waiting Area</div>
        <h1 className="text-4xl font-black italic mb-6">{gameState.gameType}</h1>
        
        <div className="flex flex-col gap-3">
          {gameState.players.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center font-bold text-black">
                {p.name[0]}
              </div>
              <span className="font-bold flex-1 text-left">{p.name}</span>
              {p.isHost && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold uppercase">Host</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-1 gap-3">
        <button 
          onClick={copyInviteLink}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
        >
          <Share2 size={18} /> INVITE FRIENDS
        </button>

        {isHost && (
          <button 
            onClick={startGame}
            className="py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            START MISSION
          </button>
        )}
      </div>
    </div>
  );
};
