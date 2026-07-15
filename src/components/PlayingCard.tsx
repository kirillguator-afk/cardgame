
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  suit: string;
  value: string;
  index: number;
  isHidden?: boolean;
}

export const PlayingCard: React.FC<CardProps> = ({ suit, value, index, isHidden }) => {
  const isRed = suit === '♥' || suit === '♦';

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, rotate: 20 }}
      animate={{ y: 0, opacity: 1, rotate: index * 2 - 5 }}
      whileHover={{ y: -10, zIndex: 50 }}
      className={`relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 ${
        isHidden ? 'bg-indigo-900 border-white/20' : 'bg-white border-transparent'
      } card-shadow flex flex-col p-2 select-none`}
    >
      {!isHidden ? (
        <>
          <div className={`text-lg font-bold leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
            {value}
          </div>
          <div className={`text-xl self-center my-auto ${isRed ? 'text-red-600' : 'text-black'}`}>
            {suit}
          </div>
          <div className={`text-lg font-bold leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
            {value}
          </div>
        </>
      ) : (
        <div className="w-full h-full border border-white/10 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.05)_5px,rgba(255,255,255,0.05)_10px)]" />
      )}
    </motion.div>
  );
};
