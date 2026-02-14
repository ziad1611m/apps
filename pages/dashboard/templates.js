import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { withAuth } from '../../lib/auth';
import { templateAPI } from '../../lib/api';
import toast from 'react-hot-toast';

function Templates() {
    const [templates, setTemplates] = useState({ system: [], custom: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('system');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await templateAPI.getAll();
            setTemplates({
                system: response.data.data.system_templates,
                custom: response.data.data.user_templates
            });
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this template?')) return;
        try {
            await templateAPI.deleteTemplate(id);
            toast.success('Template deleted');
            loadTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const currentTemplates = activeTab === 'system' ? templates.system : templates.custom;

    const handlePreview = (template) => {
        setSelectedTemplate({ ...template, original_content: template.html_content });
        setShowModal(true);
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            const data = {
                name: e.target.name.value,
                description: e.target.description.value,
                html_content: selectedTemplate.html_content,
                category: 'custom'
            };

            await templateAPI.createTemplate(data);
            toast.success('Template saved to My Templates');
            setShowModal(false);
            loadTemplates();
        } catch (error) {
            toast.error('Failed to save template');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            // Create a new template object from the uploaded file
            setSelectedTemplate({
                name: file.name.replace('.html', ''),
                description: 'Uploaded template',
                html_content: content,
                isNew: true // Flag to indicate this is a new upload
            });
            setShowModal(true);
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <DashboardLayout title="Email Templates" icon="fas fa-file-code">
            <div className="tabs mb-4 d-flex justify-between items-center">
                <div className="d-flex gap-3">
                    <button
                        className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                    >
                        System Templates
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                        onClick={() => setActiveTab('custom')}
                    >
                        My Templates
                    </button>
                </div>
                <div className="upload-section">
                    <input
                        type="file"
                        id="templateUpload"
                        accept=".html"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="templateUpload" className="btn btn-primary">
                        <i className="fas fa-upload mr-2"></i> Upload HTML
                    </label>
                </div>
            </div>

            <div className="grid-templates">
                {currentTemplates.map(template => (
                    <div key={template.id} className="card template-card animate-fade-in">
                        <div className="preview-area">
                            {template.preview_image_path ? (
                                <img src={`https://email-sender.wuaze.com/${template.preview_image_path}`} alt={template.name} />
                            ) : (
                                <div className="placeholder">
                                    <i className="fas fa-file-code"></i>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            <h5>{template.name}</h5>
                            <p className="text-muted small mb-3">{template.description || 'No description'}</p>

                            <div className="actions d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline btn-full"
                                    onClick={() => handlePreview(template)}
                                >
                                    <i className="fas fa-eye"></i> Preview
                                </button>
                                {activeTab === 'custom' && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(template.id)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {currentTemplates.length === 0 && (
                <div className="text-center py-5">
                    <p className="text-muted">No templates found in this category.</p>
                </div>
            )}

            {showModal && selectedTemplate && (
                <div className="modal-overlay animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Preview Template</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="preview-container mb-4">
                                <div className="preview-header mb-2 d-flex justify-between">
                                    <label className="label">HTML Preview</label>
                                    <span className="badge badge-primary">Live Preview</span>
                                </div>
                                <div className="html-preview" dangerouslySetInnerHTML={{ __html: selectedTemplate.html_content }}></div>
                            </div>

                            <div className="edit-section mb-4">
                                <label className="label">Edit HTML Content</label>
                                <textarea
                                    className="input code-editor"
                                    rows="6"
                                    value={selectedTemplate.html_content}
                                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, html_content: e.target.value })}
                                ></textarea>
                            </div>

                            <form onSubmit={handleSaveTemplate} className="save-form p-4 bg-surface rounded">
                                <h4 className="mb-3">Save as New Template</h4>
                                <div className="form-group mb-3">
                                    <label className="label">Template Name</label>
                                    <input
                                        name="name"
                                        className="input"
                                        defaultValue={`Copy of ${selectedTemplate.name}`}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="label">Description</label>
                                    <input
                                        name="description"
                                        className="input"
                                        defaultValue={selectedTemplate.description}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-full">
                                    <i className="fas fa-save"></i> Save to My Templates
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .tabs {
                    display: flex;
                    gap: 16px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 2px;
                }

                .tab-btn {
                    background: none;
                    border: none;
                    padding: 12px 24px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .tab-btn.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }

                .grid-templates {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }

                .template-card {
                    overflow: hidden;
                    transition: transform 0.2s;
                    border: 1px solid rgba(226, 232, 240, 0.6);
                }

                .preview-area {
                    height: 180px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .preview-area img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .placeholder {
                    font-size: 48px;
                    color: #cbd5e1;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    background: white;
                    z-index: 10;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary);
                }

                .modal-body {
                    padding: 24px;
                }

                .html-preview {
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 20px;
                    min-height: 300px;
                    background: #f9fafb;
                    overflow: auto;
                }

                .code-editor {
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 14px;
                    background: #1e1e1e;
                    color: #d4d4d4;
                }
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(Templates);
