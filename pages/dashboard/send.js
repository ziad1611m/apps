import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth } from '../../lib/auth';
import { emailAPI, templateAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function SendEmail() {
    const [step, setStep] = useState(1); // 1: Recipients, 2: Content, 3: Review & Send
    const [recipients, setRecipients] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]); // Changed to array for multi-select
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [subject, setSubject] = useState('');
    const [senderName, setSenderName] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, total: 0, failed: 0, currentAccount: '' });
    const [useMultiAccount, setUseMultiAccount] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [accRes, tplRes] = await Promise.all([
                emailAPI.getAccounts(),
                templateAPI.getAll()
            ]);
            setAccounts(accRes.data.data.accounts);
            setTemplates([
                ...tplRes.data.data.system_templates,
                ...tplRes.data.data.user_templates
            ]);
        } catch (error) {
            toast.error('Failed to load initial data');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;

            if (file.name.endsWith('.csv')) {
                Papa.parse(data, {
                    header: true,
                    complete: (results) => {
                        processRecipients(results.data);
                    }
                });
            } else {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                processRecipients(json);
            }
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    };

    const processRecipients = (data) => {
        if (!data || !Array.isArray(data)) return;

        const validRecipients = data
            .map(row => {
                // Find email-like key (case insensitive, common variations)
                const emailKey = Object.keys(row).find(k =>
                    ['email', 'e-mail', 'mail', 'email_address', 'address'].includes(k.toLowerCase())
                );

                // Find name-like key
                const nameKey = Object.keys(row).find(k =>
                    ['name', 'full_name', 'fullname', 'username', 'display_name', 'user'].includes(k.toLowerCase())
                );

                const email = emailKey ? String(row[emailKey]).trim() : null;
                const name = nameKey ? String(row[nameKey]).trim() : '';

                return { ...row, email, name };
            })
            .filter(row => row.email && row.email.includes('@') && row.email.includes('.'));

        setRecipients(validRecipients);
        if (validRecipients.length > 0) {
            toast.success(`Loaded ${validRecipients.length} recipients`);
        } else {
            toast.error('No valid emails found in the file. Ensure you have an "Email" column.');
        }
    };

    const handleTemplateChange = (e) => {
        const id = parseInt(e.target.value);
        setSelectedTemplate(id);
        const template = templates.find(t => t.id === id);
        if (template) {
            setSubject(template.subject || '');
            setContent(template.html_content || '');
            if (!senderName && selectedAccounts.length > 0) {
                // Pre-fill sender name if we find a likely candidate from accounts
                const account = accounts.find(a => String(a.id) === String(selectedAccounts[0]));
                if (account) setSenderName(account.display_name);
            }
        }
    };

    const toggleAccountSelection = (accountId) => {
        if (!useMultiAccount) {
            setSelectedAccounts([accountId]);
        } else {
            setSelectedAccounts(prev =>
                prev.includes(accountId)
                    ? prev.filter(id => id !== accountId)
                    : [...prev, accountId]
            );
        }
    };

    const startSending = async () => {
        setSending(true);
        const total = recipients.length;
        setProgress({ sent: 0, total, failed: 0, currentAccount: '' });

        let sentCount = 0;
        let failedCount = 0;
        const accountsToUse = useMultiAccount && selectedAccounts.length > 1
            ? selectedAccounts
            : selectedAccounts;

        for (let i = 0; i < total; i++) {
            const recipient = recipients[i];
            // Round-robin: pick account based on index
            const currentAccountId = accountsToUse[i % accountsToUse.length];
            const currentAccount = accounts.find(a => String(a.id) === String(currentAccountId));

            try {
                setProgress(prev => ({
                    ...prev,
                    currentAccount: currentAccount?.email_address || ''
                }));

                // Prepare data for API
                const emailData = {
                    to: recipient.email,
                    name: recipient.name,
                    subject: subject,
                    body: content,
                    from_name: senderName,
                    account_id: currentAccountId
                };

                await emailAPI.sendEmail(emailData);
                sentCount++;
            } catch (error) {
                console.error(`Failed to send to ${recipient.email}:`, error);
                failedCount++;
            }

            // Update progress
            setProgress(prev => ({ ...prev, sent: sentCount, failed: failedCount }));

            // Add a small delay to avoid overwhelming the server/SMTP
            await new Promise(r => setTimeout(r, 500));
        }

        toast.success(`Campaign completed! Sent: ${sentCount}, Failed: ${failedCount}`);
        setSending(false);
        // Refresh account stats to show updated quota
        loadData();
    };

    return (
        <DashboardLayout title="Send Emails" icon="fas fa-paper-plane">
            {/* Stepper */}
            <div className="stepper mb-5">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`step ${step >= s ? 'active' : ''}`}>
                        <div className="step-circle">{s}</div>
                        <div className="step-label">
                            {s === 1 ? 'Recipients' : s === 2 ? 'Content' : 'Review'}
                        </div>
                        {s < 3 && <div className="step-line"></div>}
                    </div>
                ))}
            </div>

            <div className="content-card">
                {step === 1 && (
                    <div className="step-content">
                        <h3>Import Recipients</h3>
                        <div className="upload-area mb-4">
                            <input type="file" id="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} hidden />
                            <label htmlFor="file" className="upload-label">
                                <i className="fas fa-cloud-upload-alt mb-3"></i>
                                <p>Drag & Drop csv/excel file here or click to browse</p>
                            </label>
                        </div>

                        {recipients.length > 0 && (
                            <div className="recipients-preview mb-4">
                                <h5>Preview ({recipients.length} recipients)</h5>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Email</th>
                                                <th>Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recipients.slice(0, 5).map((r, i) => (
                                                <tr key={i}>
                                                    <td>{r.email}</td>
                                                    <td>{r.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {recipients.length > 5 && <p className="text-muted text-center mt-2">...and {recipients.length - 5} more</p>}
                                </div>
                            </div>
                        )}

                        <div className="actions text-right">
                            <button
                                className="btn btn-primary"
                                disabled={recipients.length === 0}
                                onClick={() => setStep(2)}
                            >
                                Next Step <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <h3>Compose Email</h3>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="d-flex justify-between align-center mb-2">
                                    <label className="label mb-0">Sending Account{useMultiAccount ? 's' : ''}</label>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={useMultiAccount}
                                            onChange={(e) => {
                                                setUseMultiAccount(e.target.checked);
                                                if (!e.target.checked) {
                                                    setSelectedAccounts(selectedAccounts.slice(0, 1));
                                                }
                                            }}
                                        />
                                        <span className="toggle-slider"></span>
                                        <span className="toggle-label">Multi-Account</span>
                                    </label>
                                </div>
                                {!useMultiAccount ? (
                                    <select
                                        className="input"
                                        value={selectedAccounts[0] || ''}
                                        onChange={(e) => setSelectedAccounts([e.target.value])}
                                    >
                                        <option value="">Select Account...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.display_name} ({acc.email_address})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="account-checklist">
                                        {accounts.map(acc => (
                                            <label key={acc.id} className={`account-check-item ${selectedAccounts.includes(String(acc.id)) ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAccounts.includes(String(acc.id))}
                                                    onChange={() => toggleAccountSelection(String(acc.id))}
                                                />
                                                <span>{acc.display_name}</span>
                                                <small>{acc.email_address}</small>
                                            </label>
                                        ))}
                                        {selectedAccounts.length > 1 && (
                                            <small className="text-muted mt-2 d-block">
                                                <i className="fas fa-sync-alt"></i> Round-robin: emails will rotate between {selectedAccounts.length} accounts
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="label">Template (Optional)</label>
                                <select
                                    className="input"
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                >
                                    <option value="">Select Template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <label className="label">Email Subject</label>
                            <input
                                className="input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Special Offer for You"
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label className="label">Sender Name (The name recipients will see)</label>
                            <input
                                className="input"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="label">Template Preview</label>
                            <div className="preview-container p-3 border rounded bg-light" style={{ maxHeight: '300px', overflow: 'auto' }}>
                                {content ? (
                                    <div dangerouslySetInnerHTML={{ __html: content }}></div>
                                ) : (
                                    <p className="text-muted text-center py-5">Please select a template to see preview</p>
                                )}
                            </div>
                            <small className="text-muted">The selected template will be sent as HTML. Variable {'{{name}}'} will be replaced with recipient's name.</small>
                        </div>

                        <div className="actions d-flex justify-between">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="btn btn-primary"
                                disabled={selectedAccounts.length === 0 || !subject || !content}
                                onClick={() => setStep(3)}
                            >
                                Next Step <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content">
                        <h3>Review & Send</h3>

                        <div className="review-summary mb-4">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="summary-item">
                                        <label>Recipients</label>
                                        <p>{recipients.length}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="summary-item">
                                        <label>Account</label>
                                        <p>
                                            {useMultiAccount
                                                ? `${selectedAccounts.length} Accounts Selected`
                                                : accounts.find(a => String(a.id) === String(selectedAccounts[0]))?.email_address || 'None Selected'}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="summary-item">
                                        <label>Estimated Time</label>
                                        <p>{Math.ceil(recipients.length / 60)} mins</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {sending ? (
                            <div className="sending-progress text-center py-5">
                                <div className="spinner mb-3 mx-auto"></div>
                                <h4>Sending Campaign...</h4>
                                <p>{progress.sent} / {progress.total} emails sent</p>
                                <div className="progress mt-3" style={{ height: '10px' }}>
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="confirmation text-center py-4">
                                <p className="mb-4">Everything looks good! Ready to launch this campaign?</p>
                                <button className="btn btn-primary btn-lg" onClick={startSending}>
                                    <i className="fas fa-rocket mr-2"></i> Send Campaign Now
                                </button>
                            </div>
                        )}

                        {!sending && (
                            <div className="actions text-left mt-4">
                                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .stepper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                }

                .step {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0.5;
                    transition: all 0.3s;
                }

                .step.active {
                    opacity: 1;
                }

                .step-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--surface-hover);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .step.active .step-circle {
                    background: var(--primary);
                    color: white;
                }

                .step-line {
                    width: 40px;
                    height: 2px;
                    background: var(--border);
                }

                .content-card {
                    background: white;
                    padding: 32px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    max-width: 800px;
                    margin: 0 auto;
                }

                .upload-area {
                    border: 2px dashed var(--border);
                    border-radius: var(--radius-lg);
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                .upload-area:hover {
                    border-color: var(--primary);
                }

                .upload-label {
                    cursor: pointer;
                }

                .upload-label i {
                    font-size: 48px;
                    color: var(--primary-light);
                }

                .summary-item label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .summary-item p {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .toggle-switch {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .toggle-switch input {
                    display: none;
                }

                .toggle-slider {
                    width: 36px;
                    height: 20px;
                    background: var(--border);
                    border-radius: 10px;
                    position: relative;
                    transition: background 0.3s;
                }

                .toggle-slider::before {
                    content: '';
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    top: 2px;
                    left: 2px;
                    transition: left 0.3s;
                }

                .toggle-switch input:checked + .toggle-slider {
                    background: var(--primary);
                }

                .toggle-switch input:checked + .toggle-slider::before {
                    left: 18px;
                }

                .toggle-label {
                    color: var(--text-secondary);
                }

                .account-checklist {
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    max-height: 180px;
                    overflow-y: auto;
                }

                .account-check-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-light);
                    transition: background 0.2s;
                }

                .account-check-item:last-child {
                    border-bottom: none;
                }

                .account-check-item:hover {
                    background: var(--background);
                }

                .account-check-item.selected {
                    background: rgba(79, 70, 229, 0.1);
                }

                .account-check-item input {
                    width: 16px;
                    height: 16px;
                }

                .account-check-item span {
                    font-weight: 500;
                    flex: 1;
                }

                .account-check-item small {
                    color: var(--text-muted);
                    font-size: 11px;
                }
            `}</style>
        </DashboardLayout >
    );
}

export default withAuth(SendEmail);
