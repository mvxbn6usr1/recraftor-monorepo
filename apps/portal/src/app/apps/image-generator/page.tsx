import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { RecraftorClient } from './recraftor-client';
import { Header } from '@/components/layout/header';

export default async function ImageGeneratorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header translucent />
      <main className="flex-1 pt-20">
        <RecraftorClient userId={session.user.id} />
      </main>
    </div>
  );
}
