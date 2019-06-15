var header = document.getElementById('header');
var size = document.documentElement.clientHeight;
var up = document.getElementById('go-up')
window.onscroll = function() {
	var count = window.pageYoffset || document.documentElement.scrollTop;
	if (count > size) {
		header.className = 'fixnav';
		up.style.display = 'block';
	} else {
		header.className = 'navigation';
		up.style.display = 'none';
	}
}