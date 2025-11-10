import { useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { sbtContract } from 'lib/contracts';

export interface SBTMetadata {
  name: string;
  description: string;
  image: string;
}

export function useSBTMetadata(tokenId: number | null) {
  const id = tokenId ? BigInt(tokenId) : BigInt(0);

  // Always call the hook, but conditionally enable it
  const uriResult = useReadContract({
    address: sbtContract.address,
    abi: sbtContract.abi,
    functionName: 'tokenURI',
    args: [id],
    query: {
      enabled: tokenId !== null,
    },
  });

  const uri = uriResult.data as string | undefined;

  // Fetch metadata JSON
  const metadataResult = useQuery({
    enabled: !!uri && !!tokenId,
    queryKey: ['sbt-metadata', tokenId, uri],
    queryFn: async () => {
      const url = uri!.replace('{id}', String(tokenId!));
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.status}`);
      return (await res.json()) as SBTMetadata;
    },
  });

  return {
    data: metadataResult.data,
    isLoading: uriResult.isLoading || metadataResult.isLoading,
    error: uriResult.error || metadataResult.error,
  };
}
