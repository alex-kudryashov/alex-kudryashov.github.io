const taskNameField = document.getElementById('taskNameField');     //поле ввода задачи
const addBtn = document.getElementById('addBtn');         //кнопка добавления задачи
const taskList = document.getElementById('taskList');     //блок для хранения задач
const addListBtn = document.getElementById('addListBtn');//кнопка добавления листа
const listsList = document.querySelector('.listsList');  //блок хранения листов
const listNameField = document.getElementById('listNameField');//поле ввода листа
let lists = JSON.parse(localStorage.getItem('lists')) || [{ name: 'без имени', tasks: [], active: true }]; //список листов в локальном хранилище
const undoBlock = document.querySelector('.undo-delete');
const undoText = undoBlock.querySelector('span');
let timerId;
let undoDelete;
let taskId = 0; //счетчик id чеков для label
let subTaskId = 0; //счетчик id чеков для label

let activeList = lists.filter(list => list.active == true)[0]; //активный список



//смена темы
const themesSettings = {
   dark: [
      { '--text': 'antiquewhite' },
      { '--buttons': '#ffcc00' },
      { '--body-bg': '#000' },
      { '--active-list-text': '#000' },
      { '--panels-color': 'rgba(63,61,84,0.97)' },
      { '--error-color': 'red' },
      { '--options-bg': '#333' },
      { '--borders': '#8b8b8b' },
      { '--items': 'rgb(91, 86, 95)' },
      { '--active-list': 'rgba(255, 255, 255, 0.9)' },
      { '--delete-message': '#333' },
      { '--options-bg-hover': '#ccc' },
      { '--text-shadow-color': 'black' },
      { '--options-color-hover': 'black' },
      { '--list-line-bg-hover': '#ccc' },
      { '--list-line-text-hover': 'black' }
   ],
   light: [
      { '--text': '#333' },
      { '--buttons': 'blue' },
      { '--body-bg': '#FFF' },
      { '--active-list-text': 'antiquewhite' },
      { '--panels-color': 'rgba(189,215,253,0.8)' },
      { '--error-color': 'red' },
      { '--options-bg': '#ccc' },
      { '--borders': '#8b8b8b' },
      { '--items': 'rgb(171, 171, 171)' },
      { '--active-list': 'blue' },
      { '--delete-message': 'blue' },
      { '--options-bg-hover': 'black' },
      { '--text-shadow-color': 'blue' },
      { '--options-color-hover': 'white' },
      { '--list-line-text-hover': 'black' }
   ]
}

refreshTheme(themesSettings);

document.getElementById('themes').addEventListener('click', e => {
   if (e.target.nodeName === 'LI') {
      localStorage.setItem('activeTheme', JSON.stringify(e.target.id.match(/(.+?)Theme/)[1]));
      refreshTheme(themesSettings);
   }
})


function refreshTheme(themes) {
   let currentTheme = JSON.parse(localStorage.getItem('activeTheme')) || Object.keys(themes)[0];
   try {
      for (let v of themes[currentTheme]) {
         document.documentElement.style.setProperty(Object.keys(v)[0], v[Object.keys(v)[0]]);
      }
   } catch (error) {
      localStorage.setItem('activeTheme', JSON.stringify(Object.keys(themes)[0]));
      refreshTheme(themes);
   }
}

refreshAllLists();
refreshActiveList();

document.querySelector('.mobile-header button').addEventListener('click', () => {
   document.querySelector('.menu').classList.toggle('showMenu');
   document.querySelector('.taskField').classList.toggle('hideTasks');
})
//добавление задачи по нажатию на кнопку добавления
addBtn.addEventListener('click', addTask);

// добавление задачи по нажатию Enter в инпуте
taskNameField.addEventListener('keydown', (e) => {
   if (e.keyCode === 13) {
      addTask();
   }
})

//создание задачи и добавление в массив
function addTask() {
   if (!(/^\s*$/.test(taskNameField.value))) {
      //объект задачи
      const task = {};

      //добавление задачи в объект(с заглавной буквы)
      task.name = (taskNameField.value[0].toUpperCase() + taskNameField.value.slice(1)).trim();

      //по дэфолту без галочки
      task.check = false;

      task.subList = [];

      //добавление таска в массив активного списка
      activeList.tasks.unshift(task);

      //отображение новой задачи в списке(обновление списка)
      refreshActiveList();
   } else {
      taskNameField.classList.add('listNameFieldError');
      taskNameField.addEventListener('keydown', function clearError(e) {
         if (e.keyCode != 13) {
            taskNameField.classList.remove('listNameFieldError');
            taskNameField.removeEventListener('keydown', clearError);
         }
      })
      taskNameField.addEventListener('blur', () => taskNameField.classList.remove('listNameFieldError'));
   }
   taskNameField.value = '';
   taskNameField.focus();
}

