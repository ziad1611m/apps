import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth } from '../../lib/auth';
import { emailAPI } from '../../lib/api';
import toast from 'react-hot-toast';

function EmailAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        email_address: '',
        password: '',
        provider: 'gmail',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587
    });

    // Email provider configurations
    const emailProviders = {
        gmail: { host: 'smtp.gmail.com', port: 587, label: 'Gmail' },
        yahoo: { host: 'smtp.mail.yahoo.com', port: 465, label: 'Yahoo' },
        outlook: { host: 'smtp.office365.com', port: 587, label: 'Outlook / Hotmail' },
        other: { host: '', port: 587, label: 'Other' }
    };

    const handleProviderChange = (provider) => {
        const config = emailProviders[provider];
        setFormData({
            ...formData,
            provider,
            smtp_host: config.host,
            smtp_port: config.port
        });
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const response = await emailAPI.getAccounts();
            setAccounts(response.data.data.accounts);
        } catch (error) {
            toast.error('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await emailAPI.addAccount(formData);
            toast.success('Account added successfully');
            setShowModal(false);
            setFormData({
                display_name: '',
                email_address: '',
                password: '',
                smtp_host: 'smtp.gmail.com',
                smtp_port: 587
            });
            loadAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add account');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this account?')) return;
        try {
            await emailAPI.deleteAccount(id);
            toast.success('Account deleted');
            loadAccounts();
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <DashboardLayout title="Email Accounts" icon="fas fa-envelope">
            <div className="actions-bar mb-4 text-right">
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus"></i> Add Account
                </button>
            </div>

            <div className="grid-accounts">
                {accounts.map(account => (
                    <div key={account.id} className="card account-card animate-fade-in">
                        <div className="card-header d-flex justify-between align-center">
                            <span className={`badge badge-${account.status === 'active' ? 'success' : 'warning'}`}>
                                {account.status}
                            </span>
                            <div className="dropdown">
                                <button className="btn-icon" onClick={() => handleDelete(account.id)}>
                                    <i className="fas fa-trash text-danger"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body text-center">
                            <div className="avatar mb-3 mx-auto">
                                {account.display_name.charAt(0)}
                            </div>
                            <h5>{account.display_name}</h5>
                            <p className="text-muted small">{account.email_address}</p>

                            <div className="limits mt-3">
                                <div className="progress mb-2">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${(account.emails_sent_today / account.daily_limit) * 100}%` }}
                                    ></div>
                                </div>
                                <small className="text-muted">
                                    {account.emails_sent_today} / {account.daily_limit} sent today
                                </small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Initial Empty State */}
            {!loading && accounts.length === 0 && (
                <div className="text-center py-5">
                    <p className="text-muted">No email accounts linked yet.</p>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Add Email Account</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="label">Display Name</label>
                                    <input
                                        className="input"
                                        required
                                        value={formData.display_name}
                                        onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="label">Email Address</label>
                                    <input
                                        type="email"
                                        className="input"
                                        required
                                        value={formData.email_address}
                                        onChange={e => setFormData({ ...formData, email_address: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="label">App Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <small className="text-muted">Use App Password for Gmail/Yahoo</small>
                                </div>
                                <div className="form-group mb-3">
                                    <label className="label">Email Provider</label>
                                    <div className="provider-selector">
                                        {Object.entries(emailProviders).map(([key, config]) => (
                                            <label
                                                key={key}
                                                className={`provider-option ${formData.provider === key ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="provider"
                                                    value={key}
                                                    checked={formData.provider === key}
                                                    onChange={() => handleProviderChange(key)}
                                                />
                                                <i className={`fab fa-${key === 'gmail' ? 'google' : key === 'yahoo' ? 'yahoo' : key === 'outlook' ? 'microsoft' : 'envelope'}`}></i>
                                                <span>{config.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label className="label">SMTP Host</label>
                                        <input
                                            className="input"
                                            required
                                            value={formData.smtp_host}
                                            onChange={e => setFormData({ ...formData, smtp_host: e.target.value })}
                                            disabled={formData.provider !== 'other'}
                                        />
                                    </div>
                                    <div className="col">
                                        <label className="label">Port</label>
                                        <input
                                            type="number"
                                            className="input"
                                            required
                                            value={formData.smtp_port}
                                            onChange={e => setFormData({ ...formData, smtp_port: e.target.value })}
                                            disabled={formData.provider !== 'other'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary mr-2" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Connect Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .grid-accounts {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .account-card {
                    overflow: hidden;
                    transition: transform 0.2s;
                    border: 1px solid rgba(226, 232, 240, 0.6);
                }


                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-card {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-footer {
                    padding: 16px 24px;
                    background: var(--background);
                    text-align: right;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                }

                .provider-selector {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .provider-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .provider-option:hover {
                    border-color: var(--primary);
                }

                .provider-option.selected {
                    border-color: var(--primary);
                    background: rgba(79, 70, 229, 0.1);
                }

                .provider-option input {
                    display: none;
                }

                .provider-option i {
                    font-size: 18px;
                    color: var(--text-secondary);
                }

                .provider-option.selected i {
                    color: var(--primary);
                }

                .provider-option span {
                    font-size: 13px;
                    font-weight: 500;
                }

                .input:disabled {
                    background: var(--background);
                    color: var(--text-muted);
                    cursor: not-allowed;
                }
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(EmailAccounts);
