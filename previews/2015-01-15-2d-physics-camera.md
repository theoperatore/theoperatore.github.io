---
layout: page
title: 2D Physics Camera and Screen Shake
comments: true
tags: javascript, game
---

I watched [this video](https://www.youtube.com/watch?v=AJdEqssNZ-U) (a talk by Jan Willem Nijman from Vlambeer; 30 tiny tricks that will make your action game better) and got really excited about screen shake (too excited probably). It makes everything feel like it has weight and makes you, the player, feel really awesome. Here follows my take on making a camera for a Javascript game using the `<canvas>` and implementing screen shake. GO!

There seem to be two ways to do screen shake:

- Shake every object on the screen
- Shake the camera

I'm going to focus on the latter, and therefore need to make a camera. But not just any camera&mdash;a physics based camera. One with acceleration and velocity and everything.

Let's get a few things straight first.

### World space vs Camera space

The camera is the window into the world of the game; it defines what the player can and cannot see. By this idea there exists two spaces within the game: world space and camera space.

*World space* is the world in which all of the objects in a game reside; the player's character, environment, enemies, and any other entities. It is the global coordinate space. Anything that will ever exist in the game will have a starting position based on this coordinate system.

![world space]({{site.baseurl}}/assets/camera/world-space.png)
<span class="img-description">Figure 1&mdash;The world space with player and entities. Notice that the world space origin is the top left corner of the space.</span>

*Camera space* is the bounding area that is viewable at any point in time. Only objects that are within the bounds of the camera space will be visible to the player and drawn on the screen.

![world space showing camera space]({{site.baseurl}}/assets/camera/world-space-showing-camera.png)
<span class="img-description">Figure 2&mdash;Camera space has it's own coordinate axes (also starting at the top left of the space). Only entities within the bounds of the camera are seen by the player. The camera space is the same as the canvas.</span>

Since this is an article about using the `<canvas>`, the camera is equivalent to the canvas. When drawing, the canvas context assumes camera space. No matter where the camera object is positioned, if the canvas context is called to draw something at (0,0) the object will be at the top left of the screen (because that's where the origin is for computer graphics).

{% highlight javascript %}
// if your camera is defined like this...
var camera = {
  
  // a bunch of properties
  ...

  // position of camera at (400, 400)
  pos : {x : 400, y : 400},

  // get canvas drawing context
  cvs : document.getElementById('canvas'),
  ctx : this.cvs.getContext('2d'),
  width : cvs.width,  // 300 px
  height : cvs.height // 300 px

}

// sample entity with world space coordinates of (10, 10)
var entity1 = {
  pos : { x : 10, y : 10 },
  width : 5,
  height : 5
}

// sample entity with world space coordinates of (530, 530)
var entity2 = {
  pos : { x : 530, y : 530 },
  width : 5,
  height : 5 
}

// drawing assumes camera space; this will draw the entity at (10, 10)
// on the canvas.
// This entity should not be visible because the entity is at (10, 10)
// and the camera is at (400, 400) in world space, yet when this
// function is run, the entity is visible.
// WRONG
camera.ctx.fillRect(entity1.pos.x, entity1.pos.y, entity1.width, entity1.height);

// this entity won't be visible on the screen because it's x and y coordinates (530, 530) 
// are out of the bounds of the camera (the camera is only 300 px wide and 300px high).
// However, in the context of the game, this entity should be seen because in world
// space, entity2 is within the bounds of the camera, but the canvas context assumes 
// camera space, so the entity is drawn outside of the bounds of the canvas.
// WRONG
camera.ctx.fillRect(entity2.pos.x, entity2.pos.y, entity2.width, entity2.height);
{% endhighlight %}

On each rendering pass, the game **must** correct entity positions to be relative to the camera's current position otherwise your entities won't be drawn correctly. Before diving into correcting for camera space, let's first define some camera propeties to get rolling with some basic physics.

### Properties of a physics based camera

A camera is just an object of the world space itself; it has a position in world space. Add in some velocity and acceleration, and this camera becomes a physics camera!

The camera is defined (in Javascript) as such:

{% highlight javascript linenos %}
var camera = {

  // position vectors (acceleration spelled wrong so it all fits!)
  cpos : { x : 0, y : 0 },
  ppos : { x : 0, y : 0 },
  acel : { x : 0, y : 0 },

  // dimensions of the camera; how much of the world is visible?
  // set these to the height and width of the canvas
  height : document.body.clientHeight,
  width  : document.body.clientWidth,

  // cutoff point for drawing
  cullDist : 300

  // should the camera be flush against the walls of the world?
  bound : true,
  maxHeight : 6 * document.body.clientHeight,
  maxWidth  : 6 * document.body.clientWidth

}
{% endhighlight %}

This gives the camera object:

- `cpos`, `ppos`, `acel` positioning vectors
- `height`, `width` dimensions for viewing the world space
- `cullDist` a distance in pixels from the extremes of the bounds of the camera to start drawing objects (explained down below) 
- `bound` a boolean to determine if the camera will stop scrolling when at the edge of the world
- `maxHeight`, `maxWidth` the maximum dimensions that the camera is allowed to view

Time to figure out what to draw!

### Drawing all the things

To draw anything, first figure out if the object to draw is within the bounds of the camera. This means calculating the object's position relative to the current position of the camera. It sounds really hard. Don't worry. It isn't.

Subtract the camera's position from the object's position. This gives the object's current position relative to the camera.

![subtracting vectors]({{site.baseurl}}/assets/camera/entity-to-camera-space.png)
<span class="img-description">Figure 3&mdash;from world origin (0,0) at top-left corner, subtract the camera's position vector (c) from the object's position vector (p) to find the object's position vector relative to the camera's position (d)</span>

and the code:

{% highlight javascript linenos %}
// vector to hold object cpos in camera space ('d' in figure 3)
var diff = { x : 0, y : 0 };

// convert object's cpos from world space coordinates to camera space coordinates
// obj and camera as 'p' and 'c' in figure 3 respectively
diff.x = obj.cpos.x - camera.cpos.x;
diff.y = obj.cpos.y - camera.cpos.y;

{% endhighlight %}

`diff` now holds the object's position relative to the camera position; as if the camera's position is the origin at (0,0).

The canvas drawing context needs the object's position relative to the camera in order to draw it correctly. As stated previously, the canvas drawing context *always* assumes camera space. If `diff` lies within the bounds of the canvas, then when the object is drawn using the canvas context at position `diff.x` and `diff.y`, the object will be displayed to the user.

*Example*

If `obj` has current position `(3,5)` in world space and the camera has position `(1,2)` in world space, then `obj` position relative to the camera is:

{% highlight javascript %}

// vectors from figure 3
d = p - c;

// substituting obj's position and camera's position
d = (3,5) - (1,2);

// solving (3 - 1) for x-coord, and (5 - 2) for y-coord
d = (2,3);

{% endhighlight %}

In camera space, `obj` has a position vector `(2,3)` meaning that if you start at the camera's position and add 2 to the camera's x-coordinate and 3 to the camera's y-coordinate you'll arrive at the object's position.

Congratulations! You just performed a coordinate transformation, specifically a coordinate origin translation. Essentially, the world space origin has moved (translated) to be the camera's current position. The camera's current position is now the origin for `diff`.

This is excatly what needs to happen because the canvas context will always assume that (0,0) is the top left of the canvas, and since the canvas is our camera, we have shifted the world space origin to be the the camera's current position which is the top left of the canvas.


<span class="img-description">img showing world space origin moved to camera space?</span>


Now that there is a way to translate any entity's current world space position to camera space, it can be drawn! But first there must be a check to see if the object is actually viewable by checking to see if it's within the bounds of the camera.

Since the object's position is now in camera space, the camera bounding box starts at position `(0,0)` and has extremes `(width, height)`. This makes bounds checking easy:

{% highlight javascript %}
// assume 'diff' calculated from above and that it
// holds the position of the entity in camera space
var diff;

// check camera bounds
if ( (diff.x >= 0 && diff.x <= camera.width) &&
     (diff.y >= 0 && diff.y <= camera.height) ) 
{

  // the object is on screen
  // draw it to the canvas using the camera space coordinates
  // because the canvas always assumes camera space
  ...

}

{% endhighlight %}

*Neat. Stuff can be drawn!*

But if you test this out you might notice that some large objects tend to "pop-in" or "pop-out" when they leave the screen. That's becasue the camera is culling too early; the camera should start drawing while entities are off-screen in order to have them smoothly enter or exit the player's view. This is where `cullDist` comes into play.

![adding cullDist to the camera]({{site.baseurl}}/assets/camera/cull-dist.png)
<span class="img-description">Figure 4&mdash;if an entity lies within the bounds of the camera plus the culling field, draw it</span>

Just update the camera bounds check to use `cullDist` and everything is good to go:

{% highlight javascript %}
// assume we have 'diff' calculated from above and that it
// holds the position of the entity in camera space
var diff;

// calculate the new bounds to test
var lower = -camera.cullDist;
var upperX = camera.width + camera.cullDist;
var upperY = camera.height + camera.cullDist;

// check camera bounds with cullDist
if ( (diff.x >= lower && diff.x <= upperX) &&
     (diff.y >= lower && diff.y <= upperY) ) 
{

  // the entity is within the culling field / camera bounds
  // draw it using the camera space coordinates
  ...

}

{% endhighlight %}

Yay! No more popping entities! Almost to the goal of screen shake. Next is making the camera follow an entity and with that a note on integration.


### On integration

This article uses a type of numerical integration called [Verlet Integration](http://en.wikipedia.org/wiki/Verlet_integration). 

Basically, the integrator takes an object's current position, previous position, and acceleration (as vectors) and outputs that object's next position. It doesn't accept velocity as an input explicitly because it derives that value *implicitly* from current position and previous position. At any point in time, the object's next position can be calculated as:

$$
\begin{align*}
  & \vec{x_{next}} = 2(\vec{x_{curr}}) - \vec{x_{prev}} + \vec{a}(dt^2) \\
\end{align*}
$$

All that's left is to set the object's previous position to it's current postion, and it's current position to it's next position:

$$
\begin{align*}
  & \vec{x_{prev}} = \vec{x_{curr}} \\
  & \vec{x_{curr}} = \vec{x_{next}} \\
\end{align*}
$$

Or in javascript (because that seems to be way less confusing...)
{% highlight javascript %}
// these are all vector objects with properties 'x' and 'y'
// calculate the new pos vector from curr, prev, accel and time step dt
next = (2 * curr) - prev + (accel * dt * dt);

// set the prev vector for the next update next frame
prev = curr;

// set the curr vector to the calculated position for drawing this frame
curr = next;
{% endhighlight %}

This is similar to [Euler Integration](http://en.wikipedia.org/wiki/Euler_method), but verlet integration doesn't require velocities explicitly and is dependant on a fixed timestep `dt`. Other techniques are discussed [here](http://gafferongames.com/game-physics/integration-basics/) and should definitely be checked out.

You can use whichever method you prefer, but I just wanted to explain why my objects have `cpos` (current position vector) and `ppos` (previous position vector) properties&mdash;they're needed for verlet integration.

### Follow that player!

I've defined above the basis behind implementing a camera and drawing entities that are within the bounds of that camera. If the camera were to move to a different position, the game would show that movement by drawing entities that are withing it's view frustrum.

But how does the camera move? I could give direct control of the camera to the player (many games do this with the right analog stick on a console or mouse on PC), but let's have the camera follow the player so that when the player moves, the camera moves too.

While I could update the position of the camera with a point based off of the player's current position, it would be better (and more physics-y) if I could just tell the camera where it should be, and have it interpolate the distance over many frames. This will allow the camera to smoothly scroll and not jerk to the target location.

Update the camera object!

{% highlight javascript linenos %}
// updated camera object for target position
var camera = {
  
  // other properties from above definition
  ...

  // target point the camera should be at to follow the player
  target : { x : 0, y : 0 }

}
{% endhighlight %}

Now to move the camera, set `camera.target` to the desired position and slowly inch the camera's current position towards the target. I'll update the camera's target when the player's current position gets updated.

{% highlight javascript linenos %}
// your game loop update function
function update() {
  
  // handle input
  ...

  // update camera target position
  camera.target.x = player.cpos.x - (camera.width / 2);
  camera.target.y = player.cpos.y - (camera.height / 2);

  // update camera acceleration
  ...

  // update camera position
  ...

  // update entity positions / collisions
  ...

  // update player positions / collisions
  ...


}
{% endhighlight %}

This will set the target position of the camera to be to the left and up from the player. From the user's standpoint, as the player moves around, the player will appear to stay in the center of the screen. 

*Note that I intentionally set the camera target position to be based off of the current position of the player **before** updating the player's position for the current frame. This gives a cool effect of the player running really fast and the camera trying to catch up.*

To make the player appear locked in a different location, just manipulate the camera's target position:

{% highlight javascript linenos %}
// player appears to stay on the left third of the screen
camera.target.x = player.cpos.x - (camera.width / 3);
camera.target.y = player.cpos.y - (camera.width / 2);

// player appears to stay on the right third of the screen
camera.target.x = player.cpos.x - (2 * camera.width / 3);
camera.target.y = player.cpos.y - (camera.width / 2);

{% endhighlight %}

Cool. All that's left is to implement the smooth panning from the camera's current position to the camera's target position. Since this camera is physics based, I'm going to apply a force to the camera in the direction of the target point.

{% highlight javascript %}
// calculate force in the direction of the target
accel = accel + (target - curr) * step
{% endhighlight %}

Where `accel` is the current acceleration vector, `curr` is the current position vector, `target - curr` is relative direction vector between the target and the current position, and `step` is how much of the relative direction vector to add to the current vector.

Instead of setting the camera's current position to the target position all at once, this function gives the camera a little nudge in the correct direction. It just so happens that using a velocity-like force (`target - curr`) controlled by the `step` variable works really well.

{% highlight javascript linenos %}
// the game loop update function
function update() {
  
  // handle input
  ...

  // update camera target position
  camera.target.x = player.cpos.x - (camera.width / 2);
  camera.target.y = player.cpos.y - (camera.height / 2);

  // update camera acceleration -- step is usually great at 0.125
  camera.acel.x += (camera.target.x - camera.cpos.x) * step;
  camera.acel.y += (camera.target.y - camera.cpos.y) * step;

  // update camera position
  ...

  // update entity positions / collisions
  ...

  // update player positions / collisions
  ...

}
{% endhighlight %}

Excellent! Now wherever the player goes, the camera will follow. It is worth mentioning that the camera will follow wherever its `target` propery points. `target` could be calculated from the player, an enemy, a scripted scene, a mathematical soup of inputs, etc...go with what you feel.

It's also worth mentioning that the `step` value should be tweaked (most likely through trial and error) to find the best "feel" for the camera panning to it's proper location.

### Integrating a camera position

To make this whole thing work correctly, just update the camera's position just like any other entity. As mentioned above I use verlet integration. Inserting the update code into the update function would look something like this:

{% highlight javascript linenos %}
// the game loop update function
function update() {
  
  // handle input
  ...

  // update camera target position
  camera.target.x = player.cpos.x - (camera.width / 2);
  camera.target.y = player.cpos.y - (camera.height / 2);

  // update camera acceleration -- step is usually great at 0.125
  camera.acel.x += (camera.target.x - camera.cpos.x) * step;
  camera.acel.y += (camera.target.y - camera.cpos.y) * step;

  // apply some drag
  camera.ppos.x = camera.cpos.x + (camera.ppos.x - camera.cpos.x) * drag;
  camera.ppos.y = camera.cpos.y + (camera.ppos.y - camera.cpos.y) * drag;

  // update camera position from accel -- verlet integration
  camera.cpos.x += camera.acel.x * dt * dt * 0.001;
  camera.cpos.y += camera.acel.y * dt * dt * 0.001;

  // update camera next position -- verlet integration
  var nextx = (2 * camera.cpos.x) - camera.ppos.x;
  var nexty = (2 * camera.cpos.y) - camera.ppos.y;

  // remember previous position -- verlet integration
  camera.ppos.x = camera.cpos.x;
  camera.ppos.y = camera.ppos.y;

  // update current position -- verlet integration
  camera.cpos.x = nextx;
  camera.cpos.y = nexty;

  // reset accel -- verlet integration
  camera.acel.x = 0;
  camera.acel.y = 0;

  // bound camera to world edges if applicable
  if (camera.bound) {

    // flush camera -- x bounds
    camera.cpos.x = Math.min(camera.cpos.x, camera.maxWidth - camera.width);
    camera.cpos.x = Math.max(camera.cpos.x, 0);

    // flush camera -- y bounds
    camera.cpos.y = Math.min(camera.cpos.y, camera.maxHeight - camera.height);
    camera.cpos.y = Math.max(camera.cpos.y, 0);
  }

  // update entity positions / collisions
  ...

  // update player positions / collisions
  ...

}
{% endhighlight %}

This kinda adds a lot. 

It adds in drag on lines 16 and 17 to simulate energy loss in the system, otherwise the game objects would never come to a stop. The variable `drag` can be any value you want from 0.0 to 1.0. Think of it as the percentage of velocity that is allowed to be kept; 0.93 means that 93% of the velocity is kept while 7% is lost.

Lines 19 to 37 do the actual verlet integration. It is on these lines that the new position of the camera is actually calculated. `dt` is the change in time since the last update. Since I'm using verlet integration, a [fixed timestep](http://gafferongames.com/game-physics/fix-your-timestep/) should be used. I have this set up to accept a `dt` in milliseconds, so I convert `dt` to seconds on lines 20 and 21 by multiplying by `0.001`. I usually set `dt` to be 16 milliseconds (which corresponds to 1/60th of a second or the length of 1 frame). 

The absolute last addition on lines 40 - 49 is binding the camera to the `maxHeight` and `maxWidth` properties defined previously. Typically, these two properties define the dimensions of the world space, but they can also be thought of as the dimensions of the world that the camera is allowed to view. 

On each frame after updating and running the verlet calculations, the camera's current position is checked for bounds. These lines first check the upper bounds by setting the camera's current position to the smaller of the two&mdash;the current position or the max bounds. Then the lines check the lower bounds by setting the camera's current position the larger of the two&mdash;the current position or 0. We aren't using a `minHeight` or `minWidth` so 0 is used instead. 

*Note however that this does not prevent the player from moving off camera. This only prevents the camera from viewing something out of bounds. Player-environment collision should be handled elsewhere*

Now that everything is in place, I can finally get to...

### Shake!

YES! The whole reason I started this endeavor was to code up some juicy screen shake and now the time is finally here. 

Turns out, I already covered all of the hard stuff! Implementing screen shake is super simple. There are two requirements:

- how intense should the shaking be
- how much to dampen the shaking each frame

All three of these requirements will be assembled into an acceleration force that will be applied to the camera. No need to remember the original position of the camera, or calculate new positions from old positions&mdash;all of that is already taken care of in the "Follow that player!" section above. Since the shake is just an acceleration force, the target position for the camera does not change so the camera will naturally flow back to its intended position.

Adding more properties to the camera!

{% highlight javascript linenos %}
// updated camera object for SCREEN SHAKE!
var camera = {
  
  // other properties from above definition
  ...

  // target point the camera should be at to follow the player
  ...

  // shaking properties
  strength : 0,
  damper : 5

}
{% endhighlight %}

The new properties added will help take care of the two requrements:


- `strength` is the strength of the shaking
- `damper` is how much to subtract from `strength` on each frame

Now to add in the screen shake update to the game update function **before** using verlet integration to get the new camera position:

{% highlight javascript linenos %}
// the game loop update function
function update() {
  
  // handle input
  ...

  // update camera target position
  ...

  // update camera acceleration -- step is usually great at 0.125
  ...

  // SCREEN SHAKE
  if (camera.strength > 0) {

    // get random acceleration on the interval [-strength, strength]
    var randx = Math.random() * 2 * camera.strength - camera.strength;
    var randy = Math.random() * 2 * camera.strength - camera.strength;

    // add in the shaking acceleration
    camera.acel.x += randx;
    camera.acel.y += randy;

    // reduce strength
    camera.strength -= camera.damper;

  }

  // apply some drag
  ...

  // update camera position -- verlet integration
  ...

  // reset accel
  ...

  // bound camera to world edges if applicable
  ...

  // update entity positions / collisions
  ...

  // update player positions / collisions
  ...

}
{% endhighlight %}

The random acceleration will make the camera jerk (shake) the most violent at the start, then die down due to the `damper`, and eventually the camera will return to the target position. To make this start, set the camera properties:

{% highlight javascript linenos %}
// start shaking!
camera.strength = 90;
camera.damper = 5;
{% endhighlight %}

Now the camera will shake until there is no strength left. Put this little snippet of code anywhere to trigger the shaking&mdash;on a button press, on a player collision with an asteroid, on a bullet collision with an enemy, on an explosion, etc.

YAY! Screen shake has now been implemented. 

Toy around with different values for `strength` and `damper` to get the best feel for your game. Try a bunch of different tweaks; have strength be additive instead of capped for really crazy screen shaking...

### Cool! How can I use this?

Made it to the end. Nice. 

There was a lot here to just handle shaking the screen but I think all of it was worth mentioning because it opens doors to other effects you can implemenet using a physics based simulation; you don't have to just shake the screen, you can shake any object that acts on accelerations.

However, I realize that this might be hard to implement into every system, so I'll list some main points this post covers:

- Camera space is different than World space
  - a canvas drawing context *always* assumes camera space
- The camera is just an object
  - it has position, velocity, and acceleration like everything else in your game
- To follow an object is to define a target point for your camera
  - slowly move the camera to the target position over many frames via acceleration forces
- Shaking the camera is the same as adding random acceleration forces to the camera

Getting the camera to do what you want is really tricky. It requires a lot of trial and error to get the right "feel", but having a camera is really important and having a camera that works and feels correct is even more important. 

One last noteworthy topic is that while you can try to do most of these physics things yourself, consider getting a physics library; even a small one. I use [pocket-physics](https://github.com/kirbysayshi/pocket-physics). It's lightweight, on npm, and handles calculating verlet integrations, drag, distance constraints, spring constratints, gravitation, allows work on vectors directly, etc; all of the cool physics-y things you'd ever want. 

Well hopefully that made sense.

**The End.**

Wait! *What kind of post would this be without a demo?!* 

He's a codepen. You might have to rerun the results pane, and give the canvas focus by clicking on it once it's reloaded. 

(W,A,S,D to move, Shift to shake, ESC to stop animations):

<div data-height="446" data-theme-id="0" data-slug-hash="ZYeMMK" data-default-tab="js" data-user="theoperatore" class='codepen'><pre><code>// camera object
var camera = {
  cpos : { x : 0, y : 0 },
  ppos : { x : 0, y : 0 },
  acel : { x : 0, y : 0 },
  height : document.body.clientHeight,
  width  : document.body.clientWidth,
  maxHeight : 6 * document.body.clientHeight,
  maxWidth  : 6 * document.body.clientWidth,
  cullDist : 300,
  bound : true,
  target : { x : 0, y : 0 }
}

// player object
var player = {
  cpos : { x : 0, y : 0 },
  ppos : { x : 0, y : 0 },
  acel : { x : 0, y : 0 }
}

// handle input
var inputs = {};
document.addEventListener(&quot;keydown&quot;, function(ev) {
  inputs[ev.keyCode] = true;
}, false);
document.addEventListener(&quot;keyup&quot;, function(ev) {
  inputs[ev.keyCode] = false;
}, false);

// init entities
var entities = [];
for (var i = 0; i &lt; 100; i++) {
  var randx = Math.random() * 6 * document.body.clientWidth;
  var randy = Math.random() * 6 * document.body.clientHeight;
  entities.push({
    cpos : { x : randx, y : randy },
    ppos : { x : randx, y : randy },
    acel : { x: 0, y : 0 }
  });
}

console.log(entities);
// canvas stuff
var cvs = document.getElementById(&quot;canvas&quot;);
cvs.width = document.body.clientWidth;
cvs.height = document.body.clientHeight;
var ctx = cvs.getContext(&#x27;2d&#x27;);

function clearBlack() {
  ctx.beginPath();
  ctx.fillStyle = &quot;black&quot;;
  ctx.fillRect(0, 0, cvs.width, cvs.height);
}
var anim;
function update() {
  anim = requestAnimationFrame(update);
  // clear screen
  clearBlack();
   
  // check inputs
  // up - w
  if (inputs[87]) {
    player.acel.y = -6;
  }

  // down - s
  else if (inputs[83]) {
    player.acel.y = 6;
  }

  // left - a
  if (inputs[65]) {
    player.acel.x = -6;
  }

  // right - d
  else if (inputs[68]) { 
    player.acel.x = 6;
  }
  
  // get the target point
  camera.target.x = player.cpos.x - (camera.width / 2);
  camera.target.y = player.cpos.y - (camera.height / 2);
  
  // move camera towards target point
  camera.acel.x += (1 / 8) * (camera.target.x - camera.cpos.x);
  camera.acel.y += (1 / 8) * (camera.target.y - camera.cpos.y);
  
  // verlet integration on player and camera
  player.ppos.x = player.cpos.x + (player.ppos.x - player.cpos.x) * 0.81;
  player.ppos.y = player.cpos.y + (player.ppos.y - player.cpos.y) * 0.81;
  player.cpos.x += player.acel.x * 0.256;
  player.cpos.y += player.acel.y * 0.256;
  var px = 2 * player.cpos.x - player.ppos.x;
  var py = 2 * player.cpos.y - player.ppos.y;
  player.ppos.x = player.cpos.x;
  player.ppos.y = player.cpos.y;
  player.cpos.x = px;
  player.cpos.y = py;
  player.acel.x = 0;
  player.acel.y = 0;
  
  camera.ppos.x = camera.cpos.x + (camera.cpos.x - camera.ppos.x) * 0.96;
  camera.ppos.y = camera.cpos.y + (camera.cpos.y - camera.ppos.y) * 0.96;
  camera.cpos.x += camera.acel.x * 0.256;
  camera.cpos.y += camera.acel.y * 0.256;
  var cx = 2 * camera.cpos.x - camera.ppos.x;
  var cy = 2 * camera.cpos.y - camera.ppos.y;
  camera.ppos.x = camera.cpos.x;
  camera.ppos.y = camera.cpos.y;
  camera.cpos.x = cx;
  camera.cpos.y = cy;
  camera.acel.x = 0;
  camera.acel.y = 0;

  if (camera.bound) {

    // flush camera -- x bounds
    camera.cpos.x = Math.min(camera.cpos.x, camera.maxWidth - camera.width);
    camera.cpos.x = Math.max(camera.cpos.x, 0);

    // flush camera -- y bounds
    camera.cpos.y = Math.min(camera.cpos.y, camera.maxHeight - camera.height);
    camera.cpos.y = Math.max(camera.cpos.y, 0);
  }
  
  // draw stuff
  var playerx = player.cpos.x - camera.cpos.x;
  var playery = player.cpos.y - camera.cpos.y;
  ctx.beginPath();
  ctx.fillStyle = &quot;white&quot;;
  ctx.fillRect(playerx, playery, 10, 10);
  
  for (var i = 0; i &lt; entities.length; i++) {
    var entity = entities[i];
    var ex = entity.cpos.x - camera.cpos.x;
    var ey = entity.cpos.y - camera.cpos.y;
    ctx.beginPath();
    ctx.fillStyle=&quot;gold&quot;;
    ctx.arc(ex,ey, 10, 0, 2*Math.PI, false);
    ctx.fill();
  }
}


anim = requestAnimationFrame(update);
document.addEventListener(&quot;keydown&quot;, function(ev) {
  if (ev.keyCode === 27) {
    cancelAnimationFrame(anim);
  }
});</code></pre>
<p>See the Pen <a href='http://codepen.io/theoperatore/pen/ZYeMMK/'>2d physics camera with screen shake!</a> by Alex Petersen (<a href='http://codepen.io/theoperatore'>@theoperatore</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
</div><script async src="//assets.codepen.io/assets/embed/ei.js"></script>

Now it's the end for real, thanks for reading!

