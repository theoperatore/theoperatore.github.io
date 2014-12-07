---
layout: post
title: Creating a Tooltip using React.js
comments: false
---

In one of my recent apps I decided that a solution to a UI problem would be best solved by using some sort of tooltip or popover, similar to [Bootstrap](http://getbootstrap.com/).

I wanted to hide away some secondary information but at the same time allow for a user to access that hidden information and interact with it by modifying existing info, creating new info, or deleting unwanted info.

However I have been using [React.js](http://facebook.github.io/react/) to build the entire user interface. While I could have done some Bootstrap - React cross play, I decided that I didn't want to mess with compatibility and instead try to make a tooltip in the style of a Bootstrap Popover using soley React components (and of course a little CSS).

*In this post I'm using popover to refer to a Bootstrap Popover and tooltip to refer to the React component that simulates a Bootstrap Popover. Note that a [Bootstrap Tooltip](http://getbootstrap.com/javascript/#tooltips) is different than a [Bootstrap Popover](http://getbootstrap.com/javascript/#popovers)*

### Mixing React and Bootstrap

Before I get into making the tooltip component I want to talk about about why it might be difficult to use both React and Bootstrap together for this particular problem.

A popover is easy to configure and display:

<iframe width="100%" height="250" src="http://jsfiddle.net/theoperatore/5j5xhxrz/embedded/html,js,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

If you wanted to have HTML rendered inside a popover, you just need to use a little more javascript to set some options:

{% highlight javascript %}
// inside the js part of the above fiddle...
$('#example').popover({
  html : true,
  content: "<div class='inside'><h1>I'm a Title</h1><p>And I'm the content. Hooray!</p></div>"
});
{% endhighlight %}

Bootstrap makes it easy to create a popover with any content you'd like. Even if you wanted some interaction with the popover, like displaying a form for a user to fill out, you'd just have to hook into the popover's events and handle accordingly.

Things get a little more complicated when you start trying to throw a React component inside a popover. 

The `content` attribute of the popover is able to take a function or a string of html. Since React components (after using createClass) are functions themselves, it might seem that inserting the component function into the `content` attribute would solve the problem.

However, this doesn't work. Bootstrap isn't equiped to handle rendering a React component as a React component.

Maybe if I had the HTML of my component, I could use that as a string instead. The problem now becomes, *how do I get the HTML of my component*? Good thing React has a built-in function to do that for you: 

{% highlight javascript linenos %}
// Component to render
var Tooltip = React.createClass({
  render : function() {
    return (React.DOM.h1(null, this.props.displayName));
  }
});

// time for rendering, get HTML of component
var tooltip = React.renderComponentToString(Tooltip({displayName : "Gargantua-1 Eats You"}));

// feed Bootstrap popover your component string
$('#example').popover({
  html : true,
  content: tooltip
});
{% endhighlight %}

With result: 

<iframe width="100%" height="300" src="http://jsfiddle.net/theoperatore/433b83pp/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

This fix might work if all of your tooltips have static parts, where user interaction isn't needed.

However, because you are rendering the React component to a string, React never has time to attach its own event listeners to listen for state changes. If an interaction in the popover results in a state change, React can't update your layout because there isn't anything listening to the popover. 

Bad news since we need the tooltip to handle user interaction.

### Creating a React Tooltip

Now we create the tooltip in React. By using only a React component, we can ensure that the interactivity is conserved. The tooltip we will create will simulate an inventory with each item having a name and description.

To begin, we make the `Tooltip` component:

{% highlight javascript linenos %}
var Tooltip = React.createClass({
  
  // set up empty list
  getInitialState : function() { 
    return { inventory : [], text : "", desc : "" }; 
  },

  // handle input
  handleChange : function(e) {
    var out = {};
    out[e.target.dataset.ref] = e.target.value;
    this.setState(out);
  },

  // handle adding a new item
  handleAdd : function() {
    var list, item = {};

    item.text = this.state.text;
    item.desc = this.state.desc;
      
    list = this.state.inventory.concat([item]);
    this.setState({ inventory : list, text : "", desc : "" });
  },

  // render the component
  render : function() {
 
    var items = [];
    this.state.inventory.forEach(function(item, i) {

      items.push(
        React.DOM.li({ key: i }, item.text + " -- ", item.desc)
      );

    }, this);

    return React.DOM.div({ className : "tooltip" },
      React.DOM.h1({ className : "descriptor" }, "Inventory"),
      React.DOM.ul(null, items),
      React.DOM.input({ "data-ref" : "text", type : "text", placeholder : "Name", value : this.state.text, onChange : this.handleChange }),
      React.DOM.input({ "data-ref" : "desc", type : "text", placeholder : "Desc", value : this.state.desc, onChange : this.handleChange }),
      React.DOM.input({ type : "button", value : "+", onClick : this.handleAdd })
    );
  }
});
{% endhighlight %}


### Alternatives

React and Bootstrap don't play nice together, but there are alternatives if you want to [have it all](http://grist.files.wordpress.com/2013/08/tina-fey-burger.gif?w=245&h=160).