//создание пункта списка из объекта массива
function createTask(task) {
   const template = document.querySelector('#taskItemTemplate').content;
   const templateClone = template.cloneNode(true);
   const li = templateClone.querySelector('li');
   const label = li.querySelector('label');
   const deleteBtn = label.querySelector('.delete-btn');//кнопка удаления таска
   const settingsBtn = label.querySelector('.settings-btn');//кнопка настройки таска
   const dateTime = li.querySelector('.date-time-out');//поле для вывода даты и времени
   const checkbox = li.querySelector('input');
   const taskTitle = label.querySelector('.taskTitle');
   //события кликов
   settingsBtn.addEventListener('click', openSettings(task));
   deleteBtn.addEventListener('click', () => deleteElement('task', task));

   let days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

   days = days[task.day] ? `(${days[task.day]})` : '';

   let day = new Date(task.date).getDate();
   let month = new Date(task.date).getMonth() + 1

   if (day) {
      day = `${day}.${month}`
   } else {
      day = '-';
   }

   if (task.check) {
      dateTime.textContent = `Выполнено ${task.checkDate} в ${task.checkTime}`;
   } else {
      dateTime.textContent = `${task.time || '-'} / ${task.date === getToday('date') ? 'Сегодня' : day} ${days}`;
      //если дата и время больше текущих то выделить светлым цветом
      if (!(getToday('date') < task.date || (getToday('date') === task.date && getToday('time') < task.time))) {
         dateTime.classList.add('error-date');
      }
   }


   label.htmlFor = `task${++taskId}`;    //установление атрибута for для привязки чекбокса

   checkbox.id = `task${taskId}`;
   if (task.check) {
      checkbox.checked = true;
      label.classList.remove('icon-check-empty')
      label.classList.add('icon-check');
   }

   //текст задачи
   taskTitle.textContent = task.name;

   //событие изменения флажка задачи
   checkbox.addEventListener('change', () => {
      changeCheck(task, label);
      if (task.check) {
         let date = new Date();
         let minute = date.getMinutes();
         if (minute < 10) minute = `0${minute}`;
         task.checkTime = `${date.getHours()}:${minute}`;
         task.checkDate = `${date.getDate()}.${date.getMonth() + 1}`;
         refreshLocalStorage();
         refreshActiveList();
      }
   });

   li.setAttribute('title', task.name);
   return li; //возврат элемента для вставки
}

//нажатие на кнопку добавления списка
addListBtn.addEventListener('click', function () {
   listNameField.classList.toggle('listNameFieldActive');
   listsList.classList.toggle('listsListInput');
   listNameField.focus();
   if (!listNameField.classList.contains('listNameFieldActive')) {
      listNameField.blur();
   }
   document.addEventListener('click', (e) => {
      if (e.target.id != 'addListBtn') {
         listNameField.classList.remove('listNameFieldActive');
         listNameField.classList.remove('listNameFieldError');
         listsList.classList.remove('listsListInput');
      }
   })
   listNameField.value = '';
});

//нажатие enter в поле ввода списка
listNameField.addEventListener('keydown', e => {
   if (e.keyCode === 13) {
      if (!(/^\s*$/.test(listNameField.value))) {
         listNameField.classList.remove('listNameFieldActive');
         listsList.classList.remove('listsListInput');
         addList();
      } else {
         listNameField.classList.add('listNameFieldError');
         listNameField.addEventListener('keydown', function clearError(e) {
            if (e.keyCode != 13) {
               listNameField.classList.remove('listNameFieldError');
               listNameField.removeEventListener('keydown', clearError);
            }
         })
      }
      listNameField.value = '';
   }
})

//добавление списка
function addList() {
   lists.forEach(list => list.active = false);//всем спискам снять активацию
   const list = { name: listNameField.value[0].toUpperCase().trim() + listNameField.value.slice(1).trim(), tasks: [], active: true };
   lists.unshift(list); //добавление листа в массив
   listNameField.blur();
   refreshLocalStorage(); //обновление
   refreshAllLists();
   refreshActiveList();
   if (document.querySelector('.menu').classList.contains('showMenu')) {
      document.querySelector('.mobile-header button').click();
   }
}

