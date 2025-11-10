// lib/badges.ts
import type { MemoryProfile } from './memory';

export interface Badge {
  id: number;
  name: string;
  emoji: string;
  description: string;
  image?: string;
  video?: string;
  tokenURI: string;
  unlocked: boolean;
  claimed?: boolean;
}

export const BADGES_METADATA = [
  {
    id: 0,
    name: 'X OG',
    emoji: 'X Active',
    description: 'Has X account with >100 followers',
    video: '/badges/x_og.mp4',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/bafkreib3s2cm3kqy6k2iogncjw72n6zkfnlpu6yfq2fn4fwh4e373w5bny', // 
    check: (p: MemoryProfile) => !!p.x && p.x.followers > 100,
  },
  {
    id: 1,
    name: 'Farcaster User',
    emoji: 'Farcaster User',
    description: 'Has Farcaster account',
    video: '/badges/farcaster user.mp4',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/bafkreieubesoylmd5ubi75hr3aljxuylk3mdcesfrcvhpyqudi5gnp3dgi',
    check: (p: MemoryProfile) => !!p.farcaster,
  },
  {
    id: 2,
    name: 'GitHub Developer',
    emoji: 'GitHub Dev',
    description: 'Has GitHub account',
    video: '/badges/Github Developer.mp4',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/bafkreiao2hzyi56di4wwbjjrniipxh2huyvnf5t3eunseltoa3u563tuy4',
    check: (p: MemoryProfile) => !!p.github,
  },
  {
    id: 3,
    name: 'Lens Profile',
    emoji: 'Lens Creator',
    description: 'Has Lens profile',
    video: '/badges/lens profile.mp4',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/bafkreibzt55ye3svdzp5y3ocwqqhwlkdwwdycn3rk5yiyru5mkumszuwhq',
    check: (p: MemoryProfile) => !!p.lens,
  },
  {
    id: 4,
    name: 'Talent Profile',
    emoji: 'Talent Builder',
    description: 'Has Talent Protocol profile',
    video: '/badges/Talent Profile.mp4',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/bafkreihqrofgwbz6hlayytwybi3yaw2x5apimgq6zppvzyy4bsk2o5676i', // 
    check: (p: MemoryProfile) => !!p.talent,
  },
];

export function evaluateBadges(profile: MemoryProfile | null): Badge[] {
  if (!profile) return [];

  return BADGES_METADATA.map(def => {
    const { check, ...meta } = def;
    return {
      ...meta,
      unlocked: check(profile),
    };
  });
}
