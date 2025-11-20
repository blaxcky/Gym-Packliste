/**
 * GYM PACKLIST - VANILLA JAVASCRIPT
 *
 * This script manages a reusable gym packing checklist.
 * All data is stored in localStorage for persistence.
 *
 * Data Structure:
 * localStorage['gymPacklist'] = JSON string of array:
 * [
 *   { text: "Towel", checked: false },
 *   { text: "Water bottle", checked: true },
 *   ...
 * ]
 */

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'gymPacklist';

// Default items shown on first use
const DEFAULT_ITEMS = [
    { text: 'Towel', checked: false },
    { text: 'Water bottle', checked: false },
    { text: 'Headphones', checked: false },
    { text: 'Gym shoes', checked: false },
    { text: 'Workout clothes', checked: false },
    { text: 'Lock', checked: false }
];

// ============================================
// STATE
// ============================================

let items = [];

// ============================================
// DOM ELEMENTS
// ============================================

const newItemInput = document.getElementById('newItemInput');
const addItemBtn = document.getElementById('addItemBtn');
const checklistContainer = document.getElementById('checklist');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');

// Modal elements
const modalOverlay = document.getElementById('customModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the app when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    renderChecklist();
    attachEventListeners();
});

/**
 * Attach all event listeners
 */
function attachEventListeners() {
    // Add item on button click
    addItemBtn.addEventListener('click', handleAddItem);

    // Add item on Enter key press
    newItemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    });

    // Reset checklist
    resetBtn.addEventListener('click', handleReset);

    // Export backup
    exportBtn.addEventListener('click', handleExport);

    // Import backup - trigger file input
    importBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    // Handle file selection
    importFileInput.addEventListener('change', handleImportFile);
}

// ============================================
// LOCALSTORAGE FUNCTIONS
// ============================================

/**
 * Load items from localStorage
 * If no data exists, initialize with default items
 */
function loadItems() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData) {
            // Parse existing data
            items = JSON.parse(storedData);
        } else {
            // First time user - set default items
            items = [...DEFAULT_ITEMS];
            saveItems();
        }
    } catch (error) {
        console.error('Error loading items from localStorage:', error);
        items = [...DEFAULT_ITEMS];
    }
}

/**
 * Save current items array to localStorage
 */
async function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving items to localStorage:', error);
        await showAlert(
            'Could not save data. Your browser may have storage disabled.',
            'Storage Error',
            'danger'
        );
    }
}

// ============================================
// CHECKLIST RENDERING
// ============================================

/**
 * Render the entire checklist
 * Clears and rebuilds the checklist HTML
 * Unchecked items are shown first, checked items move to bottom
 */
function renderChecklist() {
    // Clear existing content
    checklistContainer.innerHTML = '';

    // Show empty state if no items
    if (items.length === 0) {
        checklistContainer.innerHTML = `
            <div class="empty-state">
                <p>📝 Your checklist is empty</p>
                <p>Add your first item above!</p>
            </div>
        `;
        return;
    }

    // Sort items: unchecked first, then checked
    // Create array of items with their original indices
    const itemsWithIndices = items.map((item, index) => ({ item, index }));

    // Sort: unchecked (false) comes before checked (true)
    const sortedItems = itemsWithIndices.sort((a, b) => {
        // If checked status is different, sort by checked (false < true)
        if (a.item.checked !== b.item.checked) {
            return a.item.checked ? 1 : -1;
        }
        // If same checked status, maintain original order
        return a.index - b.index;
    });

    // Render each item with its original index (for event handlers)
    sortedItems.forEach(({ item, index }) => {
        const itemElement = createChecklistItemElement(item, index);
        checklistContainer.appendChild(itemElement);
    });
}

/**
 * Create a single checklist item element
 * @param {Object} item - Item object with text and checked properties
 * @param {number} index - Index of item in array
 * @returns {HTMLElement} - The checklist item element
 */
function createChecklistItemElement(item, index) {
    // Create item container
    const itemDiv = document.createElement('div');
    itemDiv.className = `checklist-item ${item.checked ? 'checked' : ''}`;

    // Create checkbox wrapper
    const checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => handleToggleItem(index));

    checkboxWrapper.appendChild(checkbox);

    // Create item text
    const textSpan = document.createElement('span');
    textSpan.className = 'item-text';
    textSpan.textContent = item.text;

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', 'Delete item');
    deleteBtn.addEventListener('click', () => handleDeleteItem(index));

    // Assemble the item
    itemDiv.appendChild(checkboxWrapper);
    itemDiv.appendChild(textSpan);
    itemDiv.appendChild(deleteBtn);

    return itemDiv;
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle adding a new item
 */
async function handleAddItem() {
    const text = newItemInput.value.trim();

    // Validate input
    if (text === '') {
        await showAlert('Please enter an item name', 'Error', 'danger');
        return;
    }

    // Check for duplicates (optional, but helpful)
    const duplicate = items.find(item =>
        item.text.toLowerCase() === text.toLowerCase()
    );

    if (duplicate) {
        await showAlert('This item already exists in your checklist', 'Duplicate Item', 'danger');
        return;
    }

    // Add new item (unchecked by default)
    const newItem = {
        text: text,
        checked: false
    };

    items.push(newItem);

    // Save and re-render
    saveItems();
    renderChecklist();

    // Clear input and focus for next item
    newItemInput.value = '';
    newItemInput.focus();
}

/**
 * Handle toggling an item's checked state
 * @param {number} index - Index of item to toggle
 */
function handleToggleItem(index) {
    if (index >= 0 && index < items.length) {
        items[index].checked = !items[index].checked;
        saveItems();
        renderChecklist();
    }
}

/**
 * Handle deleting an item
 * @param {number} index - Index of item to delete
 */
