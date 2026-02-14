import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Activation() {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { activateApp } = useAuth(); // We'll add this to auth context

    // Check if already logged in - if so, skip activation
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleActivation = async (e) => {
        e.preventDefault();

        if (key.length < 20) {
            toast.error('Please enter a valid activation key');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.activate(key);

            if (response.data.success) {
                toast.success('Activation key verified!');

                // Store key ID temporarily for registration
                localStorage.setItem('activation_key_id', response.data.data.key_id);
                localStorage.setItem('is_activated', 'true');

                // Redirect to registration
                setTimeout(() => {
                    router.push('/register');
                }, 1000);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid activation key';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="activation-container">
            <div className="content-box">
                <div className="icon-circle">
                    <i className="fas fa-key"></i>
                </div>

                <h1>Product Activation</h1>
                <p>Please enter your 26-digit product key to activate Email Sender Pro.</p>

                <form onSubmit={handleActivation}>
                    <div className="input-group">
                        <i className="fas fa-lock input-icon"></i>
                        <input
                            type="text"
                            className="input"
                            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                            value={key}
                            onChange={(e) => setKey(e.target.value.toUpperCase())}
                            maxLength={29}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                        {loading ? 'Verifying...' : 'Activate Product'}
                    </button>
                </form>

                <div className="help-text">
                    <p>Need a key? <a href="#" target="_blank">Purchase License</a></p>
                    <div style={{ marginTop: '12px' }}>
                        Already have an account? <Link href="/login">Login</Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .activation-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                    padding: 20px;
                }

                .content-box {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 450px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                .icon-circle {
                    width: 80px;
                    height: 80px;
                    background: #EEF2FF;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    color: var(--primary);
                    font-size: 32px;
                }

                h1 {
                    font-size: 24px;
                    margin-bottom: 12px;
                }

                p {
                    font-size: 15px;
                    margin-bottom: 32px;
                }

                .help-text {
                    margin-top: 24px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
