(function() {
	var feature = document.getElementById('feature-image'),
			rando   = Math.round(Math.random() * 3),
			imgStr  = '/assets/code.png';

	switch (rando) {

		case 0:
			imgStr = '/assets/code.png';
			break;
		case 1:
			imgStr = '/assets/beaker.png';
			break;
		case 2:
			imgStr = '/assets/raspi.png';
			break;
		case 3:
			imgStr = '/assets/burrowing-owl.png';
			break;

	}
	
	feature.style.backgroundImage = 'url(' + imgStr + ')';

})();
