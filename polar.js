(function polar() {
	var canvas        = document.getElementById('demo_polar'),
		ctx           = canvas.getContext('2d'),
		center        = { x : (canvas.width / 2), y : (canvas.height / 2) },
		x             = center.x,
		y             = center.y,
		startAngle    = (3*Math.PI/2),
		anticlockwise = false,
		radiusMillis  = 10,
		radius        = 130,
		radiusMin     = 90,
		radiusHr      = 50,
		millis,
		seconds,
		degsMin,
		degsHr,
		radsMillis,
		currRads,
		radsMin,
		radsHr,
		endAngleMillis,
		endAngle,
		endAngleMin,
		endAngleHr,
		timeNow,
		anim,
		mode          = 0,
		count         = 0,
		start         = true;
		step          = 3,
		stepMin       = 1.50,
		stepHr        = 1,
		stepMillis    = 4,
		secWidth      = 40,
		minWidth      = 40,
		hrWidth       = 40,
		millisWidth   = 40;

	canvas.addEventListener('click', function(ev) {
		//cancelAnimationFrame(anim);
		//asteroids();
		//spirals();

		start = true;
		mode = (mode) ? 0 : 1;

	}, false);

	function update(time) {
		//if clicked, then grow the radii with the animations
		if (mode === 0 && start) {
			radius    += step;
			radiusMin += stepMin;
			radiusHr  += stepHr;
			//radiusMillis += stepMillis;
	
			secWidth -= (step - 1.75);
			minWidth -= stepMin;
			hrWidth  -= stepHr;
			//millisWidth -= (stepMillis - 2.75);
			count++;
		}
		//shrink radii with animations
		else if (mode === 1 && start) {
			radius    -= step;
			radiusMin -= stepMin;
			radiusHr  -= stepHr;
			//radiusMillis -= stepMillis;
	
			secWidth += (step - 1.75);
			minWidth += stepMin;
			hrWidth  += stepHr;
			//millisWidth += (stepMillis - 2.75);
			count ++;
		}
	
		// but only grow/shrink specific amount
		if (count >= 25) {
			count = 0;
			start = false;
	
			//cancelAnimationFrame(anim);
			//asteroids();
		}

		//variables used by all arcs
		timeNow = new Date();

		//milliseconds arc
		millis = 0.36 * (timeNow.getMilliseconds());
		radsMillis = Math.PI * (millis/180);
		endAngleMillis = radsMillis - Math.PI / 2;

		//seconds arc
		seconds = 6 * (timeNow.getSeconds() + (timeNow.getMilliseconds() / 1000));
		currRads = Math.PI*(seconds/180);
		endAngle = currRads - Math.PI/2;

		//minutes arc
		degsMin = 6 * (timeNow.getMinutes() + (timeNow.getSeconds() / 60) + (timeNow.getMilliseconds() / 1000 / 60));
		radsMin = Math.PI*(degsMin/180);
		endAngleMin = radsMin - Math.PI/2;

		//hours arc
		degsHr = 15 * ((timeNow.getHours()) + (timeNow.getMinutes() / 60) + (timeNow.getSeconds() / 60 / 60) + (timeNow.getMilliseconds() / 1000 / 60 / 60));
		radsHr = Math.PI*(degsHr/180);
		endAngleHr = radsHr - Math.PI/2;

		draw();
		anim = requestAnimationFrame(update,canvas);
	}

	function draw() {
		ctx.clearRect(0,0,950,450);
		//ctx.lineCap = "round";
		ctx.font = "20pt";
		ctx.lineWidth = 40;
		//ctx.strokeStyle = '#2CDB00';
	
		ctx.beginPath();
		ctx.strokeStyle = '#333333';
		ctx.lineWidth = millisWidth;
		ctx.arc(x,y,radiusMillis,startAngle,endAngleMillis,anticlockwise);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = '#57FF52';
		ctx.lineWidth = secWidth;
		ctx.arc(x,y,radius,startAngle,endAngle,anticlockwise);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = '#DD4E22';
		ctx.lineWidth = minWidth;
		ctx.arc(x,y,radiusMin,startAngle,endAngleMin,anticlockwise);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = '#FFFF5D';
		ctx.lineWidth = hrWidth;
		ctx.arc(x,y,radiusHr,startAngle,endAngleHr,anticlockwise);
		ctx.stroke();

	
	}

	anim = requestAnimationFrame(update,canvas);
})();