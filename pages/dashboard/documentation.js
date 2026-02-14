import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth } from '../../lib/auth';

function Documentation() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const sections = [
        { id: 'dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard / لوحة التحكم' },
        { id: 'send', icon: 'fas fa-paper-plane', label: 'Send Emails / إرسال' },
        { id: 'accounts', icon: 'fas fa-envelope', label: 'Accounts / الحسابات' },
        { id: 'templates', icon: 'fas fa-file-code', label: 'Templates / القوالب' },
        { id: 'statistics', icon: 'fas fa-chart-line', label: 'Statistics / الإحصائيات' },
    ];

    return (
        <DashboardLayout title="Documentation & Guide" icon="fas fa-book">
            <div className="docs-container animate-fade-in">
                <div className="docs-sidebar">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            className={`doc-nav-item ${activeTab === section.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(section.id)}
                        >
                            <i className={section.icon}></i>
                            <span>{section.label}</span>
                        </button>
                    ))}
                </div>

                <div className="docs-content">
                    {activeTab === 'dashboard' && (
                        <div className="doc-section animate-fade-in">
                            <h2>Dashboard Overview</h2>
                            <p className="ar-text">نظرة عامة على لوحة التحكم</p>

                            <div className="doc-block">
                                <h3>English Guide</h3>
                                <p>The dashboard is your central hub for monitoring email campaigns. It provides a comprehensive snapshot of your current performance metrics.</p>
                                <ul>
                                    <li><strong>Total Sent:</strong> Cumulative count of all emails dispatched in the last 7 days.</li>
                                    <li><strong>Success Rate:</strong> Percentage of emails successfully delivered to the recipient's server.</li>
                                    <li><strong>Open Rate:</strong> Percentage of recipients who opened your emails (tracking pixel based).</li>
                                    <li><strong>Analytics Chart:</strong> A visual representation of daily sending volume and engagement trends.</li>
                                </ul>
                            </div>

                            <div className="doc-block ar-block">
                                <h3>دليل العربية</h3>
                                <p>لوحة التحكم هي المركز الرئيسي لمراقبة حملات البريد الإلكتروني. توفر نظرة شاملة على مؤشرات الأداء الحالية.</p>
                                <ul>
                                    <li><strong>إجمالي المرسل:</strong> العدد التراكمي لجميع الرسائل المرسلة في آخر 7 أيام.</li>
                                    <li><strong>معدل النجاح:</strong> نسبة الرسائل التي تم تسليمها بنجاح إلى خادم المستلم.</li>
                                    <li><strong>معدل الفتح:</strong> نسبة المستلمين الذين فتحوا رسائلك (يعتمد على بكسل التتبع).</li>
                                    <li><strong>الرسم البياني:</strong> تمثيل مرئي لحجم الإرسال اليومي واتجاهات التفاعل.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'send' && (
                        <div className="doc-section animate-fade-in">
                            <h2>Sending Emails</h2>
                            <p className="ar-text">إرسال البريد الإلكتروني</p>

                            <div className="doc-block">
                                <h3>English Guide</h3>
                                <p>The usage of the Bulk Sender features is streamlined for efficiency.</p>
                                <ol>
                                    <li><strong>Subject Line:</strong> Craft a compelling subject. Supports emojis and personalization variables.</li>
                                    <li><strong>Recipients Source:</strong>
                                        <ul>
                                            <li>Manual Input: Paste email addresses separated by commas.</li>
                                            <li>File Upload: Support for .CSV and .XLSX files. Automatically detects email columns.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Template Selection:</strong> Choose from System Templates or your custom HTML templates.</li>
                                    <li><strong>Sending Speed:</strong> The system manages rate limiting automatically based on your SMTP configuration.</li>
                                </ol>
                            </div>

                            <div className="doc-block ar-block">
                                <h3>دليل العربية</h3>
                                <p>تم تصميم ميزة الإرسال الجماعي لتكون فعالة وسهلة الاستخدام.</p>
                                <ol>
                                    <li><strong>موضوع الرسالة:</strong> اكتب موضوعاً جذاباً. يدعم الرموز التعبيرية والمتغيرات.</li>
                                    <li><strong>مصدر المستلمين:</strong>
                                        <ul>
                                            <li>إدخال يدوي: الصق عناوين البريد مفصولة بفواصل.</li>
                                            <li>رفع ملف: دعم لملفات .CSV و .XLSX. يكتشف عمود البريد تلقائياً.</li>
                                        </ul>
                                    </li>
                                    <li><strong>اختيار القالب:</strong> اختر من قوالب النظام أو قوالب HTML الخاصة بك.</li>
                                    <li><strong>سرعة الإرسال:</strong> يقوم النظام بإدارة معدل الإرسال تلقائياً بناءً على إعدادات SMTP.</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className="doc-section animate-fade-in">
                            <h2>Email Accounts (SMTP)</h2>
                            <p className="ar-text">حسابات البريد (SMTP)</p>

                            <div className="doc-block">
                                <h3>English Guide</h3>
                                <p>Configure your sending identities. You can add unlimited SMTP accounts.</p>
                                <ul>
                                    <li><strong>Gmail:</strong> Use App Password (not your login password).</li>
                                    <li><strong>Outlook/Office365:</strong> Supports standard SMTP authentication.</li>
                                    <li><strong>Custom Host:</strong> Any standard SMTP server (cPanel, AWS SES, SendGrid, etc).</li>
                                </ul>
                                <p><strong>Rotation:</strong> If you select "Random Account" during sending, the system rotates through all enabled accounts to distribute load.</p>
                            </div>

                            <div className="doc-block ar-block">
                                <h3>دليل العربية</h3>
                                <p>قم بتكوين هويات الإرسال الخاصة بك. يمكنك إضافة عدد غير محدود من حسابات SMTP.</p>
                                <ul>
                                    <li><strong>Gmail:</strong> استخدم كلمة مرور التطبيق (App Password) وليس كلمة مرور الدخول.</li>
                                    <li><strong>Outlook/Office365:</strong> يدعم مصادقة SMTP القياسية.</li>
                                    <li><strong>استضافة خاصة:</strong> أي خادم SMTP قياسي (cPanel, AWS SES, SendGrid, إلخ).</li>
                                </ul>
                                <p><strong>التدوير:</strong> إذا اخترت "حساب عشوائي" أثناء الإرسال، يقوم النظام بالتدوير بين جميع الحسابات المفعلة لتوزيع الحمل.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="doc-section animate-fade-in">
                            <h2>Templates Management</h2>
                            <p className="ar-text">إدارة القوالب</p>

                            <div className="doc-block">
                                <h3>English Guide</h3>
                                <p>Manage your email designs.</p>
                                <ul>
                                    <li><strong>Upload HTML:</strong> Use the "Upload" button to import your own HTML files. Images should be hosted externally for best results.</li>
                                    <li><strong>Editor:</strong> Simple text editor for quick messages.</li>
                                    <li><strong>Preview:</strong> Always preview your template before sending a bulk campaign.</li>
                                </ul>
                            </div>

                            <div className="doc-block ar-block">
                                <h3>دليل العربية</h3>
                                <p>إدارة تصاميم رسائلك.</p>
                                <ul>
                                    <li><strong>رفع HTML:</strong> استخدم زر "Upload" لاستيراد ملفات HTML الخاصة بك. يفضل أن تكون الصور مستضافة خارجياً لأفضل نتائج.</li>
                                    <li><strong>الموحرر:</strong> محرر نصوص بسيط للرسائل السريعة.</li>
                                    <li><strong>المعاينة:</strong> قم دائماً بمعاينة القالب قبل إرسال حملة جماعية.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="doc-section animate-fade-in">
                            <h2>Detailed Statistics</h2>
                            <p className="ar-text">الإحصائيات التفصيلية</p>

                            <div className="doc-block">
                                <p>View detailed logs of every email sent.</p>
                                <ul>
                                    <li><strong>Tracking:</strong> See exactly when an email was opened or a link was clicked.</li>
                                    <li><strong>Filters:</strong> Filter by date range (7 days, 30 days, 90 days).</li>
                                    <li><strong>Export:</strong> Upcoming feature to export reports to Excel.</li>
                                </ul>
                            </div>

                            <div className="doc-block ar-block">
                                <p>عرض سجلات مفصلة لكل رسالة مرسلة.</p>
                                <ul>
                                    <li><strong>التتبع:</strong> معرفة متى تم فتح الرسالة أو النقر على الرابط بدقة.</li>
                                    <li><strong>التصفية:</strong> تصفية حسب التاريخ (7 أيام، 30 يوماً، 90 يوماً).</li>
                                    <li><strong>التصدير:</strong> ميزة قادمة لتصدير التقارير إلى Excel.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Social Media Footer */}
                    <div className="doc-footer">
                        <h4>Connect With Us | تواصل معنا</h4>
                        <div className="social-links">
                            <a href="#" className="social-btn facebook" title="Facebook"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social-btn twitter" title="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-btn instagram" title="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-btn youtube" title="YouTube"><i className="fab fa-youtube"></i></a>
                            <a href="#" className="social-btn telegram" title="Telegram"><i className="fab fa-telegram-plane"></i></a>
                            <a href="#" className="social-btn whatsapp" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                        </div>
                        <p className="copyright">© 2026 Email Sender Pro. Designed for Excellence.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .docs-container {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 0;
                    background: white;
                    border-radius: 16px;
                    min-height: 700px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    border: 1px solid var(--border-light);
                }

                .docs-sidebar {
                    background: #f8fafc;
                    padding: 24px;
                    border-right: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .doc-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    font-size: 14px;
                    font-weight: 500;
                    width: 100%;
                }

                .doc-nav-item:hover {
                    background: rgba(255,255,255,0.8);
                    color: var(--primary);
                }

                .doc-nav-item.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    font-weight: 600;
                }

                .doc-nav-item i {
                    width: 20px;
                    text-align: center;
                }

                .docs-content {
                    padding: 40px;
                    overflow-y: auto;
                    max-height: 800px;
                    background: white;
                }

                .doc-section h2 {
                    font-size: 28px;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                    font-weight: 700;
                }

                .doc-section .ar-text {
                    font-size: 18px;
                    color: var(--text-secondary);
                    margin-bottom: 30px;
                    font-family: 'Cairo', sans-serif;
                }

                .doc-block {
                    background: #f8fafc;
                    padding: 24px;
                    border-radius: 12px;
                    border: 1px solid var(--border-light);
                    margin-bottom: 24px;
                    transition: transform 0.2s;
                }
                
                .doc-block:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }

                .doc-block h3 {
                    font-size: 14px;
                    color: var(--primary);
                    margin-bottom: 16px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                    border-bottom: 1px solid rgba(79, 70, 229, 0.1);
                    padding-bottom: 8px;
                }

                .doc-block ul, .doc-block ol {
                    margin-left: 20px;
                    color: var(--text-primary);
                    line-height: 1.6;
                }

                .doc-block li {
                    margin-bottom: 10px;
                    font-size: 14px;
                }

                .ar-block {
                    text-align: right;
                    direction: rtl;
                }
                
                .ar-block ul {
                    margin-left: 0;
                    margin-right: 20px;
                }

                .doc-footer {
                    margin-top: 80px;
                    padding-top: 40px;
                    border-top: 1px solid var(--border-light);
                    text-align: center;
                }
                
                .doc-footer h4 {
                    color: var(--text-primary);
                    margin-bottom: 24px;
                    font-size: 16px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .social-links {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin: 20px 0;
                }

                .social-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    font-size: 18px;
                }

                .social-btn:hover {
                    transform: translateY(-4px) scale(1.1);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }

                .facebook { background: #1877F2; }
                .twitter { background: #1DA1F2; }
                .instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
                .youtube { background: #FF0000; }
                .telegram { background: #0088cc; }
                .whatsapp { background: #25D366; }

                .copyright {
                    color: var(--text-muted);
                    font-size: 12px;
                    margin-top: 30px;
                    opacity: 0.7;
                }
                
                @media (max-width: 768px) {
                    .docs-container {
                        grid-template-columns: 1fr;
                    }
                    .docs-sidebar {
                        flex-direction: row;
                        overflow-x: auto;
                        padding: 16px;
                    }
                    .doc-nav-item {
                        white-space: nowrap;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(Documentation);
