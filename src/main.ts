interface User {
  id: number;
  name: string;
  email: string;
  address: { city: string };
}

const userListEl = document.getElementById("userList") as HTMLElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const sortBtn = document.getElementById("sortBtn") as HTMLButtonElement;
const loader = document.getElementById("loader") as HTMLElement;
const foundCountEl = document.getElementById("foundCount") as HTMLElement;
const favCountEl = document.getElementById("favCount") as HTMLElement;
const totalCountEl = document.getElementById("totalCount") as HTMLElement;

let users: User[] = [];
let isAscending = true;
let favorites: number[] = JSON.parse(localStorage.getItem("favorites") || "[]");

async function fetchUsers() {
  try {
    loader.style.display = "block";
    userListEl.innerHTML = "";
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    users = await res.json();
    totalCountEl.textContent = users.length.toString();
    renderUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    userListEl.innerHTML = "<p>Failed to load users.</p>";
  } finally {
    loader.style.display = "none";
  }
}

function toggleFavorite(id: number) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  favCountEl.textContent = favorites.length.toString();
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, term: string): string {
  if (!term) return text;
  const safe = escapeRegExp(term);
  const re = new RegExp(safe, "gi");
  return text.replace(re, `<span class="highlight">$&</span>`);
}

function renderUsers(data: User[], matchedTerm: string = "") {
  if (!userListEl) return;
  userListEl.innerHTML = "";

  data.forEach((user) => {
    const isFav = favorites.includes(user.id);
    const highlightedName = highlightMatch(user.name, matchedTerm);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="info">
        <div class="avatar" >${user.name.charAt(0)}</div>
            <div class="information">
                <h2 class="name">${highlightedName}</h2>
                <div class="location">${user.address.city}</div>
            </div>        
        </div>      
      <div class="email">📧 ${user.email}</div>
      <div class="actions">
        <div class="star ${isFav ? "fav" : ""}" data-id="${user.id}">★</div>
        <a href="#" class="view-profile">View Profile →</a>
      </div>
      
    `;
    userListEl.appendChild(card);
  });

  foundCountEl.textContent = data.length.toString();
  favCountEl.textContent = favorites.length.toString();

  const stars = document.querySelectorAll<HTMLDivElement>(".star");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const id = Number(star.dataset.id);
      toggleFavorite(id);
      renderUsers(data, matchedTerm); 
    });
  });
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = users.filter((u) => u.name.toLowerCase().includes(term));
  renderUsers(filtered, searchInput.value.trim());
});

sortBtn.addEventListener("click", () => {
  users.sort((a, b) =>
    isAscending ? a.name.length - b.name.length : b.name.length - a.name.length
  );
  isAscending = !isAscending;
  renderUsers(users, searchInput.value.trim());
});

fetchUsers();
