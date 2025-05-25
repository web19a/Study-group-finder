import { initLocalStorage, getThemePreference, setThemePreference, DATA_KEYS, addGroupMember, addJoinRequest, removeGroupMember, getGroups, saveGroups, getUsers, saveUsers, acceptJoinRequest, rejectJoinRequest } from './data.js';
import { renderApp, renderAuthForm, renderDashboard, loadCreateGroupForm, loadAllGroups, loadJoinedGroups, loadMyCreatedGroups, loadTeacherDashboard, loadGroupChat } from './ui.js'; // IMPORT loadGroupChat
import { registerUser, loginUser, logoutUser, getCurrentUser } from './auth.js';
import { showMessage, generateUniqueId } from './utils.js';

// --- Theme Toggling ---
function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
}

function setupThemeToggle() {
    const checkbox = document.getElementById('checkbox');
    if (!checkbox) return;

    const savedTheme = getThemePreference();
    if (savedTheme === 'dark') {
        checkbox.checked = true;
        applyTheme('dark');
    } else {
        applyTheme('light'); // Ensure light mode is applied by default if not dark
    }

    checkbox.addEventListener('change', (event) => {
        const newTheme = event.target.checked ? 'dark' : 'light';
        applyTheme(newTheme);
        setThemePreference(newTheme);
        console.log(`Theme set to: ${newTheme}`);
    });
}

// --- Authentication & Group Form Event Handlers ---
function attachFormListeners() {
    const appContainer = document.getElementById('app-container');

    // Listener for Login & Signup form submissions
    appContainer.addEventListener('submit', async (event) => {
        if (event.target.id === 'loginForm') {
            event.preventDefault();
            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const messageElement = document.getElementById('loginMessage');

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (username && password) {
                const user = loginUser(username, password);
                if (user) {
                    showMessage(messageElement, 'Login successful!', 'success');
                    setTimeout(() => renderDashboard(user), 1000); // Redirect to dashboard
                    setTimeout(() => {
                        // Default load to 'All Groups' for all users after login/refresh
                        loadAllGroups();
                        const allGroupsTab = document.getElementById('allGroupsTab');
                        if(allGroupsTab) {
                            document.querySelectorAll('.dashboard-nav .tab-button').forEach(btn => btn.classList.remove('active'));
                            allGroupsTab.classList.add('active');
                        }
                    }, 1200); // Load appropriate dashboard content after dashboard render
                } else {
                    showMessage(messageElement, 'Invalid username or password.', 'error');
                }
            } else {
                showMessage(messageElement, 'Please enter both username and password.', 'error');
            }
        } else if (event.target.id === 'signupForm') {
            event.preventDefault();
            const usernameInput = document.getElementById('signupUsername');
            const passwordInput = document.getElementById('signupPassword');
            const roleRadios = document.querySelectorAll('input[name="role"]');
            const messageElement = document.getElementById('signupMessage');

            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const role = Array.from(roleRadios).find(radio => radio.checked).value;

            if (username && password) {
                const newUser = registerUser(username, password, role);
                if (newUser) {
                    showMessage(messageElement, 'Registration successful! You can now log in.', 'success');
                    // Optionally, switch to login tab after successful signup
                    document.getElementById('loginTab').click();
                } else {
                    showMessage(messageElement, 'Username already exists. Please choose a different one.', 'error');
                }
            } else {
                showMessage(messageElement, 'Please fill in all fields.', 'error');
            }
        } else if (event.target.id === 'createGroupForm') { // Handle Create Group Form Submission
            event.preventDefault();
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showMessage(document.getElementById('createGroupMessage'), 'Please log in to create a group.', 'error');
                return;
            }

            const subject = document.getElementById('groupSubject').value.trim();
            const course = document.getElementById('groupCourse').value.trim();
            const description = document.getElementById('groupDescription').value.trim();
            const groupSize = parseInt(document.getElementById('groupSize').value);
            const status = document.querySelector('input[name="groupStatus"]:checked').value;
            const meetingDay = document.getElementById('meetingDay').value;
            const meetingStartTime = document.getElementById('meetingStartTime').value;
            const meetingEndTime = document.getElementById('meetingEndTime').value;
            const messageElement = document.getElementById('createGroupMessage');

            if (!subject || !course || !description || isNaN(groupSize) || groupSize < 2 || !meetingDay || !meetingStartTime || !meetingEndTime) {
                showMessage(messageElement, 'Please fill in all required fields correctly.', 'error');
                return;
            }

            // Simple time validation (endTime after startTime)
            if (meetingEndTime <= meetingStartTime) {
                showMessage(messageElement, 'End time must be after start time.', 'error');
                return;
            }

            const newGroup = {
                id: generateUniqueId(),
                creatorId: currentUser.id,
                subject,
                course,
                description,
                maxSize: groupSize, // Use maxSize for clarity in schema
                status,
                meetingSchedule: {
                    dayOfWeek: [meetingDay], // Store as array for future multiple days
                    startTime: meetingStartTime,
                    endTime: meetingEndTime,
                    recurrence: "weekly" // Default as per requirements
                },
                members: [currentUser.id], // Creator is automatically a member
                joinRequests: [],
                announcements: [],
                resources: [],
                chatMessages: [] // Initialize chat messages for the group
            };

            const groups = getGroups();
            groups.push(newGroup);
            saveGroups(groups);

            // Add the group to the creator's createdGroups and joinedGroups lists
            const users = getUsers();
            const creatorUser = users.find(u => u.id === currentUser.id);
            if (creatorUser) {
                // Ensure creator is also added to joinedGroups if not already
                if (!creatorUser.joinedGroups.includes(newGroup.id)) {
                    creatorUser.joinedGroups.push(newGroup.id);
                }
                if (!creatorUser.createdGroups.includes(newGroup.id)) {
                    creatorUser.createdGroups.push(newGroup.id);
                }
                saveUsers(users); // Save updated user
            }

            showMessage(messageElement, 'Study group created successfully!', 'success');
            // Optionally clear form or redirect after success
            event.target.reset(); // Clear the form
            setTimeout(() => {
                document.getElementById('myCreatedGroupsTab').click(); // Go to 'My Created Groups' after creating
            }, 1500);
        }
    });
}

