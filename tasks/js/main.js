const addField = document.getElementById('addField');     //поле ввода задачи
const addBtn = document.getElementById('addBtn');         //кнопка добавления задачи
const taskList = document.getElementById('taskList');     //блок для хранения задач
let taskId = 0; //счетчик id чеков для label
let subTaskId = 0; //счетчик id чеков для label
const addListBtn = document.getElementById('addListBtn');//кнопка добавления листа
const listsList = document.getElementById('listsList');  //блок хранения листов
const listNameField = document.getElementById('listNameField');//поле ввода листа
let lists = JSON.parse(localStorage.getItem('lists')); //список листов в локальном хранилище
let undoDelete;
const undoBlock = document.querySelector('.undo-delete');
const undoText = undoBlock.querySelector('span');
let timerId;

//если список отсутствует создать безымянный
if (lists === null) {
   lists = [{ name: 'noname', tasks: [], active: true }]
}

let activeList = lists.filter(list => list.active == true)[0]; //активный список

refreshAllLists();
refreshActiveList();


//добавление задачи по нажатию на кнопку добавления
addBtn.addEventListener('click', addTask);

// добавление задачи по нажатию Enter в инпуте
addField.addEventListener('keydown', (e) => {
   addField.style.borderColor = 'rgba(255, 255, 255, 0.7)';
   if (e.keyCode === 13) {
      addTask();
   }
})

//смена цвета границы при смене фокуса
addField.addEventListener('blur', () => addField.style.borderColor = 'rgba(255, 255, 255, 0.4)')

