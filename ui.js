import {
    getCurrentUser,
    isCurrentUserTeacher
} from './auth.js';
import {
    getGroups,
    getUsers
} from './data.js';
import {
    formatMeetingTime
} from './utils.js';

const appContainer = document.getElementById('app-container');

/**
* Renders the initial application view (login/signup or dashboard).
*/
export function renderApp() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        renderDashboard(currentUser);
    } else {
        renderAuthForm();
    }
}

/**
* Renders the authentication (login/signup) form.
*/
export function renderAuthForm() {
    appContainer.innerHTML = `
    <section class="auth-form-section">
    <h2>Welcome!</h2>
    <div class="auth-tabs">
    <button id="loginTab" class="tab-button active">Login</button>
    <button id="signupTab" class="tab-button">Sign Up</button>
    </div>
    <div id="authFormContent">
    </div>
    </section>
    `;
    loadLoginForm(); // Load login form by default
    attachAuthTabListeners();
}

/**
* Loads the login form into the authFormContent div.
*/
function loadLoginForm() {
    const authFormContent = document.getElementById('authFormContent');
    authFormContent.innerHTML = `
    <form id="loginForm" class="auth-form">
    <div class="form-group">
    <label for="loginUsername">Username</label>
    <input type="text" id="loginUsername" required autocomplete="username">
    </div>
    <div class="form-group">
    <label for="loginPassword">Password</label>
    <input type="password" id="loginPassword" required autocomplete="current-password">
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
    <p id="loginMessage" class="message-text"></p>
    </form>
    `;
    // Attach listener for login form submission in app.js
}

/**
* Loads the signup form into the authFormContent div.
*/
function loadSignupForm() {
    const authFormContent = document.getElementById('authFormContent');
    authFormContent.innerHTML = `
    <form id="signupForm" class="auth-form">
    <div class="form-group">
    <label for="signupUsername">Username</label>
    <input type="text" id="signupUsername" required autocomplete="new-username">
    </div>
    <div class="form-group">
    <label for="signupPassword">Password</label>
    <input type="password" id="signupPassword" required autocomplete="new-password">
    </div>
    <div class="form-group">
    <label>Role</label>
    <div class="radio-group">
    <input type="radio" id="roleStudent" name="role" value="student" checked>
    <label for="roleStudent">Student</label>
    <input type="radio" id="roleTeacher" name="role" value="teacher">
    <label for="roleTeacher">Teacher</label>
    </div>
    </div>
    <button type="submit" class="btn btn-primary">Sign Up</button>
    <p id="signupMessage" class="message-text"></p>
    </form>
    `;
    // Attach listener for signup form submission in app.js
}

/**
* Attaches event listeners for authentication tabs.
*/
function attachAuthTabListeners() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loadLoginForm();
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        loadSignupForm();
    });
}

/**
* Renders the dashboard view for a logged-in user.
* Includes 'My Created Groups' tab.
* @param {object} user - The current user object.
*/
export function renderDashboard(user) {
    appContainer.innerHTML = `
    <section class="dashboard-section">
    <div class="dashboard-header">
    <h2>Hello, ${user.username}!</h2>
    <p class="user-role">You are a ${user.role}.</p>
    <button id="logoutBtn" class="btn btn-secondary logout-btn">Logout</button>
    </div>

    <nav class="dashboard-nav">
    <button id="allGroupsTab" class="tab-button active">All Groups</button>
    <button id="joinedGroupsTab" class="tab-button">Joined Groups</button>
    <button id="createGroupTab" class="tab-button">Create New Group</button>
    <button id="myCreatedGroupsTab" class="tab-button">My Created Groups</button>
    ${user.role === 'teacher' ? `<button id="teacherDashboardTab" class="tab-button">Teacher Dashboard</button>`: ''}
    </nav>

    <div id="dashboardContent" class="dashboard-content">
    </div>
    </section>
    `;
}

