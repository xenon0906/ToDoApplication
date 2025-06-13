let todos = JSON.parse(localStorage.getItem('todos')) || [];

const renderTodos = () => {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    const diff = getTimeDiff(todo.time);
    const status = getStatus(diff, todo);
    li.innerHTML = `
      <div class="top">
        <span class="${todo.completed ? 'completed' : ''}" onclick="toggleComplete(${index})">
          ${todo.text} (${todo.priority})
        </span>
        <div class="actions">
          <button onclick="editTodo(${index})">✏️</button>
          <button onclick="deleteTodo(${index})">🗑️</button>
        </div>
      </div>
      <div class="meta">
        <div class="status">${status}</div>
        <div class="timer" id="timer-${index}">${getCountdownText(diff, todo)}</div>
      </div>
    `;
    list.appendChild(li);
  });

  localStorage.setItem('todos', JSON.stringify(todos));
};

const addTodo = () => {
  const text = document.getElementById('todo-input').value.trim();
  const time = document.getElementById('todo-time').value;
  const duration = parseInt(document.getElementById('task-duration').value);
  const priority = document.getElementById('todo-priority').value;

  if (text && time && duration > 0) {
    todos.push({ text, time, duration, priority, completed: false });
    document.getElementById('todo-input').value = '';
    document.getElementById('todo-time').value = '';
    document.getElementById('task-duration').value = '';
    renderTodos();
  }
};

const deleteTodo = index => {
  todos.splice(index, 1);
  renderTodos();
};

const toggleComplete = index => {
  todos[index].completed = !todos[index].completed;
  renderTodos();
};

const editTodo = index => {
  const newText = prompt('Edit your task:', todos[index].text);
  if (newText && newText.trim() !== '') {
    todos[index].text = newText.trim();
    renderTodos();
  }
};

const getTimeDiff = (targetTime) => {
  const now = new Date();
  const [hours, minutes] = targetTime.split(':').map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  return target.getTime() - now.getTime();
};

const getStatus = (diff, todo) => {
  if (diff > 0) return 'Upcoming';
  const elapsed = -diff / 60000;
  if (elapsed > todo.duration) return 'Finished';
  return 'In Progress';
};

const getCountdownText = (diff, todo) => {
  const mins = Math.floor(Math.abs(diff) / 60000);
  const secs = Math.floor((Math.abs(diff) % 60000) / 1000);
  const elapsed = -diff / 60000;
  if (diff > 0) return `Starts in: ${mins}m ${secs}s`;
  if (elapsed > todo.duration) return `Ended`;
  return `Ongoing: ${Math.floor(elapsed)}m ${Math.floor((elapsed % 1) * 60)}s`;
};

const updateTimers = () => {
  todos.forEach((todo, index) => {
    const diff = getTimeDiff(todo.time);
    const status = getStatus(diff, todo);
    const timerText = getCountdownText(diff, todo);
    const timerEl = document.getElementById(`timer-${index}`);
    const statusEl = timerEl?.parentElement?.querySelector('.status');
    if (timerEl && statusEl) {
      timerEl.innerText = timerText;
      statusEl.innerText = status;
    }
  });
};

// 🔊 MIC INPUT VISUALIZER
let micButton = document.getElementById("mic-button");
let audioContext, analyser, microphone, dataArray, canvasCtx;

function initMicVisualizer() {
  const canvas = document.getElementById("mic-visualizer");
  canvasCtx = canvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawVisualizer();
  }).catch(err => {
    console.error("Mic access denied:", err);
  });
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);
  canvasCtx.fillStyle = "#fff";
  canvasCtx.fillRect(0, 0, 300, 60);
  const barWidth = 3;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = dataArray[i] / 2;
    canvasCtx.fillStyle = "coral";
    canvasCtx.fillRect(x, 60 - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

micButton.addEventListener("click", initMicVisualizer);

// Init
renderTodos();
setInterval(updateTimers, 1000);
