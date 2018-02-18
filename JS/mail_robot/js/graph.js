
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