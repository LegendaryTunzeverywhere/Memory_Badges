// lib/memory.ts
import { Address } from 'viem';

export interface MemoryProfile {
  address: Address;
  x?: { username: string; followers: number; verified: boolean };
  farcaster?: { fid: number; username: string; followers: number; following: number };
  lens?: { username: string; followers: number; following: number; verified: boolean; url: string };
  github?: { username: string; followers: number; following: number; verified: boolean; url: string };
  talent?: { id: string; url: string; verified: boolean };
  contracts?: { address: string; url: string }[];
  ens?: string;
  onchain?: { txCount: number; contractsDeployed: number; nftCount: number };
  graph?: { mutuals: number };
}

export class MemoryAPI {
  private baseURL = process.env.NEXT_PUBLIC_MEMORY_API_URL || 'https://api.memoryproto.co';
  private apiKey = process.env.NEXT_PUBLIC_MEMORY_API_KEY;

  async getProfile(identifier: string): Promise<MemoryProfile | null> {
    if (!this.apiKey || !identifier) return null;

    const address = identifier.toLowerCase() as Address;
    console.log('[MemoryAPI] Fetching:', address);

    try {
      const res = await fetch(`${this.baseURL}/identities/wallet/${address}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('[MemoryAPI] HTTP', res.status);
        return { address };
      }

      const data: any[] = await res.json();
      console.log('[MemoryAPI] Raw array:', data);

      // FIND WALLET
      const walletIdentity = data.find((item: any) => 
        item.id?.toLowerCase() === address && item.platform === 'ethereum'
      );

      if (!walletIdentity) {
        console.log('[MemoryAPI] Wallet not found in array');
        return { address };
      }

      // EXTRACT SOCIALS FROM ARRAY BY PLATFORM
const profile: MemoryProfile = { address };

data.forEach((item: any) => {
  const { platform, username, social, id, url } = item;

  switch (platform) {
    case 'twitter':
      profile.x = {
        username: username || '',
        followers: social?.followers || 0,
        verified: social?.verified || false,
      };
      break;

    case 'farcaster':
      profile.farcaster = {
        fid: parseInt(id) || 0,
        username: username || '',
        followers: social?.followers || 0,
        following: social?.following || 0,
      };
      break;

    case 'lens':
      profile.lens = {
        username: username || '',
        followers: social?.followers || 0,
        following: social?.following || 0,
        verified: social?.verified || false,
        url,
      };
      break;

    case 'github':
      profile.github = {
        username: username || '',
        followers: social?.followers || 0,
        following: social?.following || 0,
        verified: social?.verified || false,
        url,
      };
      break;

    case 'talent-protocol':
      profile.talent = {
        id,
        url,
        verified: social?.verified || false,
      };
      break;

    case 'ethereum':
      // Track all wallet contracts
      if (!profile.contracts) profile.contracts = [];
      profile.contracts.push({
        address: item.id,
        url,
      });
      break;

    case 'ens':
      if (username) profile.ens = username;
      break;
  }
});

// Preserve any graph info if present
if (walletIdentity.graph) {
  profile.graph = walletIdentity.graph;
}

console.log('[MemoryAPI] Extracted →', profile);

      return profile;
    } catch (error) {
      console.error('[MemoryAPI] Failed:', error);
      return { address };
    }
  }
}

export const memoryAPI = new MemoryAPI();
