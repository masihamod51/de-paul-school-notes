import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

/*
  1. Create a free Firebase project.
  2. Enable Authentication > Email/Password.
  3. Create a teacher user.
  4. Enable Firestore Database and Storage.
  5. Paste your Firebase web-app configuration below.
*/
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const configured = !firebaseConfig.apiKey.startsWith("PASTE_");
let auth, db, storage;
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app); db = getFirestore(app); storage = getStorage(app);
}

const grid = document.querySelector("#notesGrid");
const empty = document.querySelector("#empty");
const search = document.querySelector("#search");
let notes = [];

function render(filter="") {
  const f = filter.toLowerCase();
  const shown = notes.filter(n => `${n.title} ${n.subject} ${n.className}`.toLowerCase().includes(f));
  grid.innerHTML = shown.map(n => `
    <article class="card">
      <span class="tag">${escapeHtml(n.className)} • ${escapeHtml(n.subject)}</span>
      <h3>${escapeHtml(n.title)}</h3>
      <p>PDF Notes</p>
      <a class="open" target="_blank" rel="noopener" href="${n.url}">📖 Open Notes</a>
    </article>`).join("");
  empty.classList.toggle("hidden", shown.length !== 0);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

async function loadNotes(){
  if(!configured){
    notes = [
      {className:"Class 10",subject:"Economics",title:"Money and Credit – Sample",url:"#"},
      {className:"Class 10",subject:"Geography",title:"Forests and Wildlife Resources – Sample",url:"#"}
    ];
    render();
    return;
  }
  const snap = await getDocs(query(collection(db,"notes"),orderBy("createdAt","desc")));
  notes = snap.docs.map(d=>({id:d.id,...d.data()}));
  render();
}
loadNotes().catch(e=>{console.error(e);empty.textContent="Unable to load notes. Check Firebase setup.";});

search.addEventListener("input",e=>render(e.target.value));

const modal=document.querySelector("#loginModal");
document.querySelector("#adminBtn").onclick=()=>modal.classList.remove("hidden");
document.querySelector("#closeModal").onclick=()=>modal.classList.add("hidden");

if(configured){
  onAuthStateChanged(auth,user=>{
    document.querySelector("#adminPanel").classList.toggle("hidden",!user);
    document.querySelector("#adminBtn").textContent=user?"Teacher Panel":"Teacher Login";
  });
}else{
  document.querySelector("#adminBtn").onclick=()=>alert("First connect the website to Firebase. See SETUP.md.");
}

document.querySelector("#loginBtn").onclick=async()=>{
  const status=document.querySelector("#loginStatus");
  if(!configured){status.textContent="Firebase is not connected yet.";return;}
  try{
    await signInWithEmailAndPassword(auth,document.querySelector("#email").value,document.querySelector("#password").value);
    modal.classList.add("hidden");
  }catch(e){status.textContent="Login failed. Check email and password.";}
};
document.querySelector("#logoutBtn").onclick=()=>signOut(auth);

document.querySelector("#uploadForm").onsubmit=async e=>{
  e.preventDefault();
  const status=document.querySelector("#uploadStatus");
  if(!configured){status.textContent="Firebase is not connected yet.";return;}
  const file=document.querySelector("#file").files[0];
  if(!file || file.type!=="application/pdf"){status.textContent="Please select a PDF file.";return;}
  if(file.size>25*1024*1024){status.textContent="Please keep each PDF under 25 MB.";return;}
  status.textContent="Uploading…";
  try{
    const safe=Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const storageRef=ref(storage,`notes/${safe}`);
    await uploadBytes(storageRef,file,{contentType:"application/pdf"});
    const url=await getDownloadURL(storageRef);
    await addDoc(collection(db,"notes"),{
      className:document.querySelector("#className").value,
      subject:document.querySelector("#subject").value.trim(),
      title:document.querySelector("#title").value.trim(),
      url,createdAt:serverTimestamp()
    });
    status.textContent="Uploaded successfully!";
    e.target.reset();
    await loadNotes();
  }catch(err){console.error(err);status.textContent="Upload failed. Check Firebase rules and setup.";}
};
