// components/CongratsModal.tsx
import { useSBTMetadata } from 'lib/hooks/useSBTMetadata';
import { X, ExternalLink } from 'lucide-react';

export default function CongratsModal({ 
  txHash, 
  onClose, 
  badgeIds 
}: { 
  txHash: string; 
  onClose: () => void; 
  badgeIds: number[] 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative border border-gray-700">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X size={28} />
        </button>

        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <div className="text-5xl">🏆</div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">Congratulations!</h2>
          <p className="text-gray-300 mb-8">
            You’ve minted {badgeIds.length} Soulbound Badges!
          </p>

          <div className="space-y-4 mb-8 max-h-80 overflow-y-auto p-2">
            {badgeIds.map(id => {
              const { data: meta, isLoading } = useSBTMetadata(id);
              return (
                <div key={id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-xl">
                  {isLoading ? (
                    <div className="w-16 h-16 bg-gray-600 rounded-lg animate-pulse" />
                  ) : meta?.image ? (
                    <img src={meta.image} alt={meta.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-2xl">
                      🎖️
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <p className="font-bold text-md text-white">
                      {isLoading ? 'Loading...' : meta?.name || `Badge #${id}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      {isLoading ? '' : meta?.description || 'SBT'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Transaction Hash</p>
            <p className="text-sm font-mono text-gray-300 break-all">{txHash}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`https://base.blockscout.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 w-full justify-center px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
            >
              View on Basescan
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
