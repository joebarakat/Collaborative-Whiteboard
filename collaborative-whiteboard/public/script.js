const socket = io();

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('color');
const brushSize = document.getElementById('brush-size');
const brushButton = document.getElementById('brush');
const eraserButton = document.getElementById('eraser');
const clearButton = document.getElementById('clear');
const userList = document.getElementById('user-list');
const drawingStatus = document.getElementById('drawing-status');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const saveButton = document.getElementById('save');
const loadButton = document.getElementById('load');
const loadSelect = document.getElementById('loadSelect');
const disconnected= document.getElementById('disconnect');
let undoStack = [];
let redoStack = [];
let drawing = false;
let currentColor = '#000000';
let currentBrushSize = 2;
let isEraser = false;

function addToUndoStack() {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  undoStack.push(imageData);
}

function undo() {
  if (undoStack.length > 0) {
    const imageData = undoStack.pop();
    redoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    context.putImageData(imageData, 0, 0);
    socket.emit('update canvas', canvas.toDataURL());
  }
}

function redo() {
  if (redoStack.length > 0) {
    const imageData = redoStack.pop();
    undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    context.putImageData(imageData, 0, 0);
    socket.emit('update canvas', canvas.toDataURL());
  }
}

socket.on('update canvas', (dataURL) => {
  const img = new Image();
  img.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
  };
  img.src = dataURL;
});


undoButton.addEventListener('click', () => {
  undo();
  socket.emit('undo');
});

redoButton.addEventListener('click', () => {
  redo();
  socket.emit('redo');
});


socket.on('undo', () => {
  undo();
});

socket.on('redo', () => {
  redo();
});

saveButton.addEventListener('click', saveCanvas);
loadButton.addEventListener('click', loadCanvas);

function saveCanvas() {
  const dataURL = canvas.toDataURL();
  const savedCanvases = JSON.parse(localStorage.getItem('savedCanvases')) || [];
  const canvasName = prompt('Enter a name for your canvas:');
  if (canvasName) {
    savedCanvases.push({ name: canvasName, dataURL });
    localStorage.setItem('savedCanvases', JSON.stringify(savedCanvases));
    alert('Canvas saved!');
    updateLoadSelect();
  }
}

function loadCanvas() {
  const selectedCanvas = loadSelect.value;
  if (selectedCanvas) {
    const savedCanvases = JSON.parse(localStorage.getItem('savedCanvases')) || [];
    const canvasData = savedCanvases.find(canvas => canvas.name === selectedCanvas);
    if (canvasData) {
      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        alert('Canvas loaded!');
        socket.emit('load canvas', canvasData.dataURL);
      };
      img.src = canvasData.dataURL;
    }
  } else {
    alert('Please select a canvas to load!');
  }
}

function updateLoadSelect() {
  const savedCanvases = JSON.parse(localStorage.getItem('savedCanvases')) || [];
  loadSelect.innerHTML = '<option value="" disabled selected>Select a canvas to load</option>';
  savedCanvases.forEach(canvas => {
    const option = document.createElement('option');
    option.value = canvas.name;
    option.textContent = canvas.name;
    loadSelect.appendChild(option);
  });
}

updateLoadSelect();

canvas.addEventListener('mousedown', (event) => {
  drawing = true;
  socket.emit('start drawing');
  addToUndoStack();
  draw(event);
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  context.beginPath();
  socket.emit('stop drawing');
});

canvas.addEventListener('mousemove', (event) => {
  if (drawing) {
    draw(event);
  }
});

colorPicker.addEventListener('input', (event) => {
  currentColor = event.target.value;
  isEraser = false; // Switch to drawing mode
});

brushSize.addEventListener('input', (event) => {
  currentBrushSize = event.target.value;
});

brushButton.addEventListener('click', () => {
  isEraser = false; // Switch to brush mode
  currentColor = colorPicker.value; // Restore the selected color
});

eraserButton.addEventListener('click', () => {
  isEraser = true;
  currentColor = '#FFFFFF'; // Set color to white for erasing
});

clearButton.addEventListener('click', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
  addToUndoStack(); // Save state for undo
  redoStack = []; // Clear the redo stack
});


sendMessageButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message.trim()) {
    socket.emit('send message', message);
    messageInput.value = '';
  }
});

messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessageButton.click();
  }
});

function draw(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (!drawing) return;

  context.lineWidth = currentBrushSize;
  context.strokeStyle = currentColor;

  context.lineTo(x, y);
  context.stroke();
  context.beginPath();
  context.moveTo(x, y);

  socket.emit('draw', { x, y, color: currentColor, size: currentBrushSize, isEraser });
}

socket.on('draw', (data) => {
  context.lineWidth = data.size;
  context.strokeStyle = data.isEraser ? '#FFFFFF' : data.color;

  context.lineTo(data.x, data.y);
  context.stroke();
  context.beginPath();
  context.moveTo(data.x, data.y);
});

socket.on('clear', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('load canvas', (dataURL) => {
  const img = new Image();
  img.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
  };
  img.src = dataURL;
});

socket.on('user list', (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    userList.appendChild(li);
  });
});

socket.on('user drawing', (data) => {
  if (data.drawing) {
    drawingStatus.textContent = `${data.username} is drawing...`;
  } else {
    drawingStatus.textContent = '';
  }
});

socket.on('receive message', (message) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messages.appendChild(messageElement);
});

// Prompt user for username and notify server
function promptForUsername() {
  const username = prompt('Enter your username');
  if (username) {
    socket.emit('new user', username, (response) => {
      if (response.success) {
        console.log('Username accepted');
      } else {
        alert(response.message);
        promptForUsername();
      }
    });
  } else {
    alert('Username cannot be empty');
    promptForUsername();
  }
}

let start_session = confirm("Do you want to start the session?");
if (start_session) {
  promptForUsername();
} else {
  window.history.back();
}

function disconnect() {
  if (disconnected) {
    window.history.back();
  }
}
