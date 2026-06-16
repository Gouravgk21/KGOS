'use server';

import { prisma } from '@/db/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { getDeterministicUuid } from '@/utils/uuid';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_EMAIL = 'kumar.gourav@kgos.ai';
const DEFAULT_NAME = 'Kumar Gourav';

const isMockClerk = 
  !process.env.CLERK_SECRET_KEY || 
  process.env.CLERK_SECRET_KEY.includes('sk_test_clerk-secret-key-2031') ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('pk_test_Y2xlcmstdGVzdC');

export async function getOrCreateProfile() {
  let clerkId = DEFAULT_USER_ID;
  let email = DEFAULT_EMAIL;
  let name = DEFAULT_NAME;

  if (!isMockClerk) {
    try {
      const user = await currentUser();
      if (user) {
        clerkId = user.id;
        email = user.emailAddresses[0]?.emailAddress || email;
        name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || name;
      }
    } catch (err) {
      console.warn('Clerk auth is not initialized or configured. Using default operating system profile.', err);
    }
  }

  const profileId = getDeterministicUuid(clerkId);

  // Upsert the profile to ensure it exists
  let profile = await prisma.profile.findUnique({
    where: { id: profileId }
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: profileId,
        email,
        name,
        mission: 'To construct world-class systems combining Agri-Food engineering (KAFS), advanced research, and structural self-mastery.',
        vision: 'A unified operational command where functionality emerges from interactions, scaling B2B enterprise value and academic authority.',
        strengths: ['Hydrocolloids formulation', 'B2B sales pipeline design', 'Research translation', 'Multi-domain scheduling'],
        weaknesses: ['Sleep debt accumulation', 'High-context multitasking overhead', 'Spasmodic personal brand distribution'],
        decisionStyle: 'Data-driven, low-frequency, high-conviction.',
        learningStyle: 'Structured academic synthesis.'
      }
    });
  }

  return profile;
}
