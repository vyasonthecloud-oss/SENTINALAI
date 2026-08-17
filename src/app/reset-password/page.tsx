import { redirect } from 'next/navigation';

export default async function ResetPasswordFallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = await searchParams;
  if (resolvedParams.token) {
    redirect(`/reset-password/${encodeURIComponent(resolvedParams.token)}`);
  } else {
    redirect('/forgot-password');
  }
}
