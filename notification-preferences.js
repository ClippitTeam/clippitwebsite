// =====================================================
// NOTIFICATION PREFERENCES MANAGEMENT
// =====================================================
// Handles user notification and email preferences
// =====================================================

// Global state
let currentPreferences = null;

// =====================================================
// LOAD PREFERENCES
// =====================================================

async function loadNotificationPreferences() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        currentPreferences = profile?.notification_preferences || getDefaultPreferences();
        renderPreferencesUI();

    } catch (error) {
        console.error('Error loading notification preferences:', error);
        showNotification('Error loading preferences', 'error');
    }
}

function getDefaultPreferences() {
    return {
        email_enabled: true,
        email_immediate: true,
        email_digest: 'weekly',
        email_mentions: true,
        email_project_updates: true,
        email_assignments: true,
        email_comments: true,
        email_status_changes: true,
        push_enabled: true,
        digest_day: 'monday',
        digest_time: '09:00'
    };
}

// =====================================================
// RENDER UI
// =====================================================

function renderPreferencesUI() {
    const container = document.getElementById('notification-preferences-container');
    if (!container) return;

    container.innerHTML = `
        <div style="background: #1F2937; border-radius: 12px; padding: 2rem; border: 1px solid #374151;">
            <h2 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 1.5rem;">🔔 Notification Preferences</h2>
            
            <!-- Email Notifications -->
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #fff; font-size: 1.25rem; margin-bottom: 1rem;">📧 Email Notifications</h3>
                
                <!-- Master toggle -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #111827; border-radius: 8px; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #fff; font-weight: 600; margin-bottom: 0.25rem;">Enable Email Notifications</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0;">Receive notifications via email</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="email_enabled" ${currentPreferences.email_enabled ? 'checked' : ''} onchange="updatePreference('email_enabled', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Immediate vs Digest -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #111827; border-radius: 8px; margin-bottom: 1rem; ${!currentPreferences.email_enabled ? 'opacity: 0.5;' : ''}">
                    <div>
                        <p style="color: #fff; font-weight: 600; margin-bottom: 0.25rem;">Immediate Email Alerts</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0;">Get emails as soon as notifications arrive</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="email_immediate" ${currentPreferences.email_immediate ? 'checked' : ''} ${!currentPreferences.email_enabled ? 'disabled' : ''} onchange="updatePreference('email_immediate', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Digest Settings -->
                <div style="padding: 1rem; background: #111827; border-radius: 8px; margin-bottom: 1rem; ${!currentPreferences.email_enabled || currentPreferences.email_immediate ? 'opacity: 0.5;' : ''}">
                    <p style="color: #fff; font-weight: 600; margin-bottom: 0.75rem;">Digest Email Frequency</p>
                    <select id="email_digest" ${!currentPreferences.email_enabled || currentPreferences.email_immediate ? 'disabled' : ''} onchange="updatePreference('email_digest', this.value)" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 6px; color: #fff; font-size: 1rem;">
                        <option value="daily" ${currentPreferences.email_digest === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${currentPreferences.email_digest === 'weekly' ? 'selected' : ''}>Weekly</option>
                    </select>

                    ${currentPreferences.email_digest === 'weekly' ? `
                        <div style="margin-top: 1rem;">
                            <label style="display: block; color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Day of Week</label>
                            <select id="digest_day" onchange="updatePreference('digest_day', this.value)" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 6px; color: #fff; font-size: 1rem;">
                                <option value="monday" ${currentPreferences.digest_day === 'monday' ? 'selected' : ''}>Monday</option>
                                <option value="tuesday" ${currentPreferences.digest_day === 'tuesday' ? 'selected' : ''}>Tuesday</option>
                                <option value="wednesday" ${currentPreferences.digest_day === 'wednesday' ? 'selected' : ''}>Wednesday</option>
                                <option value="thursday" ${currentPreferences.digest_day === 'thursday' ? 'selected' : ''}>Thursday</option>
                                <option value="friday" ${currentPreferences.digest_day === 'friday' ? 'selected' : ''}>Friday</option>
                                <option value="saturday" ${currentPreferences.digest_day === 'saturday' ? 'selected' : ''}>Saturday</option>
                                <option value="sunday" ${currentPreferences.digest_day === 'sunday' ? 'selected' : ''}>Sunday</option>
                            </select>
                        </div>
                    ` : ''}

                    <div style="margin-top: 1rem;">
                        <label style="display: block; color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Time</label>
                        <input type="time" id="digest_time" value="${currentPreferences.digest_time || '09:00'}" onchange="updatePreference('digest_time', this.value)" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 6px; color: #fff; font-size: 1rem;">
                    </div>
                </div>

                <!-- Notification Type Preferences -->
                <div style="padding: 1rem; background: #111827; border-radius: 8px;">
                    <p style="color: #fff; font-weight: 600; margin-bottom: 1rem;">Email Me About</p>
                    
                    ${renderToggleOption('email_mentions', '💬 @Mentions', 'When someone mentions you', currentPreferences.email_mentions, !currentPreferences.email_enabled)}
                    ${renderToggleOption('email_assignments', '👤 Assignments', 'When you\'re assigned to a task', currentPreferences.email_assignments, !currentPreferences.email_enabled)}
                    ${renderToggleOption('email_comments', '💭 Comments', 'New comments on your items', currentPreferences.email_comments, !currentPreferences.email_enabled)}
                    ${renderToggleOption('email_status_changes', '🔄 Status Changes', 'When item status changes', currentPreferences.email_status_changes, !currentPreferences.email_enabled)}
                    ${renderToggleOption('email_project_updates', '📋 Project Updates', 'Important project updates', currentPreferences.email_project_updates, !currentPreferences.email_enabled)}
                </div>
            </div>

            <!-- Push Notifications -->
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #fff; font-size: 1.25rem; margin-bottom: 1rem;">🔔 Push Notifications</h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #111827; border-radius: 8px;">
                    <div>
                        <p style="color: #fff; font-weight: 600; margin-bottom: 0.25rem;">Enable Push Notifications</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0;">Show notifications in your browser</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="push_enabled" ${currentPreferences.push_enabled ? 'checked' : ''} onchange="updatePreference('push_enabled', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Save Button -->
            <div style="text-align: right;">
                <button onclick="saveAllPreferences()" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer;">
                    Save All Preferences
                </button>
            </div>
        </div>

        <!-- CSS for toggle switches -->
        <style>
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 24px;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #4B5563;
                transition: 0.3s;
                border-radius: 24px;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background: linear-gradient(135deg, #40E0D0, #36B8A8);
            }

            input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }

            input:disabled + .toggle-slider {
                opacity: 0.5;
                cursor: not-allowed;
            }
        </style>
    `;
}

function renderToggleOption(id, icon, label, value, disabled) {
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #374151; ${disabled ? 'opacity: 0.5;' : ''}">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.25rem;">${icon}</span>
                <span style="color: #E5E7EB;">${label}</span>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" id="${id}" ${value ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="updatePreference('${id}', this.checked)">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `;
}

// =====================================================
// UPDATE PREFERENCES
// =====================================================

function updatePreference(key, value) {
    currentPreferences[key] = value;
    
    // If email is disabled, disable immediate
    if (key === 'email_enabled' && !value) {
        currentPreferences.email_immediate = false;
    }
    
    // If immediate is enabled, it overrides digest
    if (key === 'email_immediate' && value) {
        currentPreferences.email_digest = 'none';
    }
    
    // Re-render to update UI state
    renderPreferencesUI();
}

async function saveAllPreferences() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ notification_preferences: currentPreferences })
            .eq('id', user.id);

        if (error) throw error;

        showNotification('Preferences saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving preferences:', error);
        showNotification('Error saving preferences', 'error');
    }
}

// =====================================================
// INITIALIZATION
// =====================================================

// Load preferences when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a page with preferences container
    if (document.getElementById('notification-preferences-container')) {
        loadNotificationPreferences();
    }
});
