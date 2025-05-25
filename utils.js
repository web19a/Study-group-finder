/**
 * Generates a simple unique ID.
 * @returns {string} A unique ID string.
 */
export function generateUniqueId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

/**
 * Saves data to localStorage.
 * @param {string} key - The key under which to store the data.
 * @param {any} data - The data to store. Will be JSON stringified.
 */
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Data saved to localStorage under key: ${key}`);
    } catch (error) {
        console.error(`Error saving to localStorage for key "${key}":`, error);
    }
}

/**
 * Retrieves data from localStorage.
 * @param {string} key - The key from which to retrieve the data.
 * @returns {any | null} The parsed data, or null if not found/error.
 */
export function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error retrieving from localStorage for key "${key}":`, error);
        return null;
    }
}

/**
 * Removes an item from an array stored in localStorage by ID.
 * @param {string} key - The localStorage key (e.g., 'users', 'groups').
 * @param {string} id - The ID of the item to remove.
 * @returns {boolean} True if item was removed, false otherwise.
 */
export function removeItemFromLocalStorageArray(key, id) {
    let items = getFromLocalStorage(key);
    if (!Array.isArray(items)) {
        console.warn(`Attempted to remove item from non-array or missing key: ${key}`);
        return false;
    }

    const initialLength = items.length;
    items = items.filter(item => item.id !== id);

    if (items.length < initialLength) {
        saveToLocalStorage(key, items);
        return true;
    }
    return false; // Item not found
}

// ... existing functions ...

/**
 * Displays a temporary message (success, error, info) on the UI.
 * Assumes the element has .message-text, .success, .error, .info classes for styling.
 * @param {HTMLElement} element - The DOM element to display the message in.
 * @param {string} text - The message text.
 * @param {'success' | 'error' | 'info'} type - The type of message.
 */
export function showMessage(element, text, type) {
    element.className = `messages-text ${type}`; // Set initial type class
    element.textContent = text;
    // Force reflow to ensure transition works
    void element.offsetWidth;
    element.classList.add('show'); // Trigger animation

    // Optional: Hide message after a few seconds
    setTimeout(() => {
        element.classList.remove('show');
        setTimeout(() => element.textContent = '', 500); // Wait for fade out
    }, 4000); // Message visible for 4 seconds
}

// ... existing imports and functions ...

/**
 * Formats a meeting schedule object into a readable string.
 * @param {object} schedule - The meeting schedule object.
 * @returns {string} Formatted time string.
 */
export function formatMeetingTime(schedule) {
    if (!schedule || !schedule.dayOfWeek || !schedule.startTime || !schedule.endTime) {
        return 'Not specified';
    }
    const days = Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek.join(' & ') : schedule.dayOfWeek;
    return `${days}s at ${schedule.startTime} - ${schedule.endTime}`;
}
