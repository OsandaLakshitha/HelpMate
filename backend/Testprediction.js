import axios from "axios";

const API = "http://localhost:8080/api";

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {

console.log("\n========= RAP SYSTEM TEST =========\n");

const email = `student_${Date.now()}@rap.test`;
const password = "Password123!";

let token;


/* ---------------- REGISTER ---------------- */

const register = await axios.post(`${API}/auth/register`, {
  firstName: "RAP",
  lastName: "Tester",
  email,
  password
});

console.log("Student created:", email);


/* ---------------- LOGIN ---------------- */

const login = await axios.post(`${API}/auth/login`, {
  email,
  password
});

token = login.data.token;

const headers = {
  Authorization: `Bearer ${token}`
};

console.log("Login successful");


/* ---------------- CREATE PROJECT 1 ---------------- */

const project1 = await axios.post(
`${API}/projects`,
{
title: "Snake Game Mobile App",
description: "Android snake game",
complexity: "High",
projectType: "Coding",
dueDate: "2026-03-20"
},
{ headers }
);

const project1Id = project1.data.project._id;

console.log("Project 1:", project1Id);


/* ---------------- CREATE PROJECT 2 ---------------- */

const project2 = await axios.post(
`${API}/projects`,
{
title: "Web Task Manager",
description: "MERN task manager",
complexity: "Medium",
projectType: "Coding",
dueDate: "2026-03-25"
},
{ headers }
);

const project2Id = project2.data.project._id;

console.log("Project 2:", project2Id);


/* ---------------- GENERATE TASKS ---------------- */

console.log("\nGenerating tasks...");

await axios.post(`${API}/tasks/generate`, { projectId: project1Id }, { headers });
await axios.post(`${API}/tasks/generate`, { projectId: project2Id }, { headers });

await sleep(2000);


/* ---------------- LOAD TASKS ---------------- */

const tasks1 = await axios.get(`${API}/tasks?projectId=${project1Id}`, { headers });
const tasks2 = await axios.get(`${API}/tasks?projectId=${project2Id}`, { headers });

const list1 = tasks1.data.tasks;
const list2 = tasks2.data.tasks;

console.log("Tasks loaded");


/* ---------------- SIMULATE CONSISTENT STUDENT ---------------- */

console.log("\nSimulating consistent student...\n");

for (let day = 0; day < 4; day++) {

console.log(`DAY ${day + 1}`);

if (list1[day]) {
await axios.post(`${API}/tasks/${list1[day]._id}/complete`, {}, { headers });
console.log("Completed P1:", list1[day].name);
}

if (list2[day]) {
await axios.post(`${API}/tasks/${list2[day]._id}/complete`, {}, { headers });
console.log("Completed P2:", list2[day].name);
}

await sleep(1500);

}


/* ---------------- CHECK PREDICTIONS ---------------- */

console.log("\nFetching predictions...\n");

const prediction1 = await axios.get(`${API}/predictions/${project1Id}`, { headers });
const prediction2 = await axios.get(`${API}/predictions/${project2Id}`, { headers });

console.log("Project 1 Prediction:");
console.log(prediction1.data);

console.log("\nProject 2 Prediction:");
console.log(prediction2.data);

console.log("\n========= TEST COMPLETE =========\n");

}

main().catch(err => {
console.error(err.response?.data || err.message);
});