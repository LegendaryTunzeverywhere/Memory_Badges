import { useSBTMetadata } from 'lib/hooks/useSBTMetadata';

export default function BadgeListItem({ badgeId }: { badgeId: string }) {
  const { data: meta, isLoading } = useSBTMetadata(parseInt(badgeId, 10));

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      {isLoading ? (
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
      ) : meta?.image ? (
        <img src={meta.image} alt={meta.name} className="w-12 h-12 rounded-lg object-cover" />
      ) : (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-xl">
          🎖️
        </div>
      )}
      <div className="text-left flex-1">
        <p className="font-semibold text-sm">
          {isLoading ? 'Loading...' : meta?.name || `Badge #${badgeId}`}
        </p>
        <p className="text-xs text-gray-500">
          {isLoading ? '' : meta?.description || 'SBT'}
        </p>
      </div>
    </div>
  );
}
