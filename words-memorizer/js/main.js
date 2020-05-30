"use strict";

const
  $checkWordBtn = $('#checkWord'),
  $learnedBtn = $('#learned'),
  $forgotBtn = $('#forgot'),
  $origWord = $('#origWord'),
  $translatedWord = $('#translatedWord'),
  $addWordBtn = $('#addWordBtn'),
  $rusWordInput = $('#rusWordInput'),
  $engWordInput = $('#engWordInput'),
  $category = $('#category'),
  $startBtn = $('#start'),
  $chooseCategory = $('#chooseCategory'),
  $newCategoryTitle = $('#newCategoryTitle'),
  $examples = $('#examples'),
  $wordsSectionWrap = $('#wordsSectionWrap'),
  $wordsSection = $('#wordsSection'),
  $categoriesList = $('#categoriesList'),
  $categories = $('#categories'),
  $closeContextExampleBtn = $('#closeContextExample'),
  $transcriptionInput = $('#transcriptionInput'),
  $chooseCategoryEditing = $('#chooseCategoryEditing'),
  $editingSectionWrap = $('#editingSectionWrap'),
  $editingSection = $('#editingSection'),
  $categoriesEditing = $('#categoriesEditing'),
  $closeEditingWindowBtn = $('#closeEditingWindow'),
  $rusWordEditingInput = $('#rusWordEditingInput'),
  $engWordEditingInput = $('#engWordEditingInput'),
  $newEditingCategoryTitle = $('#newEditingCategoryTitle'),
  $transcriptionEditingInput = $('#transcriptionEditingInput'),
  $addNewEditingCategory = $('#addNewEditingCategory'),
  $addExampleEditingFormBtn = $('#addExampleEditingFormBtn'),
  $saveEditing = $('#saveEditing'),
  $cardOptionsBtn = $('#cardOptionsBtn');


let
  chosenCategories = new Set(),
  wordCounter,
  langNum,
  currentWord,
  examplesCount = 0,
  editing = false,
  editingWord,
  allWords,
  categories,
  currentUser,
  firstLang,
  tempUserData = {};

$('#resetWordFromCard').on('click', () => {
  resetWordProgress(allWords.find(word => word.wordId == currentWord));
  nextWord();
  stopClosingCategoryList();
})

$('#editWordFromCard').on('click', () => {
  openEditingWindow(allWords.find(word => word.wordId == currentWord));
  stopClosingCategoryList();
  nextWord();
})

$('#addExampleFormBtn').on('click', () => {
  addExampleForm.call($('#addExampleFormBtn'));
})

$('#addWordBtn').on('click', () => {
  addWord();
})

$('#deleteWordFromCard').on('click', () => {
  allWords.splice(allWords.indexOf(allWords.find(word => word.wordId == currentWord)), 1);
  nextWord();
  stopClosingCategoryList();
})

$('#addNewCategory').on('click', () => {
  let currentCategory = $chooseCategory.val();
  addNewCategory();
  $chooseCategory.val(currentCategory);
})

$('#transcriptionSymbols').on('click', 'span', function () {
  let input = document.querySelector('#transcriptionInput');
  input.setRangeText(this.textContent, input.selectionStart, input.selectionEnd, "end");
  input.focus();
})

$('#transcriptionEditingSymbols').on('click', 'span', function () {
  let input = document.querySelector('#transcriptionEditingInput');
  input.setRangeText(this.textContent, input.selectionStart, input.selectionEnd, "end");
  input.focus();
})

$('#changeUser').on('click', () => {
  if (JSON.parse(localStorage.getItem('userName'))) {
    localStorage.clear();
  }
  openSignInWindow();
})

$('#cardOpenBtn').on('click', () => {
  $('#card').show(100);
  $('#categoriesBlock').hide(100);
  $('#mainMenuWrap').hide(100);
})

$('#categoriesOpenBtn').on('click', () => {
  $('#card').hide(100);
  $('#categoriesBlock').show(100);
  $('#mainMenuWrap').hide(100);
})

$('#mainMenuOpenBtn').on('click', () => {
  $('#card').hide(100);
  $('#categoriesBlock').hide(100);
  $('#mainMenuWrap').show(100);
  $("[name=firstLang]")[firstLang].checked = true;
})

$('body').on('keydown', key => {
  if (key.keyCode == 27) {
    closeAddingWindow();
    closeEditingWindow();
    closeSignUpWindow();
    closeFaqWindow();
    closeSheduleWindow();
    closeMainMenu();
  }
});

$('#openMainMenu').on('click', () => {
  $('#mainMenuWrap').fadeIn('slow');
  $('#mainMenu').slideDown(100, () => { $('#mainMenu').css({ top: '100px' }) });
  $("[name=firstLang]")[firstLang].checked = true;
})

