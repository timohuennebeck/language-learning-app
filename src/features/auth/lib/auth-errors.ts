/** Maps Supabase Auth error messages to i18n keys under `auth.errors`. */
export function authErrorKey(error: unknown): string {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  if (message.includes('invalid login credentials')) return 'auth.errors.invalidCredentials';
  if (message.includes('already registered') || message.includes('already been registered'))
    return 'auth.errors.emailTaken';
  if (message.includes('password')) return 'auth.errors.weakPassword';
  if (message.includes('email')) return 'auth.errors.invalidEmail';
  if (message.includes('network') || message.includes('fetch')) return 'auth.errors.offline';
  return 'auth.errors.generic';
}
