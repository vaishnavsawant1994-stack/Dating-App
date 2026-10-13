import { redirect } from 'next/navigation';

export default function ProtectedAdminLayout() {
  // Stage 0 deliberately has no staff-session implementation. Until the dedicated
  // internal auth boundary exists, every protected route fails closed.
  redirect('/login?reason=admin-auth-required');
}
