export function getCurrentDomain(): string {
  return window.location.hostname;
}

export function getSubdomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) {
    return 'default';
  }

  return parts[0];
}
