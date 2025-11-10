import type { MemoryProfile } from '../memory';
import { useQuery } from '@tanstack/react-query';
import { memoryAPI } from '../memory';
import { Address } from 'viem';

const HAS_KEY = !!process.env.NEXT_PUBLIC_MEMORY_API_KEY;

export function useMemoryProfile(wallet: Address | undefined) {


interface MemoryError {
    message?: string;
}

    return useQuery<MemoryProfile, Error>({
        queryKey: ['memory-profile', wallet], // More specific query key
        queryFn: async (): Promise<MemoryProfile> => {
            if (!wallet) {
                throw new Error('Wallet address is required');
            }

            try {
                const profile = await memoryAPI.getProfile(wallet);
                if (!profile) {
                    throw new Error('Profile not found, Sign up may be required');
                }
                return profile;
            } catch (error) {
                console.error('Failed to fetch memory profile:', error);
                throw error;
            }
        },
        enabled: Boolean(wallet),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount: number, error: MemoryError) => {
            if (error?.message?.includes('401')) return false; // Don't retry auth errors
            return failureCount < 1;
        },
    });
}