$('#openAddingWindow').on('click', () => {
  openAddingWindow();
})

$('#openSheduleWindow').on('click', () => {
  openSheduleWindow();
})

$('#closeAddingWindow').on('click', () => {
  closeAddingWindow();
})

$('#closeFaq').on('click', () => {
  closeFaqWindow();
})

$('#closeSignUpWindow').on('click', () => {
  closeSignUpWindow();
})

$('#closeSheduleWindow').on('click', () => {
  closeSheduleWindow();
})

$('#guideBtn').on('click', () => {
  openGuideWindow();
})

$('#goTosignUp').on('click', () => {
  openSignUpWindow();
})

$('#closeMainMenu').on('click', () => {
  closeMainMenu();
})

$("[name=firstLang]").on('click', (e) => {
  firstLang = e.target.value;
  refreshStorage()
})

$('#deleteUser').on('click', () => {
  deleteUser();
})

$('#signIn').on('click', () => {
  signIn();
})

$('#signUp').on('click', () => {
  signUp();
})

$closeEditingWindowBtn.on('click', () => {
  closeEditingWindow();
})

$chooseCategory.on('change', () => {
  chooseCategory.call($chooseCategory);
})

$startBtn.on('click', () => {
  $cardOptionsBtn.show();
  $startBtn.hide();
  $checkWordBtn.show();
  $learnedBtn.show();
  $forgotBtn.show();
  $origWord.slideDown(300);
  $category.slideDown(300);
  nextWord();
})

$checkWordBtn.on('click', () => {
  showTranslationAndExamples();
})

$learnedBtn.on('click', () => {
  const now = new Date();
  allWords.forEach(word => {
    if (word.wordId == currentWord) {
      word.learnedCount++;
      word.forgotInThisSession = false;

      switch (word.learnedCount) {
        case 0:
          word.learned = "true";
          break;
        case 1:
          word.date = now.setMinutes(now.getMinutes() + 15);
          break;
        case 2:
          word.date = now.setHours(now.getHours() + 1)
          break;
        case 3:
          word.date = now.setHours(now.getHours() + 3)
          break;
        case 4:
          word.date = now.setDate(now.getDate() + 1)
          break;
        case 5:
          word.date = now.setDate(now.getDate() + 2)
          break;
        case 6:
          word.date = now.setDate(now.getDate() + 4)
          break;
        case 7:
          word.date = now.setDate(now.getDate() + 7)
          break;
        case 8:
          word.date = now.setDate(now.getDate() + 14)
          break;
        case 9:
          word.date = now.setMonth(now.getMonth() + 1)
          break;
        case 10:
          word.learned = "true";
          break;
      }
      word.date = new Date(word.date)
    }
  })
  nextWord();
})

$forgotBtn.on('click', () => {
  allWords.forEach(word => {
    if (word.wordId == currentWord && word.learnedCount > 1 && !word.forgotInThisSession) {
      word.learnedCount--;
      word.forgotInThisSession = true;
    }
    if (word.wordId == currentWord && word.learnedCount == -1) {
      word.learnedCount = 0;
    }
  })
  nextWord();
})

$categoriesList.on('click', e => {
  let ul;
  if (e.target.classList.contains('openCategory')) {
    ul = e.target.parentNode.querySelector('ul.wordsList');
  } else {
    return
  }
  $('.wordsList').slideUp(500);
  $('.openCategory').removeClass('rotateArrow')
  if (ul.style.display == 'none') {
    $(ul).slideToggle(500);
    ul.parentNode.querySelector('.openCategory').classList.add('rotateArrow')
  }
})

$addExampleEditingFormBtn.on('click', () => {
  addExampleForm.call($addExampleEditingFormBtn);
})

$addNewEditingCategory.on('click', () => {
  let currentCategory = $chooseCategoryEditing.val();
  addNewCategory();
  $chooseCategoryEditing.val(currentCategory);
})

$saveEditing.on('click', () => {
  saveEditing();
})

$chooseCategoryEditing.on('change', () => {
  chooseCategory.call($chooseCategoryEditing);
})

$cardOptionsBtn.on('click', function () {
  openOptionsList($(this).next())
})

function Word() {
  const examples = [];
  const ruExamples = document.querySelectorAll('input[data-added-example-lang="ru"]');
  const engExamples = document.querySelectorAll('input[data-added-example-lang="eng"]');
  ruExamples.forEach((example, index) => {
    if (!isEmptyStr(example.value) && !isEmptyStr(engExamples[index].value)) {
      examples.push({ ru: example.value, eng: engExamples[index].value })
    }
  })
  this.rus = $rusWordInput.val();
  this.eng = $engWordInput.val();
  this.learned = "false";
  this.learnedCount = -1;
  this.date = new Date();
  this.category = Array.from(chosenCategories);
  if (allWords.length == 0) {
    this.wordId = 0;
  } else {
    this.wordId = Number(allWords[allWords.length - 1].wordId) + 1;
  }
  this.forgotInThisSession = false;
  this.examples = examples;
  this.transcription = $transcriptionInput.val();
  return this
}