// --- Dashboard Event Handlers ---
function attachDashboardListeners() {
    const appContainer = document.getElementById('app-container');

    // Logout button handler
    appContainer.addEventListener('click', (event) => {
        if (event.target.id === 'logoutBtn') {
            logoutUser();
            renderApp(); // Render login/signup page after logout
        }
    });

    // Dashboard navigation tabs
    appContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('tab-button') && target.closest('.dashboard-nav')) {
            // Remove 'active' from all tab buttons in the nav
            document.querySelectorAll('.dashboard-nav .tab-button').forEach(btn => btn.classList.remove('active'));
            // Add 'active' to the clicked button
            target.classList.add('active');

            // Logic to load specific content based on tab ID
            switch (target.id) {
                case 'allGroupsTab':
                    loadAllGroups();
                    break;
                case 'joinedGroupsTab':
                    loadJoinedGroups();
                    break;
                case 'createGroupTab':
                    loadCreateGroupForm();
                    break;
                case 'myCreatedGroupsTab': // NEW: Load My Created Groups
                    loadMyCreatedGroups();
                    break;
                case 'teacherDashboardTab':
                    loadTeacherDashboard();
                    break;
                default:
                    document.getElementById('dashboardContent').innerHTML = '<p class="info-text">Select a tab to view content.</p>';
            }
        }
    });

    // --- Group Action Buttons (Join, Request, Go to Chat, Leave, Accept/Reject) ---
    appContainer.addEventListener('click', (event) => {
        const target = event.target;
        const dashboardContent = document.getElementById('dashboardContent');
        let messageElement = dashboardContent.querySelector('.action-message-text');
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.classList.add('message-text', 'action-message-text');
            dashboardContent.prepend(messageElement); // Prepend to show at top
        }

        const currentUser = getCurrentUser();
        if (!currentUser) {
            showMessage(messageElement, 'You must be logged in to perform this action.', 'error');
            return;
        }

        // Handle general group actions (Join, Request, Leave, Go to Chat)
        if (target.classList.contains('btn-group-action')) {
            const action = target.dataset.action;
            const groupId = target.dataset.groupId;

            switch (action) {
                case 'join':
                    if (addGroupMember(groupId, currentUser.id)) {
                        showMessage(messageElement, 'Successfully joined the group!', 'success');
                        loadAllGroups(); // Re-render to show updated status
                    } else {
                        showMessage(messageElement, 'Could not join group. Already a member or group full.', 'error');
                    }
                    break;
                case 'request':
                    if (addJoinRequest(groupId, currentUser.id)) {
                        showMessage(messageElement, 'Join request sent! Waiting for approval.', 'success');
                        loadAllGroups(); // Re-render to show updated status
                    } else {
                        showMessage(messageElement, 'Could not send request. Already sent or a member.', 'error');
                    }
                    break;
                case 'leaveGroup':
                    if (removeGroupMember(groupId, currentUser.id)) {
                        showMessage(messageElement, 'Successfully left the group.', 'success');
                        loadJoinedGroups(); // Re-render joined groups
                    } else {
                        showMessage(messageElement, 'Could not leave group.', 'error');
                    }
                    break;
                case 'goToChat':
                    loadGroupChat(groupId); // NEW: Load the chat interface
                    // No message needed here, as the chat loads
                    break;
            }
        }

        // Handle Request Actions (Accept/Reject)
        if (target.classList.contains('btn-request-action')) {
            const action = target.dataset.action;
            const groupId = target.dataset.groupId;
            const userId = target.dataset.userId;

            // Retrieve users here to ensure it's defined within this scope
            const allUsers = getUsers();

            const groups = getGroups();
            const group = groups.find(g => g.id === groupId);

            if (!group || group.creatorId !== currentUser.id) {
                showMessage(messageElement, 'Permission Denied: You are not the creator of this group.', 'error');
                return;
            }

            switch (action) {
                case 'acceptRequest':
                    if (acceptJoinRequest(groupId, userId)) {
                        showMessage(messageElement, `Request from user ${allUsers.find(u=>u.id===userId).username} accepted!`, 'success');
                        loadMyCreatedGroups();
                    } else {
                        showMessage(messageElement, 'Failed to accept request.', 'error');
                    }
                    break;
                case 'rejectRequest':
                    if (rejectJoinRequest(groupId, userId)) {
                        showMessage(messageElement, `Request from user ${allUsers.find(u=>u.id===userId).username} rejected.`, 'info');
                        loadMyCreatedGroups();
                    } else {
                        showMessage(messageElement, 'Failed to reject request.', 'error');
                    }
                    break;
            }
        }

        // --- Chat Specific Event Handlers ---
        if (target.id === 'sendChatMessageBtn') {
            const chatMessageInput = document.getElementById('chatMessageInput');

            // --- CONSOLE.LOGS FOR DEBUGGING ---
            console.log('1. chatMessageInput element:', chatMessageInput);
            if (chatMessageInput) {
                console.log('2. chatMessageInput.value (before trim):', chatMessageInput.value);
            }

            const messageText = chatMessageInput.value.trim();

            // --- CONSOLE.LOGS FOR DEBUGGING ---
            console.log('3. messageText (after trim):', messageText);

            const chatContainer = target.closest('.group-chat-container');
            const groupId = chatContainer ? chatContainer.dataset.groupId : null;

            // --- CONSOLE.LOGS FOR DEBUGGING ---
            console.log('4. groupId:', groupId);

            if (messageText && groupId) {
                // --- CONSOLE.LOGS FOR DEBUGGING ---
                console.log('5. Calling addChatMessage with:', { groupId, senderId: currentUser.id, messageText });
                addChatMessage(groupId, currentUser.id, messageText);
                chatMessageInput.value = ''; // Clear input
                const groups = getGroups();
                const group = groups.find(g => g.id === groupId);
                if (group) {
                    renderChatMessages(group.id);
                }
            } else {
                // --- CONSOLE.LOGS FOR DEBUGGING ---
                console.log('6. Message cannot be sent: messageText empty or groupId null.', { messageText, groupId });
                showMessage(messageElement, 'Message cannot be empty.', 'error');
            }
        }

        if (event.target.id === 'backToJoinedGroupsBtn') {
            loadJoinedGroups(); // Go back to joined groups
            // Ensure the Joined Groups tab is active
            const joinedGroupsTab = document.getElementById('joinedGroupsTab');
            if(joinedGroupsTab) {
                document.querySelectorAll('.dashboard-nav .tab-button').forEach(btn => btn.classList.remove('active'));
                joinedGroupsTab.classList.add('active');
            }
        }
    });

    // Handle pressing Enter to send message
    appContainer.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && event.target.id === 'chatMessageInput') {
            document.getElementById('sendChatMessageBtn').click();
        }
    });
}

