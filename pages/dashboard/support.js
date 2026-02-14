import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth } from '../../lib/auth';
import api from '../../lib/api';
import toast from 'react-hot-toast';

function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const response = await api.get('/support.php');
            setTickets(response.data.data.tickets || []);
        } catch (error) {
            console.error('Failed to load tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/support.php', formData);
            setSubmitted(true);
            setShowForm(false);
            setFormData({ subject: '', message: '', priority: 'medium' });
            loadTickets();

            // Reset submitted state after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل في إرسال الرسالة');
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'success',
            medium: 'warning',
            high: 'danger'
        };
        return colors[priority] || 'secondary';
    };

    const getStatusBadge = (status) => {
        return status === 'open' ? 'warning' : 'success';
    };

    return (
        <DashboardLayout title="الدعم الفني" icon="fas fa-headset">
            {/* Success Message */}
            {submitted && (
                <div className="success-message mb-4">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>تم إرسال رسالتك بنجاح!</h3>
                    <p>من فضلك انتظر الرد على البريد الخاص بك.</p>
                </div>
            )}

            {/* New Ticket Button */}
            {!showForm && !submitted && (
                <div className="actions-bar mb-4">
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <i className="fas fa-plus"></i> إرسال مشكلة جديدة
                    </button>
                </div>
            )}

            {/* New Ticket Form */}
            {showForm && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h3>إرسال مشكلة جديدة</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="card-body">
                            <div className="form-group mb-3">
                                <label className="label">الموضوع</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="اكتب عنوان المشكلة..."
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="label">الأولوية</label>
                                <select
                                    className="input"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية</option>
                                </select>
                            </div>

                            <div className="form-group mb-3">
                                <label className="label">وصف المشكلة</label>
                                <textarea
                                    className="input"
                                    rows={5}
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="اشرح المشكلة بالتفصيل..."
                                />
                            </div>
                        </div>

                        <div className="card-footer d-flex gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                إلغاء
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i> إرسال
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tickets History */}
            <div className="card">
                <div className="card-header">
                    <h3>سجل التذاكر</h3>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fas fa-spinner fa-spin fa-2x"></i>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-ticket-alt fa-3x mb-3"></i>
                            <p>لا توجد تذاكر سابقة</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الموضوع</th>
                                    <th>الأولوية</th>
                                    <th>الحالة</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket, index) => (
                                    <tr key={ticket.id}>
                                        <td>{index + 1}</td>
                                        <td>{ticket.subject}</td>
                                        <td>
                                            <span className={`badge badge-${getPriorityBadge(ticket.priority)}`}>
                                                {ticket.priority === 'low' ? 'منخفضة' : ticket.priority === 'medium' ? 'متوسطة' : 'عالية'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getStatusBadge(ticket.status)}`}>
                                                {ticket.status === 'open' ? 'مفتوحة' : 'تم الحل'}
                                            </span>
                                        </td>
                                        <td>{new Date(ticket.created_at).toLocaleDateString('ar-EG')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style jsx>{`
                .success-message {
                    background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    animation: fadeIn 0.5s ease;
                }

                .success-icon {
                    font-size: 64px;
                    color: #059669;
                    margin-bottom: 16px;
                }

                .success-message h3 {
                    color: #065F46;
                    margin-bottom: 8px;
                }

                .success-message p {
                    color: #047857;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .card-footer {
                    padding: 16px 24px;
                    background: var(--background);
                    border-top: 1px solid var(--border-light);
                }

                .table {
                    margin: 0;
                }

                .table th, .table td {
                    padding: 16px;
                    text-align: right;
                }

                .table th {
                    background: var(--background);
                    font-weight: 600;
                }
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(Support);
