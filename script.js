
const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");

const today = new Date().toLocaleDateString("en-CA");
document.getElementById("date").textContent =
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

let habits = [];

try {
  habits = JSON.parse(localStorage.getItem("habitmind-data")) || [];
  if (!Array.isArray(habits)) habits = [];
} catch {
  habits = [];
}

function saveHabits() {
  localStorage.setItem("habitmind-data", JSON.stringify(habits));
}

function renderHabits() {
  habitList.replaceChildren();

  habits.forEach((habit, index) => {
    const row = document.createElement("div");
    row.className = "habit" + (habit.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.done;
    checkbox.setAttribute("aria-label", "Complete " + habit.name);

    checkbox.addEventListener("change", () => {
      habits[index].done = checkbox.checked;
      habits[index].lastUpdated = today;
      saveHabits();
      renderHabits();
    });

    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = habit.name;

    const remove = document.createElement("button");
    remove.className = "delete";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete " + habit.name);

    remove.addEventListener("click", () => {
      habits.splice(index, 1);
      saveHabits();
      renderHabits();
    });

    row.append(checkbox, name, remove);
    habitList.appendChild(row);
  });

  const completed = habits.filter(habit => habit.done).length;
  const total = habits.length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  document.getElementById("progress").textContent = percent + "%";
  document.getElementById("completed").textContent =
    completed + " / " + total;
  document.getElementById("progressBar").style.width = percent + "%";

  const message = document.getElementById("coachMessage");

  if (total === 0) {
    message.textContent = "Start small. Add your first habit today!";
  } else if (completed === total) {
    message.textContent = "Amazing! You completed all your habits today!";
  } else if (completed > 0) {
    message.textContent =
      "Good progress! You have completed " + completed +
      " of " + total + " habits. Keep going!";
  } else {
    message.textContent =
      "Choose one small habit and get started. You can do this!";
  }
}

habitForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = habitInput.value.trim();
  if (!name) return;

  habits.push({
    name,
    done: false,
    created: today,
    lastUpdated: null
  });

  saveHabits();
  habitInput.value = "";
  renderHabits();
});

const tips = [
  "Start with just five minutes. Small actions build consistency.",
  "Do your habit at the same time each day to build a routine.",
  "Missing one day is not failure. Restart with your next opportunity.",
  "Make your good habits easy to begin and your distractions harder to reach."
];

document.getElementById("tipButton").addEventListener("click", () => {
  const tip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById("coachMessage").textContent = tip;
});

renderHabits();


const detectiveForm = document.getElementById("detectiveForm");
const detectiveHabit = document.getElementById("detectiveHabit");
const missReason = document.getElementById("missReason");
const missTime = document.getElementById("missTime");
const habitDifficulty = document.getElementById("habitDifficulty");
const detectiveResult = document.getElementById("detectiveResult");

// Keep the habit dropdown updated.
function syncDetectiveHabits() {
  const previousValue = detectiveHabit.value;
  detectiveHabit.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Habit select karo";
  detectiveHabit.appendChild(placeholder);

  habits.forEach((habit, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = habit.name;
    detectiveHabit.appendChild(option);
  });

  if (
    previousValue !== "" &&
    Number(previousValue) < habits.length
  ) {
    detectiveHabit.value = previousValue;
  }
}

habitForm.addEventListener("submit", syncDetectiveHabits);
habitList.addEventListener("click", syncDetectiveHabits);
habitList.addEventListener("change", syncDetectiveHabits);

// Analyse the user's answers and suggest a recovery plan.
detectiveForm.addEventListener("submit", event => {
  event.preventDefault();

  const index = Number(detectiveHabit.value);
  const habit = habits[index];

  if (!habit || !missReason.value) {
    showDetectiveResult(
      "Habit select karo",
      "Pehle ek valid habit aur miss hone ka reason select karo."
    );
    return;
  }

  const reason = missReason.value;
  const time = missTime.value;
  const difficulty = habitDifficulty.value;

  const reasons = {
    time: {
      title: "Time Management Pattern",
      analysis: "Ho sakta hai tumhari habit ke liye fixed time yaad nahi rehta.",
      mission: "Apne din mein 5 minute ka ek specific time block karo."
    },
    forgot: {
      title: "Reminder Pattern",
      analysis: "Habit ko existing routine ke saath jodna tumhare liye useful ho sakta hai.",
      mission: "Habit ke liye phone reminder lagao ya ek visible note rakho."
    },
    tired: {
      title: "Energy Pattern",
      analysis: "Tumhare selected answer ke hisaab se low energy ek possible obstacle hai.",
      mission: "Habit ka 2-minute version try karo, ya apne liye suitable time choose karo."
    },
    difficult: {
      title: "Difficulty Pattern",
      analysis: "Ho sakta hai habit ka current target bahut bada lag raha ho.",
      mission: "Habit ko ek chhote step mein tod do aur bas pehla step complete karo."
    },
    distraction: {
      title: "Distraction Pattern",
      analysis: "Mobile ya aas-paas ki distractions tumhara focus tod sakti hain.",
      mission: "5 minute ke liye notifications silent karo aur phone door rakho."
    },
    motivation: {
      title: "Starting Pattern",
      analysis: "Motivation ka wait karne ke bajay ek chhota starting rule helpful ho sakta hai.",
      mission: "Sirf 2 minute ke liye shuru karo. Uske baad continue karna optional hai."
    }
  };

  const result = reasons[reason];

  let mission = result.mission;

  if (difficulty === "hard") {
    mission += " Apne target ko aur chhota karne ki koshish karo.";
  }

  if (time === "anytime") {
    mission += " Ek consistent time choose karke experiment karo.";
  }

  showDetectiveResult(
    result.title,
    result.analysis,
    habit.name,
    mission
  );
});

function showDetectiveResult(title, analysis, habitName, mission) {
  detectiveResult.replaceChildren();
  detectiveResult.hidden = false;

  const heading = document.createElement("h3");
  heading.textContent = "🔎 " + title;
  detectiveResult.appendChild(heading);

  const explanation = document.createElement("p");
  explanation.textContent = analysis;
  detectiveResult.appendChild(explanation);

  if (habitName) {
    const habitText = document.createElement("p");
    habitText.textContent = "Habit: " + habitName;
    detectiveResult.appendChild(habitText);
  }

  const missionBox = document.createElement("p");
  missionBox.className = "mission";
  missionBox.textContent = "🎯 Recovery Mission: " + mission;
  detectiveResult.appendChild(missionBox);

  const note = document.createElement("p");
  note.className = "muted";
  note.textContent =
    "Ye tumhare answers par based ek possible explanation hai, confirmed cause nahi.";
  detectiveResult.appendChild(note);
}

syncDetectiveHabits();
