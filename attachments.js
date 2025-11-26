// File Attachments Management
class AttachmentsManager {
    constructor() {
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain', 'text/csv',
            'application/zip', 'application/x-zip-compressed'
        ];
    }

    // Initialize attachment functionality for a project or ticket
    init(parentType, parentId, containerId) {
        this.parentType = parentType; // 'project' or 'ticket'
        this.parentId = parentId;
        this.containerId = containerId;
        
        this.render();
        this.loadAttachments();
    }

    // Render the attachments UI
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="attachments-section">
                <div class="attachments-header">
                    <h3>
                        <i class="fas fa-paperclip"></i>
                        Attachments
                        <span class="attachment-count" id="attachmentCount-${this.parentId}">0</span>
                    </h3>
                    <button class="btn-primary" onclick="attachmentsManager.showUploadModal()">
                        <i class="fas fa-upload"></i>
                        Upload File
                    </button>
                </div>
                
                <div class="attachments-list" id="attachmentsList-${this.parentId}">
                    <div class="loading">Loading attachments...</div>
                </div>
            </div>
        `;
    }

    // Load attachments from database
    async loadAttachments() {
        try {
            const column = this.parentType === 'project' ? 'project_id' : 'ticket_id';
            
            const { data: attachments, error } = await supabase
                .from('attachments')
                .select(`
                    *,
                    uploader:uploaded_by(email, full_name)
                `)
                .eq(column, this.parentId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.displayAttachments(attachments || []);
        } catch (error) {
            console.error('Error loading attachments:', error);
            showNotification('Failed to load attachments', 'error');
        }
    }

    // Display attachments in the UI
    displayAttachments(attachments) {
        const listContainer = document.getElementById(`attachmentsList-${this.parentId}`);
        const countElement = document.getElementById(`attachmentCount-${this.parentId}`);
        
        if (!listContainer) return;

        countElement.textContent = attachments.length;

        if (attachments.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No attachments yet</p>
                    <p class="text-muted">Upload files to share with your team</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = attachments.map(attachment => `
            <div class="attachment-item" data-id="${attachment.id}">
                <div class="attachment-icon">
                    ${this.getFileIcon(attachment.file_type)}
                </div>
                <div class="attachment-info">
                    <div class="attachment-name">${this.escapeHtml(attachment.file_name)}</div>
                    <div class="attachment-meta">
                        <span class="file-size">${this.formatFileSize(attachment.file_size)}</span>
                        <span class="separator">•</span>
                        <span class="upload-time">${this.formatDate(attachment.created_at)}</span>
                        <span class="separator">•</span>
                        <span class="uploader">${attachment.uploader?.full_name || attachment.uploader?.email || 'Unknown'}</span>
                    </div>
                    ${attachment.description ? `<div class="attachment-description">${this.escapeHtml(attachment.description)}</div>` : ''}
                </div>
                <div class="attachment-actions">
                    <button class="btn-icon" onclick="attachmentsManager.downloadAttachment('${attachment.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="attachmentsManager.deleteAttachment('${attachment.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Show upload modal
    showUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Upload File</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="uploadForm">
                        <div class="form-group">
                            <label>Select File</label>
                            <div class="file-upload-area" id="fileUploadArea">
                                <input type="file" id="fileInput" accept="*/*" required style="display: none;">
                                <div class="file-upload-placeholder" onclick="document.getElementById('fileInput').click()">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Click to select a file or drag and drop</p>
                                    <p class="text-muted">Maximum file size: 50MB</p>
                                </div>
                                <div class="file-upload-preview" id="filePreview" style="display: none;">
                                    <i class="fas fa-file"></i>
                                    <span id="fileName"></span>
                                    <button type="button" onclick="attachmentsManager.clearFileSelection()" class="btn-icon">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="fileDescription">Description (Optional)</label>
                            <textarea id="fileDescription" rows="3" placeholder="Add a description for this file..."></textarea>
                        </div>

                        <div class="upload-progress" id="uploadProgress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="progress-text" id="progressText">0%</div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-upload"></i>
                                Upload
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Setup file input handler
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Setup drag and drop
        const uploadArea = document.getElementById('fileUploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.handleFileSelect({ target: fileInput });
            }
        });

        // Setup form submission
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadFile();
        });

        modal.style.display = 'flex';
    }

    // Handle file selection
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > this.maxFileSize) {
            showNotification('File size exceeds 50MB limit', 'error');
            this.clearFileSelection();
            return;
        }

        // Show file preview
        document.querySelector('.file-upload-placeholder').style.display = 'none';
        const preview = document.getElementById('filePreview');
        preview.style.display = 'flex';
        document.getElementById('fileName').textContent = file.name;
    }

    // Clear file selection
    clearFileSelection() {
        document.getElementById('fileInput').value = '';
        document.querySelector('.file-upload-placeholder').style.display = 'flex';
        document.getElementById('filePreview').style.display = 'none';
    }

    // Upload file to Supabase Storage
    async uploadFile() {
        const fileInput = document.getElementById('fileInput');
        const description = document.getElementById('fileDescription').value;
        const file = fileInput.files[0];

        if (!file) {
            showNotification('Please select a file', 'error');
            return;
        }

        try {
            // Show progress
            const progressContainer = document.getElementById('uploadProgress');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            progressContainer.style.display = 'block';

            // Generate unique file path
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${this.parentType}s/${this.parentId}/${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            progressFill.style.width = '50%';
            progressText.textContent = '50%';

            // Save metadata to database
            const { data: attachment, error: dbError } = await supabase
                .from('attachments')
                .insert({
                    [this.parentType + '_id']: this.parentId,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    description: description || null,
                    uploaded_by: (await supabase.auth.getUser()).data.user.id
                })
                .select()
                .single();

            if (dbError) throw dbError;

            progressFill.style.width = '100%';
            progressText.textContent = '100%';

            showNotification('File uploaded successfully', 'success');
            
            // Close modal and reload attachments
            document.querySelector('.modal').remove();
            this.loadAttachments();

        } catch (error) {
            console.error('Error uploading file:', error);
            showNotification('Failed to upload file: ' + error.message, 'error');
        }
    }

    // Download attachment
    async downloadAttachment(attachmentId) {
        try {
            // Get attachment metadata
            const { data: attachment, error: fetchError } = await supabase
                .from('attachments')
                .select('file_name, file_path')
                .eq('id', attachmentId)
                .single();

            if (fetchError) throw fetchError;

            // Get signed URL for download
            const { data: { signedUrl }, error: urlError } = await supabase.storage
                .from('attachments')
                .createSignedUrl(attachment.file_path, 60); // 60 seconds expiry

            if (urlError) throw urlError;

            // Trigger download
            const link = document.createElement('a');
            link.href = signedUrl;
            link.download = attachment.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error downloading file:', error);
            showNotification('Failed to download file', 'error');
        }
    }

    // Delete attachment
    async deleteAttachment(attachmentId) {
        if (!confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        try {
            // Get file path before deleting record
            const { data: attachment, error: fetchError } = await supabase
                .from('attachments')
                .select('file_path')
                .eq('id', attachmentId)
                .single();

            if (fetchError) throw fetchError;

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('attachments')
                .remove([attachment.file_path]);

            if (storageError) throw storageError;

            // Delete from database
            const { error: dbError } = await supabase
                .from('attachments')
                .delete()
                .eq('id', attachmentId);

            if (dbError) throw dbError;

            showNotification('Attachment deleted successfully', 'success');
            this.loadAttachments();

        } catch (error) {
            console.error('Error deleting attachment:', error);
            showNotification('Failed to delete attachment', 'error');
        }
    }

    // Get appropriate icon for file type
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) {
            return '<i class="fas fa-file-image text-primary"></i>';
        } else if (fileType === 'application/pdf') {
            return '<i class="fas fa-file-pdf text-danger"></i>';
        } else if (fileType.includes('word')) {
            return '<i class="fas fa-file-word text-info"></i>';
        } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            return '<i class="fas fa-file-excel text-success"></i>';
        } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
            return '<i class="fas fa-file-powerpoint text-warning"></i>';
        } else if (fileType.includes('zip') || fileType.includes('compressed')) {
            return '<i class="fas fa-file-archive text-secondary"></i>';
        } else {
            return '<i class="fas fa-file text-muted"></i>';
        }
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString();
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize global attachments manager
const attachmentsManager = new AttachmentsManager();

// Subscribe to realtime changes
supabase
    .channel('attachments_changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'attachments' },
        (payload) => {
            // Reload attachments when changes occur
            if (attachmentsManager.parentId) {
                attachmentsManager.loadAttachments();
            }
        }
    )
    .subscribe();
