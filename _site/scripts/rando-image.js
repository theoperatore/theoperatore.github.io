(function() {
	var feature  = document.getElementById('feature-image'),
			imgName  = document.getElementById('img-name'),
			rando    = Math.round(Math.random() * 3),
			imgStr   = '/assets/code.png';

	switch (rando) {

		case 0:
			imgStr = '/assets/code.png';
			imgName.innerHTML = "'code'";
			break;
		case 1:
			imgStr = '/assets/beaker.png';
			imgName.innerHTML = "'Beaker!'";
			break;
		case 2:
			imgStr = '/assets/raspi.png';
			imgName.innerHTML = "'raspberry pi'";
			break;
		case 3:
			imgStr = '/assets/burrowing-owl.png';
			imgName.innerHTML = "'burrowing owl?'";
			break;

	}

	feature.style.backgroundImage = 'url(' + imgStr + ')';

})();
