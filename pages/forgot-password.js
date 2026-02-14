import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Request, 2: Verify Code, 3: Reset Password
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.forgotPassword({ action: 'request', email });
            toast.success('Reset code sent to your email');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.forgotPassword({ action: 'verify', email, code });
            setResetToken(res.data.data.reset_token);
            toast.success('Code verified');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authAPI.forgotPassword({
                action: 'reset',
                email,
                reset_token: resetToken,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            toast.success('Password reset successfully');
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="header">
                    <h1>Reset Password</h1>
                    <p>
                        {step === 1 && 'Enter your email to receive a reset code'}
                        {step === 2 && 'Enter the verification code sent to your email'}
                        {step === 3 && 'Create a new strong password'}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequest}>
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <div className="input-group">
                                <i className="fas fa-envelope input-icon"></i>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerify}>
                        <div className="form-group">
                            <label className="label">Verification Code</label>
                            <input
                                type="text"
                                className="input text-center"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                style={{ fontSize: '24px', letterSpacing: '4px' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleReset}>
                        <div className="form-group">
                            <label className="label">New Password</label>
                            <div className="input-group">
                                <i className="fas fa-lock input-icon"></i>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Confirm Password</label>
                            <div className="input-group">
                                <i className="fas fa-lock input-icon"></i>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="footer-links">
                    <Link href="/login">Back to Login</Link>
                </div>
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

                .form-group {
                    margin-bottom: 20px;
                }

                .footer-links {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