function fillCategories() {
  $categoriesList.html('');

  for (const category in categories) {
    $categoriesList.append(createCategoryOnPage(category));
  }

  $('.wordsList').each((index, wordsListItem) => {
    if (wordsListItem.innerHTML == '') {
      wordsListItem.innerHTML = '<li class="wordInCategory">В данной категории нет слов!</li>';
    }
  })
  $('.wordsList').hide();
}

function includeCategory(category, checkedBtn) {
  let curCut = categories[category];
  if (curCut === "true") {
    categories[category] = "false";
    checkedBtn.addClass('icon-check-empty');
    checkedBtn.removeClass('icon-check');
    refreshStorage();
    return
  } else {
    categories[category] = "true";
    checkedBtn.removeClass('icon-check-empty');
    checkedBtn.addClass('icon-check');
    refreshStorage();
  }
}

function createCategoryOnPage(globalCategory) {
  const $categoryTemplate = $(document.getElementById('categoryTemplate').cloneNode(true).content);
  const $categoryLi = $categoryTemplate.find('li');
  const $categoryUl = $categoryTemplate.find('ul.wordsList');
  const $checkedBtn = $categoryTemplate.find('.checkedList');
  const $deleteCategoryBtn = $categoryTemplate.find('.deleteCategory');
  const $clearCategoryBtn = $categoryTemplate.find('.clearCategory');
  const $listTitle = $categoryTemplate.find('span');

  if (categories[globalCategory] === "true") {
    $checkedBtn.removeClass('icon-check-empty');
    $checkedBtn.addClass('icon-check');
  }

  $listTitle.html(globalCategory);
  $categoryLi.data('categoryName', globalCategory);

  $deleteCategoryBtn.on('click', () => {
    deleteCategory(globalCategory)
  })

  $listTitle.on('click', () => {
    $listTitle.attr('contentEditable', true);
    $listTitle.focus();
  })

  renameCategory($listTitle, globalCategory);

  $checkedBtn.on('click', () => {
    includeCategory($categoryLi.data('categoryName'), $checkedBtn);
  })

  $clearCategoryBtn.on('click', () => {
    clearCategory(globalCategory);
  })

  allWords.forEach(word => {
    if (word.category.includes(globalCategory)) {
      $categoryUl.append(createWordInCategoryList(word, $categoryLi));
    }
  })
  return $categoryLi
}

function deleteCategory(category) {
  if (confirm('Вы действительно хотите удалить эту категорию?')) {
    if (Object.keys(categories).length > 1) {
      delete categories[category];
      allWords.forEach(word => {
        if (word.category.includes(category)) {
          let categoryIndex = word.category.indexOf(category);
          word.category.splice(categoryIndex, 1);
          if (word.category.length == 0) {
            allWords.splice(allWords.indexOf(word), 1);
          }
        }
      })
      refreshStorage();
      fillCategories();
    } else {
      alert('Вы не можете удалить единственную категорию!')
    }
  }
}

function clearCategory(globalCategory) {
  if (confirm('Вы действительно хотите удалить все слова из этой категории?')) {
    $(allWords).each((index, word) => {
      if (word.category.includes(globalCategory)) {

        word.category.splice(word.category.indexOf(globalCategory), 1);
        refreshStorage();
        stopClosingCategoryList();
      }
      if (word.category.length == 0) {
        allWords.splice(allWords.indexOf(word), 1);
        refreshStorage();
      }
    })
  }
}

function renameCategory(listTitle, globalCategory) {
  listTitle.on('keydown', e => {
    if (e.keyCode == 13) {
      e.preventDefault();
      categories[listTitle.text()] = categories[globalCategory];
      let newCategories = {};
      for (const category in categories) {
        if (category === globalCategory) {
          newCategories[listTitle.text()] = categories[globalCategory];
        } else {
          newCategories[category] = categories[category]
        }
      }

      categories = newCategories;
      if (listTitle.text() != globalCategory) {
        delete categories[globalCategory];
      }
      allWords.forEach(word => {
        if (word.category.includes(globalCategory)) {
          word.category.push(listTitle.text());
          word.category.splice(word.category.indexOf(globalCategory), 1)
        }
      })
      refreshStorage();
      stopClosingCategoryList();
    }
  })
  listTitle.on('blur', () => {
    listTitle.removeAttr('contentEditable');
    listTitle.text(globalCategory);
  })
}

