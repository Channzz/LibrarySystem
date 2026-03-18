import { auth, db } from "./config.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const loginForm = document.getElementById("loginForm");
const visitorBtn = document.getElementById("visitorModeBtn");
const adminBtn = document.getElementById("adminModeBtn");
const formTitle = document.getElementById("formTitle");
const btnText = document.getElementById("btnText");
const loader = document.getElementById("loginLoader");
const regLinkWrapper = document.getElementById("regLinkWrapper");
const formDivider = document.getElementById("formDivider");

let currentMode = "Visitor";


const togglePass = document.getElementById("toggleLoginPass");
const passwordInput = document.getElementById("loginPass");
togglePass.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePass.querySelector("i").classList.toggle("bi-eye");
    togglePass.querySelector("i").classList.toggle("bi-eye-slash");
});


adminBtn.onclick = () => {
    currentMode = "Admin";
    adminBtn.classList.add("active");
    visitorBtn.classList.remove("active");
    document.body.classList.add("admin-mode-active");
    formTitle.innerText = "Administrator Access";
    btnText.innerText = "Secure Login";
    regLinkWrapper.style.display = "none"; 
    formDivider.style.display = "none";
};

visitorBtn.onclick = () => {
    currentMode = "Visitor";
    visitorBtn.classList.add("active");
    adminBtn.classList.remove("active");
    document.body.classList.remove("admin-mode-active");
    formTitle.innerText = "Account Login";
    btnText.innerText = "Login";
    regLinkWrapper.style.display = "flex";
    formDivider.style.display = "block";
};

loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    
    btnText.style.opacity = "0";
    loader.style.display = "block";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPass").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (currentMode === "Admin") {
                
                if (userData.role === "Admin") {
                    window.location.href = "admin.html";
                } else {
                    await signOut(auth);
                    alert("Unauthorized: This account does not have Admin access.");
                    resetUI();
                }
            } else {
                
                const q = query(collection(db, "blockedUsers"), where("studentID", "==", userData.studentID));
                const blockSnap = await getDocs(q);

                if (!blockSnap.empty) {
                    await signOut(auth); 
                    alert("ACCESS DENIED: Your account is restricted by the library admin.");
                    resetUI();
                    return; 
                }
                window.location.href = "visitor.html";
            }
        } else {
            alert("Error: Profile not found in database.");
            resetUI();
        }
    } catch (error) {
        alert("Authentication Failed: " + error.message);
        resetUI();
    }
});

function resetUI() {
    btnText.style.opacity = "1";
    loader.style.display = "none";
}