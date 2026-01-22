import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const user = session.user;
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : user.email?.[0].toUpperCase() || "?";

    return (
        <div className="page-container">
            <nav className="navbar">
                <Link href="/" className="nav-brand">
                    🔐 AuthApp
                </Link>
                <div className="nav-links">
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button type="submit" className="btn btn-ghost">
                            Sign Out
                        </button>
                    </form>
                </div>
            </nav>

            <main className="dashboard animate-fade-in">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Welcome back! 👋</h1>
                    <p className="dashboard-subtitle">
                        You&apos;re signed in and viewing your protected dashboard.
                    </p>
                </div>

                <div className="profile-card">
                    <div className="avatar profile-avatar">
                        {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt={user.name || "User"} />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="profile-info">
                        <h3>{user.name || "User"}</h3>
                        <p>{user.email}</p>
                    </div>
                    <div className="profile-actions">
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}
                        >
                            <button type="submit" className="btn btn-danger">
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ marginTop: "32px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
                        Session Information
                    </h2>
                    <div
                        className="card"
                        style={{
                            background: "var(--background-tertiary)",
                            padding: "20px",
                            fontFamily: "monospace",
                            fontSize: "13px",
                            overflow: "auto"
                        }}
                    >
                        <pre style={{ margin: 0, color: "var(--foreground-secondary)" }}>
                            {JSON.stringify(session, null, 2)}
                        </pre>
                    </div>
                </div>

                <section className="features" style={{ padding: "48px 0" }}>
                    <div className="feature-card">
                        <div className="feature-icon">✅</div>
                        <h3 className="feature-title">Authenticated</h3>
                        <p className="feature-description">
                            Your session is active and you have access to protected resources.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔄</div>
                        <h3 className="feature-title">JWT Session</h3>
                        <p className="feature-description">
                            Using JWT strategy for edge-compatible, serverless authentication.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3 className="feature-title">Protected Route</h3>
                        <p className="feature-description">
                            This page is protected by middleware and requires authentication.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
