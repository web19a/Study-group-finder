import { getUsers, saveUsers, setCurrentUserId, getCurrentUserId, DATA_KEYS } from './data.js';
import { generateUniqueId } from './utils.js';

// Placeholder for a simple password hashing function (NOT secure for real apps, but good for local simulation)
function hashPassword(password) {
    // In a real app, use a robust crypto library.
    // For local storage, a simple concatenation/encoding is often sufficient to prevent plain text storage.
    return btoa(password + 'studygroup_salt'); // Base64 encode with a simple salt
}

/**
 * Registers a new user.
 * @param {string} username
 * @param {string} password
 * @param {'student' | 'teacher'} role
 * @returns {object | null} The new user object if successful, null if username exists.
 */
export function registerUser(username, password, role) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        console.warn(`Registration failed: Username '${username}' already exists.`);
        return null;
    }

    const newUser = {
        id: generateUniqueId(),
        username: username,
        password: hashPassword(password),
        role: role,
        joinedGroups: [],
        createdGroups: []
    };

    users.push(newUser);
    saveUsers(users);
    console.log(`User '${username}' (${role}) registered successfully.`);
    return newUser;
}

/**
 * Logs in a user.
 * @param {string} username
 * @param {string} password
 * @returns {object | null} The logged-in user object if successful, null otherwise.
 */
export function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === hashPassword(password));

    if (user) {
        setCurrentUserId(user.id);
        console.log(`User '${username}' logged in successfully.`);
        return user;
    } else {
        console.warn("Login failed: Invalid username or password.");
        return null;
    }
}

/**
 * Logs out the current user.
 */
export function logoutUser() {
    setCurrentUserId(null); // Clear current user ID
    console.log("User logged out.");
}

/**
 * Gets the currently logged-in user object.
 * @returns {object | null} The current user object, or null if no one is logged in.
 */
export function getCurrentUser() {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
        return null;
    }
    const users = getUsers();
    return users.find(u => u.id === currentUserId);
}

/**
 * Checks if the current user is a teacher.
 * @returns {boolean} True if the current user is a teacher, false otherwise.
 */
export function isCurrentUserTeacher() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'teacher';
}