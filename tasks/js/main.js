const addField = document.getElementById('addField');     //поле ввода задачи
const addBtn = document.getElementById('addBtn');         //кнопка добавления задачи
const taskList = document.getElementById('taskList');     //блок для хранения задач
let taskId = 0; //счетчик id чеков для label
let subTaskId = 0; //счетчик id чеков для label
const addListBtn = document.getElementById('addListBtn');//кнопка добавления листа
const listsList = document.getElementById('listsList');  //блок хранения листов
const listNameField = document.getElementById('listNameField');//поле ввода листа
let lists = JSON.parse(localStorage.getItem('lists')); //список листов в локальном хранилище
if (lists === null) {
   lists = [{ name: 'noname', tasks: [], active: true }]
}
let activeList = lists.filter(list => list.active == true)[0]; //активный список

refresh(); //глобальное обновление

//добавление задачи по нажатию на кнопку добавления
addBtn.addEventListener('click', addTask);

addField.addEventListener('keydown', function (e) {
   const str = addField.value.replace(/^\s+|\s+$/g, '');
   if (e.keyCode === 13 && str !== '') {                             // добавление задачи по нажатию Enter в инпуте
      addTask();
   }
})

//добавление листа
addListBtn.addEventListener('click', inputListName);
listNameField.addEventListener('keydown', function (e) {
   const str = listNameField.value.replace(/^\s+|\s+$/g, '');
   if (e.keyCode === 13 && str !== '') {
      listNameField.style.cssText = 'border-width: 0px; padding:0px;height:0px;';
      listsList.style.top = '120px';
      addList();
   }
})
listNameField.addEventListener('blur', function () {

   listNameField.style.cssText = 'border-width: 0px; padding:0px;height:0px;';
   listsList.style.top = '120px';

})
function addList() {
   lists.forEach(list => list.active = false);//всем спискам снять активацию
   const list = { name: listNameField.value[0].toUpperCase().trim() + listNameField.value.slice(1).trim(), tasks: [], active: true };
   lists.unshift(list); //добавление листа в массив
   refresh(); //обновление
   listNameField.value = '';
   addField.focus();//установка фокуса в поле добавления задачи
}