/**
* Renders the form to create a new study group.
*/
export function loadCreateGroupForm() {
    const dashboardContent = document.getElementById('dashboardContent');
    dashboardContent.innerHTML = `
    <form id="createGroupForm" class="app-form">
    <h3>Create a New Study Group</h3>

    <div class="form-group">
    <label for="groupSubject">Subject</label>
    <input type="text" id="groupSubject" placeholder="e.g., Mathematics, History" required>
    </div>

    <div class="form-group">
    <label for="groupCourse">Course</label>
    <input type="text" id="groupCourse" placeholder="e.g., Calculus I, World History II" required>
    </div>

    <div class="form-group">
    <label for="groupDescription">Description</label>
    <textarea id="groupDescription" rows="4" placeholder="Briefly describe your group's focus, goals, or what you'll study." required></textarea>
    </div>

    <div class="form-group">
    <label for="groupSize">Max Group Size</label>
    <input type="number" id="groupSize" min="2" max="20" value="5" required>
    </div>

    <div class="form-group">
    <label>Group Status</label>
    <div class="radio-group">
    <input type="radio" id="statusPublic" name="groupStatus" value="public" checked>
    <label for="statusPublic">Public</label>
    <input type="radio" id="statusPrivate" name="groupStatus" value="private">
    <label for="statusPrivate">Private</label>
    </div>
    </div>

    <div class="form-group">
    <label>Recurring Meeting Time</label>
    <div class="meeting-time-inputs">
    <select id="meetingDay" required>
    <option value="">Select Day</option>
    <option value="Monday">Monday</option>
    <option value="Tuesday">Tuesday</option>
    <option value="Wednesday">Wednesday</option>
    <option value="Thursday">Thursday</option>
    <option value="Friday">Friday</option>
    <option value="Saturday">Saturday</option>
    <option value="Sunday">Sunday</option>
    </select>
    <input type="time" id="meetingStartTime" required>
    <span>-</span>
    <input type="time" id="meetingEndTime" required>
    </div>
    </div>

    <button type="submit" class="btn btn-primary">Create Group</button>
    <p id="createGroupMessage" class="message-text"></p>
    </form>
    `;
    // We'll attach the form submission listener in app.js
}

/**
* Renders a single group card for 'All Groups' or 'Joined Groups' views.
* Removed creator-specific management buttons as they are now in 'My Created Groups'.
* @param {object} group - The group object to render.
* @param {object} currentUser - The currently logged-in user object.
* @returns {string} HTML string for the group card.
*/
function renderGroupCard(group, currentUser) {
    const isMember = currentUser.joinedGroups.includes(group.id);
    const hasRequested = group.joinRequests.includes(currentUser.id);
    // const isCreator = group.creatorId === currentUser.id; // Not directly used for buttons here anymore

    let buttonHtml = '';
    if (isMember) {
        buttonHtml = `<button class="btn btn-primary btn-group-action" data-action="goToChat" data-group-id="${group.id}">Go to Chat</button>
        <button class="btn btn-secondary btn-group-action leave-group-btn" data-action="leaveGroup" data-group-id="${group.id}">Leave Group</button>`;
    } else if (hasRequested) {
        buttonHtml = `<button class="btn btn-secondary btn-group-action" data-action="pending" data-group-id="${group.id}" disabled>Request Pending</button>`;
    } else if (group.status === 'public') {
        buttonHtml = `<button class="btn btn-primary btn-group-action" data-action="join" data-group-id="${group.id}">Join Group</button>`;
    } else if (group.status === 'private') {
        buttonHtml = `<button class="btn btn-secondary btn-group-action" data-action="request" data-group-id="${group.id}">Request to Join</button>`;
    }

    const meetingTime = formatMeetingTime(group.meetingSchedule);

    // Get creator's username
    const users = getUsers();
    const creator = users.find(u => u.id === group.creatorId);
    const creatorUsername = creator ? creator.username: 'Unknown';


    return `
    <div class="group-card ${isMember ? 'group-card--joined': ''} ${group.status === 'private' ? 'group-card--private': ''}" data-group-id="${group.id}">
    <div class="group-card-header">
    <h3>${group.subject}: ${group.course}</h3>
    <span class="group-status-badge">${group.status === 'public' ? 'Public': 'Private'}</span>
    </div>
    <p class="group-description">${group.description}</p>
    <div class="group-details">
    <p><strong>Size:</strong> ${group.members.length}/${group.maxSize} members</p>
    <p><strong>Meeting:</strong> ${meetingTime}</p>
    <p><strong>Created by:</strong> ${creatorUsername} (${creator ? creator.role: 'N/A'})</p>
    </div>
    <div class="group-actions">
    ${buttonHtml}
    </div>
    </div>
    `;
}

