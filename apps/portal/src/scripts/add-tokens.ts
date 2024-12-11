import { TokenService } from '@/lib/token-service';

async function addTokensToRonStevens() {
  const userId = 'cm4hkfve700008ocxnhmd31g1';
  const tokensToAdd = 1_000_000; // 1 million tokens

  try {
    const updatedBalance = await TokenService.addTokens(
      userId,
      tokensToAdd,
      'Development token allocation',
      {
        type: 'development_allocation',
        purpose: 'unlimited testing',
        addedBy: 'system'
      }
    );

    console.log(`Successfully added ${tokensToAdd} tokens to Ron Stevens' account`);
    console.log('New balance:', updatedBalance.amount);
  } catch (error) {
    console.error('Failed to add tokens:', error);
  }
}

addTokensToRonStevens(); 