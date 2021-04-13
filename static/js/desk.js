/**
 ********************************************************
 * @documentation --> ../../docs-code/Client/desk.js.md *
 ********************************************************
**/

// IMPORTS AND GLOBAL
import validation from './scripts/validation.js';
const socket = io();

// DESK DATA FETCH
let userData, deskData, adminData, memberData;
fetch('/desk/deskdata')
.then(res => res.json())
.then(data => {
    userData = data.user;       // OBJECT - USER:               _id, name
    deskData = data.desk;       // OBJECT - DESK:               _id, name, color, lists
    adminData = data.admin;     // OBJECT - ADMIN:              _id, name, email, image
    memberData = data.members;  // ARRAY OF OBJECTS - MEMBERS:  _id, name, email, image
    renderDeskname();
    renderMembers();
    addRoleDependingEvents();
    renderLists();

    addOnlineStatus(userData._id);
    setupSocket();
    fadeOutLoader();
});

// SETUP FUNCTIONS / RENDER FUNCTIONS
function fadeOutLoader(){
    const fadeWindow = document.querySelector('#fadeInWindow');
    fadeWindow.style.opacity = 0;
    setTimeout(() => {
        fadeWindow.remove();
    }, 1000);
};
function renderDeskname(){
    document.querySelector('#topDeskname').textContent = deskData.name;
    document.querySelector('#renameInput').value = deskData.name;
    document.querySelector('#chatDeskname').textContent = deskData.name;
    document.title = `Task-App | ${deskData.name}`;
};
function renderMembers(){
    const admin = document.querySelector('#admin');
    const url = adminData.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_50,c_scale/${adminData.image}`;
    admin.style.backgroundImage = `url(${url})`;
    admin.setAttribute('title', adminData.name);
    admin.setAttribute('data-id', adminData._id);

    const membersDiv = document.querySelector('#topMembers');
    memberData.forEach(member => {
        const url = member.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_50,c_scale/${member.image}`;
        membersDiv.innerHTML += `<div id="topMember${member._id}" class="member-card" data-id="${member._id}"></div>`;
        const currentMember = document.getElementById(`topMember${member._id}`);
        currentMember.style.backgroundImage = `url(${url})`;
        currentMember.setAttribute('title', member.name);
    });
};
function addRoleDependingEvents(){
    const deskActionText = document.querySelector('#deskActionText');
    const deskActionBtn = document.querySelector('#deskActionBtn');
    // FOR ADMIN
    if(userData._id == adminData._id){

        // REMOVE DISABLED STYLING FROM ELEMENTS
        const elements = document.querySelectorAll('.accessDisabled');
        elements.forEach( element => {
            element.classList.remove('accessDisabled');
        });

        // INVITE BUTTON + MODAL
        elements[0].setAttribute('data-bs-toggle', 'modal');
        elements[0].setAttribute('data-bs-target', '#inviteModal');
        const inviteForm = document.querySelector('#inviteForm');
        inviteForm.addEventListener('submit', e => {
            e.preventDefault();
            const mail = inviteForm.inviteEmail.value.trim();
            const error = validation.mail(mail);
            const errorField = document.querySelector('#inviteError');
            if(error != ''){
                errorField.innerHTML = '<i class="fas fa-exclamation-circle"></i> '+error;
                inviteForm.inviteEmail.focus();
                return;
            }
            const checkMembers = [...memberData, adminData].find( member => {
                return member.email == mail;
            });
            if(checkMembers){
                errorField.innerHTML = '<i class="fas fa-exclamation-circle"></i> User is already a Member';
                inviteForm.inviteEmail.focus();
                return;
            }
            errorField.innerHTML = '&nbsp;';
            fetch('/user/invite', {
                method : 'POST',
                body : JSON.stringify({
                    mail : mail,
                    deskID : deskData._id
                }),
                headers : {'Content-type' : 'application/json; charset=UTF-8'}
            })
            .then(res => res.json())
            .then(user => {
                if(!user){
                    errorField.innerHTML = '<i class="fas fa-exclamation-circle"></i> User / Email not found';
                    inviteForm.inviteEmail.focus();
                }
                else{
                    errorField.innerHTML = `<span style="color: #23CE6B;"><i class="fas fa-check-circle"></i> ${user.name} invited</span>`;
                    inviteForm.reset();
                    inviteForm.inviteEmail.focus();
                    socket.emit('sent-invite', user._id);
                }
            });
        });

        // UPDATE DESKNAME
        elements[2].addEventListener('click', () => {
            const newName = document.querySelector('#renameInput').value.trim();
            if(newName == deskData.name) return;
            fetch('/desk/deskname', {
                method: 'PATCH',
                body: JSON.stringify({deskname : newName}),
                headers: {'Content-type' : 'application/json; charset=UTF-8'}
            })
            .then(res => res.json())
            .then(deskname => {
                deskData.name = deskname;
                renderDeskname();
            });
        });

        // DELETE DESK
        deskActionText.innerHTML = 'Delete Desk';
        deskActionBtn.textContent = 'Delete';
        deskActionBtn.addEventListener('click', () => {
            const confirmed = confirm(`Are you sure you want to delete this desk:\n"${deskData.name}"`);
            if(confirmed){
                fetch(`/desk/delete`, {
                    method: 'DELETE'
                })
                .then( res => {
                    const memberIds = memberData.map( member => member._id);
                    socket.emit('desk-deletion', memberIds);
                    location.href = '/board';
                });
            };
        });
    }
    // FOR MEMBERS
    else{
        // LEAVE DESK
        deskActionText.innerHTML = 'Leave Desk';
        deskActionBtn.textContent = 'Leave';
        deskActionBtn.addEventListener('click', () => {
            const confirmed = confirm('You will no longer be a Member on this Desk\n\nContinue ?');
            if(confirmed){
                fetch(`/desk/leave`, {
                    method: 'DELETE',
                })
                .then(res => res.json())
                .then(res => {
                    if(res){
                        socket.emit('member-leaving', userData._id);
                        location.href = '/board';
                    }
                });
            };
        });
    };
};
const cellContainer = document.querySelector('#cellContainer');
addDragOverList(cellContainer);
function renderLists(){

    cellContainer.innerHTML = '';
    const lists = deskData.lists;

    // SORT LISTS BY ORDER
    lists.sort((a,b) => {
        if(a.order < b.order) return -1;
        if(a.order > b.order) return 1;
        return 0;
    });

    lists.forEach( list => {
        const listTemplate = document.querySelector('#listTemplate').content.cloneNode(true);
        listTemplate.querySelector('.list').id = list._id;
        listTemplate.querySelector('.list-name-textarea').textContent = list.name; 

        // DELETE LIST EVENT
        listTemplate.querySelector('.delete-list').addEventListener('click', () => { deleteList(list._id)});

        const taskContainer = listTemplate.querySelector('.list-tasks');
        addDragOverTask(taskContainer);
        addDragStartEvent(listTemplate.querySelector('.list-cell'));
        addDragEndEvent(listTemplate.querySelector('.list-cell'));

        // SORT TASKS BY ORDER
        list.tasks.sort((a,b) => {
            if(a.order < b.order) return -1;
            if(a.order > b.order) return 1;
            return 0;
        });

        // RENDER TASKS
        list.tasks.forEach( task => {
            const taskTemplate = document.querySelector('#taskTemplate').content.cloneNode(true);
            taskTemplate.querySelector('.task').id = task._id;
            taskTemplate.querySelector('.taskName').textContent = task.name;
            if(task.members.includes(userData._id)){
                taskTemplate.querySelector('.taskMarker').classList.remove('d-none');
            };

            addDragStartEvent(taskTemplate.querySelector('.task'));
            addDragEndEvent(taskTemplate.querySelector('.task'));

            taskContainer.appendChild(taskTemplate);
        });

        // APPEND FINAL LIST
        cellContainer.appendChild(listTemplate);
    });
    
    if(lists.length > 0){
        // OPEN-TASK BUTTON EVENTS
        document.querySelectorAll('.taskInfo').forEach( button => {
            const listID = button.closest('.list').id;
            const taskID = button.closest('.task').id;
            button.addEventListener('click', () => {openTaskModal(listID, taskID)});
        });
        // DELETE-TASK BUTTON EVENTS
        document.querySelectorAll('.taskComplete').forEach( button => {
            const listID = button.closest('.list').id;
            const taskID = button.closest('.task').id;
            button.addEventListener('click', () => {deleteTask(listID, taskID)});
        });
        // LISTNAME TEXTAREA SETTINGS AND EVENTS
        document.querySelectorAll('.list-name-textarea').forEach( textarea => {
            autoSetTextareaHeight(textarea);
            textarea.addEventListener('input', () => {
                autoSetTextareaHeight(textarea); 
            });
            textarea.addEventListener('keydown', e => {
                if(e.which === 13 && !e.shiftKey){
                    e.preventDefault();
                    textarea.blur();
                };
            });
            textarea.addEventListener('change', () => {
                const newListName = textarea.value.trim();
                if(newListName == currentListName || !newListName){
                    textarea.value = currentListName;
                    return;
                };
                const listID = textarea.closest('.list').id;
                updateListName(listID, newListName);
            });
            textarea.addEventListener('click', () => {
                currentListName = textarea.value.trim();
            });
        });
    };
};

