import { redirect } from 'next/navigation';

/**
 * Backwards compatibility redirect.
 *
 * The login page has moved to /portal/login to enable seamless
 * animations between login and dashboard within the same React tree.
 *
 * This redirect ensures existing bookmarks and links continue to work.
 */
export default async function LoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Preserve query params in the redirect
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    }
  }

  const queryString = params.toString();
  const redirectUrl = queryString
    ? `/portal/login?${queryString}`
    : '/portal/login';

  redirect(redirectUrl);
}
