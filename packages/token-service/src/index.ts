import { prisma } from '@/lib/prisma';

export class InsufficientTokensError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientTokensError';
  }
}

export class InvalidOperationError extends Error {
  constructor(operation: string) {
    super(`Invalid operation: ${operation}`);
    this.name = 'InvalidOperationError';
  }
}

// Token costs based on the pricing structure
export const TOKEN_COSTS = {
  // Image Generation
  raster_generation: 4,
  vector_generation: 8,
  
  // Image Processing
  vectorization: 4,
  background_removal: 4,
  clarity_upscale: 4,
  generative_upscale: 80,
  
  // Style Operations
  style_creation: 4,
  
  // Special Operations
  vector_illustration: 8, // Same cost as vector_generation
} as const;

// Operation categories for better organization
export const OPERATION_CATEGORIES = {
  GENERATION: ['raster_generation', 'vector_generation', 'vector_illustration'],
  PROCESSING: ['vectorization', 'background_removal', 'clarity_upscale', 'generative_upscale'],
  STYLE: ['style_creation'],
} as const;

export type OperationType = keyof typeof TOKEN_COSTS;

function isValidOperation(operation: string): operation is OperationType {
  return operation in TOKEN_COSTS;
}

function getOperationCategory(operation: OperationType): string {
  for (const [category, operations] of Object.entries(OPERATION_CATEGORIES)) {
    if (operations.includes(operation)) {
      return category;
    }
  }
  return 'UNKNOWN';
}

export class TokenService {
  static async getBalance(userId: string) {
    let balance = await prisma.tokenBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      balance = await TokenService.createBalance(userId, 'hobby');
    }

    return balance.amount;
  }

  static async createBalance(userId: string, plan: string) {
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const initialTokens = {
      hobby: 100,
      creator: 300,
      professional: 800,
      enterprise: 0, // Custom amount to be set manually
    }[plan] ?? 0;

    return prisma.tokenBalance.create({
      data: {
        userId,
        amount: initialTokens,
        plan,
        renewalDate,
      },
    });
  }

  static async deductTokens(
    userId: string, 
    operation: OperationType,
    metadata?: Record<string, any>
  ) {
    // Validate operation
    if (!isValidOperation(operation)) {
      throw new InvalidOperationError(operation);
    }

    const cost = TOKEN_COSTS[operation];
    const category = getOperationCategory(operation);

    try {
      // First, ensure the user has a balance
      let balance = await prisma.tokenBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        balance = await TokenService.createBalance(userId, 'hobby');
      }

      return await prisma.$transaction(async (tx) => {
        // Get the latest balance within the transaction
        const currentBalance = await tx.tokenBalance.findUnique({
          where: { userId },
        });

        if (!currentBalance) {
          throw new Error('Token balance not found');
        }

        if (currentBalance.amount < cost) {
          throw new InsufficientTokensError(
            `Insufficient tokens for ${operation}. Required: ${cost}, Available: ${currentBalance.amount}`
          );
        }

        // Update balance
        const updatedBalance = await tx.tokenBalance.update({
          where: { userId },
          data: { amount: currentBalance.amount - cost },
        });

        // Record transaction with enhanced metadata
        await tx.tokenTransaction.create({
          data: {
            userId,
            amount: -cost,
            operation,
            description: `Used ${cost} tokens for ${operation.replace(/_/g, ' ')}`,
            metadata: JSON.stringify({
              ...metadata,
              category,
              cost,
              operationType: operation
            }),
          },
        });

        return updatedBalance;
      });
    } catch (error) {
      // Re-throw known errors
      if (error instanceof InsufficientTokensError || error instanceof InvalidOperationError) {
        throw error;
      }

      // Log unknown errors
      console.error('Error in deductTokens:', error);
      throw new Error('Failed to process token operation');
    }
  }

  static async addTokens(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ) {
    return prisma.$transaction(async (tx) => {
      const balance = await tx.tokenBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        throw new Error('No token balance found for user');
      }

      // Update balance
      const updatedBalance = await tx.tokenBalance.update({
        where: { userId },
        data: { amount: balance.amount + amount },
      });

      // Record transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount,
          operation: 'token_purchase',
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return updatedBalance;
    });
  }

  static async getTransactionHistory(userId: string, limit = 10) {
    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map(tx => ({
      ...tx,
      metadata: tx.metadata ? JSON.parse(tx.metadata) : null,
    }));
  }

  static async handleRenewal(userId: string) {
    const balance = await prisma.tokenBalance.findUnique({
      where: { userId },
      select: { plan: true, amount: true, renewalDate: true },
    });

    if (!balance || new Date() < balance.renewalDate) {
      return null;
    }

    const monthlyTokens = {
      hobby: 100,
      creator: 300,
      professional: 800,
    }[balance.plan] ?? 0;

    // For professional plan, allow 50% token rollover
    let newAmount = monthlyTokens;
    if (balance.plan === 'professional') {
      const rolloverAmount = Math.floor(balance.amount * 0.5);
      newAmount += rolloverAmount;
    }

    const nextRenewal = new Date(balance.renewalDate);
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);

    return prisma.$transaction(async (tx) => {
      // Update balance
      const updatedBalance = await tx.tokenBalance.update({
        where: { userId },
        data: {
          amount: newAmount,
          renewalDate: nextRenewal,
        },
      });

      // Record renewal transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: newAmount,
          operation: 'monthly_renewal',
          description: `Monthly token renewal for ${balance.plan} plan`,
        },
      });

      return updatedBalance;
    });
  }
} 