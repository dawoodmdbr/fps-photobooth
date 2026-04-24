import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { signInWithGoogle, authError, loading } = useAuth();

  return (
    <div className="login-root">
      {/* Decorative background */}
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
        <div className="login-grid" />
      </div>

      <div className="login-card">
        {/* Logo placeholder */}
        <div className="login-logo-wrap">
          <div className="login-logo-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="var(--blue-500)" />
              <circle cx="24" cy="24" r="10" stroke="white" strokeWidth="2.5" />
              <circle cx="24" cy="24" r="5" fill="white" />
              <rect x="10" y="13" width="8" height="5" rx="2" fill="white" opacity="0.6" />
            </svg>
          </div>
          <div className="login-brand">
            <h1 className="login-brand-title">FPS Photobooth</h1>
            <p className="login-brand-sub">Fast Photography Society</p>
          </div>
        </div>

        <div className="login-divider" />

        <div className="login-body">
          <h2 className="login-headline">Access Your Photo</h2>
          <p className="login-desc">
            Sign in with your university email to view and download your official photograph.
          </p>

          {authError && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {authError}
            </div>
          )}

          <button
            className="login-btn"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </button>

          <p className="login-hint">Use your <strong>@cfd.nu.edu.pk</strong> university email</p>
        </div>
      </div>

      <p className="login-footer">FAST National University · Faisalabad Campus</p>
    </div>
  );
}
