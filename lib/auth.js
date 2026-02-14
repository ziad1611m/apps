import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { userAPI } from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user_data');
        const isActivated = localStorage.getItem('is_activated');

        // Check if app is activated first
        if (!isActivated && router.pathname !== '/') {
            router.push('/');
            setLoading(false);
            return;
        }

        if (token) {
            try {
                // Determine if we should fetch fresh profile
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }

                // Verify token by fetching profile
                const response = await userAPI.getProfile();
                setUser(response.data.data.user);
                localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
            } catch (error) {
                console.error('Auth check failed:', error);
                // Token invalid
                logout(false); // Don't redirect, let intercepted handle it or stay on page
            }
        }
        setLoading(false);
    };

    const login = (userData, token, sessionToken) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = async (redirect = true) => {
        try {
            await userAPI.logout();
        } catch (e) {
            // Ignore error
        }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_data');
        setUser(null);

        if (redirect) {
            router.push('/login');
        }
    };

    const activateApp = () => {
        localStorage.setItem('is_activated', 'true');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, activateApp, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

// Higher order component for protected routes
export function withAuth(Component) {
    return function ProtectedRoute(props) {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.push('/login');
            }
        }, [loading, user, router]);

        if (loading || !user) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner"></div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}
