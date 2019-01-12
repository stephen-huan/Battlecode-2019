import {
  BCAbstractRobot,
  SPECS
} from 'battlecode';
var step = -1;
//variables maintained by each castle
var flocations = [] //flocations is fuel locations of [[x1,y1],...]
var klocations = [] //klocations is karbonite locations with same format as flocations
var castlelist = [] //castelist is a list of all castles on same team (self included), format [[id1,x1,y1],...]
//crusader variables
var goal_x //current x destination
var goal_y //curent y destination
class MyRobot extends BCAbstractRobot {
  turn() {
    step++;
    var map = this.getPassableMap();
    var kmap = this.getKarboniteMap();
    var fmap = this.getFuelMap();
    var church_x = null;
    var church_y = null;
    if (this.me.unit === SPECS.CRUSADER) {
      //this.log("heading towards "+goal_x+','+goal_y)
      if (step == 0) {
        var castle_robot = this.getVisibleRobotMap()[this.me.y][this.me.x - 1]
        var transmission = this.getRobot(castle_robot).signal
        //this.log("received transmission " + transmission)
        goal_y = transmission % 100
        goal_x = Math.floor((transmission - goal_y) / 100)
        //this.log('set coordinates '+goal_x+','+goal_y)
      }

      if (this.me.x == goal_x && this.me.y == goal_y)
        return
      //this.log("CRUSADER");
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
      return this.choose_move(goal_x, goal_y, choices)
    } else if (this.me.unit === SPECS.CASTLE) {
      if (step == 0) {
        var robotlist = this.getVisibleRobots()
        for (var i = 0; i < robotlist.length; i++)
          castlelist.push([robotlist[i].id, -1, -1])
        //initialize maps of karbonite
        var fmap = this.fuel_map
        var kmap = this.karbonite_map
        var roboCount = 0
        for (var y = 0; y < fmap.length; y++) {
          for (var x = 0; x < fmap.length; x++) {
            if (fmap[y][x])
              flocations.push([x, y])
            if (kmap[y][x])
              klocations.push([x, y])
          }
        }
        this.castleTalk(this.me.x + 100)
        this.log("Broadcasted x-coordinate " + this.me.x)
      }
      if (step <= 3) {
        for (var i = 0; i < castlelist.length; i++) {
          var otherCastle = this.getRobot(castlelist[i][0])
          var val = otherCastle.castle_talk
          if (val != 0) {
            this.log("Received transmission from castle " + otherCastle.id)
            if (castlelist[i][1] == -1) {
              castlelist[i][1] = val - 100
              this.log("Logged castle " + otherCastle.id + "'s x-coord as " + (val - 100))
            } else if (castlelist[i][2] == -1) {
              castlelist[i][2] = val - 100
              this.log("Logged castle " + otherCastle.id + "'s y-coord as " + (val - 100))
            }
          }
        }
      }
      if (step == 1) {
        this.castleTalk(this.me.y + 100)
        this.log("Broadcasted y-coordinate " + this.me.y)
      }
      //find other castles


      //this.log("CASTLE");
      //remove from floc is code 0b111
      //remove from kloc is code 0b101
      for (var i = 0; i < castlelist.length; i++)
        if (this.getRobot(castlelist[i][0]).castle_talk == 0b111)
          flocations.splice(flocations.length - 1)
      else if (this.getRobot(castlelist[i][0]).castle_talk == 0b101)
        klocations.splice(klocations.length - 1)
      this.log(castlelist)
      //this.log(castlelist)
      //this.log("FUEL")
      //this.log(flocations)
      //this.log("KARBONITE")
      //this.log(klocations)
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
      //only start to build on turn 1, otherwise can't identify castles
      /*
      if (step>1 && (step-2) % 10 === 0 && this.karbonite>=20 && this.fuel>=50) {
        //this.log("Building a crusader at " + (this.me.x + 1) + ", " + (this.me.y + 0));
        if (klocations.length==0 && flocations.length==0)
          return
        var coords
        var isKarbonite=true
        if(klocations.length>0)
          coords = klocations.splice(klocations.length-1)
        else {
          coords = flocations.splice(flocations.length-1)
          isKarbonite=false
        }
        var x_pos = coords[0][0]
        var y_pos = coords[0][1]
        var val = x_pos*100 + y_pos
        this.signal(val,1)
        if(isKarbonite)
          this.castleTalk(0b101)
        else
          this.castleTalk(0b111)
        return this.buildUnit(SPECS.CRUSADER, 1, 0);
      }
      */

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
