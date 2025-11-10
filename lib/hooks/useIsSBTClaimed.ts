import { useReadContracts } from 'wagmi';
import { contractAbi } from 'lib/abi';
import { ReadContractsParameters } from 'wagmi/actions';

export function useIsSBTClaimed(tokenIds: number[]) {
  const {
    data: claimedStatus,
    isLoading,
    refetch,
  } = useReadContracts({
    contracts: tokenIds.map((id) => ({
      address: process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractAbi,
      functionName: 'ownerOf',
      args: [BigInt(id)],
    })) as ReadContractsParameters['contracts'],
    query: {
      enabled: tokenIds.length > 0,
      select: (data) => data.map((d) => d.status === 'success'),
    },
  });

  return {
    claimedStatus: claimedStatus || Array(tokenIds.length).fill(false),
    isLoading,
    refetch,
  };
}
