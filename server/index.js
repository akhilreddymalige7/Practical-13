const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

let items = [
  { id: 1, name: 'Sample Item 1', description: 'This is a sample item', status: 'Active' },
  { id: 2, name: 'Sample Item 2', description: 'Another sample item', status: 'Pending' }
];

// GET all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST new item
app.post('/api/items', (req, res) => {
  const newItem = {
    id: Date.now(),
    name: req.body.name,
    description: req.body.description,
    status: req.body.status || 'Active'
  };
  items.push(newItem);
  
  // Real-time update
  io.emit('itemAdded', newItem);
  res.status(201).json(newItem);
});

// PUT update item
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...req.body };
    
    // Real-time update
    io.emit('itemUpdated', items[index]);
    res.json(items[index]);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemToDelete = items.find(item => item.id === id);
  if (itemToDelete) {
    items = items.filter(item => item.id !== id);
    
    // Real-time update
    io.emit('itemDeleted', id);
    res.json({ message: "Item deleted", id });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5055;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
