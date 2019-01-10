import {
  BCAbstractRobot,
  SPECS
} from 'battlecode';
var step = -1;
//castle variables
var flocations = []
var klocations = []
class MyRobot extends BCAbstractRobot {
  turn() {
    step++;
    var map = this.getPassableMap();
    var goal_x = null;
    var goal_y = null;
    var kmap = this.getKarboniteMap();
    var fmap = this.getFuelMap();
    var church_x = null;
    var church_y = null;
    if (this.me.unit === SPECS.CRUSADER) {
      // this.log("Crusader health: " + this.me.health);
      if (this.me.x == 0 && this.me.y == 0)
        return
      this.log("CRUSADER");
      const choices = [
        [-2, -2],
        [-2, -1],
        [-2, 0],
        [-2, 1],
        [-2, 2],
        [-1, -2],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [-1, 2],
        [0, -2],
        [0, -1],
        [0, 1],
        [0, 2],
        [1, -2],
        [1, -1],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, -2],
        [2, -1],
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 0],
        [0, 3],
        [-3, 0],
        [0, -3]
      ]
      //Note: just a basic test, only navigates to top left corner atm
      const goal_x = 0
      const goal_y = 0
      return this.choose_move(goal_x, goal_y, choices)
    } else if (this.me.unit === SPECS.CASTLE) {
      if (step == 0) {
        var fmap = this.fuel_map
        var kmap = this.karbonite_map
        //this.log(fmap)
        //this.log(kmap)
        for (var y = 0; y < fmap.length; y++) {
          for (var x = 0; x < fmap.length; x++) {
            if (fmap[y][x])
              flocations.push([x, y])
            if (kmap[y][x])
              klocations.push([x, y])
          }
        }
        this.log("Fuel Locations " + flocations)
        this.log("Karbonite Locations " + klocations)
      }
      this.log("CASTLE");
      /*
      if (step < 5) {
         var dx = 1
         var dy = 1
         if (!this.map[this.me.x + 1][this.me.y + 1]) {
            this.log("Building a pilgrim at " + (this.me.x + 1) + ", " + (this.me.y + 1));
         } else if (!this.map[this.me.x - 1][this.me.y - 1]) {
            this.log("Building a pilgrim at " + (this.me.x - 1) + ", " + (this.me.y - 1));
            dx = -1;
            dy = -1;
         } else if (!this.map[this.me.x - 1][this.me.y + 1]) {
            this.log("Building a pilgrim at " + (this.me.x - 1) + ", " + (this.me.y + 1));
            dx = -1;
            dy = 1;
         } else if (!this.map[this.me.x + 1][this.me.y - 1]) {
            this.log("Building a pilgrim at " + (this.me.x + 1) + ", " + (this.me.y - 1));
            dx = 1;
            dy = -1;
         }
         return this.buildUnit(SPECS.PILGRIM, dx, dy);
         */
      if (step % 10 === 0) {
        this.log("Building a crusader at " + (this.me.x + 1) + ", " + (this.me.y + 1));
        //var coords =
        //  this.signal()
        return this.buildUnit(SPECS.CRUSADER, 1, 1);
      } else {
        return // this.log("Castle health: " + this.me.health);
      }

    } else if (this.me.unit === SPECS.PILGRIM) {

      const choices = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2]
      ]

      if (this.me.turn === 1) {
        this.log("Setting home coords at " + this.me.x + ", " + this.me.y);
        church_x = this.me.x;
        church_y = this.me.y;
      }
      if (this.me.karbonite === 20 || this.me.fuel === 100) {
        this.log("full of resources");
        var vis = this.getVisibleRobots();
        for (var i = 0; i < vis.length; i++) {
          this.log("inside for loop");
          var bot = vis[i];
          if (bot.unit === 0 || bot.unit === 1) {
            this.log("Checking distance");
            if (Math.abs(bot.x - this.me.x) < 1 && Math.abs(bot.y - this.me.y) < 1) {
              this.log("trying to give");
              this.give(bot.x - this.me.x, bot.y - this.me.y, this.me.karbonite, this.me.fuel);
              goal_x = null;
              goal_y = null;
            }
          }
        }
        goal_x = church_x;
        goal_y = church_y;
      } else if (kmap[this.me.y][this.me.x] === true) {
        this.log("MINING at " + this.me.x + ", " + this.me.y + " and " + kmap[this.me.y][this.me.x]);
        return this.mine();
      }
      if (goal_x == null) {
        var maxdist = 10000;
        for (var i = 0; i < kmap.length; i++) {
          for (var j = 0; j < kmap.length; j++) {
            if (kmap[j][i]) {
              var d = Math.abs(Math.hypot(i - this.me.x, j - this.me.y));
              if (d < maxdist) {
                goal_x = i;
                goal_y = j;
              }
            }
          }
        }
      }
      this.log("PILGRIM at " + this.me.x + ", " + this.me.y);
      return this.choose_move(goal_x, goal_y, choices);

    }
  }
  get_dist(x1, y1, x2, y2) {
    return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5)
  }
  choose_move(goal_x, goal_y, choices) {
    var min_dist = 999999
    var best_move = [0, 0]
    for (var i = 0; i < choices.length; i++) {
      var x1 = this.me.x + choices[i][0]
      var y1 = this.me.y + choices[i][1]
      if (x1 < 0 || y1 < 0 || y1 >= this.map.length || x1 >= this.map.length)
        continue
      if (!this.map[y1][x1])
        continue
      if (this.getVisibleRobotMap()[y1][x1] > 0)
        continue
      var dist = Math.pow(Math.pow(goal_x - x1, 2) + Math.pow(goal_y - y1, 2), 0.5)
      if (dist < min_dist) {
        min_dist = dist
        best_move = choices[i]
      }
    }
    if (min_dist == 999999) {
      return
    }
    return this.move(...best_move);
  }
}

var robot = new MyRobot();
