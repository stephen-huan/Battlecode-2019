from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random, time
import nav
#from collections import deque
#import heapq

#/usr/local/lib/node_modules/bc19/bots

# __pragma__('iconv')
# __pragma__('tconv')
# __pragma__('opov')

# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1
    target = -1

    def turn(self):
        self.step += 1

        if self.step == 0:
            s = time.time()
            self.MAP = nav.combine_maps(self.map, self.karbonite_map, self.fuel_map, self.get_visible_robot_map())
            self.SYM = nav.find_sym(self.map)
            # self.log(f"Time taken: {round(1000*(time.time() - s), 6)} (ms)")

        # self.log("START TURN " + self.step)
        # self.log(f"I am a {self.me['unit']} with id {self.me['id']}")
        #'CASTLE': 0, 'CHURCH': 1, 'PILGRIM': 2, 'CRUSADER': 3, 'PROPHET': 4, 'PREACHER': 5

        if self.me['unit'] == SPECS['CASTLE']:

            while self.fuel > SPECS["UNITS"][SPECS["PILGRIM"]]["CONSTRUCTION_FUEL"] and self.karbonite > SPECS["UNITS"][SPECS["PILGRIM"]]["CONSTRUCTION_KARBONITE"]:
                delta = nav.pick_spawn(self.MAP, *self.get_pos())
                if delta != -1:
                    dx, dy = delta
                    self.log("Building a pilgrim at " + str(self.me['x'] + dx) + ", " + str(self.me['y'] + dy))
                    self.MAP[self.me['y'] + dy][self.me['x'] + dx] = "p"
                    return self.build_unit(SPECS["PILGRIM"], dx, dy)
                else:
                    break

            return

            # if self.step < 10:
            #     self.log("Building a crusader at " + str(self.me['x']+1) + ", " + str(self.me['y']+1))
            #     return self.build_unit(SPECS['CRUSADER'], 1, 1)

            # self.log("Castle health: " + self.me['health'])

        elif self.me['unit'] == SPECS['CRUSADER']:
            #self.log("Crusader health: " + str(self.me['health']))
            # The directions: North, NorthEast, East, SouthEast, South, SouthWest, West, NorthWest
            choices = [(0,-1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1)]
            choice = random.choice(choices)
            #self.log('TRYING TO MOVE IN DIRECTION ' + str(choice))
            return self.move(*choice)

        elif self.me['unit'] == SPECS['PILGRIM']:

            if self.target == -1:

                self.END, self.SEEN = nav.bfs(self.MAP, self.get_pos(), 1)
                if self.END == -1:
                    self.log("No route to target.")
                    self.log(str(self.SEEN))
                else:
                    self.log("Path found.")
                    self.PATH = []
                    while self.END != self.get_pos():
                        self.PATH.append(self.END)
                        self.END = self.SEEN[self.END]
                    self.log(str(self.PATH))

                    self.target = self.END

    def get_pos(self): return (self.me['x'], self.me['y'])

    def print_map(self):
        for i in range(len(self.MAP)):
            self.log("".join(self.MAP[i]))
        self.log(("vertical" if self.SYM else "horizontal") + " symmetry")

robot = MyRobot()
