---
layout: post
title: Closures Ruined My OOP Lifestyle
comments: true
---

Ok, the title is a slight lie, like a white lie. Object-oriented programing will always have a place in my heart. It's the first programming paradigm I was taught and it makes sense to think of everything as an object with properties and methods that operate on those properties.

However, sometimes I don't need a complicated looking data structure. Sometimes, I just need a snippet of code that couples two pieces of data together without creating a bulky class or long inheritance chain.

### Closures

This is where a closure comes in handy. I can keep access to free variables *after* they should be out of scope. Thank you [lexical scoping](http://en.wikipedia.org/wiki/Scope_%28computer_science%29#Lexical_scope_vs._dynamic_scope) and nested functions. Using this idea I can create a function that will hold access to variables declared in the environment in which the function was declared.

All of my closure examples are in JavaScript.

{% highlight javascript linenos %}
// this function returns a greeting
function hello(place) {

  // you should go away after this executes,
  // but you don't and I love you for it!
  var p = place || "world";

  // create a closure
  return function() {

    // alert the greeting
    alert("hello,", p);
  }
}
{% endhighlight %}

Now when I go to use the `hello()` function, I can create a bunch of greeting functions:

{% highlight javascript linenos %}
// create a bunch of different greetings
var homestate  = hello("Wisco"),
    northwoods = hello("Trego"),
    college    = hello("Madison"),
    classic    = hello("world");

// greet EVERYTHING
homestate();  // "hello, Wisco"
northwoods(); // "hello, Trego"
college();    // "hello, Madison"
classic();    // "hello, world"
{% endhighlight %}

By being inside the scope of the returned function (the surrounding environment), `p` is captured and remembered by the returned function and can be used later when the variable should be out of scope and unallocated.

In a different programming language that doesn't support closures, like Java, the equivalent would be:

{% highlight java linenos %}
public class Hello {
  
  private String place;

  public Hello(String p) { this.p = place; }
  public String greet()  { System.out.println("hello, " + this.place); }

}

// ... in your main class ... 
Hello homestate  = new Hello("Wisco");
Hello northwoods = new Hello("Trego");
Hello college    = new Hello("Madison");
Hello classic    = new Hello("world");

homestate.greet();  // "hello, Wisco"
northwoods.greet(); // "hello, Trego"
college.greet();    // "hello, Madison"
classic.greet();    // "hello, world"
{% endhighlight %}

But that's the interesting part isn't it? Closures in javascript allow for the creation of private variables that get remembered when they *should* go out of scope. In `hello()` above, once the function gets returned, the variable `p` should go out of scope and not be accessible. But that is not the case; `p` is accessible because the returned function remembers the environment in which it was declared.

The returned function will remember the value of variable `p` because it is part of the function's surrounding environment, and upon every invocation the function will use the correct value of `p`.

This is a closure: a function and it's surrounding environment.

### Using closures to couple data

Let's rewind a bit and talk about not using an object-oriented approach to solve a problem. I've recently been working with the [Google Maps API](https://developers.google.com/maps/documentation/javascript/tutorial) to grab the current user's location based on the gps of their mobile device, and show a map of their current location.

The user is then able to create a marker on the map at their location. If at any time the user decides that the placed marker should be deleted, they only need to tap on the marker to show an options window and hit the delete button to remove the marker.

![Delete created marker?]({{site.baseurl}}/assets/delete_selected-original.png)
<span class="img-description">Delete created mark?</span>

A closure comes into play when implementing the functionality to display the marker options menu and handle the deletion of a marker.

Making this functionality requires 5 steps:

1. Instantiate a new Marker
2. Instantiate a new InfoWindow (options menu)
3. Bind event listener 'click' to Marker
4. Bind event listener 'click' to InfoWindow DOM `<input>`
5. Handle deleting the Marker and InfoWindow

The problem is that I need a way to associate a Marker and an InfoWindow together so that I can easily handle the events that will bring about their [deletion](http://youtu.be/qnDFvQRfGxw).

Sounds like a perfect time to use a closure:

{% highlight javascript linenos %}
// Marker - InfoWindow Closure
function createMark() {

  var mark = new google.maps.Marker( /* options */ ),
      info = new google.maps.InfoWindow( /* options */ );

  // set up Marker Click Event
  google.maps.event.addListener(mark, 'click', function() {

    // open the InfoWindow; access to `info`

  });

  // set up InfoWindow events
  google.maps.event.addListener(info, 'domready', function() {

    // handle deleting `mark` and `info`

  });

  // perform other app stuff like saving the mark coordinates
}
{% endhighlight %}

Now whenever a new Maker needs to be created, an InfoWindow can be coupled with it using the closures created by the event listener functions.

The main benefit is that the closure removes any unnecessary pollution of the global namespace. It encapsulates away the parts that the program doesn't need to care about, namely the actual Marker and InfoWindow objects. The only worthwile information the program needs to remember are the latitude and longitude coordinates which can be saved elsewhere.

Plus this closure is flexible enough to allow me to return the instantiated Marker if I need to hold onto it in an array or some collection for whatever reason. 

If I really wanted to get crazy, I could turn this closure function into a factory function that returns an object containing both Marker and InfoWindow objects while still creating the closures for the event handling. 

The possibilities are quite endless because of the power of closures. But let's not get too crazy...

### But what if I get "Too Crazy"

While closures are *awesome*, they shouldn't be used willy-nilly. Remember, you are creating a *nested function that remembers the environment in which it was created*. That's memory consumption that sometimes isn't needed.

Check out [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#Performance_considerations) for more info on closures and memory consumption. Basically, the more unnecessary closures you have in your scripts, the longer it's going to take to load your page and execute those scripts.

### Thinking creatively 

Closures enable the binding of data without the need for inheritance chains or bloated class delcarations. While they shouldn't be used without reason, they can be the simple solution for which you've been looking.

Coming from a very strict object-oriented programming language (Java), it's easy to see that closures provide a way of thinking outside the box when it comes to providing solutions to problems.

Comment with your thoughts on closures.
