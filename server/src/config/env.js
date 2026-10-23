// On Vercel we always behave like production, even if NODE_ENV was copied over as "development".
export const isProd = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
