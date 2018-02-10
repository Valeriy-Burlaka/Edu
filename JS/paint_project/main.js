

function elt(name, attributes) {
    let node = document.createElement(name);
    if (attributes) {
      for (let attr in attributes)
        if (attributes.hasOwnProperty(attr))
          node.setAttribute(attr, attributes[attr]);
    }
    for (let i = 2; i < arguments.length; i++) {
      let child = arguments[i];
      if (typeof child == "string")
        child = document.createTextNode(child);
      node.appendChild(child);
    }
    return node;
};


const controls = Object.create(null);


function createPaint(parent) {
    let canvas = elt("canvas", {width: 500, height: 300});
    let cx = canvas.getContext("2d");
    let toolbar = elt("div", {class: "toolbar"});
    for (let name in controls)
      toolbar.appendChild(controls[name](cx));
  
    let panel = elt("div", {class: "picturepanel"}, canvas);
    parent.appendChild(elt("div", null, panel, toolbar));
};


const tools = Object.create(null);

controls.tool = function(cx) {
  let select = elt("select");
  for (let name in tools)
    select.appendChild(elt("option", null, name));

  cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      tools[select.value](event, cx);
      event.preventDefault();
    }
  });

  return elt("span", null, "Tool: ", select);
};


controls.color = function(cx) {
    let input = elt("input", {type: "color"});
    input.addEventListener("change", function() {
      cx.fillStyle = input.value;
      cx.strokeStyle = input.value;
    });
    return elt("span", null, "Color: ", input);
};


controls.brushSize = function(cx) {
    let select = elt("select");
    let sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
    sizes.forEach(function(size) {
      select.appendChild(elt("option", {value: size},
                             size + " pixels"));
    });
    select.addEventListener("change", function() {
      cx.lineWidth = select.value;
    });
    return elt("span", null, "Brush size: ", select);
};


controls.save = function(cx) {
    var link = elt("a", {href: "/"}, "Save");
    function update() {
      try {
        link.href = cx.canvas.toDataURL();
      } catch (e) {
        if (e instanceof SecurityError)
          link.href = "javascript:alert(" +
            JSON.stringify("Can't save: " + e.toString()) + ")";
        else
            link.href = "javascript:alert(" +
                JSON.stringify("Can't save: " + e.toString()) + ")";
        //   throw e;
      }
    }
    link.addEventListener("mouseover", update);
    link.addEventListener("focus", update);
    return link;
};


controls.openFile = function(cx) {
    let input = elt("input", {type: "file"});
    input.addEventListener("change", function() {
      if (input.files.length == 0) return;
      let reader = new FileReader();
      reader.addEventListener("load", function() {
        loadImageURL(cx, reader.result);
      });
      reader.readAsDataURL(input.files[0]);
    });
    return elt("div", null, "Open file: ", input);
};


controls.openURL = function(cx) {
    let input = elt("input", {type: "text"});
    let form = elt("form", null,
                   "Open URL: ", input,
                   elt("button", {type: "submit"}, "load"));
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      loadImageURL(cx, input.value);
    });
    return form;
};


function loadImageURL(cx, url) {
    let image = document.createElement("img");
    image.addEventListener("load", function() {
      let color = cx.fillStyle, size = cx.lineWidth;
      cx.canvas.width = image.width;
      cx.canvas.height = image.height;
      cx.drawImage(image, 0, 0);
      cx.fillStyle = color;
      cx.strokeStyle = color;
      cx.lineWidth = size;
    });
    image.src = url;
};


function relativePos(event, element) {
    let rect = element.getBoundingClientRect();
    return {x: Math.floor(event.clientX - rect.left),
            y: Math.floor(event.clientY - rect.top)};
};


function absolutePos(event) {
    return {x: event.clientX, y: event.clientY};
};


function trackDrag(onMove, onEnd) {
    function end(event) {
      removeEventListener("mousemove", onMove);
      removeEventListener("mouseup", end);
      if (onEnd)
        onEnd(event);
    };
    addEventListener("mousemove", onMove);
    addEventListener("mouseup", end);
};


tools.Line = function(event, cx, onEnd) {
    cx.lineCap = "round";
  
    let pos = relativePos(event, cx.canvas);
    trackDrag(function(event) {
      cx.beginPath();
      cx.moveTo(pos.x, pos.y);
      pos = relativePos(event, cx.canvas);
      cx.lineTo(pos.x, pos.y);
      cx.stroke();
    }, onEnd);
};


tools.Erase = function(event, cx) {
    cx.globalCompositeOperation = "destination-out";
    tools.Line(event, cx, function() {
      cx.globalCompositeOperation = "source-over";
    });
};


function randomPointInRadius(radius) {
    for (;;) {
      let x = Math.random() * 2 - 1;
      let y = Math.random() * 2 - 1;
      if (x * x + y * y <= 1)
        return {x: x * radius, y: y * radius};
    }
};


tools.Spray = function(event, cx) {
    let radius = cx.lineWidth / 2;
    let area = radius * radius * Math.PI;
    let dotsPerTick = Math.ceil(area / 30);
  
    let currentPos = relativePos(event, cx.canvas);
    let spray = setInterval(function() {
      for (let i = 0; i < dotsPerTick; i++) {
        var offset = randomPointInRadius(radius);
        cx.fillRect(currentPos.x + offset.x,
                    currentPos.y + offset.y, 1, 1);
      }
    }, 25);
    trackDrag(function(event) {
      currentPos = relativePos(event, cx.canvas);
    }, function() {
      clearInterval(spray);
    });
};


function rectangularBorder() {
    let border = elt("div", {id: "rectangle-tool-border"});
    border.style.position = "absolute";
    border.style.border = "1px solid black";
    return border;
};


function findRect() {

};


tools.Rectangle = function(event, cx) {
    let initialRelPos, currentRelPos = initialRelPos = relativePos(event, cx.canvas);
    let initialAbsPos, currentAbsPos = initialAbsPos = absolutePos(event);

    let border = rectangularBorder();
    document.body.appendChild(border);
    trackDrag(function(event) {
        currentRelPos = relativePos(event, cx.canvas);
        currentAbsPos = absolutePos(event);
        border.style.left = Math.min(currentAbsPos.x, initialAbsPos.x);
        border.style.top = Math.min(currentAbsPos.y, initialAbsPos.y);
        border.style.width = Math.abs(currentAbsPos.x - initialAbsPos.x) + "px";
        border.style.height = Math.abs(currentAbsPos.y - initialAbsPos.y) + "px";
        
    }, function() {
        let width = Math.abs(currentRelPos.x - initialRelPos.x);
        let height = Math.abs(currentRelPos.y - initialRelPos.y);
        let x = Math.min(currentRelPos.x, initialRelPos.x);
        let y = Math.min(currentRelPos.y, initialRelPos.y);
        document.body.removeChild(border);
        cx.fillRect(x, y, width, height);
    });


};


tools.Text = function(event, cx) {
    let text = prompt("Text:", "");
    if (text) {
      let pos = relativePos(event, cx.canvas);
      cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
      cx.fillText(text, pos.x, pos.y);
    }
};


document.addEventListener("DOMContentLoaded", function() {
    createPaint(document.querySelector("#main"));
});
