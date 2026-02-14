import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth, useAuth } from '../../lib/auth';
import { userAPI } from '../../lib/api';
import toast from 'react-hot-toast';

function Profile() {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        username: user?.username || '',
        email: user?.email || '',
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userAPI.updateProfile(formData);
            toast.success('Profile updated successfully');
            // Update local user state name
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await userAPI.changePassword({
                current_password: passwords.current,
                new_password: passwords.new
            });
            toast.success('Password changed successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password change failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Profile Settings" icon="fas fa-user-cog">
            <div className="grid-2">
                {/* Profile Details */}
                <div className="card p-4">
                    <h5 className="mb-4">Personal Information</h5>
                    <form onSubmit={handleUpdateProfile}>


                        <div className="form-group mb-3">
                            <label className="label">Full Name</label>
                            <input
                                className="input"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="label">Username</label>
                            <input
                                className="input"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label className="label">Email</label>
                            <input
                                className="input"
                                value={formData.email}
                                disabled
                                style={{ background: '#f8fafc' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Password Change */}
                <div className="card p-4">
                    <h5 className="mb-4">Security</h5>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group mb-3">
                            <label className="label">Current Password</label>
                            <input
                                type="password"
                                className="input"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="label">New Password</label>
                            <input
                                type="password"
                                className="input"
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label className="label">Confirm New Password</label>
                            <input
                                type="password"
                                className="input"
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-outline text-danger" disabled={loading}>
                            Update Password
                        </button>
                    </form>
                </div>
            </div>



            <style jsx>{`
                .grid-2 {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                }

                .avatar-upload {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }

                .avatar-preview {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 36px;
                    font-weight: 600;
                    border: 4px solid #EEF2FF;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                #imageUpload {
                    display: none;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content-crop {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                }

                .crop-container {
                    max-height: 400px;
                    overflow: auto;
                    margin: 20px 0;
                    display: flex;
                    justify-content: center;
                    background: #f8fafc;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(Profile);
