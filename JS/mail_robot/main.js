const {roads, places, visualRoadGraph} = require("./js/roads");
const {VillageState, runRobot} = require("./js/state");
const {randomPick, average} = require("./js/helpers");
const {randomRobot, 
       routeRobot,
       goalOrientedRobot,
       nearestPickupThenDeliveryRobot,
       nearestGoalRobot} = require("./js/robots");

const mapScale = 5;
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
    return document.getElementById("display").getContext("2d");
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

    let ctx = document.getElementById("display").getContext("2d");
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
    for (let id of ["robots", "start", "robot-speed"]) {
        document.getElementById(id).disabled = true;
    }
};

function enableControls() {
    for (let id of ["robots", "start", "robot-speed"]) {
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
    let speed = parseInt(document.getElementById("robot-speed").value);
    let interval = setInterval(run, 1000/speed);
};

document.addEventListener("DOMContentLoaded", () => {
    let main = document.getElementById("main");

    let display = document.getElementById("display");
    display.setAttribute("width", displayWidth * mapScale);
    display.setAttribute("height", displayHeight * mapScale);
    display.style.border = "2px solid lightgray";

    let state = VillageState.random(visualRoadGraph);
    drawVillageMap(state.graph);

    let robots = {
        "Route Robot": routeRobot,
        "Random Robot": randomRobot,
        "Goal-Oriented Robot": goalOrientedRobot,
        "Nearest-Pickup-Then-Delivery Robot": nearestPickupThenDeliveryRobot,
        "Always-Nearest-Goal Robot": nearestGoalRobot
    }
    let select = document.getElementById("robots");
    for (let robot in robots) {
        select.appendChild(elt("option", null, robot));
    }

    document.getElementById("start").addEventListener("click", () => {
        runRobotAnimation(state, robots[select.value], []);
    });
                    
});
