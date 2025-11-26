// =====================================================
// COMMENTS & ACTIVITY FEED SYSTEM
// =====================================================
// Handles comments, activity logs, and @mentions
// =====================================================

// Global state
let currentUser = null;
let teamMembers = [];

// =====================================================
// INITIALIZATION
// =====================================================

async function initializeCommentsSystem() {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        currentUser = user;
        
        // Load team members for mentions
        await loadTeamMembers();
        
        console.log('Comments & Activity system initialized');
    } catch (error) {
        console.error('Error initializing comments system:', error);
    }
}

// Load team members for @mentions
async function loadTeamMembers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .order('full_name');
        
        if (error) throw error;
        
        teamMembers = data || [];
    } catch (error) {
        console.error('Error loading team members:', error);
    }
}

// =====================================================
// COMMENTS SECTION UI
// =====================================================

function renderCommentsSection(entityType, entityId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="comments-section" style="background: #1F2937; border-radius: 12px; border: 1px solid #374151;">
            <!-- Comments Header -->
            <div style="padding: 1.5rem; border-bottom: 1px solid #374151;">
                <h3 style="color: #40E0D0; font-size: 1.25rem; margin-bottom: 0.5rem;">Comments & Activity</h3>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="switchCommentsTab('comments')" class="comments-tab-btn active" data-tab="comments" style="padding: 0.5rem 1rem; background: rgba(64, 224, 208, 0.2); color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; cursor: pointer; font-weight: 600;">💬 Comments</button>
                    <button onclick="switchCommentsTab('activity')" class="comments-tab-btn" data-tab="activity" style="padding: 0.5rem 1rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer;">📋 Activity</button>
                </div>
            </div>
            
            <!-- Comments Tab -->
            <div id="comments-tab" class="comments-tab-content" style="padding: 1.5rem;">
                <!-- New Comment Form -->
                <div style="margin-bottom: 1.5rem;">
                    <textarea 
                        id="new-comment-${entityId}" 
                        placeholder="Add a comment... (use @ to mention someone)"
                        style="width: 100%; min-height: 100px; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical; font-family: inherit;"
                    ></textarea>
                    
                    <!-- Mention suggestions -->
                    <div id="mention-suggestions-${entityId}" class="mention-suggestions" style="display: none; position: absolute; background: #1F2937; border: 1px solid #40E0D0; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 1000;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                        <span style="color: #9CA3AF; font-size: 0.875rem;">Tip: Use @ to mention team members</span>
                        <button 
                            onclick="postComment('${entityType}', '${entityId}')"
                            style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
                        >Post Comment</button>
                    </div>
                </div>
                
                <!-- Comments List -->
                <div id="comments-list-${entityId}" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="text-align: center; padding: 2rem; color: #9CA3AF;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
                        <p>Loading comments...</p>
                    </div>
                </div>
            </div>
            
            <!-- Activity Tab -->
            <div id="activity-tab" class="comments-tab-content" style="display: none; padding: 1.5rem;">
                <div id="activity-list-${entityId}" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="text-align: center; padding: 2rem; color: #9CA3AF;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <p>Loading activity...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup mention detection
    setupMentionDetection(entityId);
    
    // Load comments and activity
    loadComments(entityType, entityId);
    loadActivity(entityType, entityId);
}

// Switch between comments and activity tabs
function switchCommentsTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.comments-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
            btn.style.background = 'rgba(64, 224, 208, 0.2)';
            btn.style.color = '#40E0D0';
            btn.style.borderColor = '#40E0D0';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#9CA3AF';
            btn.style.borderColor = '#4B5563';
        }
    });
    
    // Show/hide tab content
    document.querySelectorAll('.comments-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    document.getElementById(`${tab}-tab`).style.display = 'block';
}

// =====================================================
// MENTION DETECTION & AUTOCOMPLETE
// =====================================================

