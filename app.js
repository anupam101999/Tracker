/**********************
 * GLOBAL STATE
 **********************/
let timerInterval = null;
let remainingSeconds = 0;

/**********************
 * STORAGE HELPERS
 **********************/
function getRecords() {
  return JSON.parse(localStorage.getItem("records") || "[]");
}

function saveRecords(records) {
  localStorage.setItem("records", JSON.stringify(records));
}

/**********************
 * DARK MODE
 **********************/
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/**********************
 * POMODORO TIMER
 **********************/
function startPomodoro() {
  if (timerInterval) return;

  const task = document.getElementById("pomodoroTask").value.trim();
  const minutes = parseInt(document.getElementById("workMinutes").value);

  if (!task || !minutes) {
    alert("Enter task and minutes");
    return;
  }

  remainingSeconds = minutes * 60;
  updateTimerUI();

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerUI();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      playAlarm();
      addRecord(task, minutes / 60);

      alert("Pomodoro completed 🍅");
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(timerInterval);
  timerInterval = null;

  const minutes =
    parseInt(document.getElementById("workMinutes").value) || 25;

  remainingSeconds = minutes * 60;
  updateTimerUI();
}

function updateTimerUI() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  document.getElementById("timer").innerText =
    `${m}:${s.toString().padStart(2, "0")}`;
}

/**********************
 * ALARM (NO LIBS)
 **********************/
function playAlarm() {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
  );
  audio.play();
}

/**********************
 * LOGGING
 **********************/
function logHours() {
  const task = document.getElementById("task").value.trim();
  const hours = parseFloat(document.getElementById("hours").value);

  if (!task || !hours) {
    alert("Enter task and hours");
    return;
  }

  addRecord(task, hours);

  document.getElementById("task").value = "";
  document.getElementById("hours").value = "";
}

function addRecord(task, hours) {
  const records = getRecords();
  const today = new Date().toISOString().slice(0, 10);

  const existing = records.find(
    r =>
      r.task.toLowerCase() === task.toLowerCase() &&
      r.date === today
  );

  if (existing) {
    existing.hours += hours;
  } else {
    records.push({ date: today, task, hours });
  }

  saveRecords(records);
  renderAll(); // 🔥 guaranteed refresh
}

/**********************
 * RENDERING
 **********************/
function renderAll() {
  renderDailyRecords();
}

/* DAILY TABLE */
function renderDailyRecords() {
  const tbody = document.getElementById("records");
  tbody.innerHTML = "";

  const records = getRecords()
    .sort((a, b) => b.date.localeCompare(a.date));

  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.task}</td>
      <td>${r.hours.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**********************
 * CSV EXPORT
 **********************/
function exportCSV() {
  const records = getRecords();
  let csv = "Date,Task,Hours\n";

  records.forEach(r => {
    csv += `${r.date},${r.task},${r.hours}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pomodoro_records.csv";
  link.click();
}

/**********************
 * INIT (IMPORTANT)
 **********************/
document.addEventListener("DOMContentLoaded", () => {
  const minutes =
    parseInt(document.getElementById("workMinutes").value) || 25;
  remainingSeconds = minutes * 60;
  updateTimerUI();
  renderAll();
});
