export function getInitials(name: string | null | undefined, email: string | undefined): string {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}
