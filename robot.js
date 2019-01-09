import {
  BCAbstractRobot,
  SPECS
} from 'battlecode';

var step = -1;
class MyRobot extends BCAbstractRobot {
  turn() {
    step++;
    var map = this.map
    if (this.me.unit === SPECS.CRUSADER) {
      // this.log("Crusader health: " + this.me.health);
      if (this.me.x == 0 && this.me.y == 0)
        return
      this.log("CRUSADER");
      const choices = [[-2, -2],[-2, -1],[-2, 0],[-2, 1],[-2, 2],[-1, -2],[-1, -1],[-1, 0],[-1, 1],[-1, 2],[0, -2],[0, -1],[0, 1],[0, 2],[1, -2],[1, -1],[1, 0],[1, 1],[1, 2],[2, -2],[2, -1],[2, 0],[2, 1],[2, 2],[3,0],[-3,0],[0,3],[0,-3]]
      //Note: just a basic test, only navigates to top left corner atm
      const goal_x = 0
      const goal_y = 0
      var min_dist = 999999
      var best_move = [0, 0]
      var count = 0
      for (var i = 0; i < choices.length; i++) {
        var x1 = this.me.x + choices[i][0]
        var y1 = this.me.y + choices[i][1]
        if (x1<0 || y1<0 || y1>=map.length || x1>=map.length)
          continue
        if (!map[y1][x1])
          continue
        if(this.getVisibleRobotMap()[y1][x1]>0)
          continue
        var dist = Math.pow(Math.pow(goal_x - x1, 2) + Math.pow(goal_y - y1, 2), 0.5)
        if (dist < min_dist) {
            min_dist = dist
            best_move = choices[i]
            count += 1
        }
      }
      if (count == 0)
        return
      return this.move(...best_move);
    } else if (this.me.unit === SPECS.CASTLE) {
      this.log("CASTLE");
      const choices = [[-1,-1],[0,-1],[1,-1],[1,0],[-1,0],[0,-1],[0,1],[1,1]]
      if (step % 10 === 0)
        for(var i=0; i<choices.length; i++) {
          var x=choices[i][0]
          var y=choices[i][1]
          if(map[this.me.y+y][this.me.x+x])
            return this.buildUnit(SPECS.CRUSADER,x,y)
        }
      else
        return // this.log("Castle health: " + this.me.health);
    }
  }

}

var robot = new MyRobot();
