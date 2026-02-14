import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

export default function Sidebar() {
    const router = useRouter();
    const { logout } = useAuth();

    const menuItems = [
        { icon: 'fas fa-chart-pie', label: 'Dashboard', path: '/dashboard' },
        { icon: 'fas fa-paper-plane', label: 'Send Emails', path: '/dashboard/send' },
        { icon: 'fas fa-envelope', label: 'Email Accounts', path: '/dashboard/email-accounts' },
        { icon: 'fas fa-file-code', label: 'Templates', path: '/dashboard/templates' },

        { icon: 'fas fa-user', label: 'Profile', path: '/dashboard/profile' },
        { icon: 'fas fa-book', label: 'How to Use', path: '/dashboard/guide' },
        { icon: 'fas fa-headset', label: 'Support', path: '/dashboard/support' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-main">
                        <i className="fas fa-envelope-open-text logo-icon"></i>
                        <span className="logo-text">Email Sender</span>
                    </div>
                    <small className="logo-tagline">Pro Panel v1.0</small>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => {
                        const isActive = item.path === '/dashboard'
                            ? router.pathname === '/dashboard'
                            : router.pathname.startsWith(item.path);

                        return (
                            <li className="nav-item" key={item.path}>
                                <Link href={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                                    <i className={`${item.icon} nav-icon`}></i>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <button onClick={() => logout()} className="logout-btn">
                    <i className="fas fa-sign-out-alt nav-icon"></i>
                    <span className="nav-label">Logout</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="version-info">
                    <small>Version 1.0.0</small>
                </div>
            </div>

            <style jsx global>{`
                .sidebar {
                    width: 260px;
                    background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    z-index: 1000;
                    color: white;
                }

                .sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .logo-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0px;
                }

                .logo-main {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-icon {
                    font-size: 18px;
                }

                .logo-text {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                }

                .logo-tagline {
                    font-size: 12px;
                    opacity: 0.7;
                }

                .sidebar-nav {
                    padding: 15px 10px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }

                .nav-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .sidebar .nav-item {
                    margin-bottom: 5px;
                }

                .sidebar .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7) !important;
                    transition: all 0.3s ease;
                    text-decoration: none !important;
                    font-size: 14px;
                    cursor: pointer;
                }

                .sidebar .nav-link:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1);
                }

                .sidebar .nav-link.active {
                    color: white !important;
                    background: #4F46E5 !important;
                }
                
                .sidebar .nav-icon {
                    width: 20px;
                    text-align: center;
                    font-size: 15px;
                }

                .logout-btn {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    transition: all 0.3s ease;
                    font-size: 14px;
                    cursor: pointer;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: 100%;
                    text-align: left;
                }

                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.3);
                }

                .sidebar-footer {
                    padding: 15px;
                    text-align: center;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0,0,0,0.1);
                }

                .version-info {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                }
            `}</style>
        </div>
    );
}
