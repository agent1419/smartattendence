function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Teacher login
function teacherLogin() {
  let user = document.getElementById("teacherUser").value;
  let pass = document.getElementById("teacherPass").value;
  if (user === "teacher" && pass === "1234") {
    localStorage.setItem("teacherLoggedIn", "true");
    document.getElementById("teacherName").innerText = user;
    showPage("teacherDashboard");
    updateDashboard();
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
    localStorage.setItem("studentName", user);
    showPage("student");
  } else {
    document.getElementById("studentMsg").innerText = "❌ Invalid credentials!";
  }
}

// Teacher QR generator
function generateQR() {
  let subject = document.getElementById("subject").value;
  let className = document.getElementById("className").value;
  let teacherName = document.getElementById("teacherName").innerText;

  let qrData = JSON.stringify({ teacherName, subject, className, date: new Date().toLocaleString() });

  document.getElementById("qrcode").innerHTML = "";
  new QRCode(document.getElementById("qrcode"), qrData);
}

// Student QR scanner
function startScan() {
  document.getElementById("reader").style.display = "block";
  let html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrCodeMessage => {
      onScanSuccess(qrCodeMessage);
      html5QrCode.stop();
      document.getElementById("reader").style.display = "none";
    }
  );
}

function onScanSuccess(qrMessage) {
  try {
    let data = JSON.parse(qrMessage);
    let studentName = localStorage.getItem("studentName") || "Unknown Student";

    let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    records.push({
      teacherName: data.teacherName,
      subject: data.subject,
      className: data.className,
      date: data.date,
      student: studentName
    });
    localStorage.setItem("attendanceRecords", JSON.stringify(records));

    // Save student history
    let history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
    history.push({
      teacherName: data.teacherName,
      subject: data.subject,
      className: data.className,
      date: data.date
    });
    localStorage.setItem("attendanceHistory", JSON.stringify(history));

    document.getElementById("result").innerText = "✅ Attendance marked!";
  } catch (e) {
    document.getElementById("result").innerText = "⚠️ Invalid QR!";
  }
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

// Teacher dashboard
function updateDashboard() {
  let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  let today = new Date().toISOString().slice(0, 10);

  let todayCount = records.filter(r => r.date.includes(today)).length;
  document.getElementById("attendanceCount").innerText = todayCount;

  let tableBody = document.getElementById("attendanceTable");
  tableBody.innerHTML = "";
  records.forEach(r => {
    let row = `<tr>
      <td>${r.student}</td>
      <td>${r.subject}</td>
      <td>${r.className}</td>
      <td>${r.date}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

function logout(role) {
  if (role === "teacher") localStorage.removeItem("teacherLoggedIn");
  if (role === "student") localStorage.removeItem("studentLoggedIn");
  showPage("home");
}