let initialPoint;
let finalPoint;
document.addEventListener('touchstart', () => initialPoint = event.changedTouches[0], false);
document.addEventListener('touchend', () => {
   finalPoint = event.changedTouches[0];
   const xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX);
   const yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
   if (xAbs > 20 || yAbs > 20) {
      if (xAbs > yAbs) {
         if (finalPoint.pageX < initialPoint.pageX) {
            /*СВАЙП ВЛЕВО*/
            document.querySelector('.mobile-header button').click();
         }
         else {
            /*СВАЙП ВПРАВО*/
            document.querySelector('.mobile-header button').click();
         }
      }
   }
}, false);

//создание листа на странице
function createList(list) {
   const template = document.querySelector('#listItemTemplate').content;
   const templateClone = template.cloneNode(true);
   const li = templateClone.querySelector('li');
   const optionsBtn = li.querySelector('#optionsBtn');
   const options = li.querySelector('.optionsList');
   const renameBtn = options.querySelector('.renameList');
   const deleteBtn = options.querySelector('.deleteList');
   const name = li.querySelector('span');
   name.innerHTML = list.name;//назавние списка

   deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteElement('list', list)
   });
   renameBtn.addEventListener('click', e => {
      e.stopPropagation();
      options.style.transform = 'scale(0)';
      renameList(name, list);
   })

   li.addEventListener('click', (e) => {
      if (e.target.id != 'optionsBtn') {
         openList(list);
      } else {
         if (options.classList.contains('optionsListOpen')) {
            options.classList.remove('optionsListOpen')
         } else {
            document.querySelectorAll('.optionsList').forEach(e => {
               if (e.classList.contains('optionsListOpen')) {
                  e.classList.remove('optionsListOpen')
               }
            });
            options.classList.add('optionsListOpen');

            document.addEventListener('click', (event) => {
               if (event.target.id != 'optionsBtn') {
                  document.querySelectorAll('.optionsList').forEach(e => {
                     if (e.classList.contains('optionsListOpen'))
                        e.classList.remove('optionsListOpen')
                  })
               }
            });
         }
      }
   }); //открытие списка

   // стили для активного листа
   if (list.active) {
      li.classList.add('activeList');
      document.querySelector('.mobile-header span').textContent = activeList.name;
   }
   hoverTitle(name);
   return li;//возврат элемента для вставки на страницу
}

function renameList(where, what, task) {
   const input = document.createElement('input');
   input.value = what.name;
   where.innerHTML = '';
   where.appendChild(input);
   input.focus();
   input.addEventListener('keydown', function (e) {
      if (e.keyCode === 13) {
         if (!(/^\s*$/.test(input.value))) {
            what.name = input.value;
            where.innerHTML = what.name;
            refreshLocalStorage();
            refreshAllLists();
            if (task) resfreshSubList(task);
         } else {
            input.style.borderBottom = '2px dotted red'
         }
      }
   })
   input.addEventListener('blur', function () {
      input.focus();
      input.style.borderBottom = '2px dotted red';
   })
   input.addEventListener('click', function (e) {
      e.stopPropagation();
   })
}


//открытие списка
function openList(list) {
   lists.forEach(l => l.active = false);//деактивировать все
   list.active = true;//активировать выбранный
   refreshLocalStorage();
   refreshAllLists();
   refreshActiveList(); //обновление
   if (document.querySelector('.menu').classList.contains('showMenu')) {
      document.querySelector('.mobile-header button').click();
   }
}


function refreshActiveList() {
   //сохранить в локальное хранилище
   refreshLocalStorage();
   //массив для незавершенный задач\


   const falseArr = activeList.tasks.filter(task => task.check === false);

   //массив для завершенных задач
   const trueArr = activeList.tasks.filter(task => task.check === true);

   //склейка завершенных и незаверш для переноса всех завершенных в конец списка
   activeList.tasks = falseArr.concat(trueArr);
   taskList.innerHTML = '';
   taskId = 0;
   if (activeList.tasks.length === 0) {
      const emptyListLabel = document.createElement('span');
      emptyListLabel.id = 'emptyList';
      emptyListLabel.innerHTML = 'Список пуст'
      taskList.appendChild(emptyListLabel);
   } else {
      activeList.tasks.forEach(task => taskList.appendChild(createTask(task)));
   }

}

function refreshLocalStorage() {
   localStorage.setItem('lists', JSON.stringify(lists));
}

