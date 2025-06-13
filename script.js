let todos = JSON.parse(localStorage.getItem('todos')) || [];
const root = document.documentElement;
const themeBtn = document.getElementById('theme-btn');

themeBtn.onclick = () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
};

function render() {
  const filter = document.getElementById('priority-filter').value;
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach((t, i) => {
    if (filter !== 'all' && t.priority !== filter) return;
    const [h, m] = t.time.split(':');
    const sched = new Date();
    sched.setHours(+h, +m, 0, 0);
    const diff = sched - new Date();
    const elapsed = -diff / 60000;

    const status = diff>0 ? 'Upcoming' : elapsed > t.duration ? 'Finished' : 'In Progress';
    const countdown = diff>0 ? `Starts in ${Math.ceil(diff/60000)}m`
                         : elapsed>t.duration ? 'Ended' : `Ongoing ${Math.floor(elapsed)}m`;

    const li = document.createElement('li');
    if (t.completed) li.classList.add('completed');
    li.innerHTML = `
      <div class="task-info">
        <strong>${t.text}</strong>
        <div class="meta">${countdown}<span class="badge">${status}</span></div>
      </div>
      <div>
        <button class="button" onclick="toggle(${i})">✔️</button>
        <button class="button" onclick="remove(${i})">🗑️</button>
      </div>`;
    list.appendChild(li);
    if (diff>0) scheduleNotify(t.text, diff);
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

function addTodo() {
  const t = document.getElementById('todo-input').value.trim();
  const tm = document.getElementById('todo-time').value;
  const dr = +document.getElementById('task-duration').value;
  const pr = document.getElementById('todo-priority').value;
  if (!t || !tm || !dr) return;
  todos.unshift({ text: t, time: tm, duration: dr, priority: pr, completed: false });
  ['todo-input','todo-time','task-duration'].forEach(id=>document.getElementById(id).value='');
  render();
}

function toggle(i) {
  todos[i].completed = !todos[i].completed; render();
}
function remove(i) {
  if (confirm('Delete this task?')) { todos.splice(i,1); render(); }
}
function scheduleNotify(text, delay) {
  if (Notification.permission === 'granted')
    setTimeout(() => new Notification('🔔 FocusFlow Reminder', { body: text }), delay);
}
if (Notification.permission !== 'granted') Notification.requestPermission();

setInterval(render, 60000);
render();

// Microphone Analyze Start/Stop
const micStart = document.getElementById('mic-start');
const micStop = document.getElementById('mic-stop');
const meter = document.getElementById('mic-meter');
let analysing = false, audioCtx, analyser, dataArr;

micStart.onclick = async () => {
  if (analysing) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const src = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    dataArr = new Uint8Array(analyser.frequencyBinCount);
    analysing = true;
    micStart.disabled = true;
    micStop.disabled = false;
    drawMeter();
  } catch {
    alert('Microphone access denied');
  }
};

micStop.onclick = () => {
  analysing = false;
  micStart.disabled = false;
  micStop.disabled = true;
  if (audioCtx) audioCtx.close();
  meter.style.width = '0%';
};

function drawMeter() {
  if (!analysing) return;
  analyser.getByteFrequencyData(dataArr);
  const peak = Math.max(...dataArr);
  meter.style.width = Math.min(100, peak / 255 * 100) + '%';
  requestAnimationFrame(drawMeter);
}
