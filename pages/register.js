import { useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    // Google Sign-In handled by _app.js and declarative HTML

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        const activationKeyId = localStorage.getItem('activation_key_id');
        if (!activationKeyId) {
            toast.error('Activation key not found. Please activate first.');
            router.push('/');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                activation_key_id: activationKeyId
            };

            const response = await authAPI.register(data);

            if (response.data.success) {
                toast.success('Registration successful! Please check your email for verification code.');
                // Store email for verification step
                localStorage.setItem('verify_email', formData.email);

                // Clear activation key - it's been used
                localStorage.removeItem('activation_key_id');

                router.push('/verify');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            const details = error.response?.data?.data;

            if (details) {
                // Show first validation error
                const firstError = Object.values(details)[0];
                toast.error(firstError);
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
                        <i className="fas fa-user-plus"></i>
                    </div>
                    <h1>Create Account</h1>
                    <p>Enter your details to set up your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <div className="input-group">
                            <i className="fas fa-user input-icon"></i>
                            <input
                                type="text"
                                name="full_name"
                                className="input"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Username</label>
                        <div className="input-group">
                            <i className="fas fa-at input-icon"></i>
                            <input
                                type="text"
                                name="username"
                                className="input"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <div className="input-group">
                            <i className="fas fa-envelope input-icon"></i>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="label">Password</label>
                            <div className="input-group">
                                <i className="fas fa-lock input-icon"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
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
                        </div>
                        <div className="col">
                            <label className="label">Confirm</label>
                            <div className="input-group">
                                <i className="fas fa-lock input-icon"></i>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                >
                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>



                    <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="footer-links">
                        Already have an account? <Link href="/login">Login</Link>
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
                    max-width: 500px;
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

                .form-group {
                    margin-bottom: 20px;
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

                .row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .col {
                    flex: 1;
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
