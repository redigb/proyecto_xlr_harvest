import { useState } from 'react';
import { useGame } from '../../context/GameContext';

export const PlayerNameModal = () => {
    const { setPlayerName, startGame } = useGame();
    const [name, setName] = useState('');

    const handleStart = () => {
        if (!name.trim()) return;
        setPlayerName(name);
        startGame();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl px-8 py-10 w-[22rem] text-center shadow-[0_8px_30px_rgb(0,0,0,0.25)] animate-fadeInGlass flex flex-col items-center justify-center">

                {/* Title */}
                <h2 className="text-3xl font-bold mb-4 text-green-300 drop-shadow-sm flex items-center justify-center gap-2">
                    🌿 <span>Welcome to Farm Harvest!</span>
                </h2>

                {/* Description */}
                <p className="text-base text-gray-200 mb-6 leading-relaxed">
                    Before you begin, please enter your farmer name:
                </p>

                {/* Input */}
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name..."
                    className="w-full bg-white/15 text-white placeholder-gray-300 border border-green-400/50 rounded-md p-3 mb-6 text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                />

                {/* Button */}
                <button
                    onClick={handleStart}
                    className="bg-green-600 hover:bg-green-700 text-white text-lg px-5 py-2.5 rounded-md w-full font-semibold transition-all duration-200 shadow-lg hover:shadow-green-700/40 animate-glowPulse"
                >
                    Start 🌱
                </button>
            </div>
        </div>
    );
};

export default PlayerNameModal;
