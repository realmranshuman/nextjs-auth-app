import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="page-container">
      <nav className="navbar">
        <Link href="/" className="nav-brand">
          🔐 AuthApp
        </Link>
        <div className="nav-links">
          {session ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn btn-ghost">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Secure Authentication <span>Made Simple</span>
          </h1>
          <p className="hero-description">
            A modern, full-featured authentication system built with Next.js 15,
            Auth.js v5, and Prisma. Supports credentials login, OAuth providers,
            and session management out of the box.
          </p>
          <div className="hero-buttons">
            {session ? (
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className="btn btn-primary">
                  Create Account
                </Link>
                <Link href="/auth/signin" className="btn btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature-card animate-fade-in">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Secure by Default</h3>
          <p className="feature-description">
            Built-in password hashing with bcrypt, JWT tokens, and CSRF protection
            to keep your users safe.
          </p>
        </div>
        <div className="feature-card animate-fade-in">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">Edge Compatible</h3>
          <p className="feature-description">
            JWT session strategy enables serverless and edge deployments
            with Vercel, Cloudflare, and more.
          </p>
        </div>
        <div className="feature-card animate-fade-in">
          <div className="feature-icon">🐙</div>
          <h3 className="feature-title">OAuth Ready</h3>
          <p className="feature-description">
            Pre-configured GitHub OAuth support. Easily add Google, Discord,
            and 50+ other providers.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>Built with Next.js 15, Auth.js v5, Prisma & PostgreSQL</p>
      </footer>
    </div>
  );
}