//создание листа на странице
function createList(list) {
   const li = document.createElement('li');
   const renameBtn = document.createElement('button');//кнопка настроек
   const deleteBtn = document.createElement('button');//кнопка удаления
   const name = document.createElement('span');
   renameBtn.classList.add('rename-btn');
   renameBtn.setAttribute('title', 'Переименовать список');
   deleteBtn.classList.add('delete-btn');
   deleteBtn.setAttribute('title', 'Удалить список');

   deleteBtn.addEventListener('click', deleteList(list));

   name.innerHTML = list.name;//назавние списка
   renameBtn.addEventListener('click', renameList(name, list, renameBtn));
   li.appendChild(name);
   //добавление кнопок
   li.appendChild(renameBtn);
   li.appendChild(deleteBtn);

   li.addEventListener('click', openList(list)); //открытие списка

   //стили для активного листа
   if (list.active == true) {
      li.style.cssText = "background-color: rgba(255, 255, 255, 1); color: black;";
   } else {
      li.style.cssText = "background-color: rgba(255, 255, 255, 0.2); color: antiquewhite;";
   }

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
            refresh();
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
               refresh();
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
//открытие окна ввода названия списка
function inputListName() {
   listNameField.style.cssText = 'border-width: 3px; padding:10px;height:50px;';
   listNameField.focus();
   listsList.style.top = '200px'
}

//открытие списка
function openList(list) {
   return function () {
      lists.forEach(l => l.active = false);//деактивировать все
      list.active = true;//активировать выбранный
      addField.focus();//фокус в поле ввода задачи
      refresh(); //обновление
   }
}
function deleteList(list) {
   return function () {
      //удаление из массива
      if (lists.length != 1) {
         delete lists[lists.indexOf(list)];
      } else {
         list.name = 'noname';
         list.tasks = [];
         list.active = true;
      }
      //обновление списка
      refresh();
   }
}

//создание задачи и добавление в массив
function addTask() {

   if (addField.value != '') {
      //объект задачи
      const task = {};

      //добавление задачи в объект(с заглавной буквы)
      task.name = addField.value[0].toUpperCase().trim() + addField.value.slice(1).trim();

      //по дэфолту без галочки
      task.check = false;
      task.subList = [];

      // присвоение id для привязки к label

      //добавление таска в массив
      activeList.tasks.unshift(task);

      //отображение новой задачи в списке(обновление списка)
      refresh();

      //очистка поля ввода задачи
      addField.value = '';
   }
}


//обновление массива задач и листа
function refresh() {
   lists = lists.filter(list => list);   //сброс массива для очистки пустых ячеек
   activeList = lists.filter(list => list.active === true)[0]; //поиск активного элемента

   //если активныого нет то сделать активным первый
   if (activeList === undefined) {
      lists[0].active = true;
      activeList = lists[0];
   }

   //массив для незавершенный задач
   const falseArr = activeList.tasks.filter(task => task.check === false);

   //массив для завершенных задач
   const trueArr = activeList.tasks.filter(task => task.check === true);

   //склейка завершенных и незаверш для переноса всех завершенных в конец списка
   activeList.tasks = falseArr.concat(trueArr);

   //очистка листа перед добавлением обновленного списка
   taskList.innerHTML = '';

   //сброс id
   taskId = 0;

   //создание задачи из массива и добавление в лист
   activeList.tasks.forEach(task => taskList.appendChild(createTask(task)));

   //очистка списка перед обновлением. для избежания дублирования списков
   listsList.innerHTML = '';

   //создать листы и добавить их в список листов
   lists.forEach(list => listsList.appendChild(createList(list)));

   //сохранить в локальное хранилище
   localStorage.setItem('lists', JSON.stringify(lists));
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


//создание пункта списка из объекта массива
function createTask(task) {
   const li = document.createElement('li');
   let check = task.check;    //переменная со значением флажка чекбокса                    
   const label = document.createElement('label');
   const deleteBtn = document.createElement('button');//кнопка удаления таска
   const settingsBtn = document.createElement('button');//кнопка настройки таска
   const dateTime = document.createElement('span');//поле для вывода даты и времени
   dateTime.classList.add('date-time-out');

   //если время в инпуте выбрано - записать его в поле - иначе записать прочерк
   if (task.time != undefined && task.time != '') {
      dateTime.textContent += task.time + ' / '
   } else {
      dateTime.textContent += '- / ';
   }

   //если дата в инпуте выбрана - записать ее в поле - иначе записать прочерк
   if (task.date != undefined && task.date != '') {
      dateTime.textContent += task.date
   } else {
      dateTime.textContent += '-';
   }

   //если дата и время меньше текущих то выделить красным
   if (getToday('date') < task.date || (getToday('date') === task.date && getToday('time') < task.time)) {
      dateTime.style.color = 'antiquewhite';
   }

   //установление атрибута for
   label.htmlFor = 'task' + taskId;
   //если таск в массиве чекед то к чекбоксу на странице добавиться атрибут
   check ? check = 'checked' : check = '';

   //текст таска
   label.innerHTML += task.name;

   settingsBtn.classList.add('settings-btn');
   settingsBtn.setAttribute('title', 'Параметры');
   deleteBtn.classList.add('delete-btn');
   deleteBtn.setAttribute('title', 'Удалить');

   settingsBtn.addEventListener('click', openSettings(task));
   deleteBtn.addEventListener('click', deleteTask(task));

   label.appendChild(settingsBtn);
   label.appendChild(deleteBtn);

   //добавление чекбокса с поставленным флажком если check = true и id для label
   li.innerHTML = `<input type="checkbox" id="task${taskId}"${check}>`;

   //событие изменения флажка чека
   li.querySelector('input').addEventListener('change', changeCheck(task));

   li.appendChild(label);
   li.appendChild(dateTime);
   taskId++;
   return li;
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
         addSubList(task, subList, subListInp);
         subListInp.value = '';
         subListInp.focus();
      });
      subListInp.addEventListener('keydown', function (e) {
         if (e.keyCode === 13) {
            addSubList(task, subList, subListInp);
            subListInp.value = '';
         }
      })
      modalInput.addEventListener('input', () => { modalInput.style.borderColor = '#ffcc00'; })
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
         delete activeList.tasks[activeList.tasks.indexOf(task)];
         modalWrap.parentNode.removeChild(modalWrap);
         refresh();
      })

      //закрытие окна настроек
      closeModal.addEventListener('click', function () {
         if (modalInput.value !== '') {
            modalWrap.parentNode.removeChild(modalWrap);
            task.name = modalInput.value;
            task.note = noteModal.value;
            if (timeCheck.checked) {
               timeModal.value = '';
               dateModal.value = '';
            }
            task.time = timeModal.value;
            task.date = dateModal.value;
            refresh();
         } else {
            modalInput.style.borderColor = 'red';
            modalInput.focus();
         }
         addField.focus();
      })
      //при открытии настроек задачи присвоить имя задачи в поле редактирования и заметку в текстареа
      modalInput.value = task.name;
      task.note != undefined ? noteModal.value = task.note : noteModal.value = '';

      task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task, subList)));
      modalInput.focus();
   }
}

function addSubList(task, subList, subListInp) {
   const newSubTask = { name: subListInp.value, check: false };
   task.subList.unshift(newSubTask);
   subList.innerHTML = '';
   task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task, subList)))
   refresh();
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
      delete task.subList[task.subList.indexOf(subTask)];
      task.subList = task.subList.filter(subTaskF => subTaskF);
      subList.innerHTML = '';
      task.subList.forEach(subTask => subList.appendChild(createSubTask(subTask, task, subList)));
      refresh();
   })
   label.appendChild(deleteBtn);
   li.appendChild(label);
   li.querySelector('input').addEventListener('change', function () {
      subTask.check ? subTask.check = false : subTask.check = true;
      refresh();
   })
   return li;
}
//смена флажка
function changeCheck(task) {
   return function () {
      // при отметке выполнения задачи или снятия флажка - проводится запись в миссив
      this.checked ? task.check = true : task.check = false;

      //обновление листа для сброса выполненных задач в конец массива
      refresh();
   }
}

//удаление задачи
function deleteTask(task) {
   return function () {
      //удаление из массива
      delete activeList.tasks[activeList.tasks.indexOf(task)];
      //обновление списка
      refresh();
   }
}

//запрет вызова контекстного меню
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('load', () => addField.focus());