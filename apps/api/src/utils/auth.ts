import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index';
import { session, user, verification, account } from 'src/db/schema';

const getCookieDomain = () => {
  const url = process.env.WEB_URL;
  if (!url) return undefined;
  try {
    const hostname = new URL(url).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return undefined;
    return `.${hostname.replace(/^www\./, '')}`;
  } catch {
    return undefined;
  }
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      verification,
      session,
      account,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: ['user', 'admin', 'superadmin'],
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.WEB_URL!],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: getCookieDomain(),
    },
    database: {
      generateId: false,
    },
  },
});

