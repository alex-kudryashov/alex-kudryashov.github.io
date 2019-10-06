let addField = document.getElementById('addField');     //поле ввода задачи
let addBtn = document.getElementById('addBtn');         //кнопка добавления задачи
let taskList = document.getElementById('taskList');     //блок для хранения задач
let id = 0; //счетчик id чеков для label

//массив для хранения тасков
let tasks = JSON.parse(localStorage.getItem('tasks'));
if (tasks == null) {
   tasks = [];
}

refreshList();

//добавление задачи по нажатию на кнопку добавления
addBtn.addEventListener('click', addTask);


addField.addEventListener('keydown', function (e) {
   if (addField.value === '' && e.keyCode === 32) {    // запрет пустой задачи
      e.preventDefault();
   }
   if (e.keyCode === 13) {                             // добавление задачи по нажатию Enter в инпуте
      addTask();
   }
})


//создание задачи и добавление в массив
function addTask() {
   if (addField.value != '') {
      //объект задачи
      let task = {};

      //добавление задачи в объект(с заглавной буквы)
      task.name = addField.value[0].toUpperCase() + addField.value.slice(1);

      //по дэфолту без галочки
      task.check = false;

      // присвоение id для привязки к label

      //добавление таска в массив
      tasks.unshift(task);

      //отображение новой задачи в списке(обновление списка)
      refreshList();

      //очистка поля ввода задачи
      addField.value = '';
   }

}

//обновление массива задач и листа
function refreshList() {

   //массив для незавершенный задач
   let falseArr = tasks.filter(task => task.check === false);

   //массив для завершенных задач
   let trueArr = tasks.filter(task => task.check === true);

   //склейка завершенных и незаверш для переноса всех завершенных в конец списка
   tasks = falseArr.concat(trueArr);

   //очистка листа перед добавлением обновленного списка
   taskList.innerHTML = '';

   //сброс id
   id = 0;

   //создание задачи из массива и добавление в лист
   tasks.forEach(task => taskList.appendChild(createTask(task)));
   localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getToday(type) {
   let date = new Date();
   let day = date.getDate();
   let month = date.getMonth() + 1;
   let hour = date.getHours();
   let minute = date.getMinutes();
   let str = date.getFullYear();
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
   let li = document.createElement('li');
   let check = task.check;    //переменная со значением флажка чекбокса                    
   let label = document.createElement('label');
   let deleteBtn = document.createElement('button');//кнопка удаления таска
   let settingsBtn = document.createElement('button');//кнопка настройки таска
   let dateTime = document.createElement('span');
   let today = new Date();
   dateTime.classList.add('date-time-out');
   if (task.time != undefined && task.time != '') {
      dateTime.textContent += task.time + ' / '
   } else {
      dateTime.textContent += '- / ';

   }
   if (task.date != undefined && task.date != '') {
      dateTime.textContent += task.date
   } else {
      dateTime.textContent += '-';
   }
   if (getToday('date') > task.date || (getToday('date') === task.date && getToday('time') > task.time)) {
      dateTime.classList.add('error-date');
   }
   //установление атрибута for
   label.htmlFor = 'task' + id;

   //если таск в массиве чекед то к чекбоксу на странице добавиться атрибут
   check ? check = 'checked' : check = '';

   //текст таска
   label.innerHTML += task.name;

   settingsBtn.classList.add('settings-btn');
   deleteBtn.classList.add('delete-btn');

   settingsBtn.addEventListener('click', openSettings(task));
   deleteBtn.addEventListener('click', deleteTask(task));

   label.appendChild(settingsBtn);
   label.appendChild(deleteBtn);

   //добавление чекбокса с поставленным флажком если check = true и id для label
   li.innerHTML += `<input type="checkbox" id="${'task' + id}"${check}>`;

   //событие изменения флажка чека
   li.querySelector('input').addEventListener('change', changeCheck(task));

   //добавление готового пункта задачи в список
   li.appendChild(label);
   li.appendChild(dateTime);

   id++;

   return li;
}

function openSettings(task) {
   return function () {

      let modalWrap = document.createElement('div');
      let modalSettings = document.createElement('div');
      let closeModal = document.createElement('button');
      let modalInput = document.createElement('input');
      let noteModal = document.createElement('textarea');
      let dateTimeModal = document.createElement('div');
      let timeModal = document.createElement('input');
      let dateModal = document.createElement('input');
      let date = new Date();
      modalWrap.classList.add('modal-wrap');
      modalSettings.classList.add('modal-settings');
      closeModal.classList.add('close-modal');
      modalInput.classList.add('modal-input');
      noteModal.classList.add('note-modal');
      timeModal.classList.add('time-modal');
      dateModal.classList.add('date-modal');
      dateTimeModal.classList.add('date-time-modal')

      timeModal.setAttribute('type', 'time');
      dateModal.setAttribute('type', 'date');

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



      document.body.appendChild(modalWrap);
      modalWrap.appendChild(modalSettings);
      modalSettings.appendChild(closeModal);
      modalSettings.appendChild(modalInput);
      modalSettings.appendChild(noteModal);
      modalSettings.appendChild(dateTimeModal)
      dateTimeModal.appendChild(timeModal);
      dateTimeModal.appendChild(dateModal);

      modalSettings.addEventListener('mousewheel', e => e.preventDefault());

      modalSettings.querySelector('.close-modal').addEventListener('click', function () {
         modalWrap.parentNode.removeChild(modalWrap);
         task.name = modalInput.value;
         task.note = noteModal.value;
         task.time = timeModal.value;
         task.date = dateModal.value;
         refreshList();
      })

      modalInput.value = task.name;
      task.note != undefined ? noteModal.value = task.note : noteModal.value = '';
   }
}


//смена флажка
function changeCheck(task) {
   return function () {
      // при отметке выполнения задачи или снятия флажка - проводится запись в миссив
      this.checked ? task.check = true : task.check = false;

      //обновление листа для сброса выполненных задач в конец массива
      refreshList();
   }
}

//удаление задачи
function deleteTask(task) {
   return function () {
      //удаление из массива
      delete tasks[tasks.indexOf(task)];

      //обновление списка
      refreshList();
   }
}



//запрет вызова контекстного меню
window.addEventListener('contextmenu', (e) => e.preventDefault());