import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth } from '../../lib/auth';
import { settingsAPI } from '../../lib/api';

function Guide() {
    const [socialLinks, setSocialLinks] = useState([]);
    const [loadingIcons, setLoadingIcons] = useState(true);

    const ALL_ICONS = [
        { platform: 'facebook', icon: 'fab fa-facebook', defaultColor: '#1877f2' },
        { platform: 'twitter', icon: 'fab fa-twitter', defaultColor: '#1da1f2' },
        { platform: 'instagram', icon: 'fab fa-instagram', defaultColor: '#c32aa3' },
        { platform: 'linkedin', icon: 'fab fa-linkedin', defaultColor: '#0a66c2' },
        { platform: 'tiktok', icon: 'fab fa-tiktok', defaultColor: '#000000' },
        { platform: 'gmail', icon: 'fas fa-envelope', defaultColor: '#ea4335' }
    ];

    useEffect(() => {
        const fetchSocialIcons = async () => {
            try {
                console.log('Fetching social icons...');
                const response = await settingsAPI.getSocialIcons();
                console.log('Social icons response:', response.data);

                if (response.data.success && response.data.icons) {
                    const enabledIconsMap = new Map(
                        response.data.icons.map(icon => [icon.platform.toLowerCase(), icon])
                    );

                    const processedLinks = ALL_ICONS.map(baseIcon => {
                        const apiData = enabledIconsMap.get(baseIcon.platform.toLowerCase());
                        const url = apiData && apiData.url ? apiData.url.trim() : '';

                        return {
                            ...baseIcon,
                            url: url || '#',
                            color: apiData ? apiData.color : baseIcon.defaultColor,
                            visible: !!apiData // Visible if returned by API, regardless of URL content
                        };
                    });

                    // If no icons are returned/enabled via API, show ALL default icons clearly for demo purposes if needed
                    // But current logic hides them.
                    // The user said "not visible", maybe they want them visible by default?
                    // Let's force visibility if the list is empty?
                    // No, that contradicts "enabled".
                    // But maybe the "consistency" requires showing them?
                    // I'll stick to the robust matching first.
                    // If the user *really* wants them, they should enable them in Admin.
                    // But I will add a fallback: if `processedLinks.filter(l => l.visible).length === 0`, show all as "demo"?
                    // No, that's confusing.

                    setSocialLinks(processedLinks);
                    console.log('Processed social links:', processedLinks);
                }
            } catch (error) {
                console.error('Failed to load social icons:', error);
                // No fallback to "visible: true". If API fails, we just don't show icons or show empty state.
                setSocialLinks([]);
            } finally {
                setLoadingIcons(false);
            }
        };
        fetchSocialIcons();
    }, []);

    const sections = [
        {
            title: { en: 'Dashboard', ar: 'لوحة التحكم' },
            icon: 'fas fa-home',
            content: {
                en: 'View real-time statistics about your email campaigns, active templates, and server status. The charts provide a quick overview of performance trends.',
                ar: 'عرض إحصائيات في الوقت الفعلي حول حملات البريد الإلكتروني الخاصة بك، والقوالب النشطة، وحالة الخادم. توفر الرسوم البيانية نظرة عامة سريعة على اتجاهات الأداء.'
            }
        },
        {
            title: { en: 'Email Accounts', ar: 'حسابات البريد' },
            icon: 'fas fa-envelope',
            content: {
                en: 'Manage your SMTP accounts here. You can add multiple email accounts, test connections, and select which account to use for sending campaigns.',
                ar: 'قم بإدارة حسابات SMTP الخاصة بك هنا. يمكنك إضافة حسابات بريد إلكتروني متعددة، واختبار الاتصالات، وتحديد الحساب المستخدم لإرسال الحملات.'
            }
        },
        {
            title: { en: 'Templates', ar: 'القوالب' },
            icon: 'fas fa-file-alt',
            content: {
                en: 'Create and edit email templates. You can use the visual editor to design professional emails or paste your own HTML code. Save templates for quick reuse.',
                ar: 'قم بإنشاء وتعديل قوالب البريد الإلكتروني. يمكنك استخدام المحرر المرئي لتصميم رسائل بريد إلكتروني احترافية أو لصق كود HTML الخاص بك. احفظ القوالب لإعادة استخدامها بسرعة.'
            }
        },
        {
            title: { en: 'Send Emails', ar: 'إرسال البريد' },
            icon: 'fas fa-paper-plane',
            content: {
                en: 'Compose and send bulk emails. Select recipients manually or upload a list. Choose a template, configure sender settings, and track sending progress.',
                ar: 'قم بإنشاء وإرسال رسائل بريد إلكتروني جماعية. حدد المستلمين يدوياً أو قم برفع قائمة. اختر قالباً، وقم بتهيئة إعدادات المرسل، وتتبع تقدم الإرسال.'
            }
        },
        {
            title: { en: 'Profile Settings', ar: 'إعدادات الملف الشخصي' },
            icon: 'fas fa-user-cog',
            content: {
                en: 'Update your personal information, change your profile picture, and manage your password securely.',
                ar: 'قم بتحديث معلوماتك الشخصية، وتغيير صورة ملفك الشخصي، وإدارة كلمة المرور الخاصة بك بشكل آمن.'
            }
        },
        {
            title: { en: 'Support', ar: 'الدعم الفني' },
            icon: 'fas fa-headset',
            content: {
                en: 'Contact our support team for any issues or inquiries. We are here to help you get the most out of the application.',
                ar: 'تواصل لاحقاً مع فريق الدعم الفني لأي مشاكل أو استفسارات. نحن هنا لمساعدتك في تحقيق أقصى استفادة من التطبيق.'
            }
        }
    ];

    return (
        <DashboardLayout title="How to Use" icon="fas fa-book">
            <div className="guide-container">
                <div className="header-section text-center mb-5">
                    <h2 className="mb-2">User Guide & Documentation</h2>
                    <h4 className="text-secondary" style={{ fontFamily: 'Cairo, sans-serif' }}>دليل الاستخدام والتوثيق</h4>
                </div>

                <div className="sections-grid">
                    {sections.map((section, index) => (
                        <div key={index} className="guide-card">
                            <div className="card-icon">
                                <i className={section.icon}></i>
                            </div>
                            <div className="card-content">
                                <h5 className="title-en">{section.title.en}</h5>
                                <p className="text-en">{section.content.en}</p>
                                <div className="divider"></div>
                                <h5 className="title-ar">{section.title.ar}</h5>
                                <p className="text-ar">{section.content.ar}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="social-section mt-5">
                    <h5 className="mb-4">Connect With Us / تواصل معنا</h5>
                    <div className="social-icons">
                        {socialLinks.filter(link => link.visible).map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target={link.url !== '#' ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="social-icon"
                                onClick={(e) => {
                                    if (link.url === '#') {
                                        e.preventDefault();
                                        toast.error('URL not set for this platform');
                                    }
                                }}
                                style={{
                                    '--brand-color': link.color,
                                    display: 'flex'
                                }}
                            >
                                <i className={link.icon}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .guide-container {
                    padding: 0 20px 40px;
                }
                
                .header-section h2 {
                    font-weight: 700;
                    color: #1e293b;
                }

                .sections-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 30px;
                }

                .guide-card {
                    background: white;
                    border-radius: 16px;
                    padding: 30px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .guide-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .card-icon {
                    width: 60px;
                    height: 60px;
                    background: #EEF2FF;
                    color: #4f46e5;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-bottom: 20px;
                }

                .title-en {
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 12px;
                    font-size: 18px; /* Increased */
                }

                .text-en {
                    color: #64748b;
                    font-size: 16px; /* Increased */
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .title-ar {
                    font-family: 'Cairo', sans-serif;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 12px;
                    text-align: right;
                    font-size: 20px; /* Increased */
                }

                .text-ar {
                    font-family: 'Cairo', sans-serif;
                    color: #64748b;
                    font-size: 16px; /* Increased */
                    line-height: 1.8;
                    text-align: right;
                }

                .social-section {
                    text-align: center;
                    padding-top: 40px;
                    border-top: 1px solid #e2e8f0;
                }

                .social-icons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    min-height: 60px; /* Ensure space */
                }

                .social-icon {
                    width: 60px; /* Increased size */
                    height: 60px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px; /* Larger icon */
                    color: var(--brand-color, #64748b);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1); /* Stronger shadow */
                    transition: all 0.3s ease;
                    text-decoration: none;
                    border: 1px solid #f1f5f9; /* Explicit border */
                }

                .social-icon:hover {
                    background: var(--brand-color, #4f46e5);
                    color: white !important;
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15);
                    border-color: transparent;
                }

                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(Guide);
