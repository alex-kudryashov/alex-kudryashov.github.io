const addField = document.getElementById('addField');     //поле ввода задачи
const addBtn = document.getElementById('addBtn');         //кнопка добавления задачи
const taskList = document.getElementById('taskList');     //блок для хранения задач
const addListBtn = document.getElementById('addListBtn');//кнопка добавления листа
const listsList = document.querySelector('.listsList');  //блок хранения листов
const listNameField = document.querySelector('.listNameField');//поле ввода листа
let lists = JSON.parse(localStorage.getItem('lists')) || [{ name: 'noname', tasks: [], active: true }]; //список листов в локальном хранилище
const undoBlock = document.querySelector('.undo-delete');
const undoText = undoBlock.querySelector('span');
let timerId;
let undoDelete;
let taskId = 0; //счетчик id чеков для label
let subTaskId = 0; //счетчик id чеков для label

let activeList = lists.filter(list => list.active == true)[0]; //активный список



//смена темы
let themes = {
   dark: [
      { '--text': 'antiquewhite' },
      { '--buttons': '#ffcc00' },
      { '--body-bg': '#000' },
      { '--active-list-text': '#000' },
      { '--panels-color': '#3f3d54' },
      { '--error-color': 'red' },
      { '--options-bg': '#333' },
      { '--borders': '#8b8b8b' },
      { '--items': 'rgb(91, 86, 95)' },
      { '--active-list': 'rgba(255, 255, 255, 0.9)' },
      { '--delete-message': '#333' }
   ],
   light: [
      { '--text': '#333' },
      { '--buttons': 'blue' },
      { '--body-bg': '#FFF' },
      { '--active-list-text': 'antiquewhite' },
      { '--panels-color': '#bdd7fd' },
      { '--error-color': 'red' },
      { '--options-bg': '#ccc' },
      { '--borders': '#8b8b8b' },
      { '--items': 'rgba(255, 255, 255, 0.2)' },
      { '--active-list': 'blue' },
      { '--delete-message': 'blue' }
   ]
}
refreshTheme();

document.getElementById('themes').addEventListener('click', e => {
   if (e.target.nodeName === 'LI') {
      localStorage.setItem('activeTheme', JSON.stringify(themes[e.target.id.match(/(.+?)Theme/)[1]]));
      refreshTheme();
   }
})

function refreshTheme() {
   for (let v of (JSON.parse(localStorage.getItem('activeTheme')) || themes.dark)) {
      document.documentElement.style.setProperty(Object.keys(v)[0], v[Object.keys(v)[0]]);
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
addField.addEventListener('keydown', (e) => {
   if (e.keyCode === 13) {
      addTask();
   }
})

//создание задачи и добавление в массив
function addTask() {
   if (!(/^\s*$/.test(addField.value))) {
      //объект задачи
      const task = {};

      //добавление задачи в объект(с заглавной буквы)
      task.name = (addField.value[0].toUpperCase() + addField.value.slice(1)).trim();

      //по дэфолту без галочки
      task.check = false;

      task.subList = [];

      //добавление таска в массив активного списка
      activeList.tasks.unshift(task);

      //отображение новой задачи в списке(обновление списка)
      refreshActiveList();
   } else {
      addField.style.borderColor = 'red';
   }
   addField.value = '';
   addField.focus();
}

//создание пункта списка из объекта массива
function createTask(task) {
   const li = document.createElement('li');
   const label = document.createElement('label');
   const deleteBtn = document.createElement('button');//кнопка удаления таска
   const settingsBtn = document.createElement('button');//кнопка настройки таска
   const dateTime = document.createElement('span');//поле для вывода даты и времени
   //стили кнопок и вывода времени
   dateTime.classList.add('date-time-out');
   settingsBtn.classList.add('settings-btn');
   deleteBtn.classList.add('delete-btn');
   //всплывающие подсказыки при наведении на кнопки
   settingsBtn.setAttribute('title', 'Параметры');
   deleteBtn.setAttribute('title', 'Удалить');
   //события кликов
   settingsBtn.addEventListener('click', openSettings(task));
   deleteBtn.addEventListener('click', () => deleteElement('task', task));

   let days = ['вт', 'ср', 'чт', 'пт', 'сб', 'вс', 'пн'];

   days = days[task.day] ? `(${days[task.day]})` : '';

   let day = new Date(task.date).getDate();
   let month = new Date(task.date).getMonth() + 1

   if (day) {
      day = `${day}.${month}`
   } else {
      day = '-';
   }
   dateTime.textContent = `${task.time || '-'} / ${task.date === getToday('date') ? 'Сегодня' : day}${days}`;

   //если дата и время больше текущих то выделить светлым цветом
   if (!(getToday('date') < task.date || (getToday('date') === task.date && getToday('time') < task.time))) {
      dateTime.classList.add('error-date');
   }

   label.htmlFor = 'task' + ++taskId;    //установление атрибута for для привязки чекбокса

   li.innerHTML = `<input type="checkbox" id="task${taskId}"${task.check ? 'checked' : ''}>`;

   //текст задачи
   label.innerHTML += task.name;

   //добавление кнопок
   label.appendChild(settingsBtn);
   label.appendChild(deleteBtn);

   //событие изменения флажка задачи
   li.querySelector('input').addEventListener('change', changeCheck(task));

   li.appendChild(label);
   li.appendChild(dateTime);

   hoverTitle(label);
   return li; //возврат элемента для вставки
}

//нажатие на кнопку добавления списка
addListBtn.addEventListener('click', () => {
   listNameField.classList.add('listNameFieldActive');
   listsList.classList.add('listsListInput');
   listNameField.focus();
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
      }
      listNameField.value = '';
   }
})