function createWordInCategoryList(word, category) {
  const $wordTemplate = $(document.getElementById('wordTemplate').cloneNode(true).content);
  const $wordLi = $wordTemplate.find('li:first');
  const $deleteFromGlobalBtn = $wordTemplate.find('.deleteFromGlobalBtn');
  const $deleteFromCategoryBtn = $wordTemplate.find('.deleteFromCategoryBtn');
  const $editWordBtn = $wordTemplate.find('.editWordBtn');
  const $text = $wordTemplate.find('.word_in_category_list');
  const $optionsBtn = $wordTemplate.find('.optionsBtn');
  const $options = $wordTemplate.find('ul.options');
  const $resetWordBtn = $wordTemplate.find('.resetWordBtn');

  $text.attr('title', `${word.rus.split(',')[0]} - ${word.eng.split(',')[0]}`);
  $text.html(`${word.rus.split(',')[0]} - ${word.eng.split(',')[0]}`);
  $wordLi.data('wordId', word.wordId);

  $optionsBtn.on('click', () => {
    openOptionsList($options)
  });

  $deleteFromGlobalBtn.on('click', () => {
    deleteWord($wordLi, category);
  })

  $deleteFromCategoryBtn.on('click', () => {
    deleteWordFromCategory($wordLi);
  })

  $editWordBtn.on('click', () => {
    openEditingWindow(word);
  })

  $resetWordBtn.on('click', () => {
    resetWordProgress(word);
  })

  return $wordLi[0]
}

function openOptionsList(options) {
  if (options.css('display') !== 'none') {
    options.fadeOut(200);
  } else {
    $('.options').each((index, list) => {
      if (list.style.display !== 'none') {
        $(list).fadeOut(200);
      }
    });
    options.fadeIn(200);

    $(document).on('click', (event) => {
      if (!event.target.classList.contains('optionsBtn')) {
        $('.options').each((index, list) => {
          if (list.style.display !== 'none')
            $(list).fadeOut(200);
        })
      }
    });
  }
}

function deleteWord(wordLi, category) {
  if (confirm('Вы действительно хотите удалить это слово?')) {
    allWords.forEach(elem => {

      if (elem.wordId == wordLi.data('wordId')) {
        allWords.splice(allWords.indexOf(elem), 1);
        const wordsInCurrentCategory = document.querySelectorAll(`li[data-word-id="${wordLi.data('wordId')}"]`);

        wordsInCurrentCategory.forEach(word => {
          word.remove();
          if (category.find('ul.wordsList li').length === 0) {
            $(category.find('ul.wordsList')).hide();
          }
        })
        refreshStorage();
        stopClosingCategoryList();
      }
    })
  }
}

function deleteWordFromCategory(wordLi) {
  if (confirm(`Вы действительно хотите убрать это слово из категории "${wordLi.parent().parent().data('categoryName')}"?`)) {
    allWords.forEach(word => {
      if (word.wordId == wordLi.data('wordId')) {
        word.category.splice(word.category.indexOf(wordLi.closest('[data-category-name]')), 1);
        wordLi.remove();
        if (category.querySelectorAll('ul.wordsList li').length === 0) {
          $(category.querySelector('ul.wordsList')).hide()
        }
        refreshStorage();
        stopClosingCategoryList();
      }
    })
  }
}

function stopClosingCategoryList() {
  let listIndex;
  $('.wordsList').each((index, wordsListItem) => {
    if (wordsListItem.style.cssText == '') {
      listIndex = index;
    }
  })
  fillCategories();
  if (listIndex >= 0) {
    $('.wordsList')[listIndex].parentNode.querySelector('.openCategory').classList.add('rotateArrow');
    $($('.wordsList')[listIndex]).show();
  }
}

