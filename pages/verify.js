import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export default function Verify() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        const storedEmail = localStorage.getItem('verify_email');
        if (!storedEmail) {
            router.push('/login');
            return;
        }
        setEmail(storedEmail);

        // Timer for resend cooldown
        let interval;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown, router]);

    const handleInput = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            toast.error('Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.verifyEmail({ email, code: fullCode });

            if (response.data.success) {
                const { user, token, session_token } = response.data.data;
                toast.success('Email verified successfully!');
                localStorage.removeItem('verify_email');
                login(user, token, session_token);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Verification failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await authAPI.resendCode(email);
            toast.success('Verification code resent');
            setResendCooldown(60);
        } catch (error) {
            toast.error('Failed to resend code');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="header">
                    <div className="logo">
                        <i className="fas fa-envelope-open-text"></i>
                    </div>
                    <h1>Verify Your Email</h1>
                    <p>Enter the 6-digit code sent to <br /><strong>{email}</strong></p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="code-inputs">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength={1}
                                className="code-input"
                                value={digit}
                                onChange={(e) => handleInput(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <div className="resend-container">
                        <p>Didn't receive the code?</p>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            className="btn-text text-muted"
                            onClick={() => router.push('/login')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}
                        >
                            <i className="fas fa-arrow-left mr-2"></i> Back to Login
                        </button>
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

                .code-inputs {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .code-input {
                    width: 45px;
                    height: 55px;
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--primary);
                }

                .code-input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }

                .resend-container {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .btn-link {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-weight: 500;
                    cursor: pointer;
                    margin-top: 4px;
                }

                .btn-link:disabled {
                    color: var(--text-muted);
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
