var left = document.getElementById('slider-left');
var right = document.getElementById('slider-right');
var left=0;
function sliderLeft() {
	var polosa = document.getElementById('line');
	left = left - 300;
	if (left<-900) {
		left = 0;
	};
	polosa.style.left = left+'px';
}

function sliderRight () {
	var polosa = document.getElementById('line');
	left = left + 300;
	if (left>0) {
		left = -900;
	};
	polosa.style.left = left+'px';
}
