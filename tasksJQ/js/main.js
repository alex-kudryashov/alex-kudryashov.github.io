const $taskNameField = $('#taskNameField');     //поле ввода задачи
const $listNameField = $('#listNameField');//поле ввода листа
const $taskList = $('#taskList');     //блок хранения задач
const $listsList = $('#listsList');  //блок хранения листов
let checkOpenModal = false;   //если переменная истинна то событие свайп не сработает
//список листов в локальном хранилище
let lists = JSON.parse(localStorage.getItem('lists')) || [{ name: 'без имени', tasks: [], active: true }];

const $undoBlock = $('.undo-delete');  //блок с сообщением об удалении и кнопкой восстановления

let timerId; // переменная для сброса таймера при повторном удалении
let taskId = 0; //счетчик id чекбоксов для задач
let subTaskId = 0; //счетчик id чекбоксов для подзадач

let activeList = lists.filter(list => list.active == true)[0]; //активный список

//темы
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

//обновление темы при открытии страницы
refreshTheme(themesSettings);

//кнопки смены тем
$('#themes').on('click', 'li', function () {
   //от id кнопки отрезается название темы и сохраняется в локальное хранилище
   localStorage.setItem('activeTheme', JSON.stringify(this.id.match(/(.+?)Theme/)[1]));
   //тема обновляется
   refreshTheme(themesSettings);
})

//обновление темы
function refreshTheme(themes) {
   //в текущую тему записывается название из локального хранилища, или, если оно пустое сохранится первая из списка
   let currentTheme = JSON.parse(localStorage.getItem('activeTheme')) || Object.keys(themes)[0];
   try {
      //все переменные цветов сохраняются в html
      for (let v of themes[currentTheme]) {
         document.documentElement.style.setProperty(Object.keys(v)[0], v[Object.keys(v)[0]]);
      }
   } catch (error) {
      //при возникновении ошибки берется первая тема
      localStorage.setItem('activeTheme', JSON.stringify(Object.keys(themes)[0]));
      //тема обновляется
      refreshTheme(themes);
   }
}

//обновление списков и задач текущего списка для отображения на странице
refreshAllLists();
refreshActiveList();

//кнопка открытия меню на телефонах
$('.mobile-header button').on('click', () => {
   $('.menu').toggleClass('showMenu');
   $('.taskField').toggleClass('hideTasks');
})

//добавление задачи по нажатию на кнопку добавления
$('#addBtn').on('click', addTask);

// добавление задачи по нажатию Enter в инпуте
$taskNameField.on('keydown', e => {
   if (e.keyCode === 13) {
      addTask();
   }
})

//создание задачи
function addTask() {
   //при НЕпустом поле
   if (!(/^\s*$/.test($taskNameField.val()))) {
      const task = {};  //объект задачи
      //добавление задачи в объект(с заглавной буквы)
      task.name = ($taskNameField.val()[0].toUpperCase() + $taskNameField.val().slice(1)).trim();
      task.check = false;  //по дэфолту без галочки
      task.subList = [];   //пустой список подзадач
      activeList.tasks.unshift(task);  //добавление задачи в массив активного списка
      refreshActiveList(); //отображение новой задачи в списке(обновление списка)
   } else {
      $taskNameField.addClass('listNameFieldError');  //покрасить поле в красный при пустом поле или при вводе только пробелов
      //возврат стандартного цвета при вводе в поле
      $taskNameField.on('keydown', function clearError(e) {
         if (e.keyCode != 13) {
            $taskNameField.removeClass('listNameFieldError');
            $taskNameField.off('keydown', clearError);   //отвязка события
         }
      })
      $taskNameField.on('blur', () => $taskNameField.removeClass('listNameFieldError'));  //возврат цвета при смене фокуса
   }
   $taskNameField.val(''); //очистка поля
   $taskNameField.focus(); //возврат фокуса на поле(чтобы при нажатии на кнопку фокус не переходил на нее)
}