function refreshAllLists() {
   let dop = lists.filter(list => list.active === true)
   activeList = dop[0]; //поиск активного элемента
   if (dop.length > 1) {
      lists.forEach(list => list.active = false);
      lists[0].active = true;
      activeList = lists[0];
      refreshLocalStorage();
      refreshActiveList();
   }
   //если активныого нет то сделать активным первый
   if (activeList === undefined) {
      lists[0].active = true;
      activeList = lists[0];
   }
   //очистка списка перед обновлением. для избежания дублирования списков
   listsList.innerHTML = '';

   //создать листы и добавить их в список листов
   lists.forEach(list => listsList.appendChild(createList(list)));
}

//функция для получения даты или времени в формате инпутов в окне настроек задачи (в параметр передается тип - дата или время)
function getToday(type) {
   const date = new Date();
   let day = date.getDate();
   let month = date.getMonth() + 1;
   let hour = date.getHours();
   let minute = date.getMinutes();
   if (hour < 10) hour = '0' + hour;
   if (minute < 10) minute = '0' + minute;
   if (type === 'date') {
      return `${date.getFullYear()}-${month < 10 ? (`0${month}`) : month}-${day < 10 ? (`0${day}`) : day}`;
   }
   if (type === 'time') {
      return `${hour}:${minute}`;
   }
}

function openSettings(task) {
   return function () {
      const template = document.querySelector('#modalSettingsTemplate').content;
      const modalClone = template.cloneNode(true);
      document.body.appendChild(modalClone);
      const modalWrap = document.querySelector('.modal-wrap');
      const modalInput = modalWrap.querySelector('.modal-input');
      const timeModal = modalWrap.querySelector('.time-modal');
      const dateModal = modalWrap.querySelector('.date-modal');
      const deleteBtn = modalWrap.querySelector('.modal-delete-btn');
      const saveModal = modalWrap.querySelector('.save-modal');
      const noteModal = modalWrap.querySelector('.note-modal');
      const timeCheck = modalWrap.querySelector('input[type="checkbox"]');
      const subListInp = modalWrap.querySelector('#subListInp');
      const checkLabel = modalWrap.querySelector('.modal-check');

      timeCheck.addEventListener('change', () => {
         if (timeCheck.checked) {
            checkLabel.classList.add('icon-check');
            checkLabel.classList.remove('icon-check-empty');
         } else {
            checkLabel.classList.remove('icon-check');
            checkLabel.classList.add('icon-check-empty');
         }
      });

      modalWrap.querySelector('#subListAdd').addEventListener('click', function () {
         addSubTask(task, subListInp);
         subListInp.value = '';
         subListInp.focus();
      });
      subListInp.addEventListener('keydown', function (e) {
         if (e.keyCode === 13) {
            addSubTask(task, subListInp);
            subListInp.value = '';
         }
      })
      modalInput.addEventListener('input', () => { modalInput.style.borderColor = '#ffcc00'; })
      subListInp.addEventListener('input', () => { subListInp.style.borderColor = '#ffcc00'; })

      //если дата и время не были заданы изначально - при открытии настроек заполнить поля текущими иначе заполнить указанными ранее
      task.time ? timeModal.value = task.time : timeModal.value = getToday('time');
      task.date ? dateModal.value = task.date : dateModal.value = getToday('date');
      dateModal.setAttribute('min', getToday('date'));
      deleteBtn.addEventListener('click', function () {
         deleteElement('task', task);
         modalWrap.parentNode.removeChild(modalWrap);
      })

      //закрытие окна настроек
      saveModal.addEventListener('click', function () {
         if (!(/^\s*$/.test(modalInput.value))) {
            modalWrap.parentNode.removeChild(modalWrap);
            task.name = modalInput.value;
            task.note = noteModal.value;
            if (timeCheck.checked) {
               timeModal.value = '';
               dateModal.value = '';
            }
            task.time = timeModal.value;
            task.date = dateModal.value;
            task.day = new Date(task.date).getDay();
            refreshActiveList();
         } else {
            modalInput.classList.add('listNameFieldError');
            modalInput.addEventListener('keydown', function clearError() {
               modalInput.classList.remove('listNameFieldError');
               modalInput.removeEventListener('keydown', clearError);
            })
            modalInput.value = '';
            modalInput.focus();
         }
      })
      //при открытии настроек задачи присвоить имя задачи в поле редактирования и заметку в текстареа
      modalInput.value = task.name;
      task.note != undefined ? noteModal.value = task.note : noteModal.value = '';

      subTaskId = 0;
      resfreshSubList(task);
   }
}

