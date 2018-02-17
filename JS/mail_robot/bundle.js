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
    "Alice's House,70,20", "Bob's House,80,35", "Cabin,90,5", "Post Office,40,5",
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
    disableControls();
    let turn = 0;
    let ctx = getContext();
    drawAll(ctx, state, turn);

    function run() {
        turn++;
        let action = robot(state, memory);
        state = state.move(action.direction);
        drawAll(ctx, state, turn);
        if (state.parcels.length == 0) {
            clearInterval(interval);
            enableControls();
            return turn;
        }
        memory = action.memory;
    };
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
        // console.log(e);
        // console.log(e.target);
        // console.log(e.target.value, robots[e.target.value]);
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

},{"./js/helpers":2,"./js/roads":3,"./js/robots":4,"./js/state":5}]},{},[6]);
