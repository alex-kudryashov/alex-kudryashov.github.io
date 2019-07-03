var leftArrow = document.getElementById('leftArrow');
var rightArrow = document.getElementById('rightArrow');
var block = document.querySelector('.feedback-block');
var dop = -550;

leftArrow.addEventListener('click', function () {
	dop -= -550;
	if (block.style.left < 1100) {
		block.style.left = dop + 'px';
	} else {
		block.style.left = block.style.width - dop + 'px';
	}
})