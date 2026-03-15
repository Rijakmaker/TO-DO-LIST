// Elements
const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const timeInput = document.getElementById('timeInput');
const categoryInput = document.getElementById('categoryInput');
const addBtn = document.getElementById('addBtn');
const modeToggle = document.getElementById('modeToggle');
const todoList = document.getElementById('todoList');
const doingList = document.getElementById('doingList');
const doneList = document.getElementById('doneList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks.forEach(t => { if(t.notified===undefined) t.notified=false; });

// Save & Render
function saveTasks(){ localStorage.setItem('tasks',JSON.stringify(tasks)); }

function renderTasks(){
    todoList.innerHTML=''; doingList.innerHTML=''; doneList.innerHTML='';

    tasks.forEach((task,index)=>{
        const li=document.createElement('li');
        li.draggable=true;
        li.dataset.index=index;
        li.className=task.completed?'completed':'';

        let subtaskHtml='';
        if(task.subtasks){ subtaskHtml=`<ul class="subtasks">${task.subtasks.map((sub,i)=>`<li>${sub}<button onclick="deleteSubtask(${index},${i})">x</button></li>`).join('')}</ul>`; }

        li.innerHTML=`
            <div class="task-info">
                <span onclick="toggleComplete(${index})">${task.text}</span>
                ${task.deadline?`<span> Due: ${task.deadline}</span>`:''}
                ${task.time?`<span> At: ${task.time}</span>`:''}
                ${task.category?`<span> Category: ${task.category}</span>`:''}
                ${subtaskHtml}
            </div>
            <div>
                <button class="edit" onclick="editTask(${index})">Edit</button>
                <button class="delete" onclick="deleteTask(${index})">Delete</button>
                <button class="add-subtask" onclick="addSubtask(${index})">+Subtask</button>
                <button class="status-btn" onclick="changeStatus(${index},'todo')">➖</button>
                <button class="status-btn" onclick="changeStatus(${index},'doing')">➡️</button>
                <button class="status-btn" onclick="changeStatus(${index},'done')">✅</button>
                <button class="status-btn" onclick="changeStatus(${index},'cancel')">❌</button>
                <button class="change-time" onclick="changeTime(${index})">⏰ Change</button>
            </div>
        `;

        // Drag events
        li.addEventListener('dragstart',dragStart);
        li.addEventListener('dragover',dragOver);
        li.addEventListener('drop',drop);

        if(task.status==='doing') doingList.appendChild(li);
        else if(task.status==='done') doneList.appendChild(li);
        else if(task.status==='cancel'){} // optional hide canceled tasks
        else todoList.appendChild(li);
    });
}

// CRUD
function addTask(){
    const text=taskInput.value.trim(); if(!text) return;
    tasks.push({text, deadline:deadlineInput.value, time:timeInput.value, category:categoryInput.value, status:'todo', completed:false, subtasks:[], notified:false});
    taskInput.value=''; deadlineInput.value=''; timeInput.value=''; categoryInput.value='';
    saveTasks(); renderTasks();
}
function deleteTask(index){ tasks.splice(index,1); saveTasks(); renderTasks(); }
function toggleComplete(index){ tasks[index].completed=!tasks[index].completed; saveTasks(); renderTasks(); }
function editTask(index){ const task=tasks[index]; const newText=prompt("Edit task",task.text); if(newText){task.text=newText; task.notified=false; saveTasks(); renderTasks(); } }
function addSubtask(index){ const sub=prompt("Enter subtask"); if(sub){ tasks[index].subtasks.push(sub); saveTasks(); renderTasks(); } }
function deleteSubtask(tIndex,sIndex){ tasks[tIndex].subtasks.splice(sIndex,1); saveTasks(); renderTasks(); }

// Change time/date
function changeTime(index){
    const newDate=prompt("Enter new date (YYYY-MM-DD)", tasks[index].deadline);
    const newTime=prompt("Enter new time (HH:MM)", tasks[index].time);
    if(newDate) tasks[index].deadline=newDate;
    if(newTime) tasks[index].time=newTime;
    tasks[index].notified=false;
    saveTasks(); renderTasks();
}

// Status buttons
function changeStatus(index,status){
    if(status==='cancel'){ tasks[index].status='todo'; tasks[index].completed=false; } 
    else { tasks[index].status=status; if(status==='done') tasks[index].completed=true; else tasks[index].completed=false; }
    saveTasks(); renderTasks();
}

// Drag & Drop
let draggedIndex=null;
function dragStart(e){ draggedIndex=e.currentTarget.dataset.index; }
function dragOver(e){ e.preventDefault(); }
function drop(e){
    const targetList=e.currentTarget.parentElement.id;
    const targetStatus=targetList==='todoList'?'todo':targetList==='doingList'?'doing':'done';
    tasks[draggedIndex].status=targetStatus;
    saveTasks(); renderTasks();
}

// Dark mode
let darkMode=localStorage.getItem('darkMode')==='true';
function toggleMode(){ darkMode=!darkMode; document.body.classList.toggle('dark',darkMode); localStorage.setItem('darkMode',darkMode); }
modeToggle.addEventListener('click',toggleMode);
document.body.classList.toggle('dark',darkMode);

// Notifications + Voice + Popup
function checkReminders(){
    const now=new Date();
    tasks.forEach(task=>{
        if(task.time && task.deadline && !task.notified && task.status!=='done'){
            const [h,m]=task.time.split(':'); const [y,mon,d]=task.deadline.split('-');
            const tDate=new Date(y,mon-1,d,h,m);
            if(now>=tDate && now-tDate<60000){
                // Notification
                if(Notification.permission==="granted") new Notification("Task Reminder ⏰",{body:task.text});
                // Popup
                alert(`Reminder: ${task.text}`);
                // Voice
                if('speechSynthesis' in window){
                    const msg=new SpeechSynthesisUtterance(`Reminder: ${task.text}`);
                    window.speechSynthesis.speak(msg);
                }
                task.notified=true; saveTasks();
            }
        }
    });
}
setInterval(checkReminders,10000);
if("Notification" in window && Notification.permission!=="granted"){ Notification.requestPermission(); }

// Add task
addBtn.addEventListener('click',addTask);
taskInput.addEventListener('keypress',e=>{ if(e.key==='Enter') addTask(); });
renderTasks();
