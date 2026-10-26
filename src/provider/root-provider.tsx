import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { auth } from '@/auth';

import { HeaderTitleProvider } from './_header-title-provider';
import { PostHogProvider } from './_posthog-provider';
import ReactQueryProvider from './_react-query-provider';

interface RootProviderProps {
  children: React.ReactNode;
}

export default async function RootProvider({ children }: RootProviderProps) {
  const messages = await getMessages();

  // Try to get the session, but don't fail if it's not available
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error('Error getting session:', error);
    session = null;
  }

  return (
    <PostHogProvider>
      <NextIntlClientProvider messages={messages}>
        <ReactQueryProvider>
          <SessionProvider session={session}>
            <NuqsAdapter>
              <HeaderTitleProvider>{children}</HeaderTitleProvider>
            </NuqsAdapter>
          </SessionProvider>
        </ReactQueryProvider>
      </NextIntlClientProvider>
    </PostHogProvider>
  );
}
