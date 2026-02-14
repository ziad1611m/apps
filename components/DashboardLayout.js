import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../lib/auth';
import { useLanguage } from '../lib/LanguageContext';
import { useRouter } from 'next/router';
import { userAPI } from '../lib/api';

export default function DashboardLayout({ children, title, icon }) {
    const { user, logout } = useAuth();
    const { language, isRTL, toggleLanguage, t } = useLanguage();
    const router = useRouter();
    const [contextMenu, setContextMenu] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications on mount and every minute
    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await userAPI.getNotifications();
            if (res.data.success) {
                setNotifications(res.data.data.notifications || []);
                setUnreadCount(res.data.data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await userAPI.clearNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to clear notifications', error);
        }
    };

    const handleDeleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await userAPI.deleteNotification(id);
            const newNotifs = notifications.filter(n => n.id !== id);
            setNotifications(newNotifs);
            if (newNotifs.length < notifications.length) {
                fetchNotifications(); // Refresh count
            }
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    useEffect(() => {
        const handleContextMenu = (e) => {
            if (e.target.closest('.dashboard-layout')) {
                e.preventDefault();
                const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
                const selectedText = window.getSelection().toString().trim();
                const isTextSelected = selectedText.length > 0;

                // Only show menu if there's something to show
                if (isTextSelected || isInput) {
                    setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        isInput: isInput,
                        isTextSelected: isTextSelected,
                        selectedText: selectedText,
                        target: e.target
                    });
                }
            }
        };

        const handleClick = () => setContextMenu((prev) => ({ ...prev, visible: false }));

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const handlePaste = async () => {
        if (contextMenu.target) {
            try {
                const text = await navigator.clipboard.readText();
                const start = contextMenu.target.selectionStart;
                const end = contextMenu.target.selectionEnd;
                const value = contextMenu.target.value;

                contextMenu.target.value = value.substring(0, start) + text + value.substring(end);

                // Trigger change event for React state updates
                const event = new Event('input', { bubbles: true });
                contextMenu.target.dispatchEvent(event);

                // Move cursor
                contextMenu.target.selectionStart = contextMenu.target.selectionEnd = start + text.length;
                contextMenu.target.focus();
            } catch (err) {
                console.error('Failed to read clipboard', err);
            }
        }
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleCopy = async () => {
        // Use stored text if available, fallback to current selection
        const textToCopy = contextMenu.selectedText || window.getSelection().toString();

        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
            } catch (err) {
                console.error('Failed to copy text', err);
            }
        }
        setContextMenu({ ...contextMenu, visible: false });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header className="top-header">
                    <div className="page-title">
                        <i className={icon}></i>
                        <h1>{title}</h1>
                    </div>

                    <div className="header-actions">
                        {/* Notifications */}
                        <div className="notification-container">
                            <button
                                className={`icon-btn notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <i className="fas fa-bell"></i>
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown animate-fade-in">
                                    <div className="notification-header">
                                        <span>Notifications</span>
                                        {notifications.length > 0 && (
                                            <button className="clear-btn" onClick={handleClearAll}>
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="no-notifications">
                                                <div className="empty-state-icon">
                                                    <i className="far fa-bell"></i>
                                                </div>
                                                <p>No new notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif, idx) => (
                                                <div key={notif.id || idx} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                                                    <div className={`notification-icon ${notif.type}`}>
                                                        <i className={`fas ${notif.type === 'success' ? 'fa-check' : notif.type === 'warning' ? 'fa-exclamation' : notif.type === 'error' ? 'fa-times' : 'fa-info'}`}></i>
                                                    </div>
                                                    <div className="notification-content">
                                                        <p>{notif.message}</p>
                                                        <small>{new Date(notif.created_at).toLocaleString()}</small>
                                                    </div>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-profile-container">
                            <div className="user-info">
                                <span className="user-name">{user?.full_name}</span>
                                <span className="user-role">Admin</span>
                            </div>
                            <div className="profile-avatar-placeholder">
                                {user?.full_name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Custom Context Menu */}
            {contextMenu && contextMenu.visible && (contextMenu.isTextSelected || contextMenu.isInput) && (
                <div
                    className="context-menu animate-scale-in"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    {contextMenu.isTextSelected && (
                        <div className="menu-item" onClick={handleCopy}>
                            <i className="fas fa-copy"></i>
                            <span>Copy</span>
                        </div>
                    )}
                    {contextMenu.isInput && (
                        <div className="menu-item" onClick={handlePaste}>
                            <i className="fas fa-paste"></i>
                            <span>Paste</span>
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
                /* Layout Styles */
                .dashboard-layout {
                    display: flex;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .main-content {
                    flex: 1;
                    margin-left: 260px;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    transition: margin-left 0.3s ease;
                }

                .top-header {
                    height: 70px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .page-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .page-title i {
                    font-size: 20px;
                    color: var(--primary);
                    background: rgba(79, 70, 229, 0.1);
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }

                .page-title h1 {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }

                .content-area {
                    padding: 32px;
                    flex: 1;
                    max-width: 1600px;
                    margin: 0 auto;
                    width: 100%;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .user-profile-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px 12px;
                    border-radius: 12px;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .user-profile-container:hover {
                    background: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .user-info {
                    text-align: right;
                }

                .user-name {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .user-role {
                    display: block;
                    font-size: 11px;
                    color: var(--text-secondary);
                    margin-top: 2px;
                }

                .profile-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    object-fit: cover;
                    border: 2px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .profile-avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                    border: 2px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                /* Context Menu */
                .context-menu {
                    position: absolute;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    min-width: 220px;
                    z-index: 9999;
                    padding: 8px;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .profile-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 10px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    width: 200px;
                    padding: 8px;
                    border: 1px solid var(--border);
                    animation: slideDown 0.2s ease;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-item, .menu-item {
                    padding: 12px 18px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    color: var(--text-primary);
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.2s;
                    font-size: 15px;
                    font-weight: 600;
                }

                .dropdown-item i, .menu-item i {
                    font-size: 18px;
                    color: var(--primary);
                    width: 24px;
                    text-align: center;
                }

                .dropdown-item:hover, .menu-item:hover {
                    background: var(--surface-hover);
                    color: var(--primary);
                    transform: translateX(3px);
                }

                .dropdown-item:hover {
                    background: var(--surface-hover);
                    color: var(--primary);
                }

                .dropdown-item.text-danger:hover {
                    background: #FEF2F2;
                    color: #EF4444;
                }

                .page-content {
                    padding: 25px;
                    flex: 1;
                }

                /* Notification Styles */
                .notification-container {
                    position: relative;
                }

                .notification-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    background: white;
                    color: var(--text-secondary);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    box-shadow: var(--shadow-sm);
                }

                .notification-btn:hover, .notification-btn.active {
                    background: var(--surface-hover);
                    color: var(--primary);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .notification-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #EF4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                }

                .notification-dropdown {
                    position: absolute;
                    top: 120%;
                    right: -10px;
                    width: 320px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
                    border: 1px solid var(--border);
                    z-index: 100;
                    animation: slideDown 0.2s ease;
                    overflow: hidden;
                }

                .notification-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                    background: #f8fafc;
                }

                .clear-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 12px;
                    cursor: pointer;
                }

                .clear-btn:hover {
                    color: #EF4444;
                }

                .notification-list {
                    max-height: 350px;
                    overflow-y: auto;
                }

                .notification-item {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    transition: background 0.2s;
                    position: relative;
                }

                .notification-item:hover {
                    background: var(--surface-hover);
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(79, 70, 229, 0.1);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-content p {
                    margin: 0 0 4px;
                    font-size: 13px;
                    color: var(--text-primary);
                    line-height: 1.4;
                }

                .notification-content small {
                    display: block;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .delete-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    opacity: 0;
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 4px;
                }

                .notification-item:hover .delete-btn {
                    opacity: 1;
                }

                .delete-btn:hover {
                    color: #EF4444;
                }

                .no-notifications {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .no-notifications i {
                    font-size: 32px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
}
