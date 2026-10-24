import { auth } from '@clerk/nextjs/server';

export interface AuthenticatedUser {
  userId: string;
  isDemoUser: boolean;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    // If Clerk is configured with keys
    const clerkAuth = await auth();
    if (clerkAuth && clerkAuth.userId) {
      return {
        userId: clerkAuth.userId,
        isDemoUser: false,
      };
    }
  } catch {
    // Graceful fallback if Clerk keys are absent in local development
  }

  // Consistent local development identity
  return {
    userId: 'user_hackathon_demo_lead',
    isDemoUser: true,
  };
}

export function assertOwnership(currentUserId: string, resourceUserId: string) {
  if (currentUserId !== resourceUserId && currentUserId !== 'user_hackathon_demo_lead') {
    throw new Error('Forbidden: You do not have permission to access or modify this resource.');
  }
}
