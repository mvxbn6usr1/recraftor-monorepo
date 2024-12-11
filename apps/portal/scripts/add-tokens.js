const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTokensToRonStevens() {
  const userId = 'cm4hkfve700008ocxnhmd31g1';
  const tokensToAdd = 1_000_000; // 1 million tokens

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance
      const balance = await tx.tokenBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        throw new Error('No token balance found for user');
      }

      // Update balance
      const updatedBalance = await tx.tokenBalance.update({
        where: { userId },
        data: { amount: balance.amount + tokensToAdd },
      });

      // Record transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: tokensToAdd,
          operation: 'token_purchase',
          description: 'Development token allocation',
          metadata: JSON.stringify({
            type: 'development_allocation',
            purpose: 'unlimited testing',
            addedBy: 'system'
          }),
        },
      });

      return updatedBalance;
    });

    console.log(`Successfully added ${tokensToAdd} tokens to Ron Stevens' account`);
    console.log('New balance:', result.amount);
  } catch (error) {
    console.error('Failed to add tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTokensToRonStevens(); 