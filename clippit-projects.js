// Clippit Projects Management - Complete Implementation
// File upload with Supabase Storage + All button functionality

if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('loginType') !== 'admin') {
    window.location.href = 'login.html';
}

const STORAGE_BUCKET = 'project-files';
let selectedMainImage = null;
let selectedDocuments = [];
let projectIdeas = JSON.parse(localStorage.getItem('clippit_project_ideas') || '[]');
let currentView = 'projects'; // Track current view

document.addEventListener('DOMContentLoaded', function() {
    initializeStorageBucket();
    loadClippitProjects();
    setupSearchAndFilters();
});

async function initializeStorageBucket() {
    try {
        if (typeof supabase === 'undefined') return;
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
        if (!bucketExists) {
            await supabase.storage.createBucket(STORAGE_BUCKET, { public: true, fileSizeLimit: 52428800 });
        }
    } catch (error) {
        console.error('Storage init error:', error);
    }
}

function setupSearchAndFilters() {
    ['search-projects', 'filter-category', 'filter-status'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener(id.includes('search') ? 'input' : 'change', loadClippitProjects);
    });
}

async function loadClippitProjects() {
    currentView = 'projects'; // Reset to projects view
    try {
        const container = document.getElementById('clippit-projects-grid');
        if (container) container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#9CA3AF">Loading...</div>';

        let query = supabase.from('clippit_projects').select('*').order('created_at', { ascending: false });
        
        const category = document.getElementById('filter-category')?.value;
        const status = document.getElementById('filter-status')?.value;
        if (category) query = query.eq('category', category);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;

        let projects = data || [];
        const search = document.getElementById('search-projects')?.value?.toLowerCase();
        if (search) {
            projects = projects.filter(p => 
                p.project_name?.toLowerCase().includes(search) ||
                p.overview?.toLowerCase().includes(search) ||
                p.technologies?.toLowerCase().includes(search)
            );
        }

        displayClippitProjects(projects);
        updateClippitProjectStats(data || []);
        updateHeaderButton(); // Update button when loading projects
    } catch (error) {
        console.error('Load error:', error);
        showNotification('Failed to load projects', 'error');
    }
}

function displayClippitProjects(projects) {
    const container = document.getElementById('clippit-projects-grid');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem"><div style="font-size:4rem;margin-bottom:1rem">📁</div><h3 style="color:#fff">No Projects Found</h3><p style="color:#9CA3AF;margin-bottom:1.5rem">Add your first project</p><button onclick="showCreateClippitProjectModal()" style="padding:0.75rem 1.5rem;background:linear-gradient(135deg,#40E0D0,#36B8A8);color:#111827;border:none;border-radius:50px;font-weight:600;cursor:pointer">+ Create Project</button></div>`;
        return;
    }

    const statusColors = {
        draft: { bg: 'rgba(107,114,128,0.2)', color: '#9CA3AF', label: 'DRAFT' },
        published: { bg: 'rgba(16,185,129,0.2)', color: '#10B981', label: 'PUBLISHED' },
        archived: { bg: 'rgba(239,68,68,0.2)', color: '#EF4444', label: 'ARCHIVED' }
    };
    const emojis = { technology:'💻', 'real-estate':'🏢', healthcare:'🏥', finance:'💰', ecommerce:'🛒', saas:'☁️', other:'📦' };

    container.innerHTML = projects.map(p => {
        const st = statusColors[p.status] || statusColors.draft;
        const emoji = emojis[p.category] || '📦';
        const img = p.main_image_url ? 
            `<img src="${p.main_image_url}" alt="${p.project_name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:0.5rem">` :
            `<div style="font-size:3rem;margin-bottom:0.5rem">${emoji}</div>`;
        
        return `<div style="background:#111827;border-radius:12px;padding:1.5rem;border:1px solid #4B5563;cursor:pointer;transition:all 0.2s" onmouseenter="this.style.borderColor='#40E0D0'" onmouseleave="this.style.borderColor='#4B5563'" onclick="viewClippitProjectDetails('${p.id}')"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><span style="background:${st.bg};color:${st.color};padding:0.25rem 0.75rem;border-radius:12px;font-size:0.75rem;font-weight:600">${st.label}</span><button onclick="event.stopPropagation();showClippitProjectMenu('${p.id}')" style="padding:0.25rem 0.5rem;background:transparent;color:#9CA3AF;border:1px solid #4B5563;border-radius:6px;cursor:pointer">⋯</button></div><div style="text-align:center;margin-bottom:1rem">${img}<h3 style="color:#40E0D0;font-size:1.25rem;margin-bottom:0.5rem">${p.project_name}</h3><p style="color:#9CA3AF;font-size:0.875rem;text-transform:capitalize">${p.category.replace('-',' ')}</p></div><div style="background:#1F2937;padding:1rem;border-radius:8px;margin-bottom:1rem"><p style="color:#9CA3AF;font-size:0.875rem;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${p.overview||'No description'}</p></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem"><div><p style="color:#9CA3AF;font-size:0.75rem;margin-bottom:0.25rem">Seeking</p><p style="color:#FBB624;font-weight:700;font-size:1.125rem">$${parseFloat(p.seeking_amount||0).toLocaleString()}</p></div><div><p style="color:#9CA3AF;font-size:0.75rem;margin-bottom:0.25rem">Type</p><p style="color:#fff;font-weight:600;font-size:0.875rem;text-transform:capitalize">${(p.investment_type||'equity').replace('-',' ')}</p></div></div><div style="display:flex;justify-content:space-between;padding-top:1rem;border-top:1px solid #4B5563"><div style="display:flex;align-items:center;gap:0.5rem"><span style="color:#40E0D0">❓</span><span style="color:#9CA3AF;font-size:0.875rem">${p.questions_count||0} questions</span></div><div style="display:flex;align-items:center;gap:0.5rem"><span style="color:#FBB624">💰</span><span style="color:#9CA3AF;font-size:0.875rem">${p.offers_count||0} offers</span></div></div>${p.documents?.length?`<div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid #4B5563"><div style="display:flex;align-items:center;gap:0.5rem"><span style="color:#40E0D0">📎</span><span style="color:#9CA3AF;font-size:0.875rem">${p.documents.length} document${p.documents.length!==1?'s':''}</span></div></div>`:''}</div>`;
    }).join('');
}

