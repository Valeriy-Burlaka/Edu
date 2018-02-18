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
