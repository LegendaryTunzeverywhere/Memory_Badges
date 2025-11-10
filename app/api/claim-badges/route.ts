// app/api/claim-badges/route.ts
import { NextResponse } from 'next/server';
import { createThirdwebClient } from "thirdweb";
import { getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { BADGES_METADATA } from '@/lib/badges';
import { memoryAPI } from '@/lib/memory';

// Rate limiting map (in production, use Redis or similar)
const claimAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 claims per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(address: string): boolean {
  const now = Date.now();
  const userAttempts = claimAttempts.get(address);

  if (!userAttempts || now > userAttempts.resetAt) {
    claimAttempts.set(address, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userAttempts.count >= RATE_LIMIT) {
    return false;
  }

  userAttempts.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const { address, chainId, tokenId } = await request.json();

    // Validation
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid address' },
        { status: 400 }
      );
    }

    if (!chainId || typeof chainId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid chainId' },
        { status: 400 }
      );
    }

    if (tokenId === undefined || typeof tokenId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid tokenId' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(address.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Environment variables check
    if (!process.env.THIRDWEB_SECRET_KEY) {
      throw new Error('Missing Thirdweb secret key');
    }

    if (!process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS) {
      throw new Error('Missing SBT contract address');
    }

    // Find badge metadata
    const badgeMetadata = BADGES_METADATA.find(b => b.id === tokenId);
    if (!badgeMetadata) {
      return NextResponse.json(
        { success: false, error: 'Invalid badge ID' },
        { status: 400 }
      );
    }

    // Fetch user's Memory Protocol profile
    console.log(`Fetching profile for ${address}...`);
    const profile = await memoryAPI.getProfile(address);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Unable to fetch user profile. Please ensure you have a Memory Protocol profile.' },
        { status: 400 }
      );
    }

    // Check if user is eligible for this badge
    const isEligible = badgeMetadata.check(profile);
    if (!isEligible) {
      return NextResponse.json(
        { 
          success: false, 
          error: `You are not eligible for the "${badgeMetadata.name}" badge. ${badgeMetadata.description}` 
        },
        { status: 403 }
      );
    }

    console.log(`User ${address} is eligible for badge ${tokenId}`);

    // Initialize Thirdweb client
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });

    // Get the contract
    const chain = defineChain(chainId);
    const contract = getContract({
      client,
      chain,
      address: process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS,
    });

    // Check if the user has already claimed this badge by checking the owner of the token
    try {
      const owner = await readContract({
        contract,
        method: "function ownerOf(uint256) view returns (address)",
        params: [BigInt(tokenId)],
      });

      // If the owner is the same as the address, they have already claimed it
      if (owner.toLowerCase() === address.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'You have already claimed this badge.' },
          { status: 409 } // 409 Conflict
        );
      }
    } catch (error) {
      // If ownerOf reverts, it's likely because the token has not been minted.
      // This is the expected case for a valid claim, so we can ignore the error and proceed.
      console.log(`ownerOf check for tokenId ${tokenId} failed. Assuming token is not yet claimed.`);
    }

    console.log(`User ${address} is eligible and has not claimed badge ${tokenId}. Preparing parameters...`);

    // Prepare the parameters for the frontend
    const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const claimParams = {
      _receiver: address,
      _quantity: '1', // Using string for BigInt serialization
      _currency: NATIVE_TOKEN_ADDRESS,
      _pricePerToken: '0', // Using string for BigInt serialization
      _allowlistProof: {
        proof: [],
        quantityLimitPerWallet: '0', // Using string for BigInt serialization
        pricePerToken: '0', // Using string for BigInt serialization
        currency: NATIVE_TOKEN_ADDRESS,
      },
      _data: `0x${tokenId.toString(16).padStart(64, '0')}`,
    };

    return NextResponse.json({
      success: true,
      badgeName: badgeMetadata.name,
      tokenId: tokenId,
      claimParams: claimParams,
    });
  } catch (error: any) {
    console.error('Claim error:', error);
    
    let errorMessage = error.message || 'Failed to mint badge';
    
    // Handle specific error cases
    if (error.message?.includes('Rate limit')) {
      errorMessage = 'You have made too many claim attempts. Please try again later.';
    } else if (error.message?.includes('not eligible')) {
      errorMessage = error.message;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Transaction is taking longer than expected. The badge may still be minting. Please check back in a few minutes.';
    } else if (error.message?.includes('insufficient funds')) {
      errorMessage = 'The minting wallet has insufficient funds. Please contact support.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
