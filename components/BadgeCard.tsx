// components/BadgeCard.tsx
import { Badge } from '@/lib/badges';
import { Loader2, Lock, CheckCircle } from 'lucide-react';

interface BadgeCardProps {
  badge: Badge;
  claimed: boolean;
  onClickMint: (tokenId: number) => void;
  minting: boolean;
}

export default function BadgeCard({ badge, claimed, onClickMint, minting }: BadgeCardProps) {
  const canClaim = badge.unlocked && !claimed && !minting;
  
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${badge.unlocked 
          ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-blue-900/40 shadow-lg shadow-purple-500/20' 
          : 'border-gray-700 bg-gray-800/50 opacity-60'
        }
        ${canClaim ? 'hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30' : ''}
      `}
    >
      {/* Badge Video/Image */}
      <div className="relative aspect-square bg-gray-900/50 flex items-center justify-center overflow-hidden">
        {badge.video ? (
          <video
            src={badge.video}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover ${!badge.unlocked ? 'grayscale blur-sm' : ''}`}
          />
        ) : badge.image ? (
          <img
            src={badge.image}
            alt={badge.name}
            className={`w-full h-full object-cover ${!badge.unlocked ? 'grayscale blur-sm' : ''}`}
          />
        ) : (
          <div className="text-6xl">{badge.emoji}</div>
        )}

        {/* Overlay for locked/claimed states */}
        {!badge.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Lock className="text-gray-400" size={48} />
          </div>
        )}

        {claimed && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-2">
            <CheckCircle className="text-white" size={20} />
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="p-4">
        <h3 className={`text-lg font-bold mb-1 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}>
          {badge.name}
        </h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {badge.description}
        </p>

        {/* Action Button */}
        {badge.unlocked && !claimed && (
          <button
            onClick={() => onClickMint(badge.id)}
            disabled={minting}
            className={`
              w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200
              ${minting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95'
              }
              text-white flex items-center justify-center gap-2
            `}
          >
            {minting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Minting...
              </>
            ) : (
              'Claim Badge'
            )}
          </button>
        )}

        {claimed && (
          <div className="w-full py-2 px-4 rounded-lg font-semibold bg-green-600/20 text-green-400 text-center border border-green-600/50">
            Claimed ✓
          </div>
        )}

        {!badge.unlocked && (
          <div className="w-full py-2 px-4 rounded-lg font-semibold bg-gray-700/50 text-gray-400 text-center border border-gray-600">
            <Lock size={16} className="inline mr-2" />
            Locked
          </div>
        )}
      </div>
    </div>
  );
}