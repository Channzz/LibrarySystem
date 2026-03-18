import { auth, db } from "./config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const courseData = {
    "College of Accountancy": ["BS in Accountancy", "BS in Accounting Information System"],
    "College of Agriculture": ["BS in Agriculture"],
    "College of Arts and Sciences": ["BA in Economics", "BA in Political Science", "BS in Biology", "BS in Psychology", "Public Administration"],
    "College of Business Administration": ["BSBA Financial Management", "BSBA Human Resource Development", "BSBA Legal Management", "BSBA Marketing Management", "BS in Entrepreneurship", "BS in Real Estate Management"],
    "College of Communication": ["BA in Broadcasting", "BA in Communication", "BA in Journalism"],
    "College of Informatics and Computing Studies": ["Bachelor of Library and Information Science", "BS in Computer Science", "BS EMC - Digital Animation", "BS EMC - Game Development", "BS in Information Technology", "BS in Information System"],
    "College of Criminology": ["BS in Criminology"],
    "College of Education": ["BEEd", "BEEd Preschool Education", "BEEd Special Education", "BSEd MAPEH", "BSEd English", "BSEd Filipino", "BSEd Mathematics", "BSEd Science", "BSEd Social Studies", "BSEd TLE"],
    "College of Engineering and Architecture": ["BS in Architecture", "BS in Astronomy", "BS in Civil Engineering", "BS in Electrical Engineering", "BS in Electronics Engineering", "BS in Industrial Engineering", "BS in Mechanical Engineering"],
    "College of Medical Technology": ["BS in Medical Technology"],
    "College of Midwifery": ["Diploma in Midwifery"],
    "College of Music": ["BM in Choral Conducting", "BM in Music Education", "BM in Piano", "BM in Voice"],
    "College of Nursing": ["BS in Nursing"],
    "College of Physical Therapy": ["BS in Physical Therapy"],
    "College of Respiratory Therapy": ["BS in Respiratory Therapy"],
    "School of International Relations": ["BA in Foreign Service"],
    "School of Graduate Studies": [ 
        "Doctor in Business Administration", "Master in Business Administration",
        "MBA Major in Human Resource Management", "MBA Major in Organizational Development",
        "PhD in Education Major in Bilingual Education", "PhD in Education Major in Early Childhood Education",
        "PhD in Education Major in Educational Leadership", "PhD in Education Major in Educational Management",
        "PhD in Education Major in Guidance & Counseling", "PhD in Education Major in Instructional Leadership",
        "PhD in Education Major in Special Education and Inclusive Education",
        "MA in Education Major in Early Childhood Education", "MA in Education Major in Educational Management",
        "MA in Education Major in Educational Psychology", "MA in Education Major in Educational Technology",
        "MA in Education Major in Environmental Education", "MA in Education Major in Filipino",
        "MA in Education Major in Guidance and Counseling", "MA in Education Major in Language Education",
        "MA in Education Major in Mathematics Education", "MA in Education Major in Reading Education",
        "MA in Education Major in Science Education", "MA in Education Major in Social Science",
        "MA in Education Major in Special Education and Inclusive Education"
    ]
};

const roleSelect = document.getElementById('userRole');
const deptSelect = document.getElementById('dept');
const courseSelect = document.getElementById('course');


roleSelect.addEventListener('change', () => {
    const isFaculty = roleSelect.value === 'Faculty';
    
    document.getElementById('gradGroup').style.display = isFaculty ? 'none' : '';
    document.getElementById('undergradGroup').style.display = isFaculty ? 'none' : '';
    document.getElementById('facultyGroup').style.display = isFaculty ? '' : 'none';
    
    document.getElementById('courseContainer').style.display = isFaculty ? 'none' : 'block';
    document.getElementById('yearContainer').style.display = isFaculty ? 'none' : 'block';
});


deptSelect.addEventListener('change', () => {
    if (roleSelect.value === 'Faculty') return;
    
    courseSelect.innerHTML = '<option value="" selected disabled>Select Course...</option>';
    courseSelect.disabled = false;
    
    const courses = courseData[deptSelect.value] || [];
    courses.forEach(c => {
        let opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        courseSelect.appendChild(opt);
    });
});


document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const studentID = document.getElementById("studentID").value;
        const q = query(collection(db, "users"), where("studentID", "==", studentID));
        if (!(await getDocs(q)).empty) return alert("Error: ID already registered.");

        const userCred = await createUserWithEmailAndPassword(auth, document.getElementById("regEmail").value, document.getElementById("regPass").value);
        await setDoc(doc(db, "users", userCred.user.uid), {
            name: document.getElementById("fullName").value,
            studentID: studentID,
            role: roleSelect.value,
            department: deptSelect.value,
            course: roleSelect.value === 'Faculty' ? 'N/A' : document.getElementById("course").value,
            yearLevel: roleSelect.value === 'Faculty' ? 'N/A' : document.getElementById("yearLevel").value,
            createdAt: new Date()
        });
        alert("Registration Successful!");
        window.location.href = "index.html";
    } catch (err) { alert(err.message); }
});