async function handleDeleteItem(index) {
    if (index >= 0 && index < items.length) {
        const itemText = items[index].text;
        const confirmed = await showConfirm(
            `Delete "${itemText}"?`,
            'Delete Item'
        );

        if (confirmed) {
            items.splice(index, 1);
            saveItems();
            renderChecklist();
        }
    }
}

/**
 * Handle resetting the checklist
 * Unchecks all items but keeps them in the list
 */
async function handleReset() {
    if (items.length === 0) {
        await showAlert('Your checklist is already empty', 'Notice');
        return;
    }

    // Check if any items are checked
    const hasCheckedItems = items.some(item => item.checked);

    if (!hasCheckedItems) {
        await showAlert('All items are already unchecked', 'Notice');
        return;
    }

    // Confirm reset
    const confirmed = await showConfirm(
        'This will uncheck all items. Continue?',
        'Reset Checklist'
    );

    if (confirmed) {
        // Uncheck all items
        items.forEach(item => {
            item.checked = false;
        });

        saveItems();
        renderChecklist();
    }
}

// ============================================
// BACKUP & RESTORE FUNCTIONS
// ============================================

/**
 * Handle export - download checklist as JSON file
 * Creates a backup file with timestamp in filename
 */
async function handleExport() {
    if (items.length === 0) {
        await showAlert('Your checklist is empty. Nothing to export.', 'Notice');
        return;
    }

    try {
        // Create JSON string with nice formatting
        const jsonString = JSON.stringify(items, null, 2);

        // Create blob from JSON
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `gym-packlist-backup-${timestamp}.json`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        await showAlert('Backup exported successfully!', 'Success', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        await showAlert('Export failed. Please try again.', 'Error', 'danger');
    }
}

/**
 * Handle import file selection
 * Reads selected JSON file and imports data
 */
async function handleImportFile(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
        await showAlert('Please select a valid JSON file.', 'Invalid File', 'danger');
        importFileInput.value = '';
        return;
    }

    // Read file
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const jsonString = e.target.result;
            const imported = JSON.parse(jsonString);

            // Validate data structure
            if (!Array.isArray(imported)) {
                throw new Error('Invalid data format: Expected an array');
            }

            // Validate each item has required properties
            const isValid = imported.every(item =>
                item.hasOwnProperty('text') &&
                item.hasOwnProperty('checked') &&
                typeof item.text === 'string' &&
                typeof item.checked === 'boolean'
            );

            if (!isValid) {
                throw new Error('Invalid data format: Items missing required properties');
            }

            // Confirm before overwriting
            const confirmed = await showConfirm(
                `Import ${imported.length} items?\n\nThis will replace your current checklist!`,
                'Import Backup'
            );

            if (confirmed) {
                items = imported;
                saveItems();
                renderChecklist();
                await showAlert('Import successful!', 'Success', 'success');
            }
        } catch (error) {
            console.error('Import failed:', error);
            await showAlert(
                `Import failed. Please check your file format.\n\nError: ${error.message}`,
                'Import Error',
                'danger'
            );
        } finally {
            // Reset file input so same file can be selected again
            importFileInput.value = '';
        }
    };

    reader.onerror = async () => {
        await showAlert('Error reading file. Please try again.', 'Error', 'danger');
        importFileInput.value = '';
    };

    // Start reading the file
    reader.readAsText(file);
}

// ============================================
// CUSTOM MODAL SYSTEM
// ============================================

/**
 * Show custom modal with title, message, and actions
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} confirmText - Text for confirm button
 * @param {string} confirmType - Button type: 'default', 'danger', 'success'
 * @param {boolean} showCancel - Whether to show cancel button
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showModal(title, message, confirmText = 'OK', confirmType = 'default', showCancel = true) {
    return new Promise((resolve) => {
        // Set content
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalConfirm.textContent = confirmText;

        // Set button style
        modalConfirm.className = 'btn-modal btn-confirm';
        if (confirmType === 'danger') {
            modalConfirm.classList.add('danger');
        } else if (confirmType === 'success') {
            modalConfirm.classList.add('success');
        }

        // Show/hide cancel button
        modalCancel.style.display = showCancel ? 'block' : 'none';

        // Show modal
        modalOverlay.classList.add('active');

        // Handle confirm
        const handleConfirm = () => {
            modalOverlay.classList.remove('active');
            cleanup();
            resolve(true);
        };

        // Handle cancel
        const handleCancel = () => {
            modalOverlay.classList.remove('active');
            cleanup();
            resolve(false);
        };

        // Handle backdrop click
        const handleBackdrop = (e) => {
            if (e.target === modalOverlay) {
                handleCancel();
            }
        };

        // Cleanup function
        const cleanup = () => {
            modalConfirm.removeEventListener('click', handleConfirm);
            modalCancel.removeEventListener('click', handleCancel);
            modalOverlay.removeEventListener('click', handleBackdrop);
        };

        // Attach event listeners
        modalConfirm.addEventListener('click', handleConfirm);
        modalCancel.addEventListener('click', handleCancel);
        modalOverlay.addEventListener('click', handleBackdrop);
    });
}

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (default: 'Confirm')
 * @returns {Promise<boolean>} - True if confirmed
 */
async function showConfirm(message, title = 'Confirm') {
    return await showModal(title, message, 'Confirm', 'default', true);
}

/**
 * Show alert dialog
 * @param {string} message - Alert message
 * @param {string} title - Dialog title (default: 'Notice')
 * @param {string} type - Alert type: 'default', 'danger', 'success'
 * @returns {Promise<boolean>} - Always true
 */
async function showAlert(message, title = 'Notice', type = 'default') {
    return await showModal(title, message, 'OK', type, false);
}
