import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getDeterministicUuid } from '@/utils/uuid';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const userId = getDeterministicUuid(DEFAULT_USER_ID);

    // Fetch transactions from the database
    const transactions = await prisma.transaction.findMany({
      where: { userId }
    });

    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Mock threshold for testing the n8n variance alert
    const budget_limit = 250000; 

    return NextResponse.json({
      expenses,
      income,
      budget_limit,
      variance: expenses - budget_limit
    });
  } catch (err: any) {
    console.error('API Transactions Summary error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