/**
* Loads and displays all available groups.
*/
export function loadAllGroups() {
    const groups = getGroups();
    const currentUser = getCurrentUser();
    const dashboardContent = document.getElementById('dashboardContent');

    if (!currentUser) {
        dashboardContent.innerHTML = '<p class="error">Error: User not logged in.</p>';
        return;
    }

    dashboardContent.innerHTML = `
    <h3>All Available Study Groups</h3>
    <div class="groups-grid">
    ${groups.length > 0 ?
    groups.map(group => renderGroupCard(group, currentUser)).join(''):
    '<p class="info-text">No groups available yet. Be the first to create one!</p>'
    }
    </div>
    `;
}

/**
* Loads and displays groups the current user has joined.
*/
export function loadJoinedGroups() {
    const groups = getGroups();
    const currentUser = getCurrentUser();
    const dashboardContent = document.getElementById('dashboardContent');

    if (!currentUser) {
        dashboardContent.innerHTML = '<p class="error">Error: User not logged in.</p>';
        return;
    }

    const joinedGroups = groups.filter(group => currentUser.joinedGroups.includes(group.id));

    dashboardContent.innerHTML = `
    <h3>Your Joined Study Groups</h3>
    <div class="groups-grid">
    ${joinedGroups.length > 0 ?
    joinedGroups.map(group => renderGroupCard(group, currentUser)).join(''):
    '<p class="info-text">You haven\'t joined any groups yet. Explore "All Groups" to find one!</p>'
    }
    </div>
    `;
}

/**
* Renders the "My Created Groups" dashboard, showing groups created by the current user
* and their pending requests.
*/
export function loadMyCreatedGroups() {
    const currentUser = getCurrentUser();
    const dashboardContent = document.getElementById('dashboardContent');

    if (!currentUser) {
        dashboardContent.innerHTML = '<p class="error">Error: User not logged in.</p>';
        return;
    }

    const allGroups = getGroups();
    const users = getUsers(); // To display usernames of requesters
    const userCreatedGroups = allGroups.filter(group => group.creatorId === currentUser.id);

    let myCreatedGroupsHtml = `
    <h3>Your Created Study Groups</h3>
    <div class="created-groups-list">
    `;

    if (userCreatedGroups.length === 0) {
        myCreatedGroupsHtml += '<p class="info-text">You haven\'t created any groups yet. Go to "Create New Group" to get started!</p>';
    } else {
        myCreatedGroupsHtml += userCreatedGroups.map(group => {
            let requestsHtml = '';
            // Only show requests for private groups
            if (group.status === 'private' && group.joinRequests.length > 0) {
                requestsHtml = `
                <h4>Pending Join Requests (${group.joinRequests.length})</h4>
                <div class="pending-requests-list">
                ${group.joinRequests.map(requesterId => {
                    const requester = users.find(u => u.id === requesterId);
                    const requesterUsername = requester ? requester.username: 'Unknown User';
                    return `
                    <div class="pending-request-item">
                    <span>${requesterUsername} wants to join.</span>
                    <div class="request-actions">
                    <button class="btn btn-primary btn-small btn-request-action" data-action="acceptRequest" data-group-id="${group.id}" data-user-id="${requesterId}">Accept</button>
                    <button class="btn btn-secondary btn-small btn-request-action reject-btn" data-action="rejectRequest" data-group-id="${group.id}" data-user-id="${requesterId}">Reject</button>
                    </div>
                    </div>
                    `;
                }).join('')}
                </div>
                `;
            } else if (group.status === 'private' && group.joinRequests.length === 0) {
                requestsHtml = '<p class="info-text-small">No pending join requests for this private group.</p>';
            }
            // For public groups, no join requests to manage, so requestsHtml remains empty or specific message could be added.

            return `
            <div class="created-group-card">
            <div class="created-group-card-header">
            <h4>${group.subject}: ${group.course}</h4>
            <span class="group-status-badge">${group.status === 'public' ? 'Public': 'Private'}</span>
            </div>
            <p class="group-description">${group.description}</p>
            <p class="group-details"><strong>Members:</strong> ${group.members.length}/${group.maxSize}</p>
            <p class="group-details"><strong>Meeting:</strong> ${formatMeetingTime(group.meetingSchedule)}</p>
            ${requestsHtml}
            ${group.status === 'public' && group.creatorId === currentUser.id ?
            '<div class="group-actions"><button class="btn btn-primary btn-group-action" data-action="goToChat" data-group-id="' + group.id + '">Go to Chat</button></div>': ''
            }
            </div>
            `;
        }).join('');
    }

    myCreatedGroupsHtml += `</div>`; // Close created-groups-list

    dashboardContent.innerHTML = myCreatedGroupsHtml;
}


