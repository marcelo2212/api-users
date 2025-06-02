export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  const maskedUser = user.length <= 3 ? '***' : `${user.slice(0, 3)}***`;
  return `${maskedUser}@${domain}`;
}