// DASHBOARD BUTTON
document.querySelector('#dashboardBtn').addEventListener('click', () => {
    const fadeWindow = document.querySelector('#fadeOutWindow');
    fadeWindow.style.opacity = 1;
    fadeWindow.style.zIndex = 9000;
    setTimeout(() => {
        location.href = '/board';
    }, 800);
});

// UPDATE LISTNAME
let currentListName;
function updateListName(listID, newName){
    fetch('/desk/list/name', {
        method: 'PATCH',
        body: JSON.stringify({
            listID: listID,
            newName: newName
        }),
        headers: {'Content-Type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
    });
};

// LIST AND TASK DRAGGING
// LIST ONLY DRAGGABLE WHEN ON GRAB-ICON
cellContainer.addEventListener('mouseover', e => {
    if(e.target.matches('.grab-icon')){
        e.target.closest('.list-cell').setAttribute('draggable', 'true');
    }
});
cellContainer.addEventListener('mouseout', e => {
    if(e.target.matches('.grab-icon')){
        e.target.closest('.list-cell').setAttribute('draggable', 'false');
    }
});

let draggedElement, oldList, newList, oldOrder, newOrder;

// ADD .dragging CLASS
function addDragStartEvent(element){
    element.addEventListener('dragstart', e => {
        e.stopPropagation();
        element.classList.add('dragging');
        if(element.classList.contains('task')){
            draggedElement = 'task';
            oldList = element.closest('.list').id;
            oldOrder = getCurrentTaskIndex(element.id);
        }
        else if(element.classList.contains('list-cell')){
            draggedElement = 'list';
            oldOrder = getCurrentListIndex(element.querySelector('.list').id);
        };
    });    
};

// REMOVE .dragging CLASS and handle new order
function addDragEndEvent(element){
    element.addEventListener('dragend', e => {
        e.stopPropagation();
        draggedElement = undefined;
        element.classList.remove('dragging');

        if(element.classList.contains('task')){
            newList = element.closest('.list').id;
            newOrder = getCurrentTaskIndex(element.id);

            if(oldList == newList && oldOrder == newOrder) return;

            const list1 = createTaskOrderArray(oldList);
            const list2 = newList === oldList ? undefined : createTaskOrderArray(newList);
            saveNewTaskOrder(list1,list2);
        }
        else if(element.classList.contains('list-cell')){
            newOrder = getCurrentListIndex(element.querySelector('.list').id);

            if(oldOrder == newOrder) return;

            const array = createListOrderArray();
            saveNewListOrder(array);
        };
    });
};

// Get current List or Task index to check if any order changed (prevent useless fetch)
function getCurrentListIndex(listID){
    const lists = Array.from(document.querySelectorAll('.list'));
    const getIndexWithID = list => list.id == listID;
    return lists.findIndex(getIndexWithID);
};
function getCurrentTaskIndex(taskID){
    const tasks = Array.from(document.getElementById(taskID).closest('.list-tasks').querySelectorAll('.task'));
    const getIndexWithID = task => task.id == taskID;
    return tasks.findIndex(getIndexWithID);
};

// Create Array containing ID's and Order(index)
function createTaskOrderArray(listID){
    const tasks = document.getElementById(listID).querySelectorAll('.task');
    let array = [listID];
    tasks.forEach( (task, i) => {
        array.push({id: task.id, order: i});
    });
    return array;
};
function createListOrderArray(){
    const lists = document.querySelectorAll('.list');
    let array = [];
    lists.forEach( (list, i) => {
        array.push({id: list.id, order: i});
    });
    return array;
};

// Save new Lists or Tasks Order (fetch request)
function saveNewTaskOrder(list1,list2){
    fetch('/desk/task/order', {
        method: 'PATCH',
        body: JSON.stringify({list1: list1, list2: list2}),
        headers: {'Content-Type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
    });
};
function saveNewListOrder(array){
    fetch('/desk/list/order', {
        method: 'PATCH',
        body: JSON.stringify(array),
        headers: {'Content-Type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
    });
};

// ADD DRAGOVER EVENTS
function addDragOverList(container){
    container.addEventListener('dragover', e => {
        if(draggedElement == 'task') return;
        e.preventDefault();
        const afterTask = getDragAfterList(container, e.clientX);
        const draggable = document.querySelector('.dragging');
        if(afterTask == null){
            container.appendChild(draggable);
        }
        else{
            container.insertBefore(draggable, afterTask);
        };
    });
};
function addDragOverTask(container){
    container.addEventListener('dragover', e => {
        if(draggedElement == 'list') return;
        e.preventDefault();
        const afterTask = getDragAfterTask(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if(afterTask == null){
            container.appendChild(draggable);
        }
        else{
            container.insertBefore(draggable, afterTask);
        };
    });
};

// RETURNS THE AFTER ELEMENT
function getDragAfterList(container, axis){
    const draggableElements = [...container.querySelectorAll('.list-cell:not(.dragging)')];
    return draggableElements.reduce( (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = axis - box.left - box.width/1.2;
        if(offset < 0 && offset > closest.offset){
            return { offset: offset, element: child};
        }
        else{
            return closest;
        };
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};
function getDragAfterTask(container, axis){
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    return draggableElements.reduce( (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = axis - box.top - box.height/2;
        if(offset < 0 && offset > closest.offset){
            return { offset: offset, element: child};
        }
        else{
            return closest;
        };
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};

// INVITE MODAL - Input focus und Error Reset
const inviteModal = document.querySelector('#inviteModal');
inviteModal.addEventListener('shown.bs.modal', () => {
    document.querySelector('input[name="inviteEmail"]').focus();
});
inviteModal.addEventListener('hidden.bs.modal', () => {
    document.querySelector('#inviteError').innerHTML = '&nbsp;';
});

// MENU show/hide
const openMenu = document.querySelector('#menuBtn');
openMenu.addEventListener('click', () => {
    document.querySelector('#sideMenu').classList.toggle('d-none');
});

// CREATE LIST: BUTTON / FORM TOGGLE
function toggleListCreation(){
    openListForm.classList.toggle('d-none');
    listForm.classList.toggle('d-none');    
};

// TRY TO CLOSE OPEN FORMS OR TASKS
function closeOpenForms(){
    try{
        document.querySelector('#cancelTask').click();
    }
    catch(err){}
    if(!listForm.classList.contains('d-none')){
        document.querySelector('#cancelList').click();
    }
};
function closeOpenTasks(){
    try{
        document.querySelectorAll('.task-expand').forEach(element => {
            element.classList.remove('task-expand');
        });
        document.querySelectorAll('.task-buttons').forEach(element => {
            element.classList.add('task-closed');
        });
    }
    catch(err){}
};

// ADD NEW LIST
const openListForm = document.querySelector('#addListBtn');
const listForm = document.querySelector('#listForm');

openListForm.addEventListener('click', () => {
    closeOpenForms();
    closeOpenTasks();
    toggleListCreation();
    listForm.querySelector('#newListname').focus();
});

listForm.addEventListener('reset', () => {
    toggleListCreation();
});

listForm.addEventListener('submit', e => {
    e.preventDefault();
    const listName = listForm.listName.value.trim();
    if(listName.length == 0) return;
    fetch('/desk/list', {
        method: 'POST',
        body: JSON.stringify({name: listName}),
        headers: {'Content-type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        deskData.lists = newLists;
        toggleListCreation();
        renderLists();
        listForm.listName.value = '';
    });
});

// LIST ACTIONS
// ADD TASK BUTTON / SAVE TASK / CANCEL TASK
cellContainer.addEventListener('click', e => {
    if(e.target.matches('.addTaskBtn')){
        closeOpenForms();
        e.target.closest('.addTask').innerHTML = `
        <form id="taskForm">
            <input id="newTaskname" type="text" placeholder="New Taskname">
            <button type="submit" id="saveTask" IsTabStop="false"><i class="fas fa-check-circle"></i></button>
            <button type="button" id="cancelTask" IsTabStop="false"><i class="fas fa-times-circle"></i></button>
        </form>`;
        document.getElementById('newTaskname').focus();
        document.getElementById('saveTask').addEventListener('click', e => {
            e.preventDefault();
            const taskName = e.target.previousElementSibling.value.trim();
            if(taskName.length == 0) return;
            const listID = e.target.closest('.list').id;
            fetch('/desk/task', {
                method: 'POST',
                body: JSON.stringify(
                    {
                        name: taskName,
                        listID: listID
                    }
                ),
                headers: {'Content-Type' : 'application/json; charset=UTF-8'}
            })
            .then(res => res.json())
            .then(newLists => {
                deskData.lists = newLists;
                renderLists();
                const currentList = document.getElementById(listID);
                currentList.querySelector('.addTaskBtn').click();
            });
        });
    }
    if(e.target.matches('#cancelTask')){
        e.target.closest('.addTask').innerHTML = `
        <button class="addTaskBtn"><i class="fas fa-plus"></i> Add Task</button>`;
    }
});

// EXPAND / COLLAPSE TASK FIELD
cellContainer.addEventListener('click', e => {
    if(!e.target.matches('.task')) return;
    closeOpenForms();
    if(!e.target.classList.contains('task-expand')){
        closeOpenTasks();
    }
    const taskButtons = e.target.querySelector('.task-buttons');
    e.target.classList.toggle('task-expand');
    setTimeout(() => {
        taskButtons.classList.toggle('task-closed');    
    }, 85);
});

// DELETE LIST
function deleteList(listID){
    fetch(`/desk/list/${listID}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
        document.getElementById(listID).closest('.list-cell').remove();
    });
};

// SPECIFIC TASK
const taskNameTextarea = document.querySelector('#taskNameTextarea');
const taskDescTextarea = document.querySelector('#taskDescriptionTextarea');
const availableRow = document.querySelector('#availableRow');
const assignedRow = document.querySelector('#assignedRow');
let currentList, currentTask, currentTaskName, currentDescription;

// OPEN TASKMODAL
function openTaskModal(listID, taskID){
    currentList = listID;
    currentTask = taskID;
    // When modal open Auto set Textarea Height to content size
    setTimeout(() => {
        autoSetTextareaHeight(taskNameTextarea);
        autoSetTextareaHeight(taskDescTextarea);
    }, 170);
    // Find specific Task
    const task = findSpecificTask(listID, taskID);
    // Find and Deconstruct Task in List
    const {name, description, members, date} = task;
    // Display Taskname + Task Description
    taskNameTextarea.value = name;
    taskDescTextarea.value = description;
    currentTaskName = name;
    currentDescription = description;
    // Get Time that passed since creation
    const timeSinceCreation = calculatePassedTime(new Date(date).getTime());
    document.querySelector('#passedTime').textContent = timeSinceCreation;
    // Display Members to add and already added members
    const {available, assigned} = filterTaskMembers(members);

    availableRow.innerHTML = '';
    assignedRow.innerHTML = '';

    if(available.length == 0){
        availableRow.innerHTML = `<span class="no-members">All members are working on this Task</span>`;
    }
    else renderTaskMembers(availableRow, available);
    
    if(assigned.length == 0){
        assignedRow.innerHTML = `<span class="no-members">Add members that are working on this Task</span>`;
    }
    else renderTaskMembers(assignedRow, assigned);
};
// FIND SPECIFIC TASK IN DATA
function findSpecificTask(listID, taskID){
    const getIndexWithID = list => list._id == listID;
    const listIndex = deskData.lists.findIndex(getIndexWithID);
    const list = deskData.lists[listIndex];
    return list.tasks.find( task => task._id == taskID);
};

// CALCULATE TIME DIFFERENCE
function calculatePassedTime(earlierMS, laterMS = Date.now()){
    // if minimum 1 Day: return Days
    let msBetween = (laterMS - earlierMS) / (1000*3600*24);
    if(msBetween >= 1){
        const days = Math.floor(msBetween);
        return days == 1 ? days+' day' : days+' days';
    }
    // if minimum 1 Hour: return Hours
    msBetween = (laterMS - earlierMS) / (1000*3600);
    if(msBetween >= 1){
        const hours = Math.floor(msBetween);
        return hours == 1 ? hours+' hour' : hours+' hours';
    }
    // if minimum 1 Minute: return Minutes
    msBetween = (laterMS - earlierMS) / 60000;
    if(msBetween >= 1){
        const minutes = Math.floor(msBetween);
        return minutes == 1 ? minutes+' minute' : minutes+' minutes';
    }
    // if below 1 Minute: return Seconds
    msBetween = (laterMS - earlierMS) / 1000;
    const seconds = Math.floor(msBetween);
    return seconds == 1 ? seconds+' second' : seconds+' seconds';
};

// FILTER TASK MEMBERS
function filterTaskMembers(taskMembers){
    let allMembers = [...memberData];
    allMembers.unshift(adminData);
    let available = [], assigned = [];

    if(taskMembers.length == 0){
        available = allMembers;
    }
    else{
        taskMembers.forEach( member => {
            let found = allMembers.find( deskMember => {
                if(deskMember._id == member){
                    const index = allMembers.indexOf(deskMember);
                    allMembers.splice(index,1);
                    return deskMember;
                }
            });
            assigned.push(found);
        });
        available = allMembers;
    };
    return { available: available, assigned: assigned };
};

// CREATE TASK MEMBER BUBBLES
function renderTaskMembers(element, array){
    array.forEach( user => {
        const url = user.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_40,c_scale/${user.image}`;
        if(element.matches('#availableRow')){
            element.innerHTML += `<div class="member-box"><div id="${user._id}" class="task-member"><i class="fas fa-plus-circle"></i></div><span>${user.name}</span></div>`;
        }
        else{
            element.innerHTML += `<div class="member-box"><div id="${user._id}" class="task-member"><i class="fas fa-minus-circle"></i></div><span>${user.name}</span></div>`;
        }
        const div = document.getElementById(`${user._id}`);
        div.style.backgroundImage = `url(${url})`;
        div.setAttribute('title', user.name);
    });   
};

// ASSIGN MEMBER TO TASK
document.querySelector('#availableRow').addEventListener('click', e => {
    if(e.target.matches('.member-box')){
        e.target.querySelector('.task-member').click();
        return;
    };
    if(!e.target.matches('.task-member')) return;
    const userID = e.target.id;
    fetch(`/desk/${currentList}/${currentTask}/member`, {
        method: 'POST',
        body: JSON.stringify({
            userID: userID
        }),
        headers: {'Content-Type':'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
        const task = findSpecificTask(currentList, currentTask);
        const {members} = task;
        const {available, assigned} = filterTaskMembers(members);

        availableRow.innerHTML = '';
        assignedRow.innerHTML = '';

        if(available.length == 0){
            availableRow.innerHTML = `<span class="no-members">All members are working on this Task</span>`;
        }
        else renderTaskMembers(availableRow, available);
        
        if(assigned.length == 0){
            assignedRow.innerHTML = `<span class="no-members">Add members that are working on this Task</span>`;
        }
        else renderTaskMembers(assignedRow, assigned);

        if(userID == userData._id){
            document.getElementById(currentTask).querySelector('.taskMarker').classList.remove('d-none');
        };
    });
});

// REMOVE MEMBER FROM TASK
document.querySelector('#assignedRow').addEventListener('click', e => {
    if(e.target.matches('.member-box')){
        e.target.querySelector('.task-member').click();
        return;
    };
    if(!e.target.matches('.task-member')) return;
    const userID = e.target.id;
    fetch(`/desk/${currentList}/${currentTask}/${userID}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
        const task = findSpecificTask(currentList, currentTask);
        const {members} = task;
        const {available, assigned} = filterTaskMembers(members);

        availableRow.innerHTML = '';
        assignedRow.innerHTML = '';

        if(available.length == 0){
            availableRow.innerHTML = `<span class="no-members">All members are working on this Task</span>`;
        }
        else renderTaskMembers(availableRow, available);
        
        if(assigned.length == 0){
            assignedRow.innerHTML = `<span class="no-members">Add members that are working on this Task</span>`;
        }
        else renderTaskMembers(assignedRow, assigned);

        if(userID == userData._id){
            document.getElementById(currentTask).querySelector('.taskMarker').classList.add('d-none');
        };
    });
});

// TASK NAME TEXTAREA ( EDIT )
// Keep resizing textarea on input
taskNameTextarea.addEventListener('input', () => {
    autoSetTextareaHeight(taskNameTextarea); 
});
// Check if enter key is pressed on task-name textarea
taskNameTextarea.addEventListener('keydown', e => {
    if(e.which === 13 && !e.shiftKey){
        e.preventDefault();
        taskNameTextarea.blur();
    };
});
// Listen for change on task-name textarea
taskNameTextarea.addEventListener('change', () => {
    const newName = taskNameTextarea.value.trim();
    if(!newName || newName == currentTaskName){
        taskNameTextarea.value = currentTaskName.trim();
        return;
    };
    updateTaskName(newName);
});
// Update Task-Name
function updateTaskName(newName){
    fetch(`/desk/task/name`, {
        method: 'PATCH',
        body: JSON.stringify({
            name: newName,
            listID: currentList,
            taskID: currentTask
        }),
        headers: {'Content-Type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
        currentTaskName = newName;
        document.getElementById(currentTask).querySelector('.taskName').textContent = newName;
    });
};

// TASK DESCRIPTION TEXTAREA ( EDIT )
// Keep resizing textarea on input
taskDescTextarea.addEventListener('input', () => {
    autoSetTextareaHeight(taskDescTextarea);
});
// Check if enter key is pressed on task-description textarea
taskDescTextarea.addEventListener('keydown', e => {
    if(e.which === 13 && !e.shiftKey){
        e.preventDefault();
        taskDescTextarea.blur();
    };
});
// Listen for change in task-description textarea
taskDescTextarea.addEventListener('change', () => {
    const newDesc = taskDescTextarea.value.trim();
    if(newDesc == currentDescription){
        taskDescTextarea.value = currentDescription;
        return;
    };
    updateTaskDescription(newDesc);
});
// Update Task-Description
function updateTaskDescription(newDesc){
    fetch(`/desk/task/description`, {
        method: 'PATCH',
        body: JSON.stringify({
            desc: newDesc,
            listID: currentList,
            taskID: currentTask
        }),
        headers: {'Content-Type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
    });
};

// SET TEXTAREA HEIGHT TO CONTENT
function autoSetTextareaHeight(textarea){
    textarea.style.height = "5px";
    textarea.style.height = (textarea.scrollHeight)+"px";
};

// DELETE SPECIFIC TASK
function deleteTask(listID, taskID){
    fetch(`/desk/task/${listID}/${taskID}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
        document.getElementById(taskID).remove();
    });
};

// COLOR THEME
const theme = localStorage.getItem('task_deskDarkTheme');
const themeSwitch = document.querySelector('#darkModeSwitch');

// CHECK THEME PREFERENCE
theme ? applyDarkTheme() : applyLightTheme();

// THEME SWITCH/BUTTON
themeSwitch.addEventListener('click', () => {
    themeSwitch.checked ? applyDarkTheme() : applyLightTheme();
});

// SET DATA-THEME ON BODY
function applyDarkTheme(){
    localStorage.setItem('task_deskDarkTheme', true);
    document.body.setAttribute('data-theme', 'dark');
    themeSwitch.checked = true;
    themeSwitch.setAttribute('checked', true);
};
function applyLightTheme(){
    localStorage.removeItem('task_deskDarkTheme');
    document.body.setAttribute('data-theme', 'light');
};


// TASK SEARCHBAR
const searchbar = document.querySelector('#searchbar');
const searchBtn = document.querySelector('#clearSearch');
let searchReady = true;

// SEARCH ON ENTER KEY
searchbar.addEventListener('keydown', e => {
    if(e.key != 'Enter' || !searchReady) return;
    processSearchQuery();
});
// SEARCH ON SEARCHBUTTON
searchBtn.addEventListener('click', () => {
    if(!searchReady) return;
    processSearchQuery();
});
// PROCESS SEARCH QUERY
function processSearchQuery(){
    const query = searchbar.value.toLowerCase();
    if(query == '') return markNotFound();
    searchReady = false;
    const allTasks = Array.from(document.querySelectorAll('.task'));
    const found = allTasks.find( task => {
        if (task.innerText.toLowerCase().indexOf(query) > -1) {
            return task;
        };
    });
    if(found){
        markFoundTask(found);
    }
    else{
        markNotFound();
    }
};
// Mark task after Search
function markFoundTask(found){
    found.scrollIntoView({behavior:'smooth', block: 'center', inline: 'center'});
    found.scrollTop += 20;
    found.classList.toggle('task-found');
    setTimeout(() => {
        found.classList.toggle('task-found');
        searchReady = true;
    }, 1000);
};
// Mark Searchbar if not found
function markNotFound(){
    searchbar.classList.add('task-not-found');
    searchBtn.classList.add('task-not-found');
    setTimeout(() => {
        searchbar.classList.remove('task-not-found');
        searchBtn.classList.remove('task-not-found');
        searchReady = true;
    }, 1000);
};

// Desk Chat
const openChat = document.querySelector('#chatBtn');
const chatForm = document.querySelector('#chatForm');
const chatWindow = document.querySelector('#chatWindow');
const messages = document.querySelector('#messages');
const messageIndicator = document.querySelector('#messageIndicator');

// OPEN CHAT WINDOW
openChat.addEventListener('click', () => {
    chatWindow.classList.toggle('d-none');
    chatForm.reset();
    chatForm.querySelector('input').focus();
    scrollWindow.scrollTop = scrollWindow.scrollHeight;
    messageIndicator.classList.add('d-none');
});

// BUILD CHAT MESSAGE LIST ELEMENT
const scrollWindow = document.querySelector('#messageWindow');
let lastMessageBy;
function buildMessage(msg, identifier = 'You'){
    const {alignment, color} = identifier == 'You' ? {alignment: 'left', color: '#777'} : {alignment: 'right', color: 'coral'};
    const msgHead = lastMessageBy == identifier ? '' : `<small style="color:${color}">${identifier}</small>`;

    lastMessageBy = identifier;
    messages.innerHTML += `<li class="msg-align-${alignment}">${msgHead}<div>${msg}</div></li>`;
    scrollWindow.scrollTop = scrollWindow.scrollHeight;

    if(chatWindow.classList.contains('d-none')){
        messageIndicator.classList.remove('d-none');
    };
};
// BUILD CHAT INFO LIST ELEMENT
function buildChatInfo(msg, type){
    lastMessageBy = undefined;
    const statusColor = type == 'online' ? 'limegreen' : 'rgba(220, 20, 60, 0.699)';
    messages.innerHTML += `<li class="chat-info"><div style="background-color: ${statusColor};"></div><span>${msg}</span></li>`;
    scrollWindow.scrollTop = scrollWindow.scrollHeight;
};

// SOCKETS
function setupSocket(){

    socket.emit('join', { id: userData._id, name: userData.name, room: location.pathname });

    socket.emit('chat-here', userData.name);

    socket.on('new-member', () => {
        fetch('/desk/members')
        .then(res => res.json())
        .then(members => {
            memberData = members;
            renderMembers();
        });
    });

    socket.on('left-member', userID => {
        memberData = memberData.filter( member => member._id != userID);
        setTimeout(() => {
            document.querySelector('.member-card[data-id="'+userID+'"]').remove();    
        }, 1);
    });

    socket.on('desk-deleted', () => {
        const modalElement = document.getElementById('redirectionModal');
        let count = 5;
        let countElement = document.querySelector('#redirectionCount');
        modalElement.addEventListener('shown.bs.modal', () =>{
            setInterval(() => {
                if(count <= 0){
                    location.href = '/board';
                    return;
                }
                countElement.textContent = count;
                count--;
            }, 1000);
        });
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    });

    socket.on('chat-receive', msgIn => {
        const {message, name} = msgIn;
        buildMessage(message, name);
    });

    socket.on('chat-otherHere', data => {
        const info = `${data.name} is online`;
        buildChatInfo(info, 'online');
        addOnlineStatus(data.id);
        socket.emit('status-here', userData._id);
    });

    socket.on('status-otherHere', id => {
        addOnlineStatus(id);
    });

    socket.on('desk-leave', data => {
        const info = `${data.name} left`;
        buildChatInfo(info, 'leave');
        removeOnlineStatus(data.id);
    });

    // Chat Form - Send Msg event
    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        if(chatForm.message.value.trim().length == 0){
            chatForm.reset();
            return;
        };
        const message = chatForm.message.value.trim();
        const msgOut = { message: message, name: userData.name };
        socket.emit('chat-send', msgOut);
        buildMessage(message);
        chatForm.reset();
    });
};

// TOGGLE ONLINE STATUS
function addOnlineStatus(userID){
    document.querySelector('.member-card[data-id="'+userID+'"]').classList.add('member-online');
};
function removeOnlineStatus(userID){
    document.querySelector('.member-card[data-id="'+userID+'"]').classList.remove('member-online');
};