/**
* Renders the teacher-specific dashboard.
* This is now more of a placeholder for teacher-only GLOBAL management features.
* Individual group request management is in 'My Created Groups'.
*/
export function loadTeacherDashboard() {
    const currentUser = getCurrentUser();
    const dashboardContent = document.getElementById('dashboardContent');

    if (!currentUser || currentUser.role !== 'teacher') {
        dashboardContent.innerHTML = '<p class="error">Access Denied: Only teachers can view this dashboard.</p>';
        return;
    }

    dashboardContent.innerHTML = `
    <h3>Teacher Overview Dashboard</h3>
    <p class="info-text">This section is for broader teacher functionalities like managing all students, global announcements, or analytics.</p>
    <p class="info-text-small">To manage requests for groups you created, please go to "My Created Groups" tab.</p>
    <div class="teacher-global-tools">
    <h4>Global Teacher Tools (Coming Soon!)</h4>
    <ul>
    <li>View All Students</li>
    <li>Broadcast Announcement to All Groups</li>
    <li>Generate Activity Reports</li>
    </ul>
    </div>
    `;
}

// In js/ui.js, find the loadGroupChat function:

/**
* Loads and displays the chat interface for a specific study group.
* @param {string} groupId - The ID of the group to load the chat for.
*/
export function loadGroupChat(groupId) {
    const currentUser = getCurrentUser();
    const dashboardContent = document.getElementById('dashboardContent');
    const groups = getGroups();
    const group = groups.find(g => g.id === groupId);
    const users = getUsers(); // To display sender's username

    if (!currentUser || !group) {
        dashboardContent.innerHTML = '<p class="error">Error: Group not found or user not logged in.</p>';
        return;
    }

    // Check if the current user is a member of this group
    if (!group.members.includes(currentUser.id)) {
        dashboardContent.innerHTML = '<p class="error">Access Denied: You are not a member of this group\'s chat.</p>';
        return;
    }

    // ADD data-group-id="${groupId}" to the div below
    let chatHtml = `
    <div class="group-chat-container" data-group-id="${groupId}"> <div class="chat-header">
    <h3>Chat: ${group.subject} - ${group.course}</h3>
    <button id="backToJoinedGroupsBtn" class="btn btn-secondary btn-small">Back to Groups</button>
    </div>
    <div class="chat-messages" id="chatMessages">
    </div>
    <div class="chat-input-area">
    <input type="text" id="chatMessageInput" placeholder="Type your message..." autocomplete="off">
    <button id="sendChatMessageBtn" class="btn btn-primary">Send</button>
    </div>
    </div>
    `;

    dashboardContent.innerHTML = chatHtml;
    renderChatMessages(group.id); // Load existing messages

    // Scroll chat to bottom
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

/**
* Renders the messages for a given group's chat.
* @param {string} groupId - The ID of the group.
*/
// In js/ui.js, find the renderChatMessages function:

function renderChatMessages(groupId) {
    const chatMessagesContainer = document.getElementById('chatMessages');
    const groups = getGroups();
    const group = groups.find(g => g.id === groupId);
    const users = getUsers();
    const currentUser = getCurrentUser();

    if (!group || !chatMessagesContainer) return;

    if (group.chatMessages.length === 0) {
        chatMessagesContainer.innerHTML = '<p class="info-text-small">No messages yet. Be the first to send one!</p>';
        return;
    }

    console.log('10. Messages being rendered:', group.chatMessages); // This log confirms data is here

    chatMessagesContainer.innerHTML = group.chatMessages.map(msg => {
        console.log('11. Rendering message:', msg);
        console.log('12. Message text:', msg.text); // This log confirms individual msg.text is correct

        const sender = users.find(u => u.id === msg.senderId);
        const senderUsername = sender ? sender.username: 'Unknown User';
        const messageClass = msg.senderId === currentUser.id ? 'message-self': 'message-other';

        return `
        <div class="chat-message ${messageClass}">
            <span class="sender-name">${senderUsername}</span>
            <p class="message-text">${msg.text}</p>  
            <span class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
        </div>
        `;
    }).join('');

    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}
