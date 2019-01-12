import {
  BCAbstractRobot,
  SPECS
} from 'battlecode';
//some general global vars
var step = -1;
var r2choices = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
]
var r4choices = [
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
var r9choices = [
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
//variables maintained by each castle
var flocations = [] //flocations is fuel locations of [[x1,y1],...]
var klocations = [] //klocations is karbonite locations with same format as flocations
var castlelist = [] //castelist is a list of all castles on same team (self included), format [[id1,x1,y1],...]
//crusader variables
var goal_x //current x destination
var goal_y //curent y destination
var known_robots //list of all robots that have been seen by the crusader
//hardcoded values for castle_talk transmission
var removeFuel = 0b111 //value for a castle to remove a deposit from it's list of unvisited deposits
var removeKarbonite = 0b101 //same as removeFuel but for Karbonite
class MyRobot extends BCAbstractRobot {
  turn() {
    step++;
    var map = this.getPassableMap();
    var kmap = this.getKarboniteMap();
    var fmap = this.getFuelMap();
    if (this.me.unit === SPECS.CRUSADER) {
      return
      //check if at goal
      if (this.me.x == goal_x && this.me.y == goal_y)
        return
      //otherwise, move towards goal
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
      if (step == 1) {
        this.castleTalk(this.me.y + 100)
        this.log("Broadcasted y-coordinate " + this.me.y)
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
      //code to check for transmission from friendly castles
      for (var i = 0; i < castlelist.length; i++)
        if (this.getRobot(castlelist[i][0]).castle_talk == removeFuel)
          flocations.splice(flocations.length - 1)
      else if (this.getRobot(castlelist[i][0]).castle_talk == removeKarbonite)
        klocations.splice(klocations.length - 1)

      if (step > 2 && this.fuel >= 50 && this.karbonite >= 20) {
        //this.log("length is "+r2choices.length)
        var location = this.choose_spawn(this, r2choices)
        if (location != undefined) {
          this.log('location is ' + location)
          var x = location[0]
          var y = location[1]
          this.log('Building crusader at '+(x+this.me.x)+','+(y+this.me.y))
          return this.buildUnit(SPECS.CRUSADER, x, y)
          return
        }
        else
          this.log("no spawn locations available")
      }

    } else if (this.me.unit === SPECS.PILGRIM) {

    }
  }
  get_dist(x1, y1, x2, y2) {
    return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5)
  }
  coords_from_transmit(robot) {
    //TODO: Fix to search for castle
    var castle_robot = this.getVisibleRobotMap()[this.me.y][this.me.x - 1]
    var transmission = this.getRobot(castle_robot).signal
    goal_y = transmission % 100
    goal_x = Math.floor((transmission - goal_y) / 100)
  }

  choose_spawn(robot, choices) {
    //this.log("now length is "+choices.length)
    var obstacles = this.map
    var x1 = robot.me.x
    var y1 = robot.me.y
    //this.log('pass 1')
    for (var val = 0; val < choices.length; val++) {
      //this.log('pass 2')
      //this.log(choices[val])
      var xPos = choices[val][0]
      var yPos = choices[val][1]
      //this.log(xPos + ' ' + yPos)
      if (this.map[y1 + yPos][x1 + xPos] && this.getVisibleRobotMap()[yPos + y1][xPos + x1] <= 0)
        return choices[val]
      else
        this.log("Spawn position "+(x1+xPos)+','+(y1+yPos)+' is occupied')
    }
  }
  choose_move(goal_x, goal_y, choices) {
    var min_dist = Infinity
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
    if (min_dist == Infinity)
      return
    else
      return this.move(...best_move);
  }
}


var robot = new MyRobot();