function nextWord() {
  refreshStorage();
  $translatedWord.hide();
  $origWord.hide();
  $examples.hide();
  const now = new Date();
  const availableWords = [];

  allWords.forEach(el => {
    const catsInWord = new Set();
    for (const cat in categories) {
      const catPos = el.category.indexOf(cat);

      if (categories[el.category[catPos]] === "true") {
        catsInWord.add(categories[cat]);
      }
    }

    if (catsInWord.size > 0 && el.learned === "false" && !(new Date(el.date) > now)) {
      availableWords.push(el);
    }
  })



  if (availableWords.length == 0) {
    $origWord.html('На данный момент все слова из <u>выбранных</u> категорий изучены!').slideDown(300);
    $checkWordBtn.hide();
    $learnedBtn.hide();
    $forgotBtn.hide();
    $category.hide();
    $cardOptionsBtn.hide();
    $startBtn.html('Начать').slideDown(300);
    return
  }

  wordCounter = getRandomInteger(0, availableWords.length - 1);

  currentWord = availableWords[wordCounter].wordId;
  if (availableWords[wordCounter].learnedCount == '-1') {
    $learnedBtn.html('Знаю');
    $forgotBtn.html('Изучить');
  } else {
    $learnedBtn.html('Запомнил');
    $forgotBtn.html('Забыл');
  }

  if (firstLang == 2) {
    langNum = getRandomInteger(0, 1);
  } else {
    langNum = firstLang;
  }


  $checkWordBtn.show()
  if (langNum == 0) {
    $origWord.html(availableWords[wordCounter].rus)
  } else {
    $origWord.html(`${availableWords[wordCounter].eng}<span class="transcription">${availableWords[wordCounter].transcription || ''}</span>`)
  }

  $origWord.slideDown(300);
  if (availableWords[wordCounter].learnedCount == -1) {
    $category.html(`${availableWords[wordCounter].category.join(', ')}  <span title="Новое слово">(New)</span>`);
  } else {
    $category.html(`${availableWords[wordCounter].category.join(', ')}  <span title="Запомнено ${availableWords[wordCounter].learnedCount} раз">(${availableWords[wordCounter].learnedCount})</span>`);
  }
  $examples.html('');
  availableWords[wordCounter].examples.forEach(example => {
    const translatedExample = $(`<p class="ruExample">${example.ru}</p>`);
    const exampleInEng = $(`<p class="engExample">${example.eng}</p>`);
    $examples.append(exampleInEng);
    $examples.append(translatedExample);
    translatedExample.hide();
    exampleInEng.on('click', () => {
      exampleInEng.toggleClass('rotateArrow');
      translatedExample.slideToggle('fast');
    })
  })
}

