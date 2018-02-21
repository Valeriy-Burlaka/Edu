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
