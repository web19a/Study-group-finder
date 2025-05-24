import {
    saveToLocalStorage,
    getFromLocalStorage,
    generateUniqueId
} from './utils.js';

const LOCAL_STORAGE_KEYS = {
    USERS: 'sfg_users',
    GROUPS: 'sfg_groups',
    MESSAGES: 'sfg_messages',
    CURRENT_USER_ID: 'sfg_currentUserId',
    // To persist logged-in state across sessions
    THEME: 'sfg_theme' // To persist theme preference
};

/**
* Initializes the default data structures in localStorage if they don't exist.
*/
export function initLocalStorage() {
    if (!getFromLocalStorage(LOCAL_STORAGE_KEYS.USERS)) {
        saveToLocalStorage(LOCAL_STORAGE_KEYS.USERS, []);
    }
    if (!getFromLocalStorage(LOCAL_STORAGE_KEYS.GROUPS)) {
        saveToLocalStorage(LOCAL_STORAGE_KEYS.GROUPS, []);
    }
    if (!getFromLocalStorage(LOCAL_STORAGE_KEYS.MESSAGES)) {
        saveToLocalStorage(LOCAL_STORAGE_KEYS.MESSAGES, []);
    }
    // Set default theme if not present (e.g., 'light')
    if (!getFromLocalStorage(LOCAL_STORAGE_KEYS.THEME)) {
        saveToLocalStorage(LOCAL_STORAGE_KEYS.THEME, 'light');
    }
    console.log("Local Storage initialized.");
}

// --- User Data Operations ---
export function getUsers() {
    return getFromLocalStorage(LOCAL_STORAGE_KEYS.USERS);
}

export function saveUsers(users) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.USERS, users);
}

// --- Group Data Operations ---
export function getGroups() {
    return getFromLocalStorage(LOCAL_STORAGE_KEYS.GROUPS);
}

export function saveGroups(groups) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.GROUPS, groups);
}

// --- Message Data Operations ---
export function getMessages() {
    return getFromLocalStorage(LOCAL_STORAGE_KEYS.MESSAGES);
}

export function saveMessages(messages) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.MESSAGES, messages);
}

// --- Current User/Theme Data Operations ---
export function getCurrentUserId() {
    return getFromLocalStorage(LOCAL_STORAGE_KEYS.CURRENT_USER_ID);
}

export function setCurrentUserId(userId) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, userId);
}

export function getThemePreference() {
    return getFromLocalStorage(LOCAL_STORAGE_KEYS.THEME);
}

export function setThemePreference(theme) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.THEME, theme);
}

export const DATA_KEYS = LOCAL_STORAGE_KEYS; // Export keys for external use

// ... existing imports and functions ...

// --- User-Group Relationship Operations ---

/**
* Adds a user to a group's members list.
* @param {string} groupId - The ID of the group.
* @param {string} userId - The ID of the user.
* @returns {boolean} True if added, false if not found or already a member.
*/
export function addGroupMember(groupId, userId) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            saveGroups(groups);

            // Also update the user's joinedGroups list
            const users = getUsers();
            const user = users.find(u => u.id === userId);
            if (user && !user.joinedGroups.includes(groupId)) {
                user.joinedGroups.push(groupId);
                saveUsers(users);
            }
            return true;
        } else {
            console.warn(`User ${userId} is already a member of group ${groupId}.`);
        }
    } else {
        console.warn(`Group with ID ${groupId} not found.`);
    }
    return false;
}

/**
* Removes a user from a group's members list.
* @param {string} groupId - The ID of the group.
* @param {string} userId - The ID of the user.
* @returns {boolean} True if removed, false if not found or not a member.
*/
export function removeGroupMember(groupId, userId) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        const initialMembersLength = group.members.length;
        group.members = group.members.filter(id => id !== userId);

        if (group.members.length < initialMembersLength) {
            saveGroups(groups);

            // Also update the user's joinedGroups list
            const users = getUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                user.joinedGroups = user.joinedGroups.filter(id => id !== groupId);
                saveUsers(users);
            }
            return true;
        } else {
            console.warn(`User ${userId} was not a member of group ${groupId}.`);
        }
    } else {
        console.warn(`Group with ID ${groupId} not found.`);
    }
    return false;
}

/**
* Adds a user to a group's join requests list.
* @param {string} groupId - The ID of the group.
* @param {string} userId - The ID of the user requesting to join.
* @returns {boolean} True if added, false if not found or already requested/member.
*/
export function addJoinRequest(groupId, userId) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        // Ensure user is not already a member or has already sent a request
        if (!group.members.includes(userId) && !group.joinRequests.includes(userId)) {
            group.joinRequests.push(userId);
            saveGroups(groups);
            return true;
        } else {
            console.warn(`User ${userId} is already a member or has a pending request for group ${groupId}.`);
        }
    } else {
        console.warn(`Group with ID ${groupId} not found.`);
    }
    return false;
}

/**
* Removes a user from a group's join requests list.
* @param {string} groupId - The ID of the group.
* @param {string} userId - The ID of the user whose request to remove.
* @returns {boolean} True if removed, false if not found or not in requests.
*/
export function removeJoinRequest(groupId, userId) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        const initialRequestsLength = group.joinRequests.length;
        group.joinRequests = group.joinRequests.filter(id => id !== userId);

        if (group.joinRequests.length < initialRequestsLength) {
            saveGroups(groups);
            return true;
        } else {
            console.warn(`User ${userId} did not have a pending request for group ${groupId}.`);
        }
    } else {
        console.warn(`Group with ID ${groupId} not found.`);
    }
    return false;
}

// ... rest of the file ...

// ... existing imports and functions ...

// --- New functions for Join Request Management ---

/**
 * Accepts a join request for a group, moving the user from joinRequests to members.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user whose request is being accepted.
 * @returns {boolean} True if successful, false otherwise.
 */
export function acceptJoinRequest(groupId, userId) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        // 1. Remove user from joinRequests
        group.joinRequests = group.joinRequests.filter(id => id !== userId);

        // 2. Add user to members (addGroupMember also updates user's joinedGroups)
        const added = addGroupMember(groupId, userId); // Use existing addGroupMember logic

        if (added) {
            saveGroups(groups); // Save updated groups
            return true;
        } else {
            console.warn(`User ${userId} could not be added to members for group ${groupId}.`);
        }
    } else {
        console.warn(`Group with ID ${groupId} not found.`);
    }
    return false;
}

/**
 * Rejects a join request for a group, removing the user from joinRequests.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user whose request is being rejected.
 * @returns {boolean} True if successful, false otherwise.
 */
export function rejectJoinRequest(groupId, userId) {
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        const initialRequestsLength = group.joinRequests.length;
        group.joinRequests = group.joinRequests.filter(id => id !== userId);

        if (group.joinRequests.length < initialRequestsLength) {
            saveGroups(groups);
            return true;
        } else {
            console.warn(`User ${userId} did not have a pending request for group ${groupId}.`);
        }
    } else {
        console.warn(`Group with ID ${groupId} not found.`);
    }
    return false;
}

// ... rest of the file ...