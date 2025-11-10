// app/share/page.tsx
'use client';

import { useAccount } from 'wagmi';
import { useMemoryProfile } from '@/lib/hooks/useMemoryProfile';
import { useBadges } from '@/lib/hooks/useBadges';
import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Loader2, Share2 } from 'lucide-react';

export default function SharePage() {
  const { address } = useAccount();
  const { data: profile } = useMemoryProfile(address);
  const { unlocked } = useBadges(profile || null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(cardRef.current, {
      background: '#ffffff',
    });
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (unlocked.length > 0) generateCard();
  }, [unlocked]);

  const shareToFarcaster = () => {
    const text = `I just claimed ${unlocked.length} Memory Badges on Base! Powered by @memory\n\nhttps://badges.memory.co`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(imageUrl)}`;
    window.open(url, '_blank');
  };

  const shareToX = () => {
    const text = `Claimed ${unlocked.length} Memory Badges on @base! @memoryxyz\n\nCheck yours: https://badges.memory.co`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`;
    window.open(url, '_blank');
  };

  if (!address || unlocked.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Badges to Share</h2>
          <p className="text-gray-400">You haven't unlocked any badges yet. Start by connecting your wallet on the homepage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Share Your Badges
        </h1>

        {/* Hidden Card for Canvas */}
        <div className="hidden">
          <div ref={cardRef} className="bg-gray-800 p-10 rounded-2xl shadow-xl w-[600px] border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Memory Badges</h2>
              <p className="text-md text-gray-400">On-Chain Identity Proof</p>
            </div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {unlocked.map((b) => (
                <div key={b.id} className="text-center">
                  <div className="bg-gray-700 rounded-xl w-20 h-20 mx-auto flex items-center justify-center text-4xl">
                    {b.emoji}
                  </div>
                  <p className="text-sm mt-2 font-medium text-white">{b.name}</p>
                </div>
              ))}
            </div>
            <div className="text-center text-md text-gray-400">
              <p>{profile?.ens || address?.slice(0, 6) + '...' + address?.slice(-4)}</p>
              <p className="font-bold text-purple-400">badges.memory.co</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          {isGenerating ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={48} /></div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Badge Card" className="w-full rounded-lg" />
          ) : null}
        </div>

        {/* Share Buttons */}
        <div className="flex gap-6 mt-10 justify-center">
          <button
            onClick={shareToFarcaster}
            className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-bold text-lg"
          >
            <Share2 size={24} />
            Share on Farcaster
          </button>
          <button
            onClick={shareToX}
            className="flex items-center gap-3 px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors font-bold text-lg"
          >
            <Share2 size={24} />
            Share on X
          </button>
        </div>

        <p className="text-center mt-8 text-md text-gray-400">
          Share your on-chain identity. Powered by <strong className="text-purple-400">Memory ($MEM)</strong>
        </p>
      </div>
    </div>
  );
}
