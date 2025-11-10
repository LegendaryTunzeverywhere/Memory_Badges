'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useSendTransaction } from 'wagmi'; // Changed from thirdweb
import { createThirdwebClient, getContract, prepareContractCall } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { useMemoryProfile } from 'lib/hooks/useMemoryProfile';
import { useBadges } from 'lib/hooks/useBadges';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2, ExternalLink, Share2 } from 'lucide-react';
import Link from 'next/link';
import BadgeCard from 'components/BadgeCard';
import { useIsSBTClaimed } from 'lib/hooks/useIsSBTClaimed';
import CongratsModal from 'components/CongratsModal';

type MintingStatus = 'idle' | 'checking' | 'minting' | 'success' | 'error';

interface MintingState {
  status: MintingStatus;
  tokenId: number | null;
  error: string | null;
  txHash: string | null;
  message: string;
}

const initialState: MintingState = {
  status: 'idle',
  tokenId: null,
  error: null,
  txHash: null,
  message: '',
};

export default function ClientHome() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: profile, isLoading, error, isSuccess } = useMemoryProfile(address);
  const { unlocked: allBadges } = useBadges(profile ?? null);
  const [mintingState, setMintingState] = useState<MintingState>(initialState);

  const tokenIds = useMemo(() => allBadges.map(b => b.id), [allBadges]);
  const { claimedStatus, refetch: refetchClaimed } = useIsSBTClaimed(tokenIds);

  const badges = useMemo(() => {
    return allBadges.map((badge, i) => ({
      ...badge,
      claimed: !!claimedStatus[i],
    }));
  }, [allBadges, claimedStatus]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);

  // Use wagmi's useSendTransaction
  const { sendTransaction, isPending, isSuccess: txSuccess, data: txData } = useSendTransaction();

  useEffect(() => {
    // Handle successful transaction
    if (txSuccess && txData && mintingState.status === 'minting') {
      const badgeMetadata = allBadges.find(b => b.id === mintingState.tokenId);
      setMintingState({
        ...initialState,
        status: 'success',
        tokenId: mintingState.tokenId,
        txHash: txData,
        message: `✅ "${badgeMetadata?.name || 'Badge'}" badge minted successfully!`,
      });
      refetchClaimed();
    }
  }, [txSuccess, txData, mintingState.status, mintingState.tokenId, allBadges, refetchClaimed]);

  useEffect(() => {
    // Cleanup minting state if user disconnects
    if (!isConnected) {
      setMintingState(initialState);
    }
  }, [isConnected]);

  const onClickMint = useCallback(async (tokenId: number) => {
    if (!address) {
      setMintingState({ ...initialState, status: 'error', error: 'Please connect your wallet first.' });
      return;
    }

    setMintingState({ ...initialState, status: 'checking', tokenId, message: 'Verifying eligibility...' });

    try {
      // Step 1: Verify eligibility and get claim parameters from the API
      const apiRes = await fetch('/api/claim-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chainId, tokenId }),
      });

      const apiData = await apiRes.json();

      if (!apiRes.ok || !apiData.success) {
        throw new Error(apiData.error || 'Eligibility check failed');
      }

      const { claimParams } = apiData;

      // Step 2: Prepare the transaction
      setMintingState({ 
        status: 'minting', 
        tokenId, 
        error: null,
        txHash: null,
        message: 'Please confirm in your wallet...' 
      });

      // Encode the function call
      const contractAddress = process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS as `0x${string}`;
      
      // Import the ABI
      const { contractAbi } = await import('@/lib/abi');
      
      // Encode the function data using viem or ethers
      const { encodeFunctionData } = await import('viem');
      
      const data = encodeFunctionData({
        abi: contractAbi,
        functionName: 'claim',
        args: [
          claimParams._receiver as `0x${string}`,
          BigInt(claimParams._quantity),
          claimParams._currency as `0x${string}`,
          BigInt(claimParams._pricePerToken),
          {
            proof: claimParams._allowlistProof.proof as `0x${string}`[],
            quantityLimitPerWallet: BigInt(claimParams._allowlistProof.quantityLimitPerWallet),
            pricePerToken: BigInt(claimParams._allowlistProof.pricePerToken),
            currency: claimParams._allowlistProof.currency as `0x${string}`,
          },
          claimParams._data as `0x${string}`,
        ],
      });

      // Step 3: Send the transaction using wagmi
      sendTransaction(
        {
          to: contractAddress,
          data: data,
          value: BigInt(0), // Adjust if there's a price
        },
        {
          onError: (err: Error) => {
            console.error('Transaction error:', err);
            let errorMessage = 'Transaction failed. Please try again.';
            if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
              errorMessage = 'You rejected the transaction in your wallet.';
            } else if (err.message?.includes('insufficient funds')) {
              errorMessage = 'You have insufficient funds to complete this transaction.';
            }
            setMintingState({ 
              ...initialState, 
              status: 'error', 
              tokenId, 
              error: errorMessage 
            });
          },
        }
      );

    } catch (err: any) {
      console.error('Minting process error:', err);
      setMintingState({ 
        ...initialState, 
        status: 'error', 
        tokenId, 
        error: err.message || 'An unknown error occurred.' 
      });
    }
  }, [address, chainId, sendTransaction]);

  const handleCongratsClose = useCallback(() => {
    setMintingState(prev => ({ ...prev, txHash: null }));
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto text-center pt-12 sm:pt-20">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          MEMORY BADGES
        </h1>
        <p className="text-xl sm:text-2xl text-gray-400 mb-8">
          Claim SBTs for your on-chain + social identity
        </p>

        <div className="flex justify-center items-center gap-4 mb-10">
          <ConnectButton />
          <Link
            href="/share"
            className="p-3 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            aria-label="Share your badges"
          >
            <Share2 className="text-purple-400" />
          </Link>
        </div>

        {mintingState.status === 'success' && mintingState.txHash && (
          <CongratsModal
            txHash={mintingState.txHash}
            onClose={handleCongratsClose}
            badgeIds={mintingState.tokenId !== null ? [mintingState.tokenId] : []}
          />
        )}

        {isConnected && address ? (
          <div className="mt-8">
            {isLoading && (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="animate-spin text-purple-400" size={48} />
                <p className="text-lg text-gray-400 mt-4">Loading your identity from Memory Protocol...</p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-900 border border-red-700 rounded-xl mb-6">
                <p className="text-red-300 font-semibold mb-2">Error loading profile</p>
                <p className="text-red-300 text-sm">{error.message}</p>
                <p className="text-red-400 text-xs mt-2">
                  Make sure you have a Memory Protocol profile at{' '}
                  <a 
                    href="https://app.memoryproto.co" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-red-300"
                  >
                    app.memoryproto.co
                  </a>
                </p>
              </div>
            )}

            {isSuccess && profile && unlockedCount === 0 && (
              <div className="py-12 text-center bg-gray-800 rounded-2xl">
                <h3 className="text-2xl font-semibold text-gray-200 mb-3">
                  No badges unlocked yet
                </h3>
                <p className="text-md text-gray-400 mb-6">
                  Link your social accounts on Memory Protocol to unlock badges.
                </p>
                <a
                  href="https://app.memoryproto.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Connect Accounts
                  <ExternalLink size={20} />
                </a>
              </div>
            )}

            {isSuccess && profile && unlockedCount > 0 && (
              <>
                <div className="mb-6 p-4 bg-gray-800 rounded-xl">
                  <p className="text-gray-300">
                    You've unlocked <span className="font-bold text-purple-400">{unlockedCount}</span> badge{unlockedCount !== 1 ? 's' : ''}!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {badges.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      claimed={!!badge.claimed}
                      onClickMint={onClickMint}
                      minting={mintingState.tokenId === badge.id && (mintingState.status === 'checking' || mintingState.status === 'minting')}
                    />
                  ))}
                </div>

                {mintingState.status === 'error' && mintingState.error && (
                  <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-xl">
                    <p className="text-md text-red-300 font-semibold mb-2">Minting Failed</p>
                    <p className="text-sm text-red-300">{mintingState.error}</p>
                  </div>
                )}

                {mintingState.message && mintingState.tokenId !== null && (
                  <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded-xl">
                    <p className="text-sm text-blue-300">{mintingState.message}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-400">Connect your wallet to view and claim your badges.</p>
          </div>
        )}
      </div>
    </main>
  );
}