function setupMentionDetection(entityId) {
    const textarea = document.getElementById(`new-comment-${entityId}`);
    const suggestionsDiv = document.getElementById(`mention-suggestions-${entityId}`);
    
    if (!textarea || !suggestionsDiv) return;
    
    textarea.addEventListener('input', function(e) {
        const text = this.value;
        const cursorPos = this.selectionStart;
        
        // Check if we're typing after an @
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            
            // Check if there's a space after the @
            if (!textAfterAt.includes(' ')) {
                // Show mention suggestions
                showMentionSuggestions(textAfterAt, suggestionsDiv, textarea);
                return;
            }
        }
        
        // Hide suggestions
        suggestionsDiv.style.display = 'none';
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== textarea && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

function showMentionSuggestions(searchText, suggestionsDiv, textarea) {
    // Filter team members
    const filtered = teamMembers.filter(member => {
        const name = member.full_name || member.email;
        return name.toLowerCase().includes(searchText.toLowerCase());
    });
    
    if (filtered.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    // Render suggestions
    suggestionsDiv.innerHTML = filtered.map(member => {
        const name = member.full_name || member.email;
        const roleColor = member.role === 'admin' ? '#EF4444' : member.role === 'staff' ? '#40E0D0' : '#9CA3AF';
        
        return `
            <div 
                class="mention-suggestion-item"
                onclick="insertMention('${member.id}', '${name}', '${textarea.id}')"
                style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #374151; transition: background 0.2s;"
                onmouseenter="this.style.background='#111827'"
                onmouseleave="this.style.background='transparent'"
            >
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; color: #111827;">
                        ${name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p style="color: #fff; font-weight: 600; margin-bottom: 0.125rem;">${name}</p>
                        <p style="color: ${roleColor}; font-size: 0.75rem; text-transform: capitalize;">${member.role}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Position and show
    const rect = textarea.getBoundingClientRect();
    suggestionsDiv.style.position = 'absolute';
    suggestionsDiv.style.top = `${rect.bottom + window.scrollY + 5}px`;
    suggestionsDiv.style.left = `${rect.left + window.scrollX}px`;
    suggestionsDiv.style.width = `${rect.width}px`;
    suggestionsDiv.style.display = 'block';
}

function insertMention(userId, userName, textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);
    
    // Find the @ symbol
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    // Replace from @ to cursor with mention
    const beforeAt = textBeforeCursor.substring(0, lastAtIndex);
    textarea.value = `${beforeAt}@${userName} ${textAfterCursor}`;
    
    // Store mention data
    if (!textarea.dataset.mentions) {
        textarea.dataset.mentions = '[]';
    }
    const mentions = JSON.parse(textarea.dataset.mentions);
    mentions.push({ userId, userName });
    textarea.dataset.mentions = JSON.stringify(mentions);
    
    // Hide suggestions
    const suggestionsDiv = document.getElementById(`mention-suggestions-${textareaId.split('-').pop()}`);
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
    
    // Focus back on textarea
    textarea.focus();
    const newPos = beforeAt.length + userName.length + 2;
    textarea.setSelectionRange(newPos, newPos);
}

// =====================================================
// LOAD & DISPLAY COMMENTS
// =====================================================

async function loadComments(entityType, entityId) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .is('parent_id', null) // Only top-level comments
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById(`comments-list-${entityId}`);
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #9CA3AF;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }
        
        // Render comments
        container.innerHTML = data.map(comment => renderComment(comment, entityType, entityId)).join('');
        
        // Load replies for each comment
        data.forEach(comment => loadReplies(comment.id, entityType, entityId));
        
    } catch (error) {
        console.error('Error loading comments:', error);
        showNotification('Error loading comments', 'error');
    }
}

function renderComment(comment, entityType, entityId) {
    const isOwner = currentUser && comment.author_id === currentUser.id;
    const timeAgo = getTimeAgo(comment.created_at);
    const editedText = comment.edited ? '<span style="color: #9CA3AF; font-size: 0.75rem; font-style: italic;"> (edited)</span>' : '';
    
    return `
        <div class="comment-item" data-comment-id="${comment.id}" style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: #111827; flex-shrink: 0;">
                    ${comment.author_name.substring(0, 2).toUpperCase()}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div>
                            <p style="color: #fff; font-weight: 600;">${comment.author_name}</p>
                            <p style="color: #9CA3AF; font-size: 0.875rem;">${timeAgo}${editedText}</p>
                        </div>
                        ${isOwner ? `
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="editComment('${comment.id}', '${entityType}', '${entityId}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Edit</button>
                                <button onclick="deleteComment('${comment.id}', '${entityType}', '${entityId}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #EF4444; border: 1px solid #EF4444; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Delete</button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="comment-content" data-comment-id="${comment.id}" style="color: #E5E7EB; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${formatCommentContent(comment.content)}</div>
                    
                    <!-- Reply button -->
                    <button onclick="toggleReplyForm('${comment.id}')" style="margin-top: 0.75rem; padding: 0.25rem 0.75rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">💬 Reply</button>
                    
                    <!-- Reply form (hidden by default) -->
                    <div id="reply-form-${comment.id}" style="display: none; margin-top: 1rem;">
                        <textarea 
                            id="reply-text-${comment.id}"
                            placeholder="Write a reply..."
                            style="width: 100%; min-height: 80px; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical; margin-bottom: 0.5rem;"
                        ></textarea>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="postReply('${comment.id}', '${entityType}', '${entityId}')" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Post Reply</button>
                            <button onclick="toggleReplyForm('${comment.id}')" style="padding: 0.5rem 1rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 6px; cursor: pointer;">Cancel</button>
                        </div>
                    </div>
                    
                    <!-- Replies container -->
                    <div id="replies-${comment.id}" style="margin-top: 1rem; margin-left: 1rem; border-left: 2px solid #374151; padding-left: 1rem;">
                        <!-- Replies will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatCommentContent(content) {
    // Convert @mentions to styled spans
    return content.replace(/@(\w+(?:\s+\w+)*)/g, '<span style="color: #40E0D0; font-weight: 600;">@$1</span>');
}

// =====================================================
// LOAD REPLIES
// =====================================================

async function loadReplies(parentId, entityType, entityId) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        const container = document.getElementById(`replies-${parentId}`);
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = data.map(reply => renderReply(reply, entityType, entityId)).join('');
        
    } catch (error) {
        console.error('Error loading replies:', error);
    }
}

function renderReply(reply, entityType, entityId) {
    const isOwner = currentUser && reply.author_id === currentUser.id;
    const timeAgo = getTimeAgo(reply.created_at);
    
    return `
        <div class="reply-item" data-reply-id="${reply.id}" style="background: #1F2937; padding: 1rem; border-radius: 6px; margin-bottom: 0.75rem;">
            <div style="display: flex; gap: 0.75rem;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #A855F7, #9333EA); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; color: #fff; flex-shrink: 0;">
                    ${reply.author_name.substring(0, 2).toUpperCase()}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div>
                            <p style="color: #fff; font-weight: 600; font-size: 0.875rem;">${reply.author_name}</p>
                            <p style="color: #9CA3AF; font-size: 0.75rem;">${timeAgo}</p>
                        </div>
                        ${isOwner ? `
                            <button onclick="deleteComment('${reply.id}', '${entityType}', '${entityId}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #EF4444; border: 1px solid #EF4444; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Delete</button>
                        ` : ''}
                    </div>
                    <p style="color: #E5E7EB; font-size: 0.875rem; line-height: 1.6;">${formatCommentContent(reply.content)}</p>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// POST COMMENT
// =====================================================

async function postComment(entityType, entityId) {
    try {
        const textarea = document.getElementById(`new-comment-${entityId}`);
        if (!textarea) return;
        
        const content = textarea.value.trim();
        if (!content) {
            showNotification('Please enter a comment', 'warning');
            return;
        }
        
        // Get user profile
        const profile = await getUserProfile(currentUser.id);
        if (!profile) {
            showNotification('Error getting user profile', 'error');
            return;
        }
        
        // Extract mentions
        const mentions = extractMentions(content);
        
        // Insert comment
        const { data, error } = await supabase
            .from('comments')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                content: content,
                author_id: currentUser.id,
                author_name: profile.full_name || profile.email,
                mentions: mentions
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Clear textarea
        textarea.value = '';
        textarea.dataset.mentions = '[]';
        
        // Reload comments
        await loadComments(entityType, entityId);
        
        showNotification('Comment posted!', 'success');
        
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification('Error posting comment', 'error');
    }
}

// Extract @mentions from content
function extractMentions(content) {
    const mentions = [];
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
        const mentionedName = match[1];
        
        // Find user by name
        const user = teamMembers.find(m => 
            (m.full_name || m.email).toLowerCase() === mentionedName.toLowerCase()
        );
        
        if (user) {
            mentions.push({
                userId: user.id,
                userName: user.full_name || user.email
            });
        }
    }
    
    return mentions;
}

// =====================================================
// POST REPLY
// =====================================================

async function postReply(parentId, entityType, entityId) {
    try {
        const textarea = document.getElementById(`reply-text-${parentId}`);
        if (!textarea) return;
        
        const content = textarea.value.trim();
        if (!content) {
            showNotification('Please enter a reply', 'warning');
            return;
        }
        
        // Get user profile
        const profile = await getUserProfile(currentUser.id);
        if (!profile) {
            showNotification('Error getting user profile', 'error');
            return;
        }
        
        // Extract mentions
        const mentions = extractMentions(content);
        
        // Insert reply
        const { data, error } = await supabase
            .from('comments')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                content: content,
                parent_id: parentId,
                author_id: currentUser.id,
                author_name: profile.full_name || profile.email,
                mentions: mentions
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Hide reply form
        toggleReplyForm(parentId);
        
        // Reload replies
        await loadReplies(parentId, entityType, entityId);
        
        showNotification('Reply posted!', 'success');
        
    } catch (error) {
        console.error('Error posting reply:', error);
        showNotification('Error posting reply', 'error');
    }
}

function toggleReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (!form) return;
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        document.getElementById(`reply-text-${commentId}`).focus();
    } else {
        form.style.display = 'none';
        document.getElementById(`reply-text-${commentId}`).value = '';
    }
}

// =====================================================
// EDIT & DELETE COMMENT
// =====================================================

async function editComment(commentId, entityType, entityId) {
    try {
        // Get current comment
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('*')
            .eq('id', commentId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Get content div
        const contentDiv = document.querySelector(`.comment-content[data-comment-id="${commentId}"]`);
        if (!contentDiv) return;
        
        // Replace with textarea
        const currentContent = comment.content;
        contentDiv.innerHTML = `
            <textarea 
                id="edit-text-${commentId}"
                style="width: 100%; min-height: 80px; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical; margin-bottom: 0.5rem;"
            >${currentContent}</textarea>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="saveEditComment('${commentId}', '${entityType}', '${entityId}')" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Save</button>
                <button onclick="cancelEditComment('${commentId}', \`${currentContent.replace(/`/g, '\\`')}\`)" style="padding: 0.5rem 1rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        document.getElementById(`edit-text-${commentId}`).focus();
        
    } catch (error) {
        console.error('Error editing comment:', error);
        showNotification('Error editing comment', 'error');
    }
}

async function saveEditComment(commentId, entityType, entityId) {
    try {
        const textarea = document.getElementById(`edit-text-${commentId}`);
        if (!textarea) return;
        
        const content = textarea.value.trim();
        if (!content) {
            showNotification('Comment cannot be empty', 'warning');
            return;
        }
        
        // Update comment
        const { error } = await supabase
            .from('comments')
            .update({ content: content })
            .eq('id', commentId);
        
        if (error) throw error;
        
        // Reload comments
        await loadComments(entityType, entityId);
        
        showNotification('Comment updated!', 'success');
        
    } catch (error) {
        console.error('Error saving comment:', error);
        showNotification('Error saving comment', 'error');
    }
}

function cancelEditComment(commentId, originalContent) {
    const contentDiv = document.querySelector(`.comment-content[data-comment-id="${commentId}"]`);
    if (!contentDiv) return;
    
    contentDiv.innerHTML = formatCommentContent(originalContent);
}

async function deleteComment(commentId, entityType, entityId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);
        
        if (error) throw error;
        
        // Reload comments
        await loadComments(entityType, entityId);
        
        showNotification('Comment deleted', 'success');
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification('Error deleting comment', 'error');
    }
}

// =====================================================
// LOAD & DISPLAY ACTIVITY
// =====================================================

async function loadActivity(entityType, entityId) {
    try {
        const { data, error } = await supabase
            .rpc('get_entity_activity', {
                p_entity_type: entityType,
                p_entity_id: entityId,
                p_limit: 50
            });
        
        if (error) throw error;
        
        const container = document.getElementById(`activity-list-${entityId}`);
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #9CA3AF;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                    <p>No activity yet</p>
                </div>
            `;
            return;
        }
        
        // Render activity timeline
        container.innerHTML = data.map(activity => renderActivity(activity)).join('');
        
    } catch (error) {
        console.error('Error loading activity:', error);
        showNotification('Error loading activity', 'error');
    }
}

function renderActivity(activity) {
    const timeAgo = getTimeAgo(activity.created_at);
    const actionIcon = getActionIcon(activity.action);
    const actionColor = getActionColor(activity.action);
    
    return `
        <div class="activity-item" style="display: flex; gap: 1rem; padding: 1rem; background: #111827; border-radius: 8px; border-left: 3px solid ${actionColor};">
            <div style="font-size: 1.5rem; flex-shrink: 0;">${actionIcon}</div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <p style="color: #fff; font-weight: 600;">${activity.user_name}</p>
                    <p style="color: #9CA3AF; font-size: 0.875rem;">${timeAgo}</p>
                </div>
                <p style="color: #E5E7EB; margin-bottom: 0.25rem;">${activity.description}</p>
                ${activity.changes ? renderChanges(activity.changes) : ''}
            </div>
        </div>
    `;
}

function renderChanges(changes) {
    if (!changes || typeof changes !== 'object') return '';
    
    const entries = Object.entries(changes);
    if (entries.length === 0) return '';
    
    return `
        <div style="margin-top: 0.5rem; padding: 0.75rem; background: #1F2937; border-radius: 6px; font-size: 0.875rem;">
            ${entries.map(([key, value]) => {
                if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
                    return `
                        <div style="margin-bottom: 0.5rem;">
                            <span style="color: #9CA3AF;">${formatFieldName(key)}:</span>
                            <span style="color: #EF4444; text-decoration: line-through; margin: 0 0.5rem;">${value.from}</span>
                            <span style="color: #9CA3AF;">→</span>
                            <span style="color: #10B981; margin-left: 0.5rem;">${value.to}</span>
                        </div>
                    `;
                }
                return '';
            }).join('')}
        </div>
    `;
}

function getActionIcon(action) {
    const icons = {
        'created': '✨',
        'updated': '📝',
        'deleted': '🗑️',
        'assigned': '👤',
        'unassigned': '👋',
        'status_changed': '🔄',
        'priority_changed': '⚡',
        'commented': '💬',
        'attached_file': '📎',
        'completed': '✅',
        'reopened': '🔓'
    };
    return icons[action] || '📋';
}

function getActionColor(action) {
    const colors = {
        'created': '#10B981',
        'updated': '#40E0D0',
        'deleted': '#EF4444',
        'assigned': '#A855F7',
        'unassigned': '#6B7280',
        'status_changed': '#FBB624',
        'priority_changed': '#EF4444',
        'commented': '#40E0D0',
        'attached_file': '#10B981',
        'completed': '#10B981',
        'reopened': '#FBB624'
    };
    return colors[action] || '#9CA3AF';
}

function formatFieldName(field) {
    return field
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// =====================================================
// LOG ACTIVITY
// =====================================================

async function logActivity(entityType, entityId, action, description, changes = null, metadata = null) {
    try {
        if (!currentUser) return;
        
        const profile = await getUserProfile(currentUser.id);
        if (!profile) return;
        
        const { error } = await supabase
            .from('activity_log')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                action: action,
                description: description,
                user_id: currentUser.id,
                user_name: profile.full_name || profile.email,
                changes: changes,
                metadata: metadata
            });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeCommentsSystem);
