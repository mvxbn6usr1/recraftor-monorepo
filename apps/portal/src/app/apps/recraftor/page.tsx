import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { RecraftorClient } from './recraftor-client';

if (!process.env.RECRAFTOR_URL) {
  throw new Error('RECRAFTOR_URL environment variable is not set');
}

export default async function RecraftorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <RecraftorClient 
      userId={session.user.id} 
      recraftorUrl={process.env.RECRAFTOR_URL} 
    />
  );
} 