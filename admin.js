import { db } from "./config.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("visitorTable");
const blockList = document.getElementById("blockList");
const logoutBtn = document.getElementById("adminLogout");
const blockBtn = document.getElementById("addBlockBtn");
const reportBtn = document.getElementById("generateReport");

let allLogs = []; 
let dailyChart, purposeChart; 
const auth = getAuth();

async function loadDashboard() {
    try {
        
        const q = query(collection(db, "visitorLogs"), orderBy("timeIn", "desc"));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = "";
        allLogs = [];
        const now = new Date();
        let stats = { today: 0, week: 0, month: 0 };
        let purposeData = {}, dailyData = {};

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const logDate = (data.timeIn && data.timeIn.toDate) ? data.timeIn.toDate() : new Date();
            const logId = docSnap.id;
            
            allLogs.push({ ...data, id: logId, dateObj: logDate });
            
            if (logDate.toDateString() === now.toDateString()) stats.today++;
            purposeData[data.purpose] = (purposeData[data.purpose] || 0) + 1;
            dailyData[logDate.toLocaleDateString()] = (dailyData[logDate.toLocaleDateString()] || 0) + 1;

            tableBody.innerHTML += `<tr>
                <td>${data.name}</td>
                <td>${data.studentID}</td>
                <td>${data.course}</td>
                <td>${data.department}</td>
                <td><span class="badge bg-primary">${data.purpose}</span></td>
                <td>${logDate.toLocaleString()}</td>
                <td><button class="btn btn-sm btn-outline-danger" onclick="deleteEntry('${logId}')">🗑️</button></td>
            </tr>`;
        });

        document.getElementById("todayCount").innerText = stats.today;
        
       
        const blockSnap = await getDocs(collection(db, "blockedUsers"));
        blockList.innerHTML = "";
        blockSnap.forEach(d => {
            blockList.innerHTML += `<li class="list-group-item d-flex justify-content-between">
                ${d.data().studentID} 
                <button class="btn btn-sm btn-outline-secondary" onclick="unblockUser('${d.id}')">Unblock</button>
            </li>`;
        });

        renderCharts(dailyData, purposeData);
    } catch (e) { console.error("Load Error:", e); }
}


logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("You have been logged out.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout failed:", error);
    }
});

blockBtn.addEventListener("click", async () => {
    const id = document.getElementById("blockID").value;
    if(id) { 
        await addDoc(collection(db, "blockedUsers"), { studentID: id }); 
        document.getElementById("blockID").value = "";
        loadDashboard(); 
    }
});


window.deleteEntry = async (id) => { 
    if(confirm("Delete this log?")) {
        await deleteDoc(doc(db, "visitorLogs", id)); 
        loadDashboard(); 
    }
};

window.unblockUser = async (id) => { 
    await deleteDoc(doc(db, "blockedUsers", id)); 
    loadDashboard(); 
};

reportBtn.addEventListener("click", () => {
    const doc = new window.jspdf.jsPDF();
    doc.text("NEU Library Visitor Report", 14, 20);
    doc.autoTable({
        head: [['Name', 'Student ID', 'Course', 'Purpose', 'Department', 'Time In']],
        body: allLogs.map(l => [l.name, l.studentID, l.course, l.purpose, l.department, l.dateObj.toLocaleString()]),
        startY: 35
    });
    doc.save("Library_Report.pdf");
});

function renderCharts(daily, purposes) {
    if (dailyChart) dailyChart.destroy();
    if (purposeChart) purposeChart.destroy();
    dailyChart = new Chart(document.getElementById('dailyChart'), { type: 'line', data: { labels: Object.keys(daily), datasets: [{ label: 'Visitors', data: Object.values(daily), borderColor: '#004a99' }] } });
    purposeChart = new Chart(document.getElementById('purposeChart'), { type: 'doughnut', data: { labels: Object.keys(purposes), datasets: [{ data: Object.values(purposes), backgroundColor: ['#004a99', '#007bff', '#6610f2'] }] } });
}

loadDashboard();