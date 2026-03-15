let currentEditingCard = null;

function addTaskWithLoading() {
    const btn = document.getElementById('addBtn');
    const input = document.getElementById('taskName').value;
    
    if (!input) return alert("Task title is required!");

    btn.innerText = "Processing...";
    btn.disabled = true;

    setTimeout(() => {
        createNewTask();
        btn.innerText = "Add Task";
        btn.disabled = false;
    }, 400);
}

function createNewTask() {
    const name = document.getElementById('taskName').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    const cat = document.getElementById('taskCategory').value;

    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
        <span style="font-size:0.65rem; font-weight:700; color:var(--primary);">${cat.toUpperCase()}</span>
        <h4 class="task-title">${name}</h4>
        <div class="task-meta">
            <div class="date-val">📅 ${date || 'No Date'}</div>
            <div class="time-val">⏰ ${time || '--:--'}</div>
        </div>
        <div class="actions">
            <button class="btn-action" onclick="moveNext(this)">Next →</button>
            <button class="btn-action" onclick="openEditModal(this)">Edit</button>
            <button class="btn-action" onclick="deleteTask(this)" style="color:var(--danger);">Delete</button>
        </div>
    `;

    document.querySelector('#todo .task-area').appendChild(card);
    document.getElementById('taskName').value = ""; // Reset Title
    updateCounts();
}

// FULL EDIT LOGIC
function openEditModal(btn) {
    currentEditingCard = btn.closest('.task-card');
    
    // Get existing values from the card
    const title = currentEditingCard.querySelector('.task-title').innerText;
    // Removing the emojis and extra text to get raw values for the inputs
    const date = currentEditingCard.querySelector('.date-val').innerText.replace('📅 ', '');
    const time = currentEditingCard.querySelector('.time-val').innerText.replace('⏰ ', '');

    // Fill inputs in the modal
    document.getElementById('editNameInput').value = title;
    document.getElementById('editDateInput').value = (date === 'No Date') ? '' : date;
    document.getElementById('editTimeInput').value = (time === '--:--') ? '' : time;

    document.getElementById('editModal').style.display = 'block';
}

function saveEdit() {
    const newName = document.getElementById('editNameInput').value;
    const newDate = document.getElementById('editDateInput').value;
    const newTime = document.getElementById('editTimeInput').value;

    if (newName && currentEditingCard) {
        currentEditingCard.querySelector('.task-title').innerText = newName;
        currentEditingCard.querySelector('.date-val').innerText = `📅 ${newDate || 'No Date'}`;
        currentEditingCard.querySelector('.time-val').innerText = `⏰ ${newTime || '--:--'}`;
        closeModal();
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingCard = null;
}

function moveNext(btn) {
    const card = btn.closest('.task-card');
    const parentId = card.parentElement.parentElement.id;

    if (parentId === 'todo') {
        document.querySelector('#doing .task-area').appendChild(card);
    } else if (parentId === 'doing') {
        card.classList.add('completed');
        btn.innerHTML = "✔️ Done";
        btn.disabled = true;
        document.querySelector('#done .task-area').appendChild(card);
    }
    updateCounts();
}

function deleteTask(btn) {
    const card = btn.closest('.task-card');
    card.style.opacity = "0";
    card.style.transform = "scale(0.9)";
    setTimeout(() => {
        card.remove();
        updateCounts();
    }, 200);
}

function updateCounts() {
    document.querySelectorAll('.column').forEach(col => {
        const count = col.querySelectorAll('.task-card').length;
        col.querySelector('.badge').innerText = count;
    });
}