//создание пункта списка из объекта массива
function createTask(task) {
   const $li = $(document.getElementById('taskItemTemplate').cloneNode(true).content);
   const $label = $li.find('label');
   const $dateTime = $li.find('.date-time-out');//поле для вывода даты и времени
   const $checkbox = $li.find('input');

   $label.find('.settings-btn').on('click', () => openSettings(task));     //параметры
   $label.find('.delete-btn').on('click', () => deleteElement('task', task)); //удаление

   //присвоение дня недели
   let days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
   days = days[task.day] ? `(${days[task.day]})` : '';
   let day = new Date(task.date).getDate();
   let month = new Date(task.date).getMonth() + 1;

   //если у задачи указана дата - записать ее в переменную в удобном формате
   if (day) {
      day = `${day}.${month}`
   } else {
      day = '-';
   }
   //если задача выполнена - записать в окно даты и времени когда она была выполнена
   if (task.check) {
      $dateTime.text(`Выполнено ${task.checkDate} в ${task.checkTime}`);
   } else {
      //вывод даты и времени в span
      $dateTime.text(`${task.time || '-'} / ${task.date === getToday('date') ? 'Сегодня' : day} ${days}`);
      //если дата и время больше текущих то выделить светлым цветом
      if (!(getToday('date') < task.date || (getToday('date') === task.date && getToday('time') < task.time))) {
         $dateTime.addClass('error-date');
      }
   }

   $label.attr('for', `task${++taskId}`);    //установление атрибута for для привязки чекбокса
   $checkbox.attr('id', `task${taskId}`);    //id для checkbox

   //установить галочку, если задача выполнена
   if (task.check) {
      $checkbox.prop('checked', true);
      $label.removeClass('icon-check-empty')
      $label.addClass('icon-check');
   }

   //текст задачи
   $label.find('.taskTitle').text(task.name);

   //событие изменения флажка задачи
   $checkbox.on('change', () => {
      changeCheck(task, $label);
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
   $li.attr('title', task.name);
   return $li; //возврат элемента для вставки
}

//нажатие на кнопку добавления списка
$('#addListBtn').on('click', function () {
   $listNameField.toggleClass('listNameFieldActive');
   $listsList.toggleClass('listsListInput');
   $listNameField.focus();
   if (!$listNameField.hasClass('listNameFieldActive')) {
      $listNameField.blur();
      $listNameField.removeClass('listNameFieldError');
   }
   document.addEventListener('click', (e) => {
      if (e.target.id != 'addListBtn') {
         $listNameField.removeClass('listNameFieldActive');
         $listNameField.removeClass('listNameFieldError');
         $listsList.removeClass('listsListInput');
      }
   })
   $listNameField.val('');
});

//нажатие enter в поле ввода списка
$listNameField.on('keydown', e => {
   if (e.keyCode === 13) {
      // если поле не пустое - добавить список и скрыть поле
      if (!(/^\s*$/.test($listNameField.val()))) {
         $listNameField.removeClass('listNameFieldActive');
         $listsList.removeClass('listsListInput');
         addList();
      } else {
         $listNameField.addClass('listNameFieldError');  //цвет ошибки при вводе пустого поля
         $listNameField.on('keydown', function clearError(e) {
            if (e.keyCode != 13) {
               $listNameField.removeClass('listNameFieldError');  //возврат цвета при вводе 
               $listNameField.off('keydown', clearError);   //отвязка события после первого ввода
            }
         })
      }
      $listNameField.val('');    //очистка поля
   }
})

//добавление списка
function addList() {
   lists.forEach(list => list.active = false);//всем спискам снять активацию
   const list = { name: $listNameField.val()[0].toUpperCase().trim() + $listNameField.val().slice(1).trim(), tasks: [], active: true };
   lists.unshift(list); //добавление листа в массив
   $listNameField.blur();
   refreshLocalStorage(); //обновление
   refreshAllLists();
   refreshActiveList();
   if ($('.menu').hasClass('showMenu')) {
      $('.mobile-header button').click();
   }
}

//свайп для открытия/закрытия меню
function swipe(what, func, func2) {
   let initialPoint;
   let finalPoint;
   what.addEventListener('touchstart', () => initialPoint = event.changedTouches[0], false);
   what.addEventListener('touchend', () => {
      finalPoint = event.changedTouches[0];
      const xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX);
      const yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
      if (xAbs > 20 || yAbs > 20) {
         if (xAbs > yAbs) {
            if (finalPoint.pageX < initialPoint.pageX) {
               /*СВАЙП ВЛЕВО*/
               func()
            }
            else {
               /*СВАЙП ВПРАВО*/
               func2()
            }
         }
      }
   }, false);
}

function hideMenu() {
   if ($('.menu').hasClass('showMenu')) {
      $('.mobile-header button').click()
   }
}
function showMenu() {
   if (!$('.menu').hasClass('showMenu') && !(checkOpenModal)) {
      $('.mobile-header button').click();
   }
}
swipe(document, hideMenu, showMenu);

//создание листа на странице
function createList(list) {
   const $li = $(document.getElementById('listItemTemplate').cloneNode(true).content).find('.listItem');
   const $options = $li.find('.optionsList');
   const $name = $li.find('span');
   $name.html(list.name);//назавние списка

   $options.find('.deleteList').on('click', e => {
      e.stopPropagation();
      deleteElement('list', list)
   });
   $options.find('.renameList').on('click', e => {
      e.stopPropagation();
      $options.css('transform', 'scale(0)');
      renameList($name, list);
   })
   $li.on('click', 'span', () => {
      openList(list)
   })
   $li.on('click', 'button', () => {
      if ($options.hasClass('optionsListOpen')) {
         $options.removeClass('optionsListOpen')
      } else {
         document.querySelectorAll('.optionsList').forEach(e => {
            if (e.classList.contains('optionsListOpen')) {
               e.classList.remove('optionsListOpen')
            }
         });
         $options.addClass('optionsListOpen');

         $(document).on('click', (event) => {
            if (event.target.id != 'optionsBtn') {
               document.querySelectorAll('.optionsList').forEach(e => {
                  if (e.classList.contains('optionsListOpen'))
                     e.classList.remove('optionsListOpen')
               })
            }
         });
      }
   }); //открытие списка

   // стили для активного листа
   if (list.active) {
      $li.addClass('activeList');
      $('.mobile-header span').text(activeList.name);
   }
   // hoverTitle(name);
   return $li;//возврат элемента для вставки на страницу
}

function renameList(where, what, task) {
   const input = $('<input type="text">');
   input.val(what.name);
   where.html(input);
   input.focus();
   input.on('keydown', function (e) {
      if (e.keyCode === 13) {
         if (!(/^\s*$/.test(input.val()))) {
            what.name = input.val();
            where.html(what.name);
            refreshLocalStorage();
            refreshAllLists();
            if (task) resfreshSubList(task);
         } else {
            input.addClass('rename-error');
         }
      }
   })
   input.on('blur', function () {
      input.focus();
      input.addClass('rename-error');
   })
   input.on('click', function (e) {
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
   if ($('.menu').hasClass('showMenu')) {
      $('.mobile-header button').click();
   }
}


function refreshActiveList() {
   //сохранить в локальное хранилище
   refreshLocalStorage();

   //массив для незавершенный задач
   const falseArr = activeList.tasks.filter(task => task.check === false);

   //массив для завершенных задач
   const trueArr = activeList.tasks.filter(task => task.check === true);

   //склейка завершенных и незаверш для переноса всех завершенных в конец списка
   activeList.tasks = falseArr.concat(trueArr);
   $taskList.html('');
   taskId = 0;
   if (activeList.tasks.length === 0) {
      const emptyListLabel = $('<span>');
      emptyListLabel.attr('id', 'emptyList');
      emptyListLabel.html('Список пуст');
      $taskList.append(emptyListLabel);
   } else {
      activeList.tasks.forEach(task => $taskList.append(createTask(task)));
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
   $listsList.html('');

   //создать листы и добавить их в список листов
   lists.forEach(list => $listsList.append(createList(list)));
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
   const $modalWrap = $(document.getElementById('modalSettingsTemplate').cloneNode(true).content).find('.modal-wrap');
   $('body').append($modalWrap);
   const $modalInput = $modalWrap.find('.modal-input');
   const $timeModal = $modalWrap.find('.time-modal');
   const $dateModal = $modalWrap.find('.date-modal');
   const $noteModal = $modalWrap.find('.note-modal');
   const $timeCheck = $modalWrap.find('input[type="checkbox"]');
   const $subListInp = $modalWrap.find('#subListInp');
   const $checkLabel = $modalWrap.find('.modal-check');
   checkOpenModal = true;
   $timeCheck.on('change', () => {
      if ($timeCheck.prop('checked')) {
         $checkLabel.addClass('icon-check');
         $checkLabel.removeClass('icon-check-empty');
      } else {
         $checkLabel.removeClass('icon-check');
         $checkLabel.addClass('icon-check-empty');
      }
   });

   $modalWrap.find('#subListAdd').on('click', function () {
      addSubTask(task, $subListInp);
      $subListInp.val('');
      $subListInp.focus();
   });
   $subListInp.on('keydown', function (e) {
      if (e.keyCode === 13) {
         addSubTask(task, $subListInp);
         $subListInp.val('');
      }
   })
   $modalInput.on('input', () => { $modalInput.removeClass('listNameFieldError') })
   $subListInp.on('input', () => { $subListInp.removeClass('listNameFieldError') })

   //если дата и время не были заданы изначально - при открытии настроек заполнить поля текущими иначе заполнить указанными ранее
   task.time ? $timeModal.val(task.time) : $timeModal.val(getToday('time'));
   task.date ? $dateModal.val(task.date) : $dateModal.val(getToday('date'));
   $dateModal.attr('min', getToday('date'));
   $modalWrap.find('.modal-delete-btn').on('click', function () {
      deleteElement('task', task);
      $('body').find($modalWrap).remove();
      checkOpenModal = false;
   })

   //закрытие окна настроек
   $modalWrap.find('.save-modal').on('click', function () {
      if (!(/^\s*$/.test($modalInput.val()))) {
         $('body').find($modalWrap).remove();
         task.name = $modalInput.val();
         task.note = $noteModal.val();
         if ($timeCheck.prop('checked')) {
            $timeModal.val('');
            $dateModal.val('');
         }
         task.time = $timeModal.val();
         task.date = $dateModal.val();
         task.day = new Date(task.date).getDay();
         refreshActiveList();
      } else {
         $modalInput.addClass('listNameFieldError');
         $modalInput.on('keydown', function clearError() {
            $modalInput.removeClass('listNameFieldError');
            $modalInput.off('keydown', clearError);
         })
         $modalInput.val('');
         $modalInput.focus();
      }
      checkOpenModal = false;
   })
   //при открытии настроек задачи присвоить имя задачи в поле редактирования и заметку в текстареа
   $modalInput.val(task.name);
   task.note != undefined ? $noteModal.val(task.note) : $noteModal.val('');

   resfreshSubList(task);
}

function addSubTask(task, subListInp) {
   if (!(/^\s*$/.test(subListInp.val()))) {
      task.subList.unshift({ name: subListInp.val(), check: false });
      refreshLocalStorage();
      resfreshSubList(task);
   } else {
      subListInp.addClass('listNameFieldError');
      subListInp.on('blur', () => subListInp.removeClass('listNameFieldError'))
   }
}

function resfreshSubList(task) {
   subTaskId = 0;
   const subList = $('#subList');
   subList.html('');
   task.subList.forEach(subTask => subList.append(createSubTask(subTask, task)))
}

function createSubTask(subTask, task) {
   const $li = $(document.getElementById('subTaskItemTemplate').cloneNode(true).content);
   const $label = $li.find('label');
   const $subTaskCheck = $li.find('input[type="checkbox"]');
   const $subTaskTitle = $li.find('.subTaskTitle');
   const $renameBtn = $li.find('.rename-btn');

   //установить галочку если задача выполнена
   if (subTask.check) {
      $label.addClass('icon-check');
      $subTaskCheck.prop('checked', true);
   } else {
      $label.addClass('icon-check-empty')
   }

   //установка id для связи с label
   $subTaskCheck.attr('id', `subTask${++subTaskId}`);
   $label.attr('for', `subTask${subTaskId}`);

   //текст подзадачи
   $subTaskTitle.text(subTask.name);

   //кнопка удаления
   $li.find('.delete-btn').on('click', () => deleteElement('subTask', subTask, task));

   //кнопка переименования
   $renameBtn.on('click', function renameSubTask() {
      renameList($subTaskTitle, subTask, task);
      const $input = $subTaskTitle.find('input');
      $renameBtn.removeClass('icon-pencil');
      $renameBtn.addClass('icon-ok-outline');
      $renameBtn.off('click', renameSubTask);
      $renameBtn.on('click', () => {
         if (!(/^\s*$/.test($input.val()))) {
            subTask.name = $input.val();
            $subTaskTitle.html(subTask.name);
            refreshLocalStorage();
            resfreshSubList(task);
         } else {
            $input.addClass('rename-error')
         }
      })
   })
   $subTaskCheck.on('change', () => changeCheck(subTask, $label));

   // hoverTitle(label);
   return $li;
}

//смена флажка
function changeCheck(what, where) {
   what.check = !what.check;
   where.toggleClass('icon-check');
   where.toggleClass('icon-check-empty')
   refreshLocalStorage();
   refreshActiveList();
}

function deleteElement(type, what, where) {
   $undoBlock.addClass('undo-open');
   const $undoBtn = $('<a>');
   $undoBtn.text('Восстановить');
   $undoBtn.attr('href', '#');
   $undoBlock.html('');
   clearTimeout(timerId);
   timerId = setTimeout(() => {
      $undoBlock.removeClass('undo-open');
   }, 4000);
   if (type === 'list') {
      const index = lists.indexOf(what)
      lists.splice(index, 1);
      if (lists.length === 0) {
         lists.push({ name: 'без имени', tasks: [], active: true })
      }
      //обновление списка
      $undoBlock.html('Список удален. ');
      $undoBtn.on('click', e => {
         e.preventDefault();
         undoDeleting(what, lists, index);
      });
   }
   if (type === 'task') {
      const index = activeList.tasks.indexOf(what);
      activeList.tasks.splice(index, 1);
      $undoBlock.html('Задача удалена. ');
      $undoBtn.on('click', e => {
         e.preventDefault();
         undoDeleting(what, activeList.tasks, index);
      });
   }
   if (type === 'subTask') {
      const index = where.subList.indexOf(what);
      where.subList.splice(index, 1);
      resfreshSubList(where);
      $undoBlock.html('Подзадача удалена. ');
      $undoBtn.on('click', e => {
         e.preventDefault();
         undoDeleting(what, where.subList, index);
         resfreshSubList(where);
      });
   }
   $undoBlock.append($undoBtn);
   refreshAllLists();
   refreshActiveList();
}

function undoDeleting(what, where, index) {
   $undoBlock.removeClass('undo-open');
   where.insert(index, what);
   refreshLocalStorage();
   refreshAllLists();
   refreshActiveList();
}

//запрет вызова контекстного меню
window.addEventListener('contextmenu', (e) => e.preventDefault());

Array.prototype.insert = function (index, item) {
   this.splice(index, 0, item);
};

$('body').css('background',`var(--body-bg) url('img/${Math.round(0.5 + Math.random() * 4)}.png')`);