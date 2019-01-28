# class Node:
#
#     def __init__(self, value, next=None): self.value, self.next = value, next
#
# class Queue:
#
#     def __init__(self):
#         self.head, self.tail = None, None
#         self.length = 0
#
#     def __str__(self): return f"[{self.to_str(self.head)[:-2]}]"
#
#     def to_str(self, node):
#         if node is None: return ""
#         return str(node.value) + ", " + self.to_str(node.next)
#
#     def append(self, value):
#         node = Node(value)
#         if self.head is None:
#             self.head = self.tail = node
#         else:
#             self.tail.next = self.tail = node
#         self.length += 1
#
#     def popleft(self):
#         if self.length <= 1:
#             self.head = None
#             return
#         val = self.head.value
#         self.head = self.head.next
#         self.length -= 1
#         return val
import time
DELTAS = { 1: {(0, 1), (-1, 0), (0, -1), (1, 0)},
           2: {(0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, 0), (1, -1), (1, 1)},
           4: {(0, 1), (-1, 1), (-1, 0), (-2, 0), (2, 0), (1, 1), (0, -2), (-1, -1), (0, -1), (1, 0), (1, -1), (0, 2)},
           9: {(-1, 0), (-2, 0), (3, 0), (2, 1), (0, -1), (0, 3), (1, -1), (1, -2), (1, 2), (-1, 1), (-2, 1), (-1, -1), (-1, -2), (-2, -1), (2, 2), (-2, -2), (1, 1), (-1, 2), (2, -1), (-2, 2), (2, -2), (1, 0), (0, -3), (0, 1), (-3, 0), (2, 0), (0, -2), (0, 2)} }

class Queue:

    def __init__(self, l=[]): self.instk, self.outstk = l, []

    def __len__(self): return len(self.instk) + len(self.outstk)

    def __str__(self): print(self.outstk + self.instk)

    def append(self, val): self.instk.append(val)

    def popleft(self):
        if len(self.outstk) == 0:
            while len(self.instk) > 0:
                self.outstk.append(self.instk.pop())
        return self.outstk.pop()

### MISC ###

def timer(f):

    def wrapper(*args, **kwargs):
        start = time.time()
        val = f(*args, **kwargs)
        print(f"Time taken: {1000*(time.time() - start)} (ms)")
        return val

    return wrapper

def from_file(fname="map.txt"):
    map = []
    with open(fname) as f:
        for line in f:
            map.append([ch for ch in line.split()[-1]])
    return map

### GENERAL ###

def combine_maps(bound, karb, fuel, visible):
    """ yeilds new human-friendly map from 4 bitboards """
    N = len(karb)
    new = [["." for i in range(N)] for j in range(N)]
    for y in range(N):
        for x in range(N):
            if not bound[y][x]:
                ch = "w"
            elif karb[y][x]:
                ch = "k"
            elif fuel[y][x]:
                ch = "f"
            elif visible[y][x] > 0:
                ch = "r"
            else:
                ch = "."
            new[y][x] = ch
    return new

def find_sym(map):
    """ Returns True for left/right, False for up/down """
    for y in range(len(map)):
        for x in range(len(map)//2):
            if map[y][x] != map[len(map) - 1 - y][x]:
                return True
    return False

def mirror(map, sym, y, x):
    """ returns the mirrored coords based on sym. """
    return (y, len(map) - 1 - x) if sym else (len(map) - 1 - y, x)

def pick_spawn(map, x, y):
    """ returns a delta from x, y which you should build a new unit """
    for dx, dy in DELTAS[2]:
        if map[y + dy][x + dx] == ".":
            return dx, dy
    return -1

### COMMUNICATION ###

### NAVIGATION ###

def dist(x1, y1, x2, y2): return ((x1 - x2)**2 + (y1 - y2)**2)**0.5

def add(x, y, dx, dy): return (x + dx, y + dy)

def diff(x1, y1, x2, y2): return (x2 - x1, y2 - y1)

def in_bound(n, point): return 0 <= point[0] < n and 0 <= point[1] < n

#@timer
def gen_radius(r, start=(0, 0)):
    """ generates all deltas (y, x) that are accessible from a given point"""
    q = Queue([start])
    seen = set()
    while len(q) > 0:
        n = q.popleft()
        seen.add(n)
        for d in DELTAS[1]:
            c = add(*n, *d)
            if c not in seen and dist(*c, *start) <= r**0.5:
                q.append(c)
    seen.remove(start)
    return seen

def get_path(seen, start, end):
    path = []
    while end != start:
        path.append(end)
        end = seen[end]
    return path

#@timer
def bfs(map, start, r, target=lambda x, y: map[y][x] == "k"):
    q = Queue([start])
    seen = {}
    while len(q) > 0:
        n = q.popleft()
        if target(*n):
            return n, seen
        #map[n[1]][n[0]] = "*"
        for d in DELTAS[r]:
            c = add(*n, *d)
            if c not in seen and in_bound(len(map), c) and map[c[1]][c[0]] != "w":
                q.append(c)
                seen[c] = n
    return -1, seen

def Astar(start, goal):
    seen = set()
    fringe = [Node(start, None, goal)]
    iter = 0
    while len(fringe) > 0:
        iter += 1
        n = heapq.heappop(fringe)
        if n.id == goal:
            if rtn: return n, iter
            else: return n
        if n.id in seen: continue
        seen.add(n.id)
        for child in graph[n.id]:
            if child not in seen:
                heapq.heappush(fringe, Node(child, n, goal))

if __name__ == "__main__":
    pass
    # for r in [1, 2, 4, 9]:
    #     print(gen_radius(r))

    # map = from_file()
    #
    # for y in range(len(map)):
    #     for x in range(len(map)):
    #         if map[y][x] == "r":
    #             start = (x, y)
    #             break
    #
    # target, seen = bfs(map, start, 4)
    # for n in get_path(seen, start, target):
    #     map[n[1]][n[0]] = "#"
    #
    # for row in map:
    #     print("".join(row))
    #
    # print(start, target, len(seen))
