import { useAuth } from '../lib/auth';

export default function Layout({ children }) {
    return (
        <div className="layout">
            <main className="main-content">
                {children}
            </main>

            <style jsx>{`
                .layout {
                    min-height: 100vh;
                    background: var(--background);
                }

                .main-content {
                    width: 100%;
                    min-height: 100vh;
                }
            `}</style>
        </div>
    );
}