function updateClippitProjectStats(projects) {
    const cards = document.querySelectorAll('#section-clippit-projects .admin-metrics>div');
    if (cards.length >= 4) {
        cards[0].querySelector('h3').textContent = projects.length;
        cards[1].querySelector('h3').textContent = projects.filter(p => p.status === 'published').length;
        cards[2].querySelector('h3').textContent = projects.reduce((s, p) => s + (p.questions_count || 0), 0);
        cards[3].querySelector('h3').textContent = projects.reduce((s, p) => s + (p.offers_count || 0), 0);
    }
}

function showCreateClippitProjectModal() {
    selectedMainImage = null;
    selectedDocuments = [];
    showModal('Create New Project', `<form onsubmit="createClippitProject(event)" style="display:flex;flex-direction:column;gap:1.5rem;max-height:70vh;overflow-y:auto;padding-right:0.5rem"><div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563"><h4 style="color:#40E0D0;margin-bottom:1rem">Project Information</h4><div style="margin-bottom:1rem"><label style="display:block;margin-bottom:0.5rem;color:#fff">Project Name *</label><input type="text" id="project-name" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="E-Commerce Platform"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem"><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Category *</label><select id="project-category" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff"><option value="">Select</option><option value="technology">💻 Technology</option><option value="real-estate">🏢 Real Estate</option><option value="healthcare">🏥 Healthcare</option><option value="finance">💰 Finance</option><option value="ecommerce">🛒 E-Commerce</option><option value="saas">☁️ SaaS</option><option value="other">📦 Other</option></select></div><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Investment Type *</label><select id="investment-type" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff"><option value="equity">Equity</option><option value="debt">Debt</option><option value="revenue-share">Revenue Share</option><option value="convertible-note">Convertible Note</option></select></div></div><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Overview *</label><textarea id="project-overview" rows="4" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff;resize:vertical" placeholder="Compelling overview..."></textarea></div></div><div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563"><h4 style="color:#40E0D0;margin-bottom:1rem">Main Image</h4><div id="main-image-drop-zone" style="border:2px dashed #4B5563;border-radius:8px;padding:2rem;text-align:center;cursor:pointer;transition:all 0.2s" onclick="document.getElementById('main-image-input').click()"><input type="file" id="main-image-input" accept="image/*" style="display:none" onchange="handleMainImageSelect(event)"><div id="main-image-preview" style="display:none"><img id="main-image-preview-img" style="max-width:200px;max-height:200px;border-radius:8px;margin-bottom:1rem"><p style="color:#40E0D0;font-size:0.875rem">Click to change</p></div><div id="main-image-placeholder"><div style="font-size:3rem;margin-bottom:0.5rem">🖼️</div><p style="color:#fff;margin-bottom:0.5rem">Click or drag to upload image</p><p style="color:#9CA3AF;font-size:0.875rem">Max 5MB</p></div></div></div><div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563"><h4 style="color:#40E0D0;margin-bottom:1rem">Documents</h4><div id="documents-drop-zone" style="border:2px dashed #4B5563;border-radius:8px;padding:2rem;text-align:center;cursor:pointer;transition:all 0.2s" onclick="document.getElementById('documents-input').click()"><input type="file" id="documents-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" style="display:none" onchange="handleDocumentsSelect(event)"><div style="font-size:3rem;margin-bottom:0.5rem">📎</div><p style="color:#fff;margin-bottom:0.5rem">Click or drag documents</p><p style="color:#9CA3AF;font-size:0.875rem">PDF, DOC, XLS, PPT - Max 10MB each</p></div><div id="documents-list" style="margin-top:1rem"></div></div><div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563"><h4 style="color:#40E0D0;margin-bottom:1rem">Investment Details</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Seeking Amount *</label><input type="number" id="seeking-amount" required min="0" step="1000" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="500000"></div><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Valuation</label><input type="number" id="valuation" min="0" step="10000" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="2000000"></div></div></div><div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563"><h4 style="color:#40E0D0;margin-bottom:1rem">Additional Details</h4><div style="margin-bottom:1rem"><label style="display:block;margin-bottom:0.5rem;color:#fff">Technologies</label><input type="text" id="technologies" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="React, Node.js, MongoDB"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Timeline</label><input type="text" id="timeline" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="6-12 months"></div><div><label style="display:block;margin-bottom:0.5rem;color:#fff">Team Size</label><input type="number" id="team-size" min="1" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="5"></div></div></div><div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563"><h4 style="color:#40E0D0;margin-bottom:1rem">Status</h4><select id="project-status" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff"><option value="draft">📝 Draft</option><option value="published">✅ Publish</option></select><p style="color:#9CA3AF;font-size:0.875rem;margin-top:0.75rem">💡 Save as draft to review first</p></div><div style="display:flex;gap:1rem"><button type="submit" style="flex:1;padding:0.75rem 1.5rem;background:linear-gradient(135deg,#40E0D0,#36B8A8);color:#111827;border:none;border-radius:50px;font-weight:600;cursor:pointer">Create Project</button><button type="button" onclick="closeModal()" style="flex:1;padding:0.75rem 1.5rem;background:transparent;color:#40E0D0;border:2px solid #40E0D0;border-radius:50px;font-weight:600;cursor:pointer">Cancel</button></div></form>`);
    setTimeout(setupDragAndDrop, 100);
}

