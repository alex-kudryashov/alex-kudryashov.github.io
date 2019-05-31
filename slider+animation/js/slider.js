var left = document.getElementById('slider-left');
var left=0;
var timer;
autoSlider();
function autoSlider () {
	timer = setTimeout(sliderLeft, 6000);
}

function sliderLeft() {
	var polosa = document.getElementById('line');
	left = left - 300;
	if (left<-900) {
		left = 0;
		clearTimeout(timer);
	};
	polosa.style.left = left+'px';
	autoSlider();
}

function sliderRight () {
	var polosa = document.getElementById('line');
	left = left + 300;
	if (left>0) {
		left = -900;
	};
	polosa.style.left = left+'px';
}
