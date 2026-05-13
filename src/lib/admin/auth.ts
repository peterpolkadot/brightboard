const BUILT_IN_ADMINS = ['peterpolkadot@gmail.com']

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = [
    ...BUILT_IN_ADMINS,
    ...(process.env.ADMIN_EMAILS ?? '').split(','),
  ].map(e => e.trim().toLowerCase()).filter(Boolean)

  return adminEmails.includes(email.toLowerCase())
}