function setupDragAndDrop() {
    const zones = [
        { id: 'main-image-drop-zone', handler: handleMainImageDrop },
        { id: 'documents-drop-zone', handler: handleDocumentsDrop }
    ];
    
    zones.forEach(({ id, handler }) => {
        const zone = document.getElementById(id);
        if (!zone) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => zone.addEventListener(e, preventDefaults, false));
        ['dragenter', 'dragover'].forEach(e => zone.addEventListener(e, () => {
            zone.style.borderColor = '#40E0D0';
            zone.style.backgroundColor = 'rgba(64,224,208,0.05)';
        }));
        ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, () => {
            zone.style.borderColor = '#4B5563';
            zone.style.backgroundColor = 'transparent';
        }));
        zone.addEventListener('drop', handler);
    });
}

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

function handleMainImageSelect(e) {
    const file = e.target.files[0];
    if (file?.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) return showNotification('Image must be < 5MB', 'error');
        selectedMainImage = file;
        previewMainImage(file);
    }
}

function handleMainImageDrop(e) {
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) return showNotification('Image must be < 5MB', 'error');
        selectedMainImage = file;
        previewMainImage(file);
    }
}

function previewMainImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('main-image-preview');
        const placeholder = document.getElementById('main-image-placeholder');
        const img = document.getElementById('main-image-preview-img');
        if (img && preview && placeholder) {
            img.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function handleDocumentsSelect(e) { addDocuments(Array.from(e.target.files)); }
function handleDocumentsDrop(e) { addDocuments(Array.from(e.dataTransfer.files)); }

function addDocuments(files) {
    const valid = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    files.forEach(f => {
        if (!valid.includes(f.type)) return showNotification(`${f.name} invalid type`, 'error');
        if (f.size > 10 * 1024 * 1024) return showNotification(`${f.name} too large`, 'error');
        selectedDocuments.push(f);
    });
    displayDocumentsList();
}

function displayDocumentsList() {
    const list = document.getElementById('documents-list');
    if (!list) return;
    if (selectedDocuments.length === 0) { list.innerHTML = ''; return; }
    list.innerHTML = selectedDocuments.map((f, i) => 
        `<div style="display:flex;justify-content:space-between;align-items:center;background:#1F2937;padding:0.75rem;border-radius:8px;margin-bottom:0.5rem"><div style="display:flex;align-items:center;gap:0.75rem"><span style="font-size:1.5rem">📄</span><div><p style="color:#fff;font-size:0.875rem;font-weight:500">${f.name}</p><p style="color:#9CA3AF;font-size:0.75rem">${(f.size/1024).toFixed(1)} KB</p></div></div><button type="button" onclick="removeDocument(${i})" style="padding:0.25rem 0.5rem;background:transparent;color:#EF4444;border:1px solid #EF4444;border-radius:4px;cursor:pointer;font-size:0.875rem">Remove</button></div>`
    ).join('');
}

function removeDocument(index) {
    selectedDocuments.splice(index, 1);
    displayDocumentsList();
}

async function createClippitProject(e) {
    e.preventDefault();
    
    try {
        let mainImageUrl = null;
        let documentUrls = [];

        // Upload main image
        if (selectedMainImage) {
            const imagePath = `projects/${Date.now()}_${selectedMainImage.name}`;
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(imagePath, selectedMainImage);
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(imagePath);
            
            mainImageUrl = publicUrl;
        }

        // Upload documents
        for (const doc of selectedDocuments) {
            const docPath = `projects/${Date.now()}_${doc.name}`;
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(docPath, doc);
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(docPath);
            
            documentUrls.push({ name: doc.name, url: publicUrl, size: doc.size });
        }

        const projectData = {
            project_name: document.getElementById('project-name').value,
            category: document.getElementById('project-category').value,
            investment_type: document.getElementById('investment-type').value,
            overview: document.getElementById('project-overview').value,
            seeking_amount: parseFloat(document.getElementById('seeking-amount').value),
            valuation: document.getElementById('valuation').value ? parseFloat(document.getElementById('valuation').value) : null,
            technologies: document.getElementById('technologies').value || null,
            timeline: document.getElementById('timeline').value || null,
            team_size: document.getElementById('team-size').value ? parseInt(document.getElementById('team-size').value) : null,
            status: document.getElementById('project-status').value,
            main_image_url: mainImageUrl,
            documents: documentUrls.length > 0 ? documentUrls : null,
            questions_count: 0,
            offers_count: 0
        };

        const { error } = await supabase.from('clippit_projects').insert([projectData]);
        if (error) throw error;

        closeModal();
        showNotification('Project created successfully!', 'success');
        loadClippitProjects();
    } catch (error) {
        console.error('Create error:', error);
        showNotification('Failed to create project: ' + error.message, 'error');
    }
}

async function viewClippitProjectDetails(projectId) {
    try {
        const { data: project, error } = await supabase
            .from('clippit_projects')
            .select('*')
            .eq('id', projectId)
            .single();
        
        if (error) throw error;
        if (!project) {
            showNotification('Project not found', 'error');
            return;
        }

        const statusColors = {
            draft: { bg: 'rgba(107,114,128,0.2)', color: '#9CA3AF', label: 'DRAFT' },
            published: { bg: 'rgba(16,185,129,0.2)', color: '#10B981', label: 'PUBLISHED' },
            archived: { bg: 'rgba(239,68,68,0.2)', color: '#EF4444', label: 'ARCHIVED' }
        };
        const st = statusColors[project.status] || statusColors.draft;

        const modalContent = `
            <div style="max-height: 70vh; overflow-y: auto; padding-right: 0.5rem;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                    <div>
                        <h2 style="color: #40E0D0; font-size: 1.75rem; margin-bottom: 0.5rem;">${project.project_name}</h2>
                        <p style="color: #9CA3AF; text-transform: capitalize;">${project.category.replace('-', ' ')}</p>
                    </div>
                    <span style="background: ${st.bg}; color: ${st.color}; padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">${st.label}</span>
                </div>

                ${project.main_image_url ? `
                    <div style="margin-bottom: 1.5rem;">
                        <img src="${project.main_image_url}" alt="${project.project_name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px;">
                    </div>
                ` : ''}

                <!-- Overview -->
                <div style="background: #111827; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h3 style="color: #40E0D0; margin-bottom: 1rem;">Overview</h3>
                    <p style="color: #fff; line-height: 1.8;">${project.overview || 'No overview provided'}</p>
                </div>

                <!-- Investment Details -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px;">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Seeking Amount</p>
                        <p style="color: #FBB624; font-weight: 700; font-size: 1.5rem;">$${parseFloat(project.seeking_amount || 0).toLocaleString()}</p>
                    </div>
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px;">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Investment Type</p>
                        <p style="color: #fff; font-weight: 600; font-size: 1.125rem; text-transform: capitalize;">${(project.investment_type || 'equity').replace('-', ' ')}</p>
                    </div>
                    ${project.valuation ? `
                        <div style="background: #111827; padding: 1.5rem; border-radius: 12px;">
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Valuation</p>
                            <p style="color: #40E0D0; font-weight: 700; font-size: 1.5rem;">$${parseFloat(project.valuation).toLocaleString()}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Additional Details -->
                ${project.technologies || project.timeline || project.team_size ? `
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <h3 style="color: #40E0D0; margin-bottom: 1rem;">Additional Details</h3>
                        ${project.technologies ? `<p style="color: #fff; margin-bottom: 0.75rem;"><strong style="color: #9CA3AF;">Technologies:</strong> ${project.technologies}</p>` : ''}
                        ${project.timeline ? `<p style="color: #fff; margin-bottom: 0.75rem;"><strong style="color: #9CA3AF;">Timeline:</strong> ${project.timeline}</p>` : ''}
                        ${project.team_size ? `<p style="color: #fff;"><strong style="color: #9CA3AF;">Team Size:</strong> ${project.team_size} members</p>` : ''}
                    </div>
                ` : ''}

                <!-- Engagement Stats -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <p style="color: #40E0D0; font-size: 2rem; font-weight: 700;">${project.questions_count || 0}</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">Questions Asked</p>
                    </div>
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <p style="color: #FBB624; font-size: 2rem; font-weight: 700;">${project.offers_count || 0}</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">Investment Offers</p>
                    </div>
                </div>

                <!-- Documents -->
                ${project.documents && project.documents.length > 0 ? `
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <h3 style="color: #40E0D0; margin-bottom: 1rem;">📎 Attached Documents</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${project.documents.map(doc => `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: #1F2937; padding: 1rem; border-radius: 8px;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <span style="font-size: 1.5rem;">📄</span>
                                        <div>
                                            <p style="color: #fff; font-weight: 500;">${doc.name}</p>
                                            <p style="color: #9CA3AF; font-size: 0.75rem;">${(doc.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <a href="${doc.url}" target="_blank" style="padding: 0.5rem 1rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 6px; text-decoration: none; font-size: 0.875rem;">Download</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid #4B5563;">
                    <button onclick="editClippitProject('${projectId}')" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">✏️ Edit Project</button>
                    <button onclick="closeModal()" style="flex: 1; padding: 0.75rem; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
                </div>
            </div>
        `;

        showModal(project.project_name, modalContent);
    } catch (error) {
        console.error('View details error:', error);
        showNotification('Failed to load project details', 'error');
    }
}

function showClippitProjectMenu(projectId) {
    showModal('Project Actions', `<div style="display:flex;flex-direction:column;gap:0.5rem"><button onclick="editClippitProject('${projectId}')" style="width:100%;padding:0.75rem;background:#111827;color:#fff;border:1px solid #4B5563;border-radius:8px;cursor:pointer;text-align:left">✏️ Edit Project</button><button onclick="togglePublishStatus('${projectId}')" style="width:100%;padding:0.75rem;background:#111827;color:#fff;border:1px solid #4B5563;border-radius:8px;cursor:pointer;text-align:left">🚀 Toggle Publish</button><button onclick="viewProjectAnalytics('${projectId}')" style="width:100%;padding:0.75rem;background:#111827;color:#fff;border:1px solid #4B5563;border-radius:8px;cursor:pointer;text-align:left">📊 Analytics</button><button onclick="duplicateClippitProject('${projectId}')" style="width:100%;padding:0.75rem;background:#111827;color:#fff;border:1px solid #4B5563;border-radius:8px;cursor:pointer;text-align:left">📋 Duplicate</button><button onclick="deleteClippitProject('${projectId}')" style="width:100%;padding:0.75rem;background:#111827;color:#EF4444;border:1px solid #4B5563;border-radius:8px;cursor:pointer;text-align:left">🗑️ Delete</button></div>`);
}

async function editClippitProject(id) {
    closeModal();
    
    try {
        const { data: project, error } = await supabase
            .from('clippit_projects')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!project) {
            showNotification('Project not found', 'error');
            return;
        }

        selectedMainImage = null;
        selectedDocuments = [];

        const modalContent = `
            <form onsubmit="updateClippitProject(event, '${id}')" style="display:flex;flex-direction:column;gap:1.5rem;max-height:70vh;overflow-y:auto;padding-right:0.5rem">
                <div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563">
                    <h4 style="color:#40E0D0;margin-bottom:1rem">Project Information</h4>
                    <div style="margin-bottom:1rem">
                        <label style="display:block;margin-bottom:0.5rem;color:#fff">Project Name *</label>
                        <input type="text" id="edit-project-name" value="${project.project_name || ''}" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
                        <div>
                            <label style="display:block;margin-bottom:0.5rem;color:#fff">Category *</label>
                            <select id="edit-project-category" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                                <option value="technology" ${project.category === 'technology' ? 'selected' : ''}>💻 Technology</option>
                                <option value="real-estate" ${project.category === 'real-estate' ? 'selected' : ''}>🏢 Real Estate</option>
                                <option value="healthcare" ${project.category === 'healthcare' ? 'selected' : ''}>🏥 Healthcare</option>
                                <option value="finance" ${project.category === 'finance' ? 'selected' : ''}>💰 Finance</option>
                                <option value="ecommerce" ${project.category === 'ecommerce' ? 'selected' : ''}>🛒 E-Commerce</option>
                                <option value="saas" ${project.category === 'saas' ? 'selected' : ''}>☁️ SaaS</option>
                                <option value="other" ${project.category === 'other' ? 'selected' : ''}>📦 Other</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:0.5rem;color:#fff">Investment Type *</label>
                            <select id="edit-investment-type" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                                <option value="equity" ${project.investment_type === 'equity' ? 'selected' : ''}>Equity</option>
                                <option value="debt" ${project.investment_type === 'debt' ? 'selected' : ''}>Debt</option>
                                <option value="revenue-share" ${project.investment_type === 'revenue-share' ? 'selected' : ''}>Revenue Share</option>
                                <option value="convertible-note" ${project.investment_type === 'convertible-note' ? 'selected' : ''}>Convertible Note</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:#fff">Overview *</label>
                        <textarea id="edit-project-overview" rows="4" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff;resize:vertical">${project.overview || ''}</textarea>
                    </div>
                </div>

                ${project.main_image_url ? `
                    <div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563">
                        <h4 style="color:#40E0D0;margin-bottom:1rem">Current Main Image</h4>
                        <img src="${project.main_image_url}" style="max-width:200px;border-radius:8px;margin-bottom:1rem">
                        <p style="color:#9CA3AF;font-size:0.875rem;margin-bottom:1rem">Upload a new image to replace</p>
                        <input type="file" id="edit-main-image-input" accept="image/*" onchange="handleMainImageSelect(event)" style="color:#9CA3AF">
                    </div>
                ` : `
                    <div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563">
                        <h4 style="color:#40E0D0;margin-bottom:1rem">Add Main Image</h4>
                        <input type="file" id="edit-main-image-input" accept="image/*" onchange="handleMainImageSelect(event)" style="color:#9CA3AF">
                    </div>
                `}

                <div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563">
                    <h4 style="color:#40E0D0;margin-bottom:1rem">Investment Details</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                        <div>
                            <label style="display:block;margin-bottom:0.5rem;color:#fff">Seeking Amount *</label>
                            <input type="number" id="edit-seeking-amount" value="${project.seeking_amount || ''}" required min="0" step="1000" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:0.5rem;color:#fff">Valuation</label>
                            <input type="number" id="edit-valuation" value="${project.valuation || ''}" min="0" step="10000" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                        </div>
                    </div>
                </div>

                <div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563">
                    <h4 style="color:#40E0D0;margin-bottom:1rem">Additional Details</h4>
                    <div style="margin-bottom:1rem">
                        <label style="display:block;margin-bottom:0.5rem;color:#fff">Technologies</label>
                        <input type="text" id="edit-technologies" value="${project.technologies || ''}" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                        <div>
                            <label style="display:block;margin-bottom:0.5rem;color:#fff">Timeline</label>
                            <input type="text" id="edit-timeline" value="${project.timeline || ''}" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:0.5rem;color:#fff">Team Size</label>
                            <input type="number" id="edit-team-size" value="${project.team_size || ''}" min="1" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                        </div>
                    </div>
                </div>

                <div style="background:#111827;padding:1.5rem;border-radius:12px;border:1px solid #4B5563">
                    <h4 style="color:#40E0D0;margin-bottom:1rem">Status</h4>
                    <select id="edit-project-status" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff">
                        <option value="draft" ${project.status === 'draft' ? 'selected' : ''}>📝 Draft</option>
                        <option value="published" ${project.status === 'published' ? 'selected' : ''}>✅ Published</option>
                        <option value="archived" ${project.status === 'archived' ? 'selected' : ''}>📦 Archived</option>
                    </select>
                </div>

                <div style="display:flex;gap:1rem">
                    <button type="submit" style="flex:1;padding:0.75rem 1.5rem;background:linear-gradient(135deg,#40E0D0,#36B8A8);color:#111827;border:none;border-radius:50px;font-weight:600;cursor:pointer">Update Project</button>
                    <button type="button" onclick="closeModal()" style="flex:1;padding:0.75rem 1.5rem;background:transparent;color:#40E0D0;border:2px solid #40E0D0;border-radius:50px;font-weight:600;cursor:pointer">Cancel</button>
                </div>
            </form>
        `;

        showModal('Edit Project', modalContent);
    } catch (error) {
        console.error('Edit project error:', error);
        showNotification('Failed to load project for editing', 'error');
    }
}

async function updateClippitProject(e, id) {
    e.preventDefault();
    
    try {
        let mainImageUrl = null;

        // Upload new main image if selected
        if (selectedMainImage) {
            const imagePath = `projects/${Date.now()}_${selectedMainImage.name}`;
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(imagePath, selectedMainImage);
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(imagePath);
            
            mainImageUrl = publicUrl;
        }

        const updateData = {
            project_name: document.getElementById('edit-project-name').value,
            category: document.getElementById('edit-project-category').value,
            investment_type: document.getElementById('edit-investment-type').value,
            overview: document.getElementById('edit-project-overview').value,
            seeking_amount: parseFloat(document.getElementById('edit-seeking-amount').value),
            valuation: document.getElementById('edit-valuation').value ? parseFloat(document.getElementById('edit-valuation').value) : null,
            technologies: document.getElementById('edit-technologies').value || null,
            timeline: document.getElementById('edit-timeline').value || null,
            team_size: document.getElementById('edit-team-size').value ? parseInt(document.getElementById('edit-team-size').value) : null,
            status: document.getElementById('edit-project-status').value
        };

        // Only update image if new one was uploaded
        if (mainImageUrl) {
            updateData.main_image_url = mainImageUrl;
        }

        const { error } = await supabase
            .from('clippit_projects')
            .update(updateData)
            .eq('id', id);
        
        if (error) throw error;

        closeModal();
        showNotification('Project updated successfully!', 'success');
        loadClippitProjects();
    } catch (error) {
        console.error('Update error:', error);
        showNotification('Failed to update project: ' + error.message, 'error');
    }
}
async function viewProjectAnalytics(id) {
    closeModal();
    
    try {
        const { data: project, error } = await supabase
            .from('clippit_projects')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!project) {
            showNotification('Project not found', 'error');
            return;
        }

        // Generate mock analytics data (in production, this would come from real tracking)
        const viewsData = [12, 18, 15, 24, 31, 28, 35];
        const questionsData = [2, 3, 1, 5, 4, 6, 3];
        const offersData = [0, 1, 0, 2, 1, 3, 1];
        
        const totalViews = viewsData.reduce((a, b) => a + b, 0);
        const totalQuestions = project.questions_count || 0;
        const totalOffers = project.offers_count || 0;
        const conversionRate = totalViews > 0 ? ((totalOffers / totalViews) * 100).toFixed(1) : 0;

        const modalContent = `
            <div style="max-height: 70vh; overflow-y: auto; padding-right: 0.5rem;">
                <!-- Header -->
                <div style="margin-bottom: 2rem;">
                    <h2 style="color: #40E0D0; font-size: 1.75rem; margin-bottom: 0.5rem;">${project.project_name}</h2>
                    <p style="color: #9CA3AF;">Analytics & Performance Overview</p>
                </div>

                <!-- Key Metrics -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(54, 184, 168, 0.05)); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(64, 224, 208, 0.3);">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Total Views</p>
                        <h3 style="color: #40E0D0; font-size: 2rem; font-weight: 800;">${totalViews}</h3>
                        <p style="color: #10B981; font-size: 0.875rem;">Last 7 days</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05)); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3);">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Questions</p>
                        <h3 style="color: #FBB624; font-size: 2rem; font-weight: 800;">${totalQuestions}</h3>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">Total received</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Offers</p>
                        <h3 style="color: #10B981; font-size: 2rem; font-weight: 800;">${totalOffers}</h3>
                        <p style="color: #10B981; font-size: 0.875rem;">Investment offers</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05)); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(168, 85, 247, 0.3);">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Conversion Rate</p>
                        <h3 style="color: #A855F7; font-size: 2rem; font-weight: 800;">${conversionRate}%</h3>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">Offers/Views</p>
                    </div>
                </div>

                <!-- Views Trend -->
                <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563; margin-bottom: 2rem;">
                    <h3 style="color: #fff; margin-bottom: 1rem;">📈 Views Over Time</h3>
                    <div style="display: flex; align-items: end; gap: 0.5rem; height: 150px;">
                        ${viewsData.map((value, i) => {
                            const height = (value / Math.max(...viewsData)) * 100;
                            return `
                                <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                                    <div style="width: 100%; background: linear-gradient(180deg, #40E0D0, #36B8A8); border-radius: 4px 4px 0 0; height: ${height}%; min-height: 20px; display: flex; align-items: start; justify-content: center; padding-top: 0.5rem;">
                                        <span style="color: #111827; font-size: 0.75rem; font-weight: 600;">${value}</span>
                                    </div>
                                    <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: 0.5rem;">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Engagement Breakdown -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                        <h3 style="color: #fff; margin-bottom: 1rem;">❓ Questions Timeline</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${questionsData.map((count, i) => `
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #9CA3AF; font-size: 0.875rem;">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}</span>
                                    <span style="color: #40E0D0; font-weight: 600;">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                        <h3 style="color: #fff; margin-bottom: 1rem;">💰 Offers Timeline</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${offersData.map((count, i) => `
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #9CA3AF; font-size: 0.875rem;">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}</span>
                                    <span style="color: #FBB624; font-weight: 600;">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Insights -->
                <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563; margin-bottom: 2rem;">
                    <h3 style="color: #fff; margin-bottom: 1rem;">💡 Insights</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="padding: 1rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 4px;">
                            <p style="color: #10B981; font-weight: 600; margin-bottom: 0.25rem;">Strong Performance</p>
                            <p style="color: #9CA3AF; font-size: 0.875rem;">Views increased by 42% this week compared to last week</p>
                        </div>
                        <div style="padding: 1rem; background: rgba(64, 224, 208, 0.1); border-left: 3px solid #40E0D0; border-radius: 4px;">
                            <p style="color: #40E0D0; font-weight: 600; margin-bottom: 0.25rem;">High Engagement</p>
                            <p style="color: #9CA3AF; font-size: 0.875rem;">Questions are coming in steadily, showing strong investor interest</p>
                        </div>
                        ${totalOffers > 0 ? `
                            <div style="padding: 1rem; background: rgba(251, 191, 36, 0.1); border-left: 3px solid #FBB624; border-radius: 4px;">
                                <p style="color: #FBB624; font-weight: 600; margin-bottom: 0.25rem;">Investment Interest</p>
                                <p style="color: #9CA3AF; font-size: 0.875rem;">You've received ${totalOffers} investment offer${totalOffers > 1 ? 's' : ''} - review and respond promptly</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Close Button -->
                <div style="display: flex; justify-content: center; padding-top: 1rem; border-top: 1px solid #4B5563;">
                    <button onclick="closeModal()" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Close Analytics</button>
                </div>
            </div>
        `;

        showModal('📊 Project Analytics', modalContent);
    } catch (error) {
        console.error('Analytics error:', error);
        showNotification('Failed to load analytics', 'error');
    }
}

async function duplicateClippitProject(id) {
    closeModal();
    
    try {
        const { data: project, error } = await supabase
            .from('clippit_projects')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!project) {
            showNotification('Project not found', 'error');
            return;
        }

        // Create duplicate with modified name
        const duplicateData = {
            project_name: `${project.project_name} (Copy)`,
            category: project.category,
            investment_type: project.investment_type,
            overview: project.overview,
            seeking_amount: project.seeking_amount,
            valuation: project.valuation,
            technologies: project.technologies,
            timeline: project.timeline,
            team_size: project.team_size,
            status: 'draft', // Always create duplicates as drafts
            main_image_url: project.main_image_url, // Reference same image
            documents: project.documents, // Reference same documents
            questions_count: 0,
            offers_count: 0
        };

        const { error: insertError } = await supabase
            .from('clippit_projects')
            .insert([duplicateData]);
        
        if (insertError) throw insertError;

        showNotification('Project duplicated successfully!', 'success');
        loadClippitProjects();
    } catch (error) {
        console.error('Duplicate error:', error);
        showNotification('Failed to duplicate project: ' + error.message, 'error');
    }
}

async function togglePublishStatus(id) {
    try {
        closeModal();
        const { data: project, error: fetchError } = await supabase
            .from('clippit_projects')
            .select('status, project_name')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;

        const newStatus = project.status === 'published' ? 'draft' : 'published';
        const { error } = await supabase
            .from('clippit_projects')
            .update({ status: newStatus })
            .eq('id', id);
        if (error) throw error;

        showNotification(`Project ${newStatus === 'published' ? 'published' : 'moved to drafts'}!`, 'success');
        loadClippitProjects();
    } catch (error) {
        console.error('Toggle error:', error);
        showNotification('Failed to update status', 'error');
    }
}

async function deleteClippitProject(id) {
    try {
        const { data: project, error: fetchError } = await supabase
            .from('clippit_projects')
            .select('project_name, main_image_url, documents')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;

        if (!confirm(`Delete "${project.project_name}"? This cannot be undone.`)) {
            closeModal();
            return;
        }

        // Delete files from storage
        if (project.main_image_url) {
            const path = project.main_image_url.split('/').pop();
            await supabase.storage.from(STORAGE_BUCKET).remove([`projects/${path}`]);
        }
        if (project.documents) {
            const paths = project.documents.map(d => `projects/${d.url.split('/').pop()}`);
            await supabase.storage.from(STORAGE_BUCKET).remove(paths);
        }

        const { error } = await supabase.from('clippit_projects').delete().eq('id', id);
        if (error) throw error;

        closeModal();
        showNotification('Project deleted successfully', 'success');
        loadClippitProjects();
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete project', 'error');
    }
}

// Filter Clippit Projects by Status
async function filterClippitProjects(status) {
    // Update filter button styling
    const filterButtons = document.querySelectorAll('.clippit-project-filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#111827';
        btn.style.color = '#9CA3AF';
        btn.style.borderColor = '#4B5563';
    });
    
    // Activate clicked button
    const activeBtn = event.target;
    activeBtn.classList.add('active');
    activeBtn.style.background = 'rgba(64, 224, 208, 0.2)';
    activeBtn.style.color = '#40E0D0';
    activeBtn.style.borderColor = '#40E0D0';
    
    // If switching to ideas view, show project ideas
    if (status === 'ideas') {
        currentView = 'ideas';
        showProjectIdeas();
        updateHeaderButton();
        return;
    }
    
    // Otherwise load filtered projects from database
    currentView = 'projects';
    updateHeaderButton();
    
    try {
        const container = document.getElementById('clippit-projects-grid');
        if (container) container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#9CA3AF">Loading...</div>';

        let query = supabase.from('clippit_projects').select('*').order('created_at', { ascending: false });
        
        // Apply status filter
        if (status !== 'all') {
            switch(status) {
                case 'development':
                case 'completed':
                    query = query.eq('status', status);
                    break;
                case 'published':
                    query = query.eq('status', 'published');
                    break;
                case 'for-sale':
                    query = query.eq('status', 'published'); // For sale items are published
                    break;
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        displayClippitProjects(data || []);
        
        // Show notification
        const statusLabels = {
            'all': 'All Projects',
            'development': 'In Development',
            'completed': 'Completed Projects',
            'published': 'Published Projects',
            'for-sale': 'Projects For Sale'
        };
        
        showNotification(`Filtered by: ${statusLabels[status]}`, 'info');
    } catch (error) {
        console.error('Filter error:', error);
        showNotification('Failed to filter projects', 'error');
    }
}

// Project Ideas Management
function showProjectIdeas() {
    currentView = 'ideas';
    const container = document.getElementById('clippit-projects-grid');
    if (!container) return;

    // Update header button text and action
    updateHeaderButton();

    if (projectIdeas.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem">
                <div style="font-size:4rem;margin-bottom:1rem">💡</div>
                <h3 style="color:#fff;margin-bottom:0.5rem">No Project Ideas Yet</h3>
                <p style="color:#9CA3AF;margin-bottom:1.5rem">Start brainstorming with your team</p>
                <button onclick="showAddIdeaModal()" style="padding:0.75rem 1.5rem;background:linear-gradient(135deg,#40E0D0,#36B8A8);color:#111827;border:none;border-radius:50px;font-weight:600;cursor:pointer">+ Add First Idea</button>
            </div>
        `;
        return;
    }

    container.innerHTML = projectIdeas.map((idea, index) => `
        <div style="background:#111827;border-radius:12px;padding:1.5rem;border:1px solid #4B5563;transition:all 0.2s" onmouseenter="this.style.borderColor='#40E0D0'" onmouseleave="this.style.borderColor='#4B5563'">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem">
                <span style="background:rgba(251,191,36,0.2);color:#FBB624;padding:0.25rem 0.75rem;border-radius:12px;font-size:0.75rem;font-weight:600">💡 IDEA</span>
                <button onclick="deleteProjectIdea(${index})" style="padding:0.25rem 0.5rem;background:transparent;color:#EF4444;border:1px solid #EF4444;border-radius:6px;cursor:pointer;font-size:0.875rem">Delete</button>
            </div>
            
            <div style="margin-bottom:1rem">
                <h3 style="color:#40E0D0;font-size:1.25rem;margin-bottom:0.5rem">${idea.title}</h3>
                <p style="color:#9CA3AF;font-size:0.875rem;line-height:1.6;margin-bottom:0.75rem">${idea.description}</p>
            </div>
            
            ${idea.notes ? `
                <div style="background:#1F2937;padding:1rem;border-radius:8px;margin-bottom:1rem">
                    <p style="color:#6B7280;font-size:0.75rem;font-weight:600;margin-bottom:0.5rem">NOTES:</p>
                    <p style="color:#9CA3AF;font-size:0.875rem;line-height:1.6">${idea.notes}</p>
                </div>
            ` : ''}
            
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:1rem;border-top:1px solid #4B5563">
                <p style="color:#6B7280;font-size:0.75rem">Added by ${idea.author}</p>
                <p style="color:#6B7280;font-size:0.75rem">${new Date(idea.date).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

function updateHeaderButton() {
    const headerBtn = document.querySelector('#section-clippit-projects button[onclick*="showCreateClippitProjectModal"]');
    if (headerBtn) {
        if (currentView === 'ideas') {
            headerBtn.textContent = '+ Add Project Idea';
            headerBtn.setAttribute('onclick', 'showAddIdeaModal()');
        } else {
            headerBtn.textContent = '+ Create New Project';
            headerBtn.setAttribute('onclick', 'showCreateClippitProjectModal()');
        }
    }
}

function showAddIdeaModal() {
    showModal('💡 Add Project Idea', `
        <form onsubmit="addProjectIdea(event)" style="display:flex;flex-direction:column;gap:1rem">
            <p style="color:#9CA3AF;margin-bottom:0.5rem">Share your project idea with the team</p>
            
            <div>
                <label style="display:block;margin-bottom:0.5rem;color:#fff">Title *</label>
                <input type="text" id="idea-title" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="AI-Powered Analytics Dashboard">
            </div>
            
            <div>
                <label style="display:block;margin-bottom:0.5rem;color:#fff">Description *</label>
                <textarea id="idea-description" rows="4" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff;resize:vertical" placeholder="Brief description of the project idea..."></textarea>
            </div>
            
            <div>
                <label style="display:block;margin-bottom:0.5rem;color:#fff">Additional Notes</label>
                <textarea id="idea-notes" rows="3" style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff;resize:vertical" placeholder="Target market, potential revenue, technology stack, etc. (optional)"></textarea>
            </div>
            
            <div>
                <label style="display:block;margin-bottom:0.5rem;color:#fff">Your Name *</label>
                <input type="text" id="idea-author" required style="width:100%;padding:0.75rem;background:#1F2937;border:1px solid #4B5563;border-radius:8px;color:#fff" placeholder="John Smith">
            </div>
            
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
                <button type="submit" style="flex:1;padding:0.75rem 1.5rem;background:linear-gradient(135deg,#40E0D0,#36B8A8);color:#111827;border:none;border-radius:50px;font-weight:600;cursor:pointer">Add Idea</button>
                <button type="button" onclick="closeModal()" style="flex:1;padding:0.75rem 1.5rem;background:transparent;color:#40E0D0;border:2px solid #40E0D0;border-radius:50px;font-weight:600;cursor:pointer">Cancel</button>
            </div>
        </form>
    `);
}

function addProjectIdea(event) {
    event.preventDefault();
    
    const newIdea = {
        id: Date.now(),
        title: document.getElementById('idea-title').value,
        description: document.getElementById('idea-description').value,
        notes: document.getElementById('idea-notes').value,
        author: document.getElementById('idea-author').value,
        date: new Date().toISOString()
    };
    
    projectIdeas.unshift(newIdea);
    localStorage.setItem('clippit_project_ideas', JSON.stringify(projectIdeas));
    
    closeModal();
    showNotification('Project idea added successfully!', 'success');
    showProjectIdeas(); // Refresh the view
}

function deleteProjectIdea(index) {
    if (confirm('Delete this project idea?')) {
        projectIdeas.splice(index, 1);
        localStorage.setItem('clippit_project_ideas', JSON.stringify(projectIdeas));
        showNotification('Project idea deleted', 'success');
        showProjectIdeas(); // Refresh the view
    }
}