function addSubTask(task, subListInp) {
   if (!(/^\s*$/.test(subListInp.value))) {
      task.subList.unshift({ name: subListInp.value, check: false });
      refreshLocalStorage();
      resfreshSubList(task);
   } else {
      subListInp.style.borderColor = 'red';
      subListInp.addEventListener('blur', () => subListInp.style.borderColor = 'var(--buttons)')
   }
}

function resfreshSubList(task) {
   const subList = document.querySelector('#subList');
   subList.innerHTML = '';
   task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task)))
}

function createSubTask(subTask, task) {
   const template = document.querySelector('#subTaskItemTemplate').content;
   const templateClone = template.cloneNode(true);
   const li = templateClone.querySelector('li');
   const label = li.querySelector('label');
   const deleteBtn = li.querySelector('.delete-btn');
   const subTaskCheck = li.querySelector('input[type="checkbox"]');
   const subTaskTitle = li.querySelector('.subTaskTitle');
   const renameBtn = li.querySelector('.rename-btn');

   subTaskCheck.id = `subTask${++subTaskId}`;

   if (subTask.check) {
      label.classList.add('icon-check');
      subTaskCheck.checked = true;
   } else {
      label.classList.add('icon-check-empty')
   }

   label.setAttribute('for', `subTask${subTaskId}`);
   subTaskTitle.textContent = subTask.name;

   deleteBtn.addEventListener('click', () => deleteElement('subTask', subTask, task));
   renameBtn.addEventListener('click', () => {
      renameList(subTaskTitle, subTask, task);
      const input = subTaskTitle.querySelector('input');
      renameBtn.classList.remove('icon-pencil');
      renameBtn.classList.add('icon-ok-outline');
      renameBtn.removeEventListener('click', () => renameList(subTaskTitle, subTask));
      renameBtn.addEventListener('click', () => {
         if (!(/^\s*$/.test(input.value))) {
            subTask.name = input.value;
            subTaskTitle.innerHTML = subTask.name;
            refreshLocalStorage();
            resfreshSubList(task);
         } else {
            input.style.borderBottom = '2px dotted red';
         }
      })
   })
   subTaskCheck.addEventListener('change', () => changeCheck(subTask, label));

   hoverTitle(label);
   return li;
}

//смена флажка
function changeCheck(what, where) {
   what.check = !what.check;
   if (what.check) {
      where.classList.add('icon-check');
      where.classList.remove('icon-check-empty');
   } else {
      where.classList.remove('icon-check');
      where.classList.add('icon-check-empty');
   }
   refreshLocalStorage();
   refreshActiveList();
}

function deleteElement(type, what, where) {
   undoDelete = what;
   undoBlock.classList.add('undo-open');
   const undoBtn = document.createElement('a');
   undoBtn.textContent = 'Восстановить';
   undoBtn.setAttribute('href', '#');
   undoBlock.innerHTML = '';
   clearTimeout(timerId);
   timerId = setTimeout(() => {
      undoBlock.classList.remove('undo-open');
   }, 4000);
   if (type === 'list') {
      const index = lists.indexOf(what)
      lists.splice(index, 1);
      if (lists.length === 0) {
         lists.push({ name: 'без имени', tasks: [], active: true })
      }
      //обновление списка
      undoBlock.innerHTML = 'Список удален. ';
      undoBtn.addEventListener('click', (e) => {
         e.preventDefault();
         undoDeleting(what, lists, index);
      });
   }
   if (type === 'task') {
      const index = activeList.tasks.indexOf(what);
      activeList.tasks.splice(index, 1);
      undoBlock.innerHTML = 'Задача удалена. ';
      undoBtn.addEventListener('click', (e) => {
         e.preventDefault();
         undoDeleting(what, activeList.tasks, index);
      });
   }
   if (type === 'subTask') {
      const index = where.subList.indexOf(what);
      where.subList.splice(index, 1);
      resfreshSubList(where);
      undoBlock.innerHTML = 'Подзадача удалена. ';
      undoBtn.addEventListener('click', (e) => {
         e.preventDefault();
         undoDeleting(what, where.subList, index);
         resfreshSubList(where);
      });
   }
   undoBlock.appendChild(undoBtn);
   refreshAllLists();
   refreshActiveList();
}

function undoDeleting(what, where, index) {
   undoBlock.classList.remove('undo-open');
   where.insert(index, what);
   refreshLocalStorage();
   refreshAllLists();
   refreshActiveList();
}


function hoverTitle(elem) {
   elem.setAttribute('title', elem.textContent);
}

//запрет вызова контекстного меню
window.addEventListener('contextmenu', (e) => e.preventDefault());

Array.prototype.insert = function (index, item) {
   this.splice(index, 0, item);
};