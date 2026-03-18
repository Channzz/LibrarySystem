import { auth, db } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const displayName = document.getElementById("displayName");
const displayID = document.getElementById("displayID");
const displayCourse = document.getElementById("displayCourse");
const displayDept = document.getElementById("displayDept");
const visitForm = document.getElementById("visitForm");
const logoutBtn = document.getElementById("logoutBtn");

let currentUserData = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            displayName.textContent = currentUserData.name || "N/A";
            displayID.textContent = currentUserData.studentID || "N/A";
            displayCourse.textContent = currentUserData.course || "N/A";
            displayDept.textContent = currentUserData.department || "N/A";
        }
    } else {
        window.location.href = "index.html";
    }
});

visitForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const purpose = document.getElementById("purpose").value;

    try {
       
        const q = query(collection(db, "blockedUsers"), where("studentID", "==", currentUserData.studentID));
        const blockSnap = await getDocs(q);

        if (!blockSnap.empty) {
            alert("ACCESS DENIED: Your account is restricted. Please see the library admin.");
            return;
        }

        await addDoc(collection(db, "visitorLogs"), {
            name: currentUserData.name,
            studentID: currentUserData.studentID,
            course: currentUserData.course,
            department: currentUserData.department,
            purpose: purpose,
            timeIn: serverTimestamp()
        });

        alert("Visitor log recorded successfully!");
        visitForm.reset();
    } catch (error) {
        alert("Error: " + error.message);
    }
});

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});