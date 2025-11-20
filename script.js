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
function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving items to localStorage:', error);
        alert('Could not save data. Your browser may have storage disabled.');
    }
}

// ============================================
// CHECKLIST RENDERING
// ============================================

/**
 * Render the entire checklist
 * Clears and rebuilds the checklist HTML
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

    // Render each item
    items.forEach((item, index) => {
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
function handleAddItem() {
    const text = newItemInput.value.trim();

    // Validate input
    if (text === '') {
        alert('Please enter an item name');
        return;
    }

    // Check for duplicates (optional, but helpful)
    const duplicate = items.find(item =>
        item.text.toLowerCase() === text.toLowerCase()
    );

    if (duplicate) {
        alert('This item already exists in your checklist');
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
function handleDeleteItem(index) {
    if (index >= 0 && index < items.length) {
        // Optional: Confirm deletion for better UX
        const itemText = items[index].text;
        const confirmed = confirm(`Delete "${itemText}"?`);

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
function handleReset() {
    if (items.length === 0) {
        alert('Your checklist is already empty');
        return;
    }

    // Check if any items are checked
    const hasCheckedItems = items.some(item => item.checked);

    if (!hasCheckedItems) {
        alert('All items are already unchecked');
        return;
    }

    // Confirm reset
    const confirmed = confirm('Reset checklist? This will uncheck all items.');

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
// UTILITY FUNCTIONS
// ============================================

/**
 * Optional: Export data for backup (not used in current version)
 */
function exportData() {
    return JSON.stringify(items, null, 2);
}

/**
 * Optional: Import data from backup (not used in current version)
 */
function importData(jsonString) {
    try {
        const imported = JSON.parse(jsonString);
        if (Array.isArray(imported)) {
            items = imported;
            saveItems();
            renderChecklist();
            return true;
        }
    } catch (error) {
        console.error('Import failed:', error);
        return false;
    }
}
