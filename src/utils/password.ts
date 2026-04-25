// Password policy: 8 chars min, at least one lowercase, uppercase, and digit.
// Mirrors the Supabase Cloud config (minimum_password_length=8 +
// password_requirements="lower_upper_letters_digits") so the client rejects
// weak passwords with a clear message before the auth call round-trip.
const MIN_LENGTH = 8;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export function isPasswordStrong(password: string): boolean {
  return password.length >= MIN_LENGTH && PASSWORD_PATTERN.test(password);
}
