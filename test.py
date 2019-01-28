class Node:

    def __init__(self, value, next=None): self.value, self.next = value, next

class Queue:

    def __init__(self):
        self.head, self.tail = None, None
        self.length = 0

    def __str__(self): return f"[{self.to_str(self.head)[:-2]}]"

    def to_str(self, node):
        if node is None: return ""
        return str(node.value) + ", " + self.to_str(node.next)

    def append(self, value):
        node = Node(value)
        if self.head is None:
            self.head = self.tail = node
        else:
            self.tail.next = self.tail = node
        self.length += 1

    def popleft(self):
        if self.length <= 1:
            self.head = None
            return
        val = self.head.value
        self.head = self.head.next
        self.length -= 1
        return val
