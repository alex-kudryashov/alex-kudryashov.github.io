let menuBtn = document.querySelector('#menuBtn');
let nav = document.querySelector('nav');

menuBtn.addEventListener('click', ()=> {
    nav.classList.toggle('showMenu');
})