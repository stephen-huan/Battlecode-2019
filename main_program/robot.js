import {
  BCAbstractRobot,
  SPECS
} from 'battlecode';
//some general global vars
var pMax = 5
var step = -1;
var home_x
var home_y
var r1choices = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
]
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
var myself //need to make `this` a global var in order for sort to work
var pcount = 0 //total number of pilgrims
var kdest = 0 //total num of pilgrims headed to karbonite
var fdest = 0 //total num of pilgrims headed to fuel
//crusader variables
var goal_x //current x destination
var goal_y //curent y destination
var deposit_x //assigned deposit x
var deposit_y //assigned deposit y
var known_robots = [] //list of all robots that have been seen by the crusader
//PILGRIM
var fullK = false
var fullF = false
var home_ID
var dX
var dY
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
      //################################################
      //################################################
      //################################################
      //################################################
      //##################CRUSADER CODE#################
      //################################################
      //################################################
      //################################################
      //################################################
      return
      //check if at goal
      if (this.me.x == goal_x && this.me.y == goal_y)
        return
      //otherwise, move towards goal

      return this.choose_move(goal_x, goal_y, choices)

    } else if (this.me.unit === SPECS.CASTLE) {
      //################################################
      //################################################
      //################################################
      //################################################
      //##################CASTLE CODE###################
      //################################################
      //################################################
      //################################################
      //################################################
      this.log("Start CASTLE TURN")
      if (step == 0) {
        var t0 = (new Date).getTime()
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
        home_x = this.me.x
        home_y = this.me.y
        myself = this
        this.log(klocations)
        klocations.sort(this.sort_func)
        this.log(klocations)
        //sort resource locations

        this.castleTalk(this.me.x + 100)
        this.log("Broadcasted x-coordinate " + this.me.x)
        this.log((new Date).getTime() - t0)
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

      //check if their are available fuel spots
      var hasFuel = flocations.length > 0
      var hasKarbonite = klocations.length > 0
      if (pcount < pMax && step > 2 && this.fuel >= 50 && this.karbonite >= 20 && (hasFuel || hasKarbonite)) {
        var location = this.choose_spawn(this, r1choices)
        if (location != undefined) {
          this.log('location is ' + location)
          var x = location[0]
          var y = location[1]
          this.log('Building pilgrim at ' + (x + this.me.x) + ',' + (y + this.me.y))
          if (hasKarbonite && !hasFuel)
            var goal_coords = klocations.splice(klocations.length - 1)
          else if (!hasKarbonite && hasFuel)
            var goal_coords = flocations.splice(flocations.length - 1)
          else if (kdest > fdest) {
            var goal_coords = flocations.splice(flocations.length - 1)
            this.log("SENDING TO FUEL")
            fdest++
          } else {
            var goal_coords = klocations.splice(klocations.length - 1)
            this.log("SENDING TO KARBONITE")
            kdest++
          }

          this.log('goal coords is ' + goal_coords)
          var val = goal_coords[0][0] * 100 + goal_coords[0][1]
          this.signal(val, 2)
          pcount++
          return this.buildUnit(SPECS.PILGRIM, x, y)
        } else
          this.log("no spawn locations available")
      }

    } else if (this.me.unit === SPECS.PILGRIM) {
      //################################################
      //################################################
      //################################################
      //################################################
      //##################PILGRIM CODE##################
      //################################################
      //################################################
      //################################################
      //################################################
      this.log("Start PILGRIM TURN")
      if (step == 0) {
        this.set_home(this.me.x, this.me.y)
        this.set_goal()
      }
      if (this.me.x == goal_x && this.me.y == goal_y) {
        if (fullK || fullF) {
          this.log("depositing resource to [" + (this.me.x + dX) + ',' + (this.me.y + dY) + ']')
          this.log(this.me.karbonite + ',' + this.me.fuel)
          fullK = false
          fullF = false
          //make them go back to get resources
          goal_x = deposit_x
          goal_y = deposit_y
          return this.give(dX, dY, this.me.karbonite, this.me.fuel)
        }
        if (this.me.fuel >= 100) {
          this.log("Full of fuel, heading home")
          goal_x = home_x
          goal_y = home_y
          fullF = true
        } else if (this.me.karbonite >= 20) {
          this.log("Full of karbonite, heading home")
          goal_x = home_x
          goal_y = home_y
          fullK = true
        } else {
          this.log("Harvesting resource.")
          return this.mine()
        }
      }
      var d = {}
      var t0 = (new Date).getTime()
      var isPath = this.gen_all_moves(d)
      if(isPath) {
        var nextLoc = d[this.me.x*100+this.me.y]
        this.log(nextLoc)
        var newX = Math.floor(nextLoc/100)
        var newY = nextLoc%100
        return this.move(...[newX-this.me.x,newY-this.me.y])
      }
      else
        this.log('could not bfs location')
      var t1 = (new Date).getTime()
      this.log(isPath + ' ' +(t1-t0))
      for (var i = 0; i < 100; i++)
        return this.choose_move(goal_x, goal_y, r4choices)
    }
  }
  sort_func(depositA, depositB) {
    var x1 = depositA[0]
    var y1 = depositA[1]
    var x2 = depositB[0]
    var y2 = depositB[1]
    var distA = myself.get_dist(x1, y1, home_x, home_y)
    var distB = myself.get_dist(x2, y2, home_x, home_y)
    if (distA < distB)
      return 1
    if (distA > distB)
      return -1
    return 0
  }
  set_goal() {
    var dest = this.coords_from_transmit(this)
    goal_x = dest[0]
    goal_y = dest[1]
    deposit_x = goal_x
    deposit_y = goal_y
  }
  set_home(x1, y1) {
    home_x = x1
    home_y = y1
  }
  get_dist(x1, y1, x2, y2) {
    return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5)
  }
  coords_from_transmit(robot) {
    var visMap = robot.getVisibleRobots()
    for (var i = 0; i < visMap.length; i++) {
      var newUnit = visMap[i]
      if (newUnit.unit == 0) {
        this.log('Castle Found')
        home_ID = newUnit.id
        dX = newUnit.x - this.me.x
        dY = newUnit.y - this.me.y
        var transmission = newUnit.signal
        this.log('transmission is ' + transmission)
        var new_y = transmission % 100
        var new_x = Math.floor((transmission - new_y) / 100)
        return [new_x, new_y]
      }
    }
  }

  choose_spawn(robot, choices) {
    var obstacles = this.map
    var x1 = robot.me.x
    var y1 = robot.me.y
    for (var val = 0; val < choices.length; val++) {
      var xPos = choices[val][0]
      var yPos = choices[val][1]
      if (this.map[y1 + yPos][x1 + xPos] && this.getVisibleRobotMap()[yPos + y1][xPos + x1] <= 0)
        return choices[val]
      else
        this.log("Spawn position " + (x1 + xPos) + ',' + (y1 + yPos) + ' is occupied')
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
  gen_children(x, y, seen, map) {
    var children = []
    for (var d = 0; d < r4choices.length; d++) {
      var newX = x + r4choices[d][0]
      var newY = y + r4choices[d][1]
      //this.log('position at [' + newX +',' +newY+']')
      if (newX >= 0 && newX < map.length && newY >= 0 && newY < map.length && map[newY][newX] == 1 && (this.getVisibleRobotMap()[newY][newX]<=0 || this.getVisibleRobotMap()[newY][newX]==this.me.id)) {
        var xy = newX * 100 + newY
        //this.log('found valid position at  [' + newX +',' +newY+']')
        if (!seen.has(xy)) {
          //this.log('adding position [' + newX +',' +newY+'] to children')
          children.push(xy)
          seen.add(xy)
        }
      }
    }
    return children
  }
  gen_all_moves(dict) {
    this.log("Navigating from [" + this.me.x + ',' + this.me.y + '] to [' + goal_x + ',' + goal_y + ']')
    var goalLoc = this.me.x * 100 + this.me.y
    var startLoc = goal_x * 100 + goal_y
    //this.log('from '+startLoc+' to '+goalLoc)
    var seenSet = new Set()
    seenSet.add(startLoc)
    var popPos = 0
    var fringe = [startLoc]
    while (popPos < fringe.length) {
      var loc = fringe[popPos++]
      //this.log(loc)
      if (loc == goalLoc)
        return true
      var x = Math.floor(loc / 100)
      var y = loc % 100
      var children = this.gen_children(x, y, seenSet, this.map)
      for (var c = 0; c < children.length; c++) {
        fringe.push(children[c])
        dict[children[c]] = loc
      }
    }
    return false
  }
}

var robot = new MyRobot();