//смена фокуса с поля ввода списка
listNameField.addEventListener('blur', () => {
   listNameField.value = '';
   listNameField.classList.remove('listNameFieldActive');
   listNameField.classList.remove('listNameFieldError');
   listsList.classList.remove('listsListInput');
})

//добавление списка
function addList() {
   lists.forEach(list => list.active = false);//всем спискам снять активацию
   const list = { name: listNameField.value[0].toUpperCase().trim() + listNameField.value.slice(1).trim(), tasks: [], active: true };
   lists.unshift(list); //добавление листа в массив
   refreshLocalStorage(); //обновление
   refreshAllLists();
   refreshActiveList();
}

//создание листа на странице
function createList(list) {
   const template = document.querySelector('#listItemTemplate').content;
   const templateClone = template.cloneNode(true);
   const li = templateClone.querySelector('li');
   const optionsBtn = li.querySelector('#optionsBtn');
   const options = li.querySelector('.optionsList');
   const renameBtn = options.querySelector('.rename-btn');
   const deleteBtn = options.querySelector('.delete-btn');
   const name = li.querySelector('span');
   name.innerHTML = list.name;//назавние списка

   optionsBtn.addEventListener('click', e => {
      e.stopPropagation();
      options.style.transform = 'scale(1)';
   })
   options.addEventListener('mouseleave', () => options.style.transform = 'scale(0)')
   deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteElement('list', list)
   });
   renameBtn.addEventListener('click', e => {
      e.stopPropagation();
      options.style.transform = 'scale(0)';
      renameList(name, list);
   })

   li.addEventListener('click', openList(list)); //открытие списка

   // стили для активного листа
   if (list.active) {
      li.classList.add('activeList');
      document.querySelector('.mobile-header span').textContent = activeList.name;
   }
   hoverTitle(name);
   return li;//возврат элемента для вставки на страницу
}
function renameList(name, list) {
   const input = document.createElement('input');
   input.value = list.name;
   name.innerHTML = '';
   name.appendChild(input);
   input.focus();
   input.addEventListener('keydown', function (e) {
      if (e.keyCode === 13) {
         if (!(/^\s*$/.test(input.value))) {
            list.name = input.value;
            name.innerHTML = list.name;
            refreshLocalStorage();
            refreshAllLists();
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
   return function () {
      lists.forEach(l => l.active = false);//деактивировать все
      list.active = true;//активировать выбранный
      refreshLocalStorage();
      refreshAllLists();
      refreshActiveList(); //обновление
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
   activeList.tasks.forEach(task => taskList.appendChild(createTask(task)));
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
      return `${hour < 10 ? (`0${hour}`) : hour}:${minute}`;
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
      const closeModal = modalWrap.querySelector('.close-modal');
      const noteModal = modalWrap.querySelector('.note-modal');
      const timeCheck = modalWrap.querySelector('input[type="checkbox"]');
      const subListInp = modalWrap.querySelector('#subListInp');

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
      closeModal.addEventListener('click', function () {
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
            modalInput.style.borderColor = 'red';
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
   }
}

function resfreshSubList(task) {
   const subList = document.querySelector('#subList');
   subList.innerHTML = '';
   task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task)))
}

function createSubTask(subTask, task) {
   const li = document.createElement('li');
   const label = document.createElement('label');
   const deleteBtn = document.createElement('button');
   li.innerHTML = `<input type="checkbox" id="subTask${++subTaskId}"${subTask.check ? 'checked' : ''}>`;
   label.setAttribute('for', `subTask${subTaskId}`);
   label.innerHTML = subTask.name;
   deleteBtn.classList.add('delete-btn');
   deleteBtn.addEventListener('click', () => deleteElement('subTask', subTask, task));
   label.appendChild(deleteBtn);
   li.appendChild(label);
   li.querySelector('input').addEventListener('change', changeCheck(subTask));
   hoverTitle(label);
   return li;
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
         lists.push({ name: 'noname', tasks: [], active: true })
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
//смена флажка
function changeCheck(task) {
   return function () {
      // при отметке выполнения задачи или снятия флажка - проводится запись в миссив
      this.checked ? task.check = true : task.check = false;
      //обновление листа для сброса выполненных задач в конец массива
      refreshActiveList();
   }
}

function hoverTitle(elem) {
   elem.setAttribute('title', elem.textContent);
}

//запрет вызова контекстного меню
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('load', () => addField.focus());

Array.prototype.insert = function (index, item) {
   this.splice(index, 0, item);
};