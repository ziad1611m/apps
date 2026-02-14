import { useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();


    // Google Sign-In is handled by the script in _app.js and the declarative HTML below

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password, remember_me: rememberMe });

            if (response.data.success) {
                const { user, token, session_token } = response.data.data;
                toast.success(`Welcome back, ${user.full_name}!`);
                login(user, token, session_token);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';

            if (error.response?.data?.data?.need_verification) {
                toast('Please verify your email first', { icon: '📧' });
                localStorage.setItem('verify_email', email);
                router.push('/verify');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="header">
                    <div className="logo">
                        <i className="fas fa-paper-plane"></i>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Login to manage your email campaigns</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <div className="input-group">
                            <i className="fas fa-envelope input-icon"></i>
                            <input
                                type="email"
                                className="input"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="input-group">
                            <i className="fas fa-lock input-icon"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        <div className="flex-between mt-2">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link href="/forgot-password" style={{ fontSize: '13px' }}>Forgot Password?</Link>
                        </div>
                    </div>



                    <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="footer-links">
                        Don't have an account? <Link href="/">Register</Link>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                    padding: 20px;
                }

                .auth-card {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: var(--shadow-xl);
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .logo {
                    width: 60px;
                    height: 60px;
                    background: #EEF2FF;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: var(--primary);
                    font-size: 24px;
                }

                .password-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                    z-index: 10;
                }

                .password-toggle:hover {
                    color: var(--primary);
                }

                .input-group {
                    position: relative;
                }

                .input {
                    padding-right: 40px !important;
                }

                .form-group {
                    margin-bottom: 20px;
                }



                .footer-links {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .flex-between {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .remember-me input {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