function getRandomInteger(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function fillSelect() {
  if (editing) {
    $chooseCategoryEditing.html('');
  } else {
    $chooseCategory.html('');
  }
  for (const category in categories) {
    const option = new Option(category, category);
    if (editing) {
      $chooseCategoryEditing.append(option);
    } else {
      $chooseCategory.append(option);
    }
  }
  addOptionToSelect();
}

function addOptionToSelect() {
  if (editing) {
    $categoriesEditing.html('')
  } else {
    $categories.html('');
  }
  if (chosenCategories.size === 0) {
    chosenCategories.add(getFirstCategory());
  }

  chosenCategories.forEach(category => {
    const categoryTitle = document.createElement('span');
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('icon-cancel-circled2');
    closeBtn.setAttribute('title', 'Убрать из списка категорий')

    closeBtn.addEventListener('click', () => {
      chosenCategories.delete(category);
      addOptionToSelect();
    })

    categoryTitle.innerHTML = category;
    categoryTitle.append(closeBtn);
    if (editing) {
      $categoriesEditing.append(categoryTitle);
    } else {
      $categories.append(categoryTitle)
    }
  })
}

function getFirstCategory() {
  for (var category in categories) {
    return category;
  }
};

function isEmptyStr(str) {
  return (/^\s*$/.test(str))
}

function addExampleForm() {
  const $contextFormTemplate = $(document.getElementById('contextFormTemplate').cloneNode(true).content);
  if (examplesCount < 4) {
    if (!checkExamplesEmptyness('ru') && !checkExamplesEmptyness('eng')) {
      examplesCount++;
      let $newExample = $($contextFormTemplate.find('.contextsEditingWrap'));
      // удаление формы для примера в контексте
      $newExample.children('button').on('click', () => {
        $newExample.slideUp(200, () => $newExample.remove());
        --examplesCount;
      })
      this.before($newExample);  //вставка перед кнопкой
      $newExample.hide().slideDown(200);
    }
  }
}

function checkExamplesEmptyness(lang) {
  let emptyValue = false;
  document.querySelectorAll(`input[data-added-example-lang="${lang}"]`).forEach((input, index) => {
    if (isEmptyStr(input.value)) {
      emptyValue = true;
    }
  });
  return emptyValue
}

function addNewCategory() {
  let input = $newCategoryTitle;
  if (editing) {
    input = $newEditingCategoryTitle;
  }
  if (!isEmptyStr(input.val())) {
    if (!(input.val() in categories)) {
      categories[input.val()] = false;
      refreshStorage();
      fillSelect();
      stopClosingCategoryList();
      $newCategoryTitle.val('');
    } else {
      alert('Такая категория уже существует. Выберите ее из списка.')
    }
  }
}

function openSheduleWindow() {
  $('#tableWrap').fadeIn('slow');
  if (screen.width > 899) {
    $('#tableWrap table').slideDown(100, () => { $('#tableWrap table').css({ top: '100px' }) });
    closeMainMenu();
  } else {
    $('#tableWrap table').slideDown(100, () => { $('#tableWrap table').css({ top: '0px' }) });
    $('#mainMenuWrap').hide(100);
  }
}

function openEditingWindow(word) {
  editingWord = word.wordId;
  editing = true;
  chosenCategories.clear();
  word.category.forEach(category => {
    chosenCategories.add(category);
  });
  addOptionToSelect();
  $chooseCategoryEditing.val(chosenCategories[0]);
  $editingSectionWrap.fadeIn('slow');
  if (screen.width > 899) {
    $editingSection.slideDown(100, () => { $editingSection.css({ top: '100px' }) });
  } else {
    $editingSection.slideDown(100, () => { $editingSection.css({ top: '0px' }) });
  }
  fillSelect();
  $rusWordEditingInput.val(word.rus);
  $engWordEditingInput.val(word.eng);
  $transcriptionEditingInput.val(word.transcription);


  examplesCount = word.examples.length;
  const $contextFormTemplate = $(document.getElementById('contextFormTemplate').cloneNode(true).content);
  word.examples.forEach(example => {
    const newExample = $contextFormTemplate.find('.contextsEditingWrap').clone();
    newExample[0].querySelector('input[data-added-example-lang="ru"]').value = example.ru;
    newExample[0].querySelector('input[data-added-example-lang="eng"]').value = example.eng;
    newExample.children('button').on('click', () => {
      newExample.slideUp(200, () => newExample.remove());
      refreshStorage();
      --examplesCount;
    })
    $addExampleEditingFormBtn.before(newExample);
    newExample.hide().slideDown(200);
  })
  $chooseCategoryEditing.val(word.category[0]);
}

function openGuideWindow() {
  $('#faqWrap').fadeIn('slow');
  if (screen.width > 899) {
    $('#faq').slideDown(100, () => { $('#faq').css({ top: '100px' }) });
    closeMainMenu();
  } else {
    $('#faq').slideDown(100, () => { $('#faq').css({ top: '0px' }) });
    $('#mainMenuWrap').hide(100);
  }
}

function openAddingWindow() {
  chosenCategories.clear();
  addOptionToSelect();
  $chooseCategory.val(chosenCategories[0]);
  $wordsSectionWrap.fadeIn('slow');
  if (screen.width > 899) {
    $wordsSection.slideDown(100, () => { $wordsSection.css({ top: '100px' }) });
  } else {
    $wordsSection.slideDown(100, () => { $wordsSection.css({ top: '0px' }) });
  }
  fillSelect();
}

function openSignInWindow() {
  $('#signInFormWrap').fadeIn('slow');
  if (screen.width > 899) {
    $('#signInForm').slideDown(100, () => { $('#signInForm').css({ top: '100px' }) });
    closeMainMenu();
  } else {
    $('#signInForm').slideDown(100, () => { $('#signInForm').css({ top: '0px' }) });
    $('#mainMenuWrap').hide(100);
  }
}

function openSignUpWindow() {
  $('#signUpFormWrap').fadeIn('slow');
  if (screen.width > 899) {
    $('#signUpForm').slideDown(100, () => { $('#signUpForm').css({ top: '100px' }) });
  } else {
    $('#signUpForm').slideDown(100, () => { $('#signUpForm').css({ top: '0px' }) });
  }
}

function closeEditingWindow() {
  editing = false;
  $editingSection.css({ top: '-200px' }).slideUp(100);
  $editingSectionWrap.fadeOut('slow');

  $rusWordEditingInput.val('');
  $engWordEditingInput.val('');
  $newEditingCategoryTitle.val('');
  $transcriptionEditingInput.val('');
  document.querySelectorAll('.contextsEditingWrap').forEach(element => {
    element.remove();
    examplesCount = 0;
  });
}

function closeSheduleWindow() {
  $('#tableWrap table').css({ top: '-200px' }).slideUp(100);
  $('#tableWrap').fadeOut('slow');
  if (screen.width < 900) {
    $('#mainMenuWrap').show(100);
  }
}

function closeFaqWindow() {
  $('#faq').css({ top: '-200px' }).slideUp(100);
  $('#faqWrap').fadeOut('slow');
  if (screen.width < 900) {
    $('#mainMenuWrap').show(100);
  }
}

function closeAddingWindow() {
  $wordsSection.css({ top: '-200px' }).slideUp(100);
  $wordsSectionWrap.fadeOut('slow');
  document.querySelectorAll('.contextsEditingWrap').forEach(element => {
    element.remove();
    examplesCount = 0;
  });
  $rusWordInput.val('');
  $engWordInput.val('');
  $newCategoryTitle.val('');
  $transcriptionInput.val('');
}

function closeSignInWindow() {
  if (tempUserData.name || JSON.parse(localStorage.getItem('userName'))) {
    $('#signInForm').css({ top: '-200px' }).slideUp(100);
    $('#signInFormWrap').fadeOut('slow');
    if (screen.width < 900) {
      $('#mainMenuWrap').show(100);
    }
  } else {
    alert('Войдите или зарегистрируйтесь!');
  }
}

function closeSignUpWindow() {
  $('#signUpForm').css({ top: '-200px' }).slideUp(100);
  $('#signUpFormWrap').fadeOut('slow');
  if (screen.width < 900) {
    $('#mainMenuWrap').hide(100);
  } else {
    closeMainMenu();
  }
}

function closeMainMenu() {
  $('#mainMenu').css({ top: '-200px' }).slideUp(100);
  $('#mainMenuWrap').fadeOut('slow');
}



function chooseCategory() {
  if (chosenCategories.size < 5) {
    chosenCategories.add(this[0].options[this[0].options.selectedIndex].value);
    addOptionToSelect();
  } else {
    alert('Вы не можете добавить больше 5-ти категорий!')
  }
}

function addWord() {
  if (chosenCategories.size == 0) {
    addOptionToSelect();
  }
  if (!isEmptyStr($rusWordInput.val()) && !isEmptyStr($engWordInput.val())) {
    allWords.push(new Word());
    $rusWordInput.val('');
    $engWordInput.val('');
    $transcriptionInput.val('');
    document.querySelectorAll('input[data-added-example-lang="ru"]').forEach(input => {
      input.value = '';
      input.parentNode.parentNode.querySelector('.closeContextEditingExample').click();
    })
    document.querySelectorAll('input[data-added-example-lang="eng"]').forEach(input => {
      input.value = '';
    })
    refreshStorage();
    stopClosingCategoryList();
    $rusWordInput.focus();
  }
}

function showTranslationAndExamples() {
  allWords.forEach(word => {
    if (word.wordId == currentWord) {

      if (langNum == 1) {
        $translatedWord.html(word.rus)
      } else {
        $translatedWord.html(`${word.eng}<span class="transcription">${word.transcription || ''}</span>`)
      }

      $translatedWord.slideDown(300);
      $examples.slideDown(300);
      $checkWordBtn.hide();
      return
    }
  })
}

function saveEditing() {
  allWords.forEach(word => {
    if (word.wordId == editingWord) {
      let examples;
      examples = [];
      const ruExamples = document.querySelectorAll('input[data-added-example-lang="ru"]');
      const engExamples = document.querySelectorAll('input[data-added-example-lang="eng"]');
      ruExamples.forEach((example, index) => {
        if (!isEmptyStr(example.value) && !isEmptyStr(engExamples[index].value)) {
          examples.push({ ru: example.value, eng: engExamples[index].value })
        }
      })
      word.rus = $rusWordEditingInput.val();
      word.eng = $engWordEditingInput.val();
      word.category = Array.from(chosenCategories);
      word.transcription = $transcriptionEditingInput.val();
      word.examples = examples;
      refreshStorage();
      stopClosingCategoryList();
      closeEditingWindow();
      nextWord();
      return
    }
  })
}

function resetWordProgress(word) {
  word.learned = false;
  word.learnedCount = -1;
  word.date = new Date();
  word.forgotInThisSession = false;
}






function refreshStorage() {
  $.ajax({
    type: "PUT",
    // url: `https://dry-thicket-77260.herokuapp.com/users/${currentUser._id}`,
    url: `http://localhost:3000/users/${currentUser._id}`,
    data: {
      "words": allWords,
      "categories": categories,
      "name": currentUser.name,
      "password": currentUser.password,
      "firstLanguage": firstLang
    },
    success: function (resp) {
      let user = JSON.parse(localStorage.getItem('userName'));
      let password = JSON.parse(localStorage.getItem('userPass'));
      if (!user) {
        user = tempUserData.name;
        password = tempUserData.password;
      }

      $.ajax({
        type: "GET",
        // url: `https://dry-thicket-77260.herokuapp.com/users/${user}/${password}`,
        url: `http://localhost:3000/users/${user}/${password}`,
        success: function (response) {
          currentUser = response.data;
          allWords = response.data.words;
          categories = response.data.categories;
          firstLang = response.data.settings.firstLanguage;
          stopClosingCategoryList();
        }
      })
    }
  })
}

function checkStorage() {
  let user = JSON.parse(localStorage.getItem('userName'));
  let password = JSON.parse(localStorage.getItem('userPass'));
  if (user) {
    $('#loadingWindowWrap').show();
    $.ajax({
      type: "GET",
      // url: `https://dry-thicket-77260.herokuapp.com/users/${user}/${password}`,
      url: `http://localhost:3000/users/${user}/${password}`,
      success: function (response) {
        if (response.correctLogin) {
          currentUser = response.data;
          allWords = response.data.words;
          categories = response.data.categories;
          firstLang = response.data.settings.firstLanguage;
          fillCategories();

          if (screen.width > 899) {
            $('#openMainMenuWrap').show();
          }
        } else {
          localStorage.clear();
          checkStorage();
        }
        $('#loadingWindowWrap').hide();
      }
    })
  } else {
    openSignInWindow();
  }
}

function addUserToDB() {
  $.ajax({
    // url: `https://dry-thicket-77260.herokuapp.com/users/`,
    url: `http://localhost:3000/users/`,
    type: "POST",
    data: {
      name: $('#loginUpInput').val(),
      password: $('#passwordUpInput').val()
    },
    success: function (response) {
      $.ajax({
        type: "GET",
        // url: `https://dry-thicket-77260.herokuapp.com/users/${$('#loginUpInput').val()}/${$('#passwordUpInput').val()}`,
        url: `http://localhost:3000/users/${$('#loginUpInput').val()}/${$('#passwordUpInput').val()}`,
        success: function (response) {
          currentUser = response.data;
          allWords = response.data.words;
          categories = response.data.categories;
          firstLang = response.data.settings.firstLanguage;
          if ($('#rememberMeUp').prop('checked')) {
            localStorage.setItem('userName', JSON.stringify($('#loginUpInput').val()));
            localStorage.setItem('userPass', JSON.stringify($('#passwordUpInput').val()));
          } else {
            tempUserData.name = response.data.name;
            tempUserData.password = response.data.password;
          }
          closeSignInWindow();
          closeSignUpWindow();
          if (screen.width > 899) {
            $('#openMainMenuWrap').show();
          }
          fillCategories();
          $('#loadingWindowWrap').hide();
          openGuideWindow();
        }
      })
    }
  });
}

function deleteUser() {
  if (confirm('Вы уверены что хотите удалить аккаунт?')) {
    $('#loadingWindowWrap').show();
    $.ajax({
      type: "DELETE",
      // url: `https://dry-thicket-77260.herokuapp.com/users/${currentUser._id}`,
      url: `http://localhost:3000/users/${currentUser._id}`,
      success: function (response) {
        if (JSON.parse(localStorage.getItem('userName'))) {
          localStorage.clear();
        }
        $('#loadingWindowWrap').hide();
        openSignInWindow();
      }
    })
  }
}

function signIn() {
  $('#loadingWindowWrap').show();
  $.ajax({
    type: "GET",
    // url: `https://dry-thicket-77260.herokuapp.com/users/${$('#loginInInput').val()}/${$('#passwordInInput').val()}`,
    url: `http://localhost:3000/users/${$('#loginInInput').val()}/${$('#passwordInInput').val()}`,
    success: function (response) {
      if (response.correctLogin) {
        if (response.correctPassword) {
          currentUser = response.data;
          allWords = response.data.words;
          categories = response.data.categories;
          firstLang = response.data.settings.firstLanguage;
          fillCategories();
          if ($('#rememberMeIn').prop('checked')) {
            localStorage.setItem('userName', JSON.stringify(response.data.name));
            localStorage.setItem('userPass', JSON.stringify(response.data.password));
          } else {
            tempUserData.name = response.data.name;
            tempUserData.password = response.data.password;
          }
          closeSignInWindow();
          if (screen.width > 899) {
            $('#openMainMenuWrap').show();
          }
        } else {
          alert('Пароль не верный!');
        }
      } else {
        alert('Пользователя с таким логином не существует!')
      }
      $('#loadingWindowWrap').hide();
    }
  })
}

function signUp() {
  $('#loadingWindowWrap').show();
  $.ajax({
    type: "GET",
    // url: `https://dry-thicket-77260.herokuapp.com/users/${$('#loginUpInput').val()}/${$('#passwordUpInput').val()}`,
    url: `http://localhost:3000/users/${$('#loginUpInput').val()}/${$('#passwordUpInput').val()}`,
    success: function (response) {
      if (response.correctLogin) {
        $('#loadingWindowWrap').hide();
        alert(`Пользователь с логином ${$('#loginUpInput').val()} уже существует, придумайте другой логин.`);
      } else {
        if ($('#passwordUpInput').val().length > 4) {
          addUserToDB();
        } else {
          $('#loadingWindowWrap').hide();
          alert('Пароль слишком короткий!');
        }
      }
    }
  })
}






checkStorage();







// Список фич:

// сброс прогресса по всей категории
// добавить окно со статистикой
// поиск по словам - при вводе слова - выводятся подходящий варианты, которые можно редачить, удалять и сбрасывать прогресс
// процент изученных слов в каждой категории
// выбор первого показываемого языка
// функцию высчитывающую желаемое количество новых слов в день
// удалять слова если нет категорий