// Function to add a chat message (kept here for simplicity as it's tied to UI interaction)
function addChatMessage(groupId, senderId, text) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        const newMessage = {
            id: generateUniqueId(), // Unique ID for the message
            senderId: senderId,
            text: text, // This is the value being stored
            timestamp: new Date().toISOString() // ISO string for easy sorting/display
        };
        group.chatMessages.push(newMessage);
        // --- CONSOLE.LOGS FOR DEBUGGING ---
        console.log('7. New message added to group:', newMessage);
        console.log('8. Group chatMessages after add:', group.chatMessages);
        saveGroups(groups); // Save updated groups to localStorage
    } else {
        // --- CONSOLE.LOGS FOR DEBUGGING ---
        console.log('9. Group not found when trying to add message:', groupId);
    }
}

// --- Initial Application Load ---
document.addEventListener('DOMContentLoaded', () => {
    initLocalStorage(); // Ensure localStorage structures are set up
    setupThemeToggle(); // Apply and setup theme preference
    renderApp();        // Render the initial UI (login/signup or dashboard)

    // Initial load for dashboard content if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Default to loading 'All Groups' when dashboard is first shown
        loadAllGroups();
        // Ensure the 'All Groups' tab is marked active
        const allGroupsTab = document.getElementById('allGroupsTab');
        if(allGroupsTab) {
            document.querySelectorAll('.dashboard-nav .tab-button').forEach(btn => btn.classList.remove('active'));
            allGroupsTab.classList.add('active');
        }
    }

    // Attach event listeners for forms and navigation
    attachFormListeners();
    attachDashboardListeners();
});
