import validation from './scripts/validation.js';
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
});

function renderDeskname(){
    document.querySelector('#topDeskname').textContent = deskData.name;
    document.querySelector('#renameInput').value = deskData.name;
    document.title = `Task-App | ${deskData.name}`;
};

function renderMembers(){
    const admin = document.querySelector('#admin');
    const url = adminData.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_50,c_scale/${adminData.image}`;
    admin.style.backgroundImage = `url(${url})`;
    admin.setAttribute('title', adminData.name);

    const membersDiv = document.querySelector('#topMembers');
    memberData.forEach(member => {
        const url = member.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_50,c_scale/${member.image}`;
        membersDiv.innerHTML += `<div id="${member._id}" class="member-card"></div>`;
        const currentMember = document.getElementById(`${member._id}`);
        currentMember.style.backgroundImage = `url(${url})`;
        currentMember.setAttribute('title', member.name);
    });
};

function addRoleDependingEvents(){
    const deskActionText = document.querySelector('#deskActionText');
    const deskActionBtn = document.querySelector('#deskActionBtn');

    if(userData._id == adminData._id){
        deskActionText.innerHTML = '<i id="dangerIcon" class="fas fa-exclamation-triangle"></i> Delete Desk';
        deskActionBtn.textContent = 'Delete';
        const elements = document.querySelectorAll('.accessDisabled');

        elements.forEach( element => {
            element.classList.remove('accessDisabled');
        });

        elements[0].setAttribute('data-bs-toggle', 'modal');
        elements[0].setAttribute('data-bs-target', '#inviteModal');

        const inviteForm = document.querySelector('#inviteForm');
        inviteForm.addEventListener('submit', e => {
            e.preventDefault();
            const mail = inviteForm.inviteEmail.value.trim();
            const error = validation.mail(mail);
            const errorField = document.querySelector('#inviteError');
            if(error != ''){
                errorField.textContent = error;
                return;
            }
            const checkMembers = memberData.find( member => {
                return member.email == mail;
            });
            if(checkMembers){
                errorField.textContent = 'User is already a Member';
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
            .then(status => {
                if(!status){
                    errorField.textContent = 'No user with this Email found';
                }
                else{
                    errorField.innerHTML = `<span style="color: #23CE6B;">${status.name} invited !</span>`;
                    inviteForm.reset();
                }
            });
        });
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
        deskActionBtn.addEventListener('click', () => {
            const confirmed = confirm(`Are you sure you want to delete this desk:\n"${deskData.name}"`);
            if(confirmed){
                fetch(`/desk/delete`, {
                    method: 'DELETE'
                })
                .then(location.href = '/board');
            };
        });
    }
    else{
        deskActionText.innerHTML = '<i id="dangerIcon" class="fas fa-exclamation-triangle"></i> Leave Desk';
        deskActionBtn.textContent = 'Leave';
        deskActionBtn.addEventListener('click', () => {
            const confirmed = confirm('You will no longer be a Member on this Desk\n\nContinue ?');
            if(confirmed){
                fetch(`/desk/leave`, {
                    method: 'DELETE',
                })
                .then(res => res.json())
                .then(res => {
                    if(res) location.href = '/board';
                });
            };
        });
    };
};

function renderLists(){
    const cellContainer = document.querySelector('#cellContainer');
    cellContainer.innerHTML = '';
    const lists = deskData.lists;

    lists.forEach( list => {
        const listTemplate = document.querySelector('#listTemplate').content.cloneNode(true);
        listTemplate.querySelector('.list').id = list._id;
        listTemplate.querySelector('.list-name').textContent = list.name; 

        // DELETE LIST EVENT
        listTemplate.querySelector('.delete-list').addEventListener('click', () => { deleteList(list._id)});

        // RENDER TASKS
        const taskContainer = listTemplate.querySelector('.list-tasks');
        list.tasks.forEach( task => {
            const taskTemplate = document.querySelector('#taskTemplate').content.cloneNode(true);
            taskTemplate.querySelector('.task').id = task._id;
            taskTemplate.querySelector('.taskName').textContent = task.name;
            taskContainer.appendChild(taskTemplate);
        });

        // APPEND FINAL LIST
        cellContainer.appendChild(listTemplate);
    });
    
    if(lists.length > 0){
        document.querySelectorAll('.taskInfo').forEach( button => {
            const taskID = button.closest('.task').id;
            button.addEventListener('click', () => {openTaskModal(taskID)});
        });
        document.querySelectorAll('.taskComplete').forEach( button => {
            const taskID = button.closest('.task').id;
            button.addEventListener('click', () => {deleteTask(taskID)});
        });
    }
    
};

// Invite Modal - Input focus und Error Reset
const inviteModal = document.querySelector('#inviteModal');
inviteModal.addEventListener('shown.bs.modal', () => {
    document.querySelector('input[name="inviteEmail"]').focus();
});
inviteModal.addEventListener('hidden.bs.modal', () => {
    document.querySelector('#inviteError').innerHTML = '&nbsp;';
});

// CHAT & MENU show/hide
const openMenu = document.querySelector('#menuBtn');
const openChat = document.querySelector('#chatBtn');
openMenu.addEventListener('click', () => {
    document.querySelector('#sideMenu').classList.toggle('d-none');
});
openChat.addEventListener('click', () => {
    document.querySelector('#chatWindow').classList.toggle('d-none');
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
const cellContainer = document.querySelector('#cellContainer');
// ADD TASK BUTTON / SAVE TASK / CANCEL TASK
cellContainer.addEventListener('click', e => {
    if(e.target.matches('.addTaskBtn')){
        closeOpenForms();
        e.target.closest('.addTask').innerHTML = `
        <form id="taskForm">
            <input id="newTaskname" type="text" placeholder="Taskname...">
            <button type="submit" id="saveTask" IsTabStop="false"><i class="far fa-check-circle"></i></button>
            <button type="button" id="cancelTask" IsTabStop="false"><i class="far fa-times-circle"></i></button>
        </form>`;
        document.getElementById('newTaskname').focus();
        document.getElementById('saveTask').addEventListener('click', e => {
            e.preventDefault();
            const taskName = e.target.previousElementSibling.value.trim();
            const listID = e.target.closest('.list').id;
            fetch('/desk/task', {
                method: 'POST',
                body: JSON.stringify(
                    {
                        name: taskName,
                        listID: listID
                    }
                ),
                headers: {'Content-Type' : 'Application/json; charset=UTF-8'}
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
function deleteList(id){
    fetch(`/desk/list/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(newLists => {
        if(!newLists) return;
        deskData.lists = newLists;
        renderLists();
    });
};

// LOAD SPECIFIC TASK INFO
function openTaskModal(taskID){
    console.log('info '+ taskID);
};

// DELETE SPECIFIC TASK
function deleteTask(taskID){
    console.log('deleting '+taskID);
};