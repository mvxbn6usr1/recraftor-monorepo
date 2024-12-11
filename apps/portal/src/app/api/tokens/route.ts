import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { 
  TokenService, 
  InsufficientTokensError, 
  InvalidOperationError, 
  TOKEN_COSTS,
  OPERATION_CATEGORIES,
  OperationType
} from '@/lib/token-service';
import { authOptions } from '@/lib/auth';

const ALLOWED_ORIGIN = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5173'
  : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return corsHeaders(NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    ));
  }

  try {
    const balance = await TokenService.getBalance(session.user.id);
    const history = await TokenService.getTransactionHistory(session.user.id);

    return corsHeaders(NextResponse.json({ 
      balance, 
      history,
      operations: {
        costs: TOKEN_COSTS,
        categories: OPERATION_CATEGORIES
      }
    }));
  } catch (error) {
    console.error('Error fetching token data:', error);
    return corsHeaders(NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }));
  }
}

interface TokenRequest {
  operation: OperationType;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return corsHeaders(NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    ));
  }

  try {
    const body = await request.json() as TokenRequest;
    const { operation, metadata } = body;

    console.log('Token deduction request:', {
      userId: session.user.id,
      operation,
      metadata
    });

    // Validate operation before proceeding
    if (!operation) {
      return corsHeaders(NextResponse.json({
        error: 'Missing operation',
        code: 'MISSING_OPERATION',
        validOperations: Object.keys(TOKEN_COSTS),
        categories: OPERATION_CATEGORIES
      }, { status: 400 }));
    }

    // Get current balance for logging
    const currentBalance = await TokenService.getBalance(session.user.id);
    console.log('Current balance:', currentBalance);

    const result = await TokenService.deductTokens(
      session.user.id,
      operation,
      metadata
    );

    console.log('Token deduction successful:', {
      userId: session.user.id,
      operation,
      previousBalance: currentBalance,
      newBalance: result.amount,
      cost: TOKEN_COSTS[operation]
    });

    return corsHeaders(NextResponse.json({
      success: true,
      balance: result.amount,
      operation,
      originalOperation: metadata?.originalOperation,
      cost: TOKEN_COSTS[operation]
    }));
  } catch (error) {
    console.error('Error processing token operation:', error);

    if (error instanceof InsufficientTokensError) {
      return corsHeaders(NextResponse.json({
        error: error.message,
        code: 'INSUFFICIENT_TOKENS'
      }, { status: 402 }));
    }

    if (error instanceof InvalidOperationError) {
      return corsHeaders(NextResponse.json({
        error: error.message,
        code: 'INVALID_OPERATION',
        validOperations: Object.keys(TOKEN_COSTS)
      }, { status: 400 }));
    }

    return corsHeaders(NextResponse.json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }));
  }
}

// Handle token purchases
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, description, metadata } = body;

    if (!amount || amount <= 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    const result = await TokenService.addTokens(
      session.user.id,
      amount,
      description,
      metadata
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing token purchase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 