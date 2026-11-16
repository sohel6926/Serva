import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth, type UserRole } from '../../context/AuthContext.tsx';
import { Link, useRouter } from '../../lib/router.tsx';
import { LoadingScreen } from '../common/LoadingScreen.tsx';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const { pathname } = useRouter();

  if (loading) {
    return <LoadingScreen message="Checking account access..." />;
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-12 px-4">
        <div className="serva-card p-8 text-center">
          <h1 className="text-2xl font-bold text-[#0A1F5C] mb-2">Sign in required</h1>
          <p className="text-[#5B6B8C] mb-6">
            Please sign in with your SERVA account to open this page.
          </p>
          <Link to={`/login?next=${encodeURIComponent(pathname)}`} className="serva-pill-btn">
            Go to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-lg mx-auto my-12 px-4">
        <div className="serva-card p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-wide mb-1">
            403 · Access Denied
          </p>
          <h1 className="text-2xl font-bold text-[#0A1F5C] mb-2">
            You do not have permission to view this page
          </h1>
          <p className="text-sm text-[#5B6B8C] mb-6">
            Signed in as <span className="font-semibold text-[#0A1F5C]">{user.name}</span> ({user.role}).
            Required role: {allowedRoles.join(' or ')}.
          </p>
          <Link to="/" className="serva-pill-btn">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