//создание задачи и добавление в массив
function addTask() {
   const str = addField.value.replace(/^\s+|\s+$/g, '');
   if (str != '') {
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
   let check = task.check;    //переменная со значением флажка чекбокса   

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

   //если время в поле выбрано - записать его в поле - иначе записать прочерк
   if (task.time != undefined && task.time != '') {
      dateTime.textContent += task.time + ' / '
   } else {
      dateTime.textContent += '- / ';
   }

   //если дата в поле выбрана - записать ее в поле - иначе записать прочерк
   if (task.date != undefined && task.date != '') {
      dateTime.textContent += task.date
   } else {
      dateTime.textContent += '-';
   }

   //если дата и время больше текущих то выделить светлым цветом
   if (getToday('date') < task.date || (getToday('date') === task.date && getToday('time') < task.time)) {
      dateTime.style.color = 'antiquewhite';
   }

   label.htmlFor = 'task' + taskId;    //установление атрибута for для привязки чекбокса

   //если задача выполнена то присвоить в переменную 'checked' и добавить ее в чекбокс
   check ? check = 'checked' : check = '';
   li.innerHTML = `<input type="checkbox" id="task${taskId}"${check}>`;

   //текст задачи
   label.innerHTML += task.name;

   //добавление кнопок
   label.appendChild(settingsBtn);
   label.appendChild(deleteBtn);

   //событие изменения флажка задачи
   li.querySelector('input').addEventListener('change', changeCheck(task));

   li.appendChild(label);
   li.appendChild(dateTime);

   taskId++;   //переход к следующему значению id
   hoverTitle(label);
   return li; //возврат элемента для вставки
}

//нажатие на кнопку добавления списка
addListBtn.addEventListener('click', inputListName);

//открытие окна ввода названия списка
function inputListName() {
   listNameField.style.cssText = 'border-width: 3px; padding:10px;height:50px;';
   listsList.style.top = '200px';
   listNameField.focus();
}

//нажатие enter в поле ввода списка
listNameField.addEventListener('keydown', function (e) {
   const str = listNameField.value.replace(/^\s+|\s+$/g, '');
   if (e.keyCode === 13 && str !== '') {
      listNameField.style.cssText = 'border-width: 0px; padding:0px;height:0px;';
      listsList.style.top = '120px';
      addList();
      listNameField.value = '';
      addField.focus();//установка фокуса в поле добавления задачи
   }
})

//смена фокуса с поля ввода списка
listNameField.addEventListener('blur', function () {
   listNameField.style.cssText = 'border-width: 0px; padding:0px;height:0px;';
   listsList.style.top = '120px';
   listNameField.value = '';
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
   const li = document.createElement('li'); //блок списка
   const renameBtn = document.createElement('button');//кнопка настроек
   const deleteBtn = document.createElement('button');//кнопка удаления
   const name = document.createElement('span');
   name.innerHTML = list.name;//назавние списка

   renameBtn.classList.add('rename-btn');
   deleteBtn.classList.add('delete-btn');

   renameBtn.setAttribute('title', 'Переименовать список');
   deleteBtn.setAttribute('title', 'Удалить список');

   deleteBtn.addEventListener('click', () => deleteElement('list', list));
   renameBtn.addEventListener('click', renameList(name, list, renameBtn));

   li.appendChild(name);
   li.appendChild(renameBtn);
   li.appendChild(deleteBtn);

   li.addEventListener('click', openList(list)); //открытие списка

   //стили для активного листа
   if (list.active == true) {
      li.style.cssText = "background-color: rgba(255, 255, 255, 1); color: black;";
   } else {
      li.style.cssText = "background-color: rgba(255, 255, 255, 0.2); color: antiquewhite;";
   }

   hoverTitle(li);

   return li;//возврат элемента для вставки на страницу
}
function renameList(name, list, btn) {
   return function (e) {
      e.stopPropagation();
      const input = document.createElement('input');
      input.value = list.name;
      name.innerHTML = '';
      btn.classList.add('rename-btn-save');
      btn.removeEventListener('click', renameList(name, list, btn));
      btn.addEventListener('click', function () {
         const str = input.value.replace(/^\s+|\s+$/g, '');
         if (str != '') {
            list.name = input.value;
            name.innerHTML = list.name;
            refreshLocalStorage();
            refreshAllLists();
            btn.classList.remove('rename-btn-save');
         } else {
            input.style.borderBottom = '2px dotted red'
         }

      })
      name.appendChild(input);
      input.focus();
      if (list.active) {
         input.style.color = 'black'
      }
      input.addEventListener('keydown', function (e) {
         if (e.keyCode === 13) {
            const str = input.value.replace(/^\s+|\s+$/g, '');
            if (str != '') {
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
}


//открытие списка
function openList(list) {
   return function () {
      lists.forEach(l => l.active = false);//деактивировать все
      list.active = true;//активировать выбранный
      addField.focus();//фокус в поле ввода задачи
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
   if (month < 10) month = '0' + month;
   if (day < 10) day = '0' + day;
   if (hour < 10) hour = '0' + hour;
   if (minute < 10) minute = '0' + minute;
   if (type === 'date') {
      return `${date.getFullYear()}-${month}-${day}`;
   } else if (type === 'time') {
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
      const closeModal = modalWrap.querySelector('.close-modal');
      const noteModal = modalWrap.querySelector('.note-modal');
      const timeCheck = modalWrap.querySelector('input[type="checkbox"]');
      const subList = modalWrap.querySelector('#subList');
      const subListInp = modalWrap.querySelector('#subListInp');
      const subListAdd = modalWrap.querySelector('#subListAdd');

      subListAdd.addEventListener('click', function () {
         addSubTask(task, subList, subListInp);
         subListInp.value = '';
         subListInp.focus();
      });
      subListInp.addEventListener('keydown', function (e) {
         if (e.keyCode === 13) {
            addSubTask(task, subList, subListInp);
            subListInp.value = '';
         }
      })
      modalInput.addEventListener('input', () => { modalInput.style.borderColor = '#ffcc00'; })
      subListInp.addEventListener('input', () => { subListInp.style.borderColor = '#ffcc00'; })

      //если дата и время не были заданы изначально - при открытии настроек заполнить поля текущими иначе заполнить указанными ранее
      if (task.time != undefined && task.time != '') {
         timeModal.value = task.time;
      } else {
         timeModal.value = getToday('time');
      }
      if (task.date != undefined && task.date != '') {
         dateModal.value = task.date;
      } else {
         dateModal.value = getToday('date');
      }
      dateModal.setAttribute('min', getToday('date'));
      deleteBtn.addEventListener('click', function () {
         deleteElement('task', task);
         modalWrap.parentNode.removeChild(modalWrap);
      })

      //закрытие окна настроек
      closeModal.addEventListener('click', function () {
         const str = modalInput.value.replace(/^\s+|\s+$/g, '');
         if (str !== '') {
            modalWrap.parentNode.removeChild(modalWrap);
            task.name = modalInput.value;
            task.note = noteModal.value;
            if (timeCheck.checked) {
               timeModal.value = '';
               dateModal.value = '';
            }
            task.time = timeModal.value;
            task.date = dateModal.value;
            refreshActiveList();
            addField.focus();
         } else {
            modalInput.style.borderColor = 'red';
            modalInput.value = '';
            modalInput.focus();
         }
      })
      //при открытии настроек задачи присвоить имя задачи в поле редактирования и заметку в текстареа
      modalInput.value = task.name;
      task.note != undefined ? noteModal.value = task.note : noteModal.value = '';

      task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task, subList)));
      modalInput.focus();
   }
}

function addSubTask(task, subList, subListInp) {
   const str = subListInp.value.replace(/^\s+|\s+$/g, '');
   if (str != '') {
      const newSubTask = { name: subListInp.value, check: false };
      task.subList.unshift(newSubTask);
      subList.innerHTML = '';
      refreshLocalStorage();
      task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task, subList)))
   } else {
      subListInp.style.borderColor = 'red';
   }
}

function createSubTask(subTask, task, subList) {
   const li = document.createElement('li');
   const label = document.createElement('label');
   const deleteBtn = document.createElement('button');
   let check = subTask.check;
   subTaskId++;
   check ? check = 'checked' : check = '';
   li.innerHTML = `<input type="checkbox" id="subTask${subTaskId}"${check}>`;
   label.setAttribute('for', `subTask${subTaskId}`);
   label.innerHTML = subTask.name;
   deleteBtn.classList.add('delete-btn');
   deleteBtn.addEventListener('click', function () {
      undoDelete = subTask;
      undoBlock.style.cssText = 'opacity: 1; transition: 1s; width: auto;'
      clearInterval(timerId);
      const undoBtn = document.createElement('a');
      undoBtn.textContent = 'Восстановить';
      undoBtn.setAttribute('href', '#');
      undoBlock.innerHTML = '';
      timerId = setInterval(() => {
         undoBlock.style.opacity = 0;
         undoBlock.style.cssText = 'opacity: 0; transition: 0s; width: 0;';
         clearInterval(timerId);
      }, 4000);
      task.subList.splice(task.subList.indexOf(subTask), 1);
      undoBlock.innerHTML = 'Подзадача удалена. ';
      undoBlock.appendChild(undoBtn);
      task.subList = task.subList.filter(subTaskF => subTaskF);
      subList.innerHTML = '';
      task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task, subList)));
      refreshLocalStorage();
      undoBtn.addEventListener('click', (e) => {
         e.preventDefault();
         undoDeleting(subTask, task.subList);
         subList.innerHTML = '';
         task.subList.forEach(st => subList.appendChild(createSubTask(st)));
      });
   })
   label.appendChild(deleteBtn);
   li.appendChild(label);
   li.querySelector('input').addEventListener('change', function () {
      subTask.check ? subTask.check = false : subTask.check = true;
      refreshLocalStorage();
   })
   hoverTitle(label);
   return li;
}

