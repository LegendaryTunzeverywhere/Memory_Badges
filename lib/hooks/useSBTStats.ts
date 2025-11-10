import { useReadContracts } from 'wagmi';
import { contractAbi } from 'lib/contracts';

const sbtContract = {
  address: process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS as `0x${string}`,
  abi: contractAbi,
};

export function useSBTStats() {
  const { data, isLoading, error, isSuccess, refetch } = useReadContracts({
    contracts: [
      {
        ...sbtContract,
        functionName: 'totalSupply',
      },
    ],
  });

  const totalSupply = data?.[0]?.result as BigInt | undefined;

  return {
    totalSupply: totalSupply !== undefined ? Number(totalSupply) : undefined,
    isLoading,
    error,
    isSuccess,
    refetch,
  };
}
