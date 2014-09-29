var Emitter = function() {
  this._subscribers = [];  
};

Emitter.prototype.emit = function(name, data) {
    var list = this._subscribers[name] || [];
    list.forEach(function(item) {
        item.callback(data);
    });
};

Emitter.prototype.on = function(name, callback) {
     this._subscribers[name] = this._subscribers[name] || [];
    this._subscribers[name].push({callback : callback});
};

// bind two pieces of data together
(function() {
  var count = 0, marks = [], emitter = new Emitter();

  // create a bunch of marks
  for (var i = 0; i < 9; i++) {
    marks.push({ x: i, y : 2*i });
  }

  // function to bind Marks with IDs and setup events for the mark
  function bindMark(mark) {
    var id = ++count;

    // setup this mark for what happens on a click
    emitter.on('click', function(del_id) {
      if (del_id === id) {
        console.log('markId:',id,"for mark pos",mark);
      }
    });
  }

  // bind marks to ids
  marks.forEach(function(mark) {
    bindMark(mark);
  });

  // simulate clicking a mark
  emitter.emit('click', 2);
  emitter.emit('click', 4);
  emitter.emit('click', 6);
  emitter.emit('click', 9);
  emitter.emit('click', 1);
})();

(function() {
  var emitter = new Emitter();

  var x = "I'm here!";

  function associate(_x) {
    var y = "Don't forget about me...";

    emitter.on('event1', function() {
      x = y + _x;
    });

    emitter.on('event2', function() {
      y = "I'm different...";
    });
  }

  associate(x);

  emitter.emit('event1');
  console.log(x);
  emitter.emit('event2');
  emitter.emit('event1');
  console.log(x);

})();