function deleteElement(type, what) {
   undoDelete = what;
   undoBlock.style.cssText = 'opacity: 1; transition: 1s; width: auto;'
   clearInterval(timerId);
   const undoBtn = document.createElement('a');
   undoBtn.textContent = 'Восстановить';
   undoBtn.setAttribute('href', '#');
   undoBlock.innerHTML = '';
   timerId = setInterval(() => {
      undoBlock.style.cssText = 'opacity: 0; transition: 0s; width: 0;';
      clearInterval(timerId);
   }, 4000);
   if (type === 'list') {
      lists.splice(lists.indexOf(what), 1);
      refreshLocalStorage();
      if (lists.length === 0) {
         lists.push({ name: 'noname', tasks: [], active: true })
      }
      //обновление списка
      lists = lists.filter(list => list);   //сброс массива для очистки пустых ячеек
      undoBlock.innerHTML = 'Список удален. ';
      undoBlock.appendChild(undoBtn);
      undoBtn.addEventListener('click', (e) => {
         e.preventDefault();
         undoDeleting(what, lists);
      });
   }
   if (type === 'task') {
      // delete activeList.tasks[activeList.tasks.indexOf(what)];
      activeList.tasks.splice(activeList.tasks.indexOf(what), 1);
      undoBlock.innerHTML = 'Задача удалена. ';
      undoBlock.appendChild(undoBtn);
      undoBtn.addEventListener('click', (e) => {
         e.preventDefault();
         undoDeleting(what, activeList.tasks);
      });
   }
   refreshAllLists();
   refreshActiveList();
}

function undoDeleting(what, where) {
   undoBlock.style.cssText = 'opacity: 0; transition: 0s;';
   where.unshift(what);
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