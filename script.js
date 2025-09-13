// Page navigation
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  if (pageId === "teacherDashboard") loadTeacherDashboard();
  if (pageId === "studentHistory") loadStudentHistory();
}

// Teacher login
function teacherLogin() {
  let user = document.getElementById("teacherUser").value;
  let pass = document.getElementById("teacherPass").value;
  if (user === "teacher" && pass === "1234") {
    localStorage.setItem("teacherLoggedIn", "true");
    showPage("teacherPortal");
  } else {
    document.getElementById("teacherMsg").innerText = "❌ Invalid credentials!";
  }
}

// Student login
function studentLogin() {
  let user = document.getElementById("studentUser").value;
  let pass = document.getElementById("studentPass").value;
  if (user === "student" && pass === "1234") {
    localStorage.setItem("studentLoggedIn", "true");
    showPage("studentPortal");
  } else {
    document.getElementById("studentMsg").innerText = "❌ Invalid credentials!";
  }
}

// Logout
function logout(role) {
  if (role === "teacher") localStorage.removeItem("teacherLoggedIn");
  if (role === "student") localStorage.removeItem("studentLoggedIn");
  showPage("home");
}

// QR Code generation
function generateQR() {
  let teacherName = document.getElementById("teacherName").value;
  let subject = document.getElementById("subject").value;
  let className = document.getElementById("className").value;
  let date = new Date().toLocaleDateString();

  let qrText = `${teacherName} | ${subject} | ${className} | ${date}`;
  document.getElementById("qrcode").innerHTML = "";
  new QRCode(document.getElementById("qrcode"), qrText);
  document.getElementById("qrText").innerText = qrText;

  let sessions = JSON.parse(localStorage.getItem("teacherSessions")) || [];
  sessions.push({ teacherName, subject, className, date });
  localStorage.setItem("teacherSessions", JSON.stringify(sessions));
}

// Teacher dashboard
function loadTeacherDashboard() {
  let sessions = JSON.parse(localStorage.getItem("teacherSessions")) || [];
  let studentHistory = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
  let tbody = document.getElementById("sessionTable");
  tbody.innerHTML = "";

  if (sessions.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>No sessions yet</td></tr>";
  } else {
    sessions.forEach(session => {
      let count = studentHistory.filter(r =>
        r.teacherName === session.teacherName &&
        r.subject === session.subject &&
        r.className === session.className &&
        r.date === session.date
      ).length;

      let row = document.createElement("tr");
      row.innerHTML = `
        <td>${session.teacherName}</td>
        <td>${session.subject}</td>
        <td>${session.className}</td>
        <td>${session.date}</td>
        <td>${count}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

// Student QR scanning
function startScan() {
  document.getElementById("reader").style.display = "block";
  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      let parts = decodedText.split(" | ");
      if (parts.length >= 4) {
        let [teacherName, subject, className, date] = parts;
        document.getElementById("result").innerHTML = `
          ✅ Attendance marked! <br>
          👨‍🏫 ${teacherName} <br>
          📘 ${subject} <br>
          🏫 ${className} <br>
          📅 ${date}
        `;
        let history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
        history.push({ teacherName, subject, className, date });
        localStorage.setItem("attendanceHistory", JSON.stringify(history));
        html5QrCode.stop();
        setTimeout(() => showPage("curriculum"), 2500);
      }
    }
  ).catch(err => {
    document.getElementById("result").innerText = "❌ Camera error: " + err;
  });
}

// Student history
function loadStudentHistory() {
  let history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
  let tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  if (history.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No attendance records</td></tr>";
  } else {
    history.forEach(r => {
      let row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.teacherName}</td>
        <td>${r.subject}</td>
        <td>${r.className}</td>
        <td>${r.date}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

