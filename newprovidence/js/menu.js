var menu = document.getElementById('menu');
var clMenu = document.getElementById('closeMenu');
function slideMenu () {
		menu.style.left = '0' + 'px';
		clMenu.style.display = 'inline';
}

function closeMenu () {
	menu.style.left = '-300' + 'px';
	clMenu.style.display = 'none';
}