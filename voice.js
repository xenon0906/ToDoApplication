const voiceBtn = document.getElementById('voice-btn');

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Rec();
  rec.lang = 'en-US';

  rec.onstart = () => voiceBtn.classList.add('listening');
  rec.onend = () => voiceBtn.classList.remove('listening');

  rec.onresult = e => {
    const txt = e.results[0][0].transcript.trim();
    parseVoice(txt);
  };

  voiceBtn.onclick = () => rec.start();
} else {
  voiceBtn.title = 'Speech not supported';
}

function parseVoice(txt) {
  const regex = /add task (.+) at (\d{1,2}:\d{2}) for (\d+) minutes priority (high|medium|low)/i;
  const m = txt.match(regex);
  if (m) {
    document.getElementById('todo-input').value = m[1];
    document.getElementById('todo-time').value = m[2];
    document.getElementById('task-duration').value = m[3];
    document.getElementById('task-priority').value = m[4].charAt(0).toUpperCase() + m[4].slice(1);
    addTodo();
  } else alert('Say: “Add task [text] at HH:MM for N minutes priority [low/medium/high]”');
}
