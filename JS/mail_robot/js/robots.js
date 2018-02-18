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
