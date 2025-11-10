// lib/contracts.ts
import { contractAbi } from './abi';

if (!process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS) {
  throw new Error('Missing SBT contract address');
}

export const sbtContract = {
  address: process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS as `0x${string}`,
  abi: contractAbi,
};

export { contractAbi };
