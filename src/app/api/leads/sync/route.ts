import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getDeterministicUuid } from '@/utils/uuid';
import { serializeBigInt } from '@/utils/serialize';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, contactPerson, email, phone, productInterest, status, opportunityValue, industry } = body;

    if (!companyName || !contactPerson) {
      return NextResponse.json({ error: 'Missing required fields: companyName, contactPerson' }, { status: 400 });
    }

    const userId = getDeterministicUuid(DEFAULT_USER_ID);

    // Ensure the profile exists in PostgreSQL
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    if (!profile) {
      await prisma.profile.create({
        data: {
          id: userId,
          email: 'kumar.gourav@kgos.ai',
          name: 'Kumar Gourav',
          mission: 'To construct world-class systems combining Agri-Food engineering (KAFS), advanced research, and structural self-mastery.',
          vision: 'A unified operational command where functionality emerges from interactions, scaling B2B enterprise value and academic authority.',
          strengths: ['Hydrocolloids formulation', 'B2B sales pipeline design', 'Research translation', 'Multi-domain scheduling'],
          weaknesses: ['Sleep debt accumulation', 'High-context multitasking overhead', 'Spasmodic personal brand distribution'],
          decisionStyle: 'Data-driven, low-frequency, high-conviction.',
          learningStyle: 'Structured academic synthesis.'
        }
      });
    }

    const lead = await prisma.lead.create({
      data: {
        userId,
        companyName,
        contactPerson,
        email: email || null,
        phone: phone || null,
        productInterest: productInterest || null,
        status: status || 'Lead',
        opportunityValue: opportunityValue ? parseFloat(opportunityValue) : 0.00,
        industry: industry || null
      }
    });

    return NextResponse.json({
      success: true,
      lead: serializeBigInt(lead)
    });
  } catch (err: any) {
    console.error('API Lead Sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
