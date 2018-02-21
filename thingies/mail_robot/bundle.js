(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){

module.exports.buildSimpleGraph = function(edges) {
    // each key holds an Array of adjacent places
    let graph = Object.create(null);
    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to)
        }
    };
    for (let [from, to] of edges.map(e => e.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
};

module.exports.buildVisualRoadGraph = function(places, roads) {
    let graph = {};
    places.forEach(place => {
        place = place.split(",");
        graph[place[0]] = {x: place[1], y: place[2]};
    });

    function addEdge(from, to) {
        if (graph[from].neighbors == null) {
            graph[from].neighbors = [to];
        } else {
            graph[from].neighbors.push(to);
        }
    };
    for (let [from, to] of roads.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    // {"Alice's House": {x: 70, y: 20, neighbors: ["Bob's House", ..., ]}, ... }
    return graph;
};

module.exports.findRoute = function(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at].neighbors) {
            if (place == to) return route.concat(place);
            if (!work.some(w => w.at == place)) {
                work.push({at: place, route: route.concat(place)});
            }
        }
    }
};
},{}],2:[function(require,module,exports){

module.exports.randomPick = function (array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
};

module.exports.average = function (array) {
    let sum = array.reduce( (x, y) => x + y );
    return sum / array.length;
};

},{}],3:[function(require,module,exports){
const {buildSimpleGraph, buildVisualRoadGraph} = require("./graph");


const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
];
module.exports.roads = roads;

const places = [
    "Alice's House,70,20", "Bob's House,80,35", "Cabin,88,5", "Post Office,40,5",
    "Town Hall,50,35", "Ernie's House,12,47", "Grete's House,5,30",
    "Daria's House,40,47", "Farm, 10,10", "Shop,25,35", "Marketplace,35,20"
];
module.exports.places = places;

const simpleRoadGraph = buildSimpleGraph(roads);
module.exports.simpleRoadGraph = simpleRoadGraph;
const visualRoadGraph = buildVisualRoadGraph(places, roads);
module.exports.visualRoadGraph = visualRoadGraph;

},{"./graph":1}],4:[function(require,module,exports){
const {findRoute} = require("./graph");
const {randomPick} = require("./helpers");


const randomRobot = function(state) {
    return {direction: randomPick(state.graph[state.place].neighbors)};
};
module.exports.randomRobot = randomRobot;

const routeRobot = function(state, memory) {
    const mailRoute = [
        "Alice's House", "Cabin", "Alice's House", "Bob's House",
        "Town Hall", "Daria's House", "Ernie's House",
        "Grete's House", "Shop", "Grete's House", "Farm",
        "Marketplace", "Post Office"
    ];
    if (memory.length == 0) {
    memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
};
module.exports.routeRobot = routeRobot;

const goalOrientedRobot = function({graph, place, parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(graph, place, parcel.place);
        } else {
            route = findRoute(graph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
};
module.exports.goalOrientedRobot = goalOrientedRobot;
    
function findNearestParcel(graph, place, parcels) {
    let nearestParcel = parcels[0];
    let shortestRouteLength = findRoute(graph, place, nearestParcel.place).length;
    parcels.slice(1).map(p => {
        let routeLength = findRoute(graph, place, p.place).length;
    //   console.log(`Place ${p.place} is ${routeLength} moves away from ${place}`);
        if (routeLength < shortestRouteLength) {
        shortestRouteLength = routeLength
        nearestParcel = p;
        }
    });
    // console.log(`${nearestParcel.place} is a nearest parcel`);
    return nearestParcel;
};

function parcelsByDistance(graph, place, parcels, action="pickup") {
    let attr = action == "pickup" ? "place" : "address"
    let byDistance = parcels.map(p => {
        let distance = findRoute(graph, place, p[attr]).length;
        return {place: p.place, address: p.address, distance: distance};
    });
    function compare(a, b) {
        return a.distance - b.distance;
    };
    byDistance.sort(compare);
    return byDistance;
};

const nearestPickupThenDeliveryRobot = function({graph, place, parcels}, route) {
    if (route.length == 0) {
        let parcel = findNearestParcel(graph, place, parcels);
        if (parcel.place != place) {
            route = findRoute(graph, place, parcel.place);
        } else {
            route = findRoute(graph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
};
module.exports.nearestPickupThenDeliveryRobot = nearestPickupThenDeliveryRobot;

const nearestGoalRobot = function({graph, place, parcels}, route) {
    if (route.length == 0) {
        let pByPickupDistance = parcelsByDistance(graph, place, parcels);
        let nearestParcel = pByPickupDistance[0];
        if (nearestParcel.place != place) {
            route = findRoute(graph, place, nearestParcel.place);
        } else {
            let pickedParcels = pByPickupDistance.filter(p => {
                return p.place == place;
            });
            let unpickedParcels = pByPickupDistance.filter(p => {
                return p.place != place;
            });
            if (unpickedParcels.length == 0) {
                let pByDeliveryDistance = parcelsByDistance(graph, place, pickedParcels, "delivery");
                route = findRoute(graph, place, pByDeliveryDistance[0].address);
            } else {
                let pByDeliveryDistance = parcelsByDistance(graph, place, pickedParcels, "delivery");
                let goal;
                if (pByDeliveryDistance[0].distance <= unpickedParcels[0].distance) {
                    goal = pByDeliveryDistance[0].address;
                } else {
                    goal = unpickedParcels[0].place;
                }
                route = findRoute(graph, place, goal);
            }
        }
    }
    let action = {direction: route[0], memory: route.slice(1)};
    return action;
};
module.exports.nearestGoalRobot = nearestGoalRobot;

},{"./graph":1,"./helpers":2}],5:[function(require,module,exports){
const {randomPick} = require("./helpers")


class VillageState {
    constructor(graph, place, parcels) {
        this.graph = graph;
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!this.graph[this.place].neighbors.includes(destination)) {
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                if (p.place != this.place) return p;
                return {place: destination, address: p.address};
            }).filter(p => p.place != p.address);

            return new VillageState(this.graph, destination, parcels);
        }
    }
};

VillageState.random = function(graph, parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(graph));
      let place;
      do {
        place = randomPick(Object.keys(graph));
      } while (place == address);
      parcels.push({place, address});
    }
    return new VillageState(graph, "Post Office", parcels);
};

function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
      if (state.parcels.length == 0) {
        return turn;
      }
      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
    }
};

module.exports.VillageState = VillageState;
module.exports.runRobot = runRobot;

},{"./helpers":2}],6:[function(require,module,exports){
const {roads, places, visualRoadGraph} = require("./js/roads");
const {VillageState, runRobot} = require("./js/state");
const {randomPick, average} = require("./js/helpers");
const {randomRobot, 
       routeRobot,
       goalOrientedRobot,
       nearestPickupThenDeliveryRobot,
       nearestGoalRobot} = require("./js/robots");

const mapScale = 6;
const displayWidth = 100;  // units
const displayHeight = 60;
const placeSize = 7;
const robotSize = placeSize * 2 / 3;
const parcelSize = placeSize / 3;


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

function getContext() {
    return document.querySelector("canvas").getContext("2d");
};

function clearDisplay(ctx) {
    ctx.clearRect(0, 0, scaled(displayWidth), scaled(displayHeight));
};

function scaled(value) {
    return value * mapScale;
};

function realCoords({x, y}) {
    return {x: scaled(x), y: scaled(y)};
};

function squareCenter(left, top, side) {
    return {x: left + side/2, y: top + side/2};
};

function textStartInSquare(x, y, squareSide) {
    let textX = x + squareSide/4, textY = y + squareSide*3/4;
    return {x: textX, y: textY};
};

function textSettings(size, family="Arial") {
    return `${size/2}pt ${family}`;
}

function placeBottomLeft(name, graph) {
    let topLeft = realCoords(graph[name]);
    return {x: topLeft.x, y: topLeft.y + scaled(placeSize)};
};

function robotTopLeft(state) {
    let placeTopLeft = realCoords(state.graph[state.place]);
    let robotLeft = placeTopLeft.x + scaled(placeSize/2);
    let robotTop = placeTopLeft.y + scaled(placeSize);
    return {x: robotLeft, y: robotTop};
};

function robotBottomRight(state) {
    let topLeft = robotTopLeft(state); 
    return {x: topLeft.x + scaled(robotSize), y: topLeft.y + scaled(robotSize)};
};

function drawVillageMap(graph) {
    let ctx = getContext();
    for (let name of Object.keys(graph)) {
        let place = graph[name];
        let {x, y} = realCoords(place);
        let pSize = scaled(placeSize);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeRect(x, y, pSize, pSize);
        ctx.closePath();
        
        ctx.font = textSettings(pSize);
        let textStart = textStartInSquare(x, y, pSize);
        ctx.fillText(name[0], textStart.x, textStart.y);

        let placeCenter = squareCenter(x, y, pSize);
        place.neighbors.forEach(n => {
            let nCoords = realCoords(graph[n])
            let nCenter = squareCenter(nCoords.x, nCoords.y, pSize);
            ctx.beginPath();                
            ctx.moveTo(placeCenter.x, placeCenter.y);
            ctx.lineTo(nCenter.x, nCenter.y);
            ctx.stroke();
            ctx.closePath();
        });
    }
};

function drawRobot(state) {
    let {x, y} = robotTopLeft(state);
    let textStart = textStartInSquare(x, y, scaled(robotSize));

    let ctx = getContext();
    ctx.beginPath();
    ctx.strokeRect(x, y, scaled(robotSize), scaled(robotSize));
    ctx.font = textSettings(scaled(robotSize));
    ctx.fillText("R", textStart.x, textStart.y);
    ctx.closePath();
};

function drawParcels(state) {
    let byPlace = {};
    state.parcels.forEach(p => {
        let place = p.place == state.place ? "Robot" : p.place;
        if (byPlace[place] == null) {
            byPlace[place] = [p.address[0]];
        } else {
            byPlace[place].push(p.address[0]);
        }
    });
    let ctx = getContext();
    let pSize = scaled(parcelSize);
    for (let parcelPlace of Object.keys(byPlace)) {
        let parcelsPileStart, x, y;
        if (parcelPlace == "Robot") {
            parcelsPileStart = robotBottomRight(state);
            x = parcelsPileStart.x + pSize / 3;
            y = parcelsPileStart.y - pSize;
        } else {
            parcelsPileStart = placeBottomLeft(parcelPlace, state.graph);
            x = parcelsPileStart.x - pSize * 4/3;
            y = parcelsPileStart.y - pSize;
        }
        
        byPlace[parcelPlace].forEach(item => {
            ctx.beginPath();
            ctx.strokeRect(x, y, pSize, pSize);
            let textStart = textStartInSquare(x, y, pSize);
            ctx.font = textSettings(pSize);
            ctx.fillText(item, textStart.x, textStart.y);
            y -= pSize;
            ctx.closePath();
        });
    }
};

function drawAll(ctx, state, turn) {
    clearDisplay(ctx);
    drawVillageMap(state.graph);
    drawRobot(state);
    drawParcels(state);
    document.getElementById("turn").innerHTML = turn;
    document.getElementById("place").innerHTML = state.place;
};

function disableControls() {
    for (let id of ["robots", "start", "input-robot-speed"]) {
        document.getElementById(id).disabled = true;
    }
};

function enableControls() {
    for (let id of ["robots", "start", "input-robot-speed"]) {
        document.getElementById(id).disabled = false;
    }
};

function runRobotAnimation(state, robot, memory) {
    function run() {
        turn++;
        let action = robot(state, memory);
        state = state.move(action.direction);
        drawAll(ctx, state, turn);
        if (state.parcels.length == 0) {
            stop();
            return turn;
        }
        memory = action.memory;
    };
    function stop() {
        clearInterval(interval);
        enableControls();
        document.getElementById("stop").removeEventListener("click", stop);
    };

    document.getElementById("stop").addEventListener("click", stop);
    disableControls();
    let turn = 0;
    let ctx = getContext();
    drawAll(ctx, state, turn);
    let speed = parseInt(document.getElementById("input-robot-speed").value);
    let interval = setInterval(run, 1000/speed);
};

document.addEventListener("DOMContentLoaded", () => {
    let display = document.querySelector("canvas");
    display.setAttribute("width", scaled(displayWidth));
    display.setAttribute("height", scaled(displayHeight));

    let state = VillageState.random(visualRoadGraph);
    drawVillageMap(state.graph);

    let robots = {
        "Choose...": null,
        "Route": routeRobot,
        "Random": randomRobot,
        "Goal-Oriented": goalOrientedRobot,
        "Nearest-Pickup-Then-Delivery": nearestPickupThenDeliveryRobot,
        "Always-Nearest-Goal": nearestGoalRobot
    }
    let select = document.getElementById("robots");
    for (let robot in robots) {
        select.appendChild(elt("option", null, robot));
    }

    document.getElementById("start").addEventListener("click", () => {
        if (robots[select.value] !== null) {
            runRobotAnimation(state, robots[select.value], []);
        }
    });                   
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#input-robot-speed").addEventListener("input", (e) => {
        document.querySelector("#robot-speed-value").innerHTML = e.target.value;
    });
});

},{"./js/helpers":2,"./js/roads":3,"./js/robots":4,"./js/state":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9ncmFwaC5qcyIsImpzL2hlbHBlcnMuanMiLCJqcy9yb2Fkcy5qcyIsImpzL3JvYm90cy5qcyIsImpzL3N0YXRlLmpzIiwibWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIlxubW9kdWxlLmV4cG9ydHMuYnVpbGRTaW1wbGVHcmFwaCA9IGZ1bmN0aW9uKGVkZ2VzKSB7XG4gICAgLy8gZWFjaCBrZXkgaG9sZHMgYW4gQXJyYXkgb2YgYWRqYWNlbnQgcGxhY2VzXG4gICAgbGV0IGdyYXBoID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmdW5jdGlvbiBhZGRFZGdlKGZyb20sIHRvKSB7XG4gICAgICAgIGlmIChncmFwaFtmcm9tXSA9PSBudWxsKSB7XG4gICAgICAgICAgICBncmFwaFtmcm9tXSA9IFt0b107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBncmFwaFtmcm9tXS5wdXNoKHRvKVxuICAgICAgICB9XG4gICAgfTtcbiAgICBmb3IgKGxldCBbZnJvbSwgdG9dIG9mIGVkZ2VzLm1hcChlID0+IGUuc3BsaXQoXCItXCIpKSkge1xuICAgICAgICBhZGRFZGdlKGZyb20sIHRvKTtcbiAgICAgICAgYWRkRWRnZSh0bywgZnJvbSk7XG4gICAgfVxuICAgIHJldHVybiBncmFwaDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmJ1aWxkVmlzdWFsUm9hZEdyYXBoID0gZnVuY3Rpb24ocGxhY2VzLCByb2Fkcykge1xuICAgIGxldCBncmFwaCA9IHt9O1xuICAgIHBsYWNlcy5mb3JFYWNoKHBsYWNlID0+IHtcbiAgICAgICAgcGxhY2UgPSBwbGFjZS5zcGxpdChcIixcIik7XG4gICAgICAgIGdyYXBoW3BsYWNlWzBdXSA9IHt4OiBwbGFjZVsxXSwgeTogcGxhY2VbMl19O1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gYWRkRWRnZShmcm9tLCB0bykge1xuICAgICAgICBpZiAoZ3JhcGhbZnJvbV0ubmVpZ2hib3JzID09IG51bGwpIHtcbiAgICAgICAgICAgIGdyYXBoW2Zyb21dLm5laWdoYm9ycyA9IFt0b107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBncmFwaFtmcm9tXS5uZWlnaGJvcnMucHVzaCh0byk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZvciAobGV0IFtmcm9tLCB0b10gb2Ygcm9hZHMubWFwKHIgPT4gci5zcGxpdChcIi1cIikpKSB7XG4gICAgICAgIGFkZEVkZ2UoZnJvbSwgdG8pO1xuICAgICAgICBhZGRFZGdlKHRvLCBmcm9tKTtcbiAgICB9XG4gICAgLy8ge1wiQWxpY2UncyBIb3VzZVwiOiB7eDogNzAsIHk6IDIwLCBuZWlnaGJvcnM6IFtcIkJvYidzIEhvdXNlXCIsIC4uLiwgXX0sIC4uLiB9XG4gICAgcmV0dXJuIGdyYXBoO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZmluZFJvdXRlID0gZnVuY3Rpb24oZ3JhcGgsIGZyb20sIHRvKSB7XG4gICAgbGV0IHdvcmsgPSBbe2F0OiBmcm9tLCByb3V0ZTogW119XTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmsubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHthdCwgcm91dGV9ID0gd29ya1tpXTtcbiAgICAgICAgZm9yIChsZXQgcGxhY2Ugb2YgZ3JhcGhbYXRdLm5laWdoYm9ycykge1xuICAgICAgICAgICAgaWYgKHBsYWNlID09IHRvKSByZXR1cm4gcm91dGUuY29uY2F0KHBsYWNlKTtcbiAgICAgICAgICAgIGlmICghd29yay5zb21lKHcgPT4gdy5hdCA9PSBwbGFjZSkpIHtcbiAgICAgICAgICAgICAgICB3b3JrLnB1c2goe2F0OiBwbGFjZSwgcm91dGU6IHJvdXRlLmNvbmNhdChwbGFjZSl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07IiwiXG5tb2R1bGUuZXhwb3J0cy5yYW5kb21QaWNrID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgbGV0IGNob2ljZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFycmF5Lmxlbmd0aCk7XG4gICAgcmV0dXJuIGFycmF5W2Nob2ljZV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5hdmVyYWdlID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgbGV0IHN1bSA9IGFycmF5LnJlZHVjZSggKHgsIHkpID0+IHggKyB5ICk7XG4gICAgcmV0dXJuIHN1bSAvIGFycmF5Lmxlbmd0aDtcbn07XG4iLCJjb25zdCB7YnVpbGRTaW1wbGVHcmFwaCwgYnVpbGRWaXN1YWxSb2FkR3JhcGh9ID0gcmVxdWlyZShcIi4vZ3JhcGhcIik7XG5cblxuY29uc3Qgcm9hZHMgPSBbXG4gICAgXCJBbGljZSdzIEhvdXNlLUJvYidzIEhvdXNlXCIsICAgXCJBbGljZSdzIEhvdXNlLUNhYmluXCIsXG4gICAgXCJBbGljZSdzIEhvdXNlLVBvc3QgT2ZmaWNlXCIsICAgXCJCb2IncyBIb3VzZS1Ub3duIEhhbGxcIixcbiAgICBcIkRhcmlhJ3MgSG91c2UtRXJuaWUncyBIb3VzZVwiLCBcIkRhcmlhJ3MgSG91c2UtVG93biBIYWxsXCIsXG4gICAgXCJFcm5pZSdzIEhvdXNlLUdyZXRlJ3MgSG91c2VcIiwgXCJHcmV0ZSdzIEhvdXNlLUZhcm1cIixcbiAgICBcIkdyZXRlJ3MgSG91c2UtU2hvcFwiLCAgICAgICAgICBcIk1hcmtldHBsYWNlLUZhcm1cIixcbiAgICBcIk1hcmtldHBsYWNlLVBvc3QgT2ZmaWNlXCIsICAgICBcIk1hcmtldHBsYWNlLVNob3BcIixcbiAgICBcIk1hcmtldHBsYWNlLVRvd24gSGFsbFwiLCAgICAgICBcIlNob3AtVG93biBIYWxsXCJcbl07XG5tb2R1bGUuZXhwb3J0cy5yb2FkcyA9IHJvYWRzO1xuXG5jb25zdCBwbGFjZXMgPSBbXG4gICAgXCJBbGljZSdzIEhvdXNlLDcwLDIwXCIsIFwiQm9iJ3MgSG91c2UsODAsMzVcIiwgXCJDYWJpbiw4OCw1XCIsIFwiUG9zdCBPZmZpY2UsNDAsNVwiLFxuICAgIFwiVG93biBIYWxsLDUwLDM1XCIsIFwiRXJuaWUncyBIb3VzZSwxMiw0N1wiLCBcIkdyZXRlJ3MgSG91c2UsNSwzMFwiLFxuICAgIFwiRGFyaWEncyBIb3VzZSw0MCw0N1wiLCBcIkZhcm0sIDEwLDEwXCIsIFwiU2hvcCwyNSwzNVwiLCBcIk1hcmtldHBsYWNlLDM1LDIwXCJcbl07XG5tb2R1bGUuZXhwb3J0cy5wbGFjZXMgPSBwbGFjZXM7XG5cbmNvbnN0IHNpbXBsZVJvYWRHcmFwaCA9IGJ1aWxkU2ltcGxlR3JhcGgocm9hZHMpO1xubW9kdWxlLmV4cG9ydHMuc2ltcGxlUm9hZEdyYXBoID0gc2ltcGxlUm9hZEdyYXBoO1xuY29uc3QgdmlzdWFsUm9hZEdyYXBoID0gYnVpbGRWaXN1YWxSb2FkR3JhcGgocGxhY2VzLCByb2Fkcyk7XG5tb2R1bGUuZXhwb3J0cy52aXN1YWxSb2FkR3JhcGggPSB2aXN1YWxSb2FkR3JhcGg7XG4iLCJjb25zdCB7ZmluZFJvdXRlfSA9IHJlcXVpcmUoXCIuL2dyYXBoXCIpO1xuY29uc3Qge3JhbmRvbVBpY2t9ID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcblxuXG5jb25zdCByYW5kb21Sb2JvdCA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgcmV0dXJuIHtkaXJlY3Rpb246IHJhbmRvbVBpY2soc3RhdGUuZ3JhcGhbc3RhdGUucGxhY2VdLm5laWdoYm9ycyl9O1xufTtcbm1vZHVsZS5leHBvcnRzLnJhbmRvbVJvYm90ID0gcmFuZG9tUm9ib3Q7XG5cbmNvbnN0IHJvdXRlUm9ib3QgPSBmdW5jdGlvbihzdGF0ZSwgbWVtb3J5KSB7XG4gICAgY29uc3QgbWFpbFJvdXRlID0gW1xuICAgICAgICBcIkFsaWNlJ3MgSG91c2VcIiwgXCJDYWJpblwiLCBcIkFsaWNlJ3MgSG91c2VcIiwgXCJCb2IncyBIb3VzZVwiLFxuICAgICAgICBcIlRvd24gSGFsbFwiLCBcIkRhcmlhJ3MgSG91c2VcIiwgXCJFcm5pZSdzIEhvdXNlXCIsXG4gICAgICAgIFwiR3JldGUncyBIb3VzZVwiLCBcIlNob3BcIiwgXCJHcmV0ZSdzIEhvdXNlXCIsIFwiRmFybVwiLFxuICAgICAgICBcIk1hcmtldHBsYWNlXCIsIFwiUG9zdCBPZmZpY2VcIlxuICAgIF07XG4gICAgaWYgKG1lbW9yeS5sZW5ndGggPT0gMCkge1xuICAgIG1lbW9yeSA9IG1haWxSb3V0ZTtcbiAgICB9XG4gICAgcmV0dXJuIHtkaXJlY3Rpb246IG1lbW9yeVswXSwgbWVtb3J5OiBtZW1vcnkuc2xpY2UoMSl9O1xufTtcbm1vZHVsZS5leHBvcnRzLnJvdXRlUm9ib3QgPSByb3V0ZVJvYm90O1xuXG5jb25zdCBnb2FsT3JpZW50ZWRSb2JvdCA9IGZ1bmN0aW9uKHtncmFwaCwgcGxhY2UsIHBhcmNlbHN9LCByb3V0ZSkge1xuICAgIGlmIChyb3V0ZS5sZW5ndGggPT0gMCkge1xuICAgICAgICBsZXQgcGFyY2VsID0gcGFyY2Vsc1swXTtcbiAgICAgICAgaWYgKHBhcmNlbC5wbGFjZSAhPSBwbGFjZSkge1xuICAgICAgICAgICAgcm91dGUgPSBmaW5kUm91dGUoZ3JhcGgsIHBsYWNlLCBwYXJjZWwucGxhY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm91dGUgPSBmaW5kUm91dGUoZ3JhcGgsIHBsYWNlLCBwYXJjZWwuYWRkcmVzcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtkaXJlY3Rpb246IHJvdXRlWzBdLCBtZW1vcnk6IHJvdXRlLnNsaWNlKDEpfTtcbn07XG5tb2R1bGUuZXhwb3J0cy5nb2FsT3JpZW50ZWRSb2JvdCA9IGdvYWxPcmllbnRlZFJvYm90O1xuICAgIFxuZnVuY3Rpb24gZmluZE5lYXJlc3RQYXJjZWwoZ3JhcGgsIHBsYWNlLCBwYXJjZWxzKSB7XG4gICAgbGV0IG5lYXJlc3RQYXJjZWwgPSBwYXJjZWxzWzBdO1xuICAgIGxldCBzaG9ydGVzdFJvdXRlTGVuZ3RoID0gZmluZFJvdXRlKGdyYXBoLCBwbGFjZSwgbmVhcmVzdFBhcmNlbC5wbGFjZSkubGVuZ3RoO1xuICAgIHBhcmNlbHMuc2xpY2UoMSkubWFwKHAgPT4ge1xuICAgICAgICBsZXQgcm91dGVMZW5ndGggPSBmaW5kUm91dGUoZ3JhcGgsIHBsYWNlLCBwLnBsYWNlKS5sZW5ndGg7XG4gICAgLy8gICBjb25zb2xlLmxvZyhgUGxhY2UgJHtwLnBsYWNlfSBpcyAke3JvdXRlTGVuZ3RofSBtb3ZlcyBhd2F5IGZyb20gJHtwbGFjZX1gKTtcbiAgICAgICAgaWYgKHJvdXRlTGVuZ3RoIDwgc2hvcnRlc3RSb3V0ZUxlbmd0aCkge1xuICAgICAgICBzaG9ydGVzdFJvdXRlTGVuZ3RoID0gcm91dGVMZW5ndGhcbiAgICAgICAgbmVhcmVzdFBhcmNlbCA9IHA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhgJHtuZWFyZXN0UGFyY2VsLnBsYWNlfSBpcyBhIG5lYXJlc3QgcGFyY2VsYCk7XG4gICAgcmV0dXJuIG5lYXJlc3RQYXJjZWw7XG59O1xuXG5mdW5jdGlvbiBwYXJjZWxzQnlEaXN0YW5jZShncmFwaCwgcGxhY2UsIHBhcmNlbHMsIGFjdGlvbj1cInBpY2t1cFwiKSB7XG4gICAgbGV0IGF0dHIgPSBhY3Rpb24gPT0gXCJwaWNrdXBcIiA/IFwicGxhY2VcIiA6IFwiYWRkcmVzc1wiXG4gICAgbGV0IGJ5RGlzdGFuY2UgPSBwYXJjZWxzLm1hcChwID0+IHtcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gZmluZFJvdXRlKGdyYXBoLCBwbGFjZSwgcFthdHRyXSkubGVuZ3RoO1xuICAgICAgICByZXR1cm4ge3BsYWNlOiBwLnBsYWNlLCBhZGRyZXNzOiBwLmFkZHJlc3MsIGRpc3RhbmNlOiBkaXN0YW5jZX07XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZTtcbiAgICB9O1xuICAgIGJ5RGlzdGFuY2Uuc29ydChjb21wYXJlKTtcbiAgICByZXR1cm4gYnlEaXN0YW5jZTtcbn07XG5cbmNvbnN0IG5lYXJlc3RQaWNrdXBUaGVuRGVsaXZlcnlSb2JvdCA9IGZ1bmN0aW9uKHtncmFwaCwgcGxhY2UsIHBhcmNlbHN9LCByb3V0ZSkge1xuICAgIGlmIChyb3V0ZS5sZW5ndGggPT0gMCkge1xuICAgICAgICBsZXQgcGFyY2VsID0gZmluZE5lYXJlc3RQYXJjZWwoZ3JhcGgsIHBsYWNlLCBwYXJjZWxzKTtcbiAgICAgICAgaWYgKHBhcmNlbC5wbGFjZSAhPSBwbGFjZSkge1xuICAgICAgICAgICAgcm91dGUgPSBmaW5kUm91dGUoZ3JhcGgsIHBsYWNlLCBwYXJjZWwucGxhY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm91dGUgPSBmaW5kUm91dGUoZ3JhcGgsIHBsYWNlLCBwYXJjZWwuYWRkcmVzcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtkaXJlY3Rpb246IHJvdXRlWzBdLCBtZW1vcnk6IHJvdXRlLnNsaWNlKDEpfTtcbn07XG5tb2R1bGUuZXhwb3J0cy5uZWFyZXN0UGlja3VwVGhlbkRlbGl2ZXJ5Um9ib3QgPSBuZWFyZXN0UGlja3VwVGhlbkRlbGl2ZXJ5Um9ib3Q7XG5cbmNvbnN0IG5lYXJlc3RHb2FsUm9ib3QgPSBmdW5jdGlvbih7Z3JhcGgsIHBsYWNlLCBwYXJjZWxzfSwgcm91dGUpIHtcbiAgICBpZiAocm91dGUubGVuZ3RoID09IDApIHtcbiAgICAgICAgbGV0IHBCeVBpY2t1cERpc3RhbmNlID0gcGFyY2Vsc0J5RGlzdGFuY2UoZ3JhcGgsIHBsYWNlLCBwYXJjZWxzKTtcbiAgICAgICAgbGV0IG5lYXJlc3RQYXJjZWwgPSBwQnlQaWNrdXBEaXN0YW5jZVswXTtcbiAgICAgICAgaWYgKG5lYXJlc3RQYXJjZWwucGxhY2UgIT0gcGxhY2UpIHtcbiAgICAgICAgICAgIHJvdXRlID0gZmluZFJvdXRlKGdyYXBoLCBwbGFjZSwgbmVhcmVzdFBhcmNlbC5wbGFjZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcGlja2VkUGFyY2VscyA9IHBCeVBpY2t1cERpc3RhbmNlLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcC5wbGFjZSA9PSBwbGFjZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHVucGlja2VkUGFyY2VscyA9IHBCeVBpY2t1cERpc3RhbmNlLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcC5wbGFjZSAhPSBwbGFjZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHVucGlja2VkUGFyY2Vscy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBwQnlEZWxpdmVyeURpc3RhbmNlID0gcGFyY2Vsc0J5RGlzdGFuY2UoZ3JhcGgsIHBsYWNlLCBwaWNrZWRQYXJjZWxzLCBcImRlbGl2ZXJ5XCIpO1xuICAgICAgICAgICAgICAgIHJvdXRlID0gZmluZFJvdXRlKGdyYXBoLCBwbGFjZSwgcEJ5RGVsaXZlcnlEaXN0YW5jZVswXS5hZGRyZXNzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHBCeURlbGl2ZXJ5RGlzdGFuY2UgPSBwYXJjZWxzQnlEaXN0YW5jZShncmFwaCwgcGxhY2UsIHBpY2tlZFBhcmNlbHMsIFwiZGVsaXZlcnlcIik7XG4gICAgICAgICAgICAgICAgbGV0IGdvYWw7XG4gICAgICAgICAgICAgICAgaWYgKHBCeURlbGl2ZXJ5RGlzdGFuY2VbMF0uZGlzdGFuY2UgPD0gdW5waWNrZWRQYXJjZWxzWzBdLmRpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdvYWwgPSBwQnlEZWxpdmVyeURpc3RhbmNlWzBdLmFkZHJlc3M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ29hbCA9IHVucGlja2VkUGFyY2Vsc1swXS5wbGFjZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcm91dGUgPSBmaW5kUm91dGUoZ3JhcGgsIHBsYWNlLCBnb2FsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgYWN0aW9uID0ge2RpcmVjdGlvbjogcm91dGVbMF0sIG1lbW9yeTogcm91dGUuc2xpY2UoMSl9O1xuICAgIHJldHVybiBhY3Rpb247XG59O1xubW9kdWxlLmV4cG9ydHMubmVhcmVzdEdvYWxSb2JvdCA9IG5lYXJlc3RHb2FsUm9ib3Q7XG4iLCJjb25zdCB7cmFuZG9tUGlja30gPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpXG5cblxuY2xhc3MgVmlsbGFnZVN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihncmFwaCwgcGxhY2UsIHBhcmNlbHMpIHtcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuICAgICAgICB0aGlzLnBsYWNlID0gcGxhY2U7XG4gICAgICAgIHRoaXMucGFyY2VscyA9IHBhcmNlbHM7XG4gICAgfVxuXG4gICAgbW92ZShkZXN0aW5hdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMuZ3JhcGhbdGhpcy5wbGFjZV0ubmVpZ2hib3JzLmluY2x1ZGVzKGRlc3RpbmF0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcGFyY2VscyA9IHRoaXMucGFyY2Vscy5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHAucGxhY2UgIT0gdGhpcy5wbGFjZSkgcmV0dXJuIHA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtwbGFjZTogZGVzdGluYXRpb24sIGFkZHJlc3M6IHAuYWRkcmVzc307XG4gICAgICAgICAgICB9KS5maWx0ZXIocCA9PiBwLnBsYWNlICE9IHAuYWRkcmVzcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgVmlsbGFnZVN0YXRlKHRoaXMuZ3JhcGgsIGRlc3RpbmF0aW9uLCBwYXJjZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblZpbGxhZ2VTdGF0ZS5yYW5kb20gPSBmdW5jdGlvbihncmFwaCwgcGFyY2VsQ291bnQgPSA1KSB7XG4gICAgbGV0IHBhcmNlbHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmNlbENvdW50OyBpKyspIHtcbiAgICAgIGxldCBhZGRyZXNzID0gcmFuZG9tUGljayhPYmplY3Qua2V5cyhncmFwaCkpO1xuICAgICAgbGV0IHBsYWNlO1xuICAgICAgZG8ge1xuICAgICAgICBwbGFjZSA9IHJhbmRvbVBpY2soT2JqZWN0LmtleXMoZ3JhcGgpKTtcbiAgICAgIH0gd2hpbGUgKHBsYWNlID09IGFkZHJlc3MpO1xuICAgICAgcGFyY2Vscy5wdXNoKHtwbGFjZSwgYWRkcmVzc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFZpbGxhZ2VTdGF0ZShncmFwaCwgXCJQb3N0IE9mZmljZVwiLCBwYXJjZWxzKTtcbn07XG5cbmZ1bmN0aW9uIHJ1blJvYm90KHN0YXRlLCByb2JvdCwgbWVtb3J5KSB7XG4gICAgZm9yIChsZXQgdHVybiA9IDA7OyB0dXJuKyspIHtcbiAgICAgIGlmIChzdGF0ZS5wYXJjZWxzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHJldHVybiB0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IGFjdGlvbiA9IHJvYm90KHN0YXRlLCBtZW1vcnkpO1xuICAgICAgc3RhdGUgPSBzdGF0ZS5tb3ZlKGFjdGlvbi5kaXJlY3Rpb24pO1xuICAgICAgbWVtb3J5ID0gYWN0aW9uLm1lbW9yeTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5WaWxsYWdlU3RhdGUgPSBWaWxsYWdlU3RhdGU7XG5tb2R1bGUuZXhwb3J0cy5ydW5Sb2JvdCA9IHJ1blJvYm90O1xuIiwiY29uc3Qge3JvYWRzLCBwbGFjZXMsIHZpc3VhbFJvYWRHcmFwaH0gPSByZXF1aXJlKFwiLi9qcy9yb2Fkc1wiKTtcbmNvbnN0IHtWaWxsYWdlU3RhdGUsIHJ1blJvYm90fSA9IHJlcXVpcmUoXCIuL2pzL3N0YXRlXCIpO1xuY29uc3Qge3JhbmRvbVBpY2ssIGF2ZXJhZ2V9ID0gcmVxdWlyZShcIi4vanMvaGVscGVyc1wiKTtcbmNvbnN0IHtyYW5kb21Sb2JvdCwgXG4gICAgICAgcm91dGVSb2JvdCxcbiAgICAgICBnb2FsT3JpZW50ZWRSb2JvdCxcbiAgICAgICBuZWFyZXN0UGlja3VwVGhlbkRlbGl2ZXJ5Um9ib3QsXG4gICAgICAgbmVhcmVzdEdvYWxSb2JvdH0gPSByZXF1aXJlKFwiLi9qcy9yb2JvdHNcIik7XG5cbmNvbnN0IG1hcFNjYWxlID0gNjtcbmNvbnN0IGRpc3BsYXlXaWR0aCA9IDEwMDsgIC8vIHVuaXRzXG5jb25zdCBkaXNwbGF5SGVpZ2h0ID0gNjA7XG5jb25zdCBwbGFjZVNpemUgPSA3O1xuY29uc3Qgcm9ib3RTaXplID0gcGxhY2VTaXplICogMiAvIDM7XG5jb25zdCBwYXJjZWxTaXplID0gcGxhY2VTaXplIC8gMztcblxuXG5mdW5jdGlvbiBlbHQobmFtZSwgYXR0cmlidXRlcykge1xuICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbiAgICBpZiAoYXR0cmlidXRlcykge1xuICAgIGZvciAobGV0IGF0dHIgaW4gYXR0cmlidXRlcylcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoYXR0cikpXG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJpYnV0ZXNbYXR0cl0pO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaGlsZCA9IGFyZ3VtZW50c1tpXTtcbiAgICBpZiAodHlwZW9mIGNoaWxkID09IFwic3RyaW5nXCIpXG4gICAgICAgIGNoaWxkID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY2hpbGQpO1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn07XG5cbmZ1bmN0aW9uIGdldENvbnRleHQoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIikuZ2V0Q29udGV4dChcIjJkXCIpO1xufTtcblxuZnVuY3Rpb24gY2xlYXJEaXNwbGF5KGN0eCkge1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgc2NhbGVkKGRpc3BsYXlXaWR0aCksIHNjYWxlZChkaXNwbGF5SGVpZ2h0KSk7XG59O1xuXG5mdW5jdGlvbiBzY2FsZWQodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgKiBtYXBTY2FsZTtcbn07XG5cbmZ1bmN0aW9uIHJlYWxDb29yZHMoe3gsIHl9KSB7XG4gICAgcmV0dXJuIHt4OiBzY2FsZWQoeCksIHk6IHNjYWxlZCh5KX07XG59O1xuXG5mdW5jdGlvbiBzcXVhcmVDZW50ZXIobGVmdCwgdG9wLCBzaWRlKSB7XG4gICAgcmV0dXJuIHt4OiBsZWZ0ICsgc2lkZS8yLCB5OiB0b3AgKyBzaWRlLzJ9O1xufTtcblxuZnVuY3Rpb24gdGV4dFN0YXJ0SW5TcXVhcmUoeCwgeSwgc3F1YXJlU2lkZSkge1xuICAgIGxldCB0ZXh0WCA9IHggKyBzcXVhcmVTaWRlLzQsIHRleHRZID0geSArIHNxdWFyZVNpZGUqMy80O1xuICAgIHJldHVybiB7eDogdGV4dFgsIHk6IHRleHRZfTtcbn07XG5cbmZ1bmN0aW9uIHRleHRTZXR0aW5ncyhzaXplLCBmYW1pbHk9XCJBcmlhbFwiKSB7XG4gICAgcmV0dXJuIGAke3NpemUvMn1wdCAke2ZhbWlseX1gO1xufVxuXG5mdW5jdGlvbiBwbGFjZUJvdHRvbUxlZnQobmFtZSwgZ3JhcGgpIHtcbiAgICBsZXQgdG9wTGVmdCA9IHJlYWxDb29yZHMoZ3JhcGhbbmFtZV0pO1xuICAgIHJldHVybiB7eDogdG9wTGVmdC54LCB5OiB0b3BMZWZ0LnkgKyBzY2FsZWQocGxhY2VTaXplKX07XG59O1xuXG5mdW5jdGlvbiByb2JvdFRvcExlZnQoc3RhdGUpIHtcbiAgICBsZXQgcGxhY2VUb3BMZWZ0ID0gcmVhbENvb3JkcyhzdGF0ZS5ncmFwaFtzdGF0ZS5wbGFjZV0pO1xuICAgIGxldCByb2JvdExlZnQgPSBwbGFjZVRvcExlZnQueCArIHNjYWxlZChwbGFjZVNpemUvMik7XG4gICAgbGV0IHJvYm90VG9wID0gcGxhY2VUb3BMZWZ0LnkgKyBzY2FsZWQocGxhY2VTaXplKTtcbiAgICByZXR1cm4ge3g6IHJvYm90TGVmdCwgeTogcm9ib3RUb3B9O1xufTtcblxuZnVuY3Rpb24gcm9ib3RCb3R0b21SaWdodChzdGF0ZSkge1xuICAgIGxldCB0b3BMZWZ0ID0gcm9ib3RUb3BMZWZ0KHN0YXRlKTsgXG4gICAgcmV0dXJuIHt4OiB0b3BMZWZ0LnggKyBzY2FsZWQocm9ib3RTaXplKSwgeTogdG9wTGVmdC55ICsgc2NhbGVkKHJvYm90U2l6ZSl9O1xufTtcblxuZnVuY3Rpb24gZHJhd1ZpbGxhZ2VNYXAoZ3JhcGgpIHtcbiAgICBsZXQgY3R4ID0gZ2V0Q29udGV4dCgpO1xuICAgIGZvciAobGV0IG5hbWUgb2YgT2JqZWN0LmtleXMoZ3JhcGgpKSB7XG4gICAgICAgIGxldCBwbGFjZSA9IGdyYXBoW25hbWVdO1xuICAgICAgICBsZXQge3gsIHl9ID0gcmVhbENvb3JkcyhwbGFjZSk7XG4gICAgICAgIGxldCBwU2l6ZSA9IHNjYWxlZChwbGFjZVNpemUpO1xuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5KTtcbiAgICAgICAgY3R4LnN0cm9rZVJlY3QoeCwgeSwgcFNpemUsIHBTaXplKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3R4LmZvbnQgPSB0ZXh0U2V0dGluZ3MocFNpemUpO1xuICAgICAgICBsZXQgdGV4dFN0YXJ0ID0gdGV4dFN0YXJ0SW5TcXVhcmUoeCwgeSwgcFNpemUpO1xuICAgICAgICBjdHguZmlsbFRleHQobmFtZVswXSwgdGV4dFN0YXJ0LngsIHRleHRTdGFydC55KTtcblxuICAgICAgICBsZXQgcGxhY2VDZW50ZXIgPSBzcXVhcmVDZW50ZXIoeCwgeSwgcFNpemUpO1xuICAgICAgICBwbGFjZS5uZWlnaGJvcnMuZm9yRWFjaChuID0+IHtcbiAgICAgICAgICAgIGxldCBuQ29vcmRzID0gcmVhbENvb3JkcyhncmFwaFtuXSlcbiAgICAgICAgICAgIGxldCBuQ2VudGVyID0gc3F1YXJlQ2VudGVyKG5Db29yZHMueCwgbkNvb3Jkcy55LCBwU2l6ZSk7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhwbGFjZUNlbnRlci54LCBwbGFjZUNlbnRlci55KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8obkNlbnRlci54LCBuQ2VudGVyLnkpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBkcmF3Um9ib3Qoc3RhdGUpIHtcbiAgICBsZXQge3gsIHl9ID0gcm9ib3RUb3BMZWZ0KHN0YXRlKTtcbiAgICBsZXQgdGV4dFN0YXJ0ID0gdGV4dFN0YXJ0SW5TcXVhcmUoeCwgeSwgc2NhbGVkKHJvYm90U2l6ZSkpO1xuXG4gICAgbGV0IGN0eCA9IGdldENvbnRleHQoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVJlY3QoeCwgeSwgc2NhbGVkKHJvYm90U2l6ZSksIHNjYWxlZChyb2JvdFNpemUpKTtcbiAgICBjdHguZm9udCA9IHRleHRTZXR0aW5ncyhzY2FsZWQocm9ib3RTaXplKSk7XG4gICAgY3R4LmZpbGxUZXh0KFwiUlwiLCB0ZXh0U3RhcnQueCwgdGV4dFN0YXJ0LnkpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdQYXJjZWxzKHN0YXRlKSB7XG4gICAgbGV0IGJ5UGxhY2UgPSB7fTtcbiAgICBzdGF0ZS5wYXJjZWxzLmZvckVhY2gocCA9PiB7XG4gICAgICAgIGxldCBwbGFjZSA9IHAucGxhY2UgPT0gc3RhdGUucGxhY2UgPyBcIlJvYm90XCIgOiBwLnBsYWNlO1xuICAgICAgICBpZiAoYnlQbGFjZVtwbGFjZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgYnlQbGFjZVtwbGFjZV0gPSBbcC5hZGRyZXNzWzBdXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ5UGxhY2VbcGxhY2VdLnB1c2gocC5hZGRyZXNzWzBdKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGxldCBjdHggPSBnZXRDb250ZXh0KCk7XG4gICAgbGV0IHBTaXplID0gc2NhbGVkKHBhcmNlbFNpemUpO1xuICAgIGZvciAobGV0IHBhcmNlbFBsYWNlIG9mIE9iamVjdC5rZXlzKGJ5UGxhY2UpKSB7XG4gICAgICAgIGxldCBwYXJjZWxzUGlsZVN0YXJ0LCB4LCB5O1xuICAgICAgICBpZiAocGFyY2VsUGxhY2UgPT0gXCJSb2JvdFwiKSB7XG4gICAgICAgICAgICBwYXJjZWxzUGlsZVN0YXJ0ID0gcm9ib3RCb3R0b21SaWdodChzdGF0ZSk7XG4gICAgICAgICAgICB4ID0gcGFyY2Vsc1BpbGVTdGFydC54ICsgcFNpemUgLyAzO1xuICAgICAgICAgICAgeSA9IHBhcmNlbHNQaWxlU3RhcnQueSAtIHBTaXplO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyY2Vsc1BpbGVTdGFydCA9IHBsYWNlQm90dG9tTGVmdChwYXJjZWxQbGFjZSwgc3RhdGUuZ3JhcGgpO1xuICAgICAgICAgICAgeCA9IHBhcmNlbHNQaWxlU3RhcnQueCAtIHBTaXplICogNC8zO1xuICAgICAgICAgICAgeSA9IHBhcmNlbHNQaWxlU3RhcnQueSAtIHBTaXplO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBieVBsYWNlW3BhcmNlbFBsYWNlXS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVJlY3QoeCwgeSwgcFNpemUsIHBTaXplKTtcbiAgICAgICAgICAgIGxldCB0ZXh0U3RhcnQgPSB0ZXh0U3RhcnRJblNxdWFyZSh4LCB5LCBwU2l6ZSk7XG4gICAgICAgICAgICBjdHguZm9udCA9IHRleHRTZXR0aW5ncyhwU2l6ZSk7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQoaXRlbSwgdGV4dFN0YXJ0LngsIHRleHRTdGFydC55KTtcbiAgICAgICAgICAgIHkgLT0gcFNpemU7XG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGRyYXdBbGwoY3R4LCBzdGF0ZSwgdHVybikge1xuICAgIGNsZWFyRGlzcGxheShjdHgpO1xuICAgIGRyYXdWaWxsYWdlTWFwKHN0YXRlLmdyYXBoKTtcbiAgICBkcmF3Um9ib3Qoc3RhdGUpO1xuICAgIGRyYXdQYXJjZWxzKHN0YXRlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInR1cm5cIikuaW5uZXJIVE1MID0gdHVybjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYWNlXCIpLmlubmVySFRNTCA9IHN0YXRlLnBsYWNlO1xufTtcblxuZnVuY3Rpb24gZGlzYWJsZUNvbnRyb2xzKCkge1xuICAgIGZvciAobGV0IGlkIG9mIFtcInJvYm90c1wiLCBcInN0YXJ0XCIsIFwiaW5wdXQtcm9ib3Qtc3BlZWRcIl0pIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBlbmFibGVDb250cm9scygpIHtcbiAgICBmb3IgKGxldCBpZCBvZiBbXCJyb2JvdHNcIiwgXCJzdGFydFwiLCBcImlucHV0LXJvYm90LXNwZWVkXCJdKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIHJ1blJvYm90QW5pbWF0aW9uKHN0YXRlLCByb2JvdCwgbWVtb3J5KSB7XG4gICAgZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICB0dXJuKys7XG4gICAgICAgIGxldCBhY3Rpb24gPSByb2JvdChzdGF0ZSwgbWVtb3J5KTtcbiAgICAgICAgc3RhdGUgPSBzdGF0ZS5tb3ZlKGFjdGlvbi5kaXJlY3Rpb24pO1xuICAgICAgICBkcmF3QWxsKGN0eCwgc3RhdGUsIHR1cm4pO1xuICAgICAgICBpZiAoc3RhdGUucGFyY2Vscy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgcmV0dXJuIHR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbWVtb3J5ID0gYWN0aW9uLm1lbW9yeTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICBlbmFibGVDb250cm9scygpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN0b3ApO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN0b3ApO1xuICAgIGRpc2FibGVDb250cm9scygpO1xuICAgIGxldCB0dXJuID0gMDtcbiAgICBsZXQgY3R4ID0gZ2V0Q29udGV4dCgpO1xuICAgIGRyYXdBbGwoY3R4LCBzdGF0ZSwgdHVybik7XG4gICAgbGV0IHNwZWVkID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnB1dC1yb2JvdC1zcGVlZFwiKS52YWx1ZSk7XG4gICAgbGV0IGludGVydmFsID0gc2V0SW50ZXJ2YWwocnVuLCAxMDAwL3NwZWVkKTtcbn07XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICBsZXQgZGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XG4gICAgZGlzcGxheS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBzY2FsZWQoZGlzcGxheVdpZHRoKSk7XG4gICAgZGlzcGxheS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgc2NhbGVkKGRpc3BsYXlIZWlnaHQpKTtcblxuICAgIGxldCBzdGF0ZSA9IFZpbGxhZ2VTdGF0ZS5yYW5kb20odmlzdWFsUm9hZEdyYXBoKTtcbiAgICBkcmF3VmlsbGFnZU1hcChzdGF0ZS5ncmFwaCk7XG5cbiAgICBsZXQgcm9ib3RzID0ge1xuICAgICAgICBcIkNob29zZS4uLlwiOiBudWxsLFxuICAgICAgICBcIlJvdXRlXCI6IHJvdXRlUm9ib3QsXG4gICAgICAgIFwiUmFuZG9tXCI6IHJhbmRvbVJvYm90LFxuICAgICAgICBcIkdvYWwtT3JpZW50ZWRcIjogZ29hbE9yaWVudGVkUm9ib3QsXG4gICAgICAgIFwiTmVhcmVzdC1QaWNrdXAtVGhlbi1EZWxpdmVyeVwiOiBuZWFyZXN0UGlja3VwVGhlbkRlbGl2ZXJ5Um9ib3QsXG4gICAgICAgIFwiQWx3YXlzLU5lYXJlc3QtR29hbFwiOiBuZWFyZXN0R29hbFJvYm90XG4gICAgfVxuICAgIGxldCBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvYm90c1wiKTtcbiAgICBmb3IgKGxldCByb2JvdCBpbiByb2JvdHMpIHtcbiAgICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKGVsdChcIm9wdGlvblwiLCBudWxsLCByb2JvdCkpO1xuICAgIH1cblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgaWYgKHJvYm90c1tzZWxlY3QudmFsdWVdICE9PSBudWxsKSB7XG4gICAgICAgICAgICBydW5Sb2JvdEFuaW1hdGlvbihzdGF0ZSwgcm9ib3RzW3NlbGVjdC52YWx1ZV0sIFtdKTtcbiAgICAgICAgfVxuICAgIH0pOyAgICAgICAgICAgICAgICAgICBcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbnB1dC1yb2JvdC1zcGVlZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGUpID0+IHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyb2JvdC1zcGVlZC12YWx1ZVwiKS5pbm5lckhUTUwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICB9KTtcbn0pO1xuIl19
