// lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const config = getDefaultConfig({
  appName: 'Memory Badges',
  projectId,
  chains: [base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
