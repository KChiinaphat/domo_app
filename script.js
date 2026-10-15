const tables = [
  { id: "T1", name: "Large table (6 seats)", type: "large", capacity: 6, icon: "🪑" },
  { id: "T2", name: "Small table (4 seats)", type: "small", capacity: 4, icon: "🛖" },
  { id: "T3", name: "Small table (4 seats)", type: "small", capacity: 4, icon: "🛖" },
  { id: "T4", name: "Small table (4 seats)", type: "small", capacity: 4, icon: "🛖" },
  { id: "T5", name: "Small table (4 seats)", type: "small", capacity: 4, icon: "🛖" }
];

const boardGames = [
  { id: "BG1", name: "Catan", players: "3-4 players", duration: "60-90 min", category: "Strategy" },
  { id: "BG2", name: "Ticket to Ride", players: "2-5 players", duration: "45-75 min", category: "Travel" },
  { id: "BG3", name: "Carcassonne", players: "2-5 players", duration: "45 min", category: "City building" },
  { id: "BG4", name: "Splendor", players: "2-4 players", duration: "30-45 min", category: "Treasure" },
  { id: "BG5", name: "Pandemic", players: "2-4 players", duration: "45 min", category: "Adventure" },
  { id: "BG6", name: "Azul", players: "2-4 players", duration: "45 min", category: "Design" },
  { id: "BG7", name: "Sushi Go!", players: "2-5 players", duration: "20 min", category: "Card game" },
  { id: "BG8", name: "7 Wonders", players: "3-7 players", duration: "30-45 min", category: "Civilization" },
  { id: "BG9", name: "Love Letter", players: "2-4 players", duration: "20 min", category: "Party" },
  { id: "BG10", name: "King of Tokyo", players: "2-6 players", duration: "30 min", category: "Battle" },
  { id: "BG11", name: "Qwirkle", players: "2-4 players", duration: "30-45 min", category: "Pattern" },
  { id: "BG12", name: "Terraforming Mars", players: "1-5 players", duration: "90-120 min", category: "Science" },
  { id: "BG13", name: "The Crew", players: "3-5 players", duration: "20 min", category: "Co-op" },
  { id: "BG14", name: "Uno", players: "2-10 players", duration: "20 min", category: "Family" },
  { id: "BG15", name: "Monopoly", players: "2-8 players", duration: "60-90 min", category: "Classic" },
  { id: "BG16", name: "Mafia", players: "5-10 players", duration: "20-30 min", category: "Party" },
  { id: "BG17", name: "Jenga", players: "1-8 players", duration: "10-20 min", category: "Tower" },
  { id: "BG18", name: "Exploding Kittens", players: "2-5 players", duration: "15 min", category: "Comedy" },
  { id: "BG19", name: "Rummikub", players: "2-4 players", duration: "30 min", category: "Tile" },
  { id: "BG20", name: "Gloomhaven", players: "1-4 players", duration: "120 min", category: "Adventure" },
  { id: "BG21", name: "Betrayal at House on the Hill", players: "3-6 players", duration: "60 min", category: "Horror" },
  { id: "BG22", name: "Wingspan", players: "1-5 players", duration: "70 min", category: "Engine building" },
  { id: "BG23", name: "Sequence", players: "2-12 players", duration: "30 min", category: "Classic" },
  { id: "BG24", name: "The Resistance", players: "5-10 players", duration: "30 min", category: "Social deduction" }
];

const timeSlots = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00"
];

const storageKey = "boardgame-bookings";

const state = {
  selectedTableId: null,
  selectedGames: new Set(),
  date: "",
  time: "10:00",
  guestCount: 4,
  bookings: loadBookings()
};

const bookingDateInput = document.getElementById("bookingDate");
const bookingTimeSelect = document.getElementById("bookingTime");
const guestCountInput = document.getElementById("guestCount");
const tableGrid = document.getElementById("tableGrid");
const boardGameList = document.getElementById("boardGameList");
const selectedTableBox = document.getElementById("selectedTableBox");
const selectedGameBox = document.getElementById("selectedGameBox");
const bookingForm = document.getElementById("bookingForm");
const resetSelectionButton = document.getElementById("resetSelection");
const gameCount = document.getElementById("gameCount");

function loadBookings() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveBookings() {
  localStorage.setItem(storageKey, JSON.stringify(state.bookings));
}

function getEndTime(slot) {
  const [hours, minutes] = slot.split(":").map(Number);
  return `${String((hours + 1) % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatDate(dateString) {
  if (!dateString) return "Select a date";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function initDateAndTime() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  const date = localDate.toISOString().split("T")[0];
  state.date = date;
  bookingDateInput.value = date;

  bookingTimeSelect.innerHTML = timeSlots
    .map((slot) => `<option value="${slot}">${slot} - ${getEndTime(slot)}</option>`)
    .join("");

  bookingTimeSelect.value = state.time;
  guestCountInput.value = state.guestCount;
}

function getTableAvailability(tableId) {
  return !state.bookings.some((booking) => {
    return (
      booking.tableId === tableId &&
      booking.date === state.date &&
      booking.time === state.time
    );
  });
}

function renderTables() {
  tableGrid.innerHTML = tables
    .map((table) => {
      const isAvailable = getTableAvailability(table.id);
      const isSelected = state.selectedTableId === table.id;
      const isMatch = state.guestCount <= table.capacity;

      return `
        <article class="table-card ${isAvailable ? "" : "unavailable"} ${isSelected ? "selected" : ""}" data-table-id="${table.id}">
          <div class="table-header">
            <span class="table-badge">${isAvailable ? "Available" : "Booked"}</span>
            <span class="table-icon">${table.icon}</span>
          </div>
          <div class="table-name">${table.name}</div>
          <div class="table-info">
            <span class="capacity">Seats: ${table.capacity}</span>
            <span>${table.type === "large" ? "Large" : "Small"}</span>
          </div>
          <div class="table-status">${!isMatch ? `Guest count exceeds capacity` : isAvailable ? "Ready to book" : "Reserved for this time slot"}</div>
        </article>
      `;
    })
    .join("");

  tableGrid.querySelectorAll(".table-card").forEach((card) => {
    const tableId = card.dataset.tableId;
    const table = tables.find((item) => item.id === tableId);
    const available = getTableAvailability(tableId);

    if (!available) {
      card.setAttribute("aria-disabled", "true");
      return;
    }

    card.addEventListener("click", () => {
      if (state.guestCount > table.capacity) {
        alert(`Table ${table.name} supports up to ${table.capacity} guests. Please choose a suitable number of people.`);
        return;
      }

      state.selectedTableId = tableId;
      renderTableSummary();
      renderTables();
    });
  });
}

function renderBoardGames() {
  boardGameList.innerHTML = boardGames
    .map((game) => {
      const isSelected = state.selectedGames.has(game.id);
      return `
        <article class="game-card ${isSelected ? "selected" : ""}">
          <div class="game-meta">
            <div class="game-title">${game.name}</div>
            <span class="game-tag">${game.category}</span>
          </div>
          <div class="game-details">
            <span>Players: ${game.players}</span>
            <span>Time: ${game.duration}</span>
          </div>
          <div class="game-check">
            <label for="game-${game.id}">Select</label>
            <input id="game-${game.id}" type="checkbox" data-game-id="${game.id}" ${isSelected ? "checked" : ""} />
          </div>
        </article>
      `;
    })
    .join("");

  gameCount.textContent = state.selectedGames.size;

  boardGameList.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const gameId = event.target.dataset.gameId;
      if (event.target.checked) {
        state.selectedGames.add(gameId);
      } else {
        state.selectedGames.delete(gameId);
      }
      renderBoardGames();
      renderTableSummary();
    });
  });
}

function renderTableSummary() {
  if (!state.selectedTableId) {
    selectedTableBox.textContent = "No table selected yet";
    selectedTableBox.classList.add("empty");
  } else {
    const selectedTable = tables.find((table) => table.id === state.selectedTableId);
    selectedTableBox.textContent = `${selectedTable.name} • ${selectedTable.capacity} guests • ${state.time}`;
    selectedTableBox.classList.remove("empty");
  }

  const selectedGames = [...state.selectedGames].map((gameId) => {
    const game = boardGames.find((item) => item.id === gameId);
    return game ? game.name : "";
  });

  if (selectedGames.length === 0) {
    selectedGameBox.textContent = "No game selected yet";
    selectedGameBox.classList.add("empty");
  } else {
    selectedGameBox.textContent = selectedGames.join(", ");
    selectedGameBox.classList.remove("empty");
  }
}

function refreshBookingSummary() {
  renderTableSummary();
  renderTables();
  renderBoardGames();
}

bookingDateInput.addEventListener("change", (event) => {
  state.date = event.target.value;
  refreshBookingSummary();
});

bookingTimeSelect.addEventListener("change", (event) => {
  state.time = event.target.value;
  refreshBookingSummary();
});

guestCountInput.addEventListener("input", (event) => {
  const value = Number(event.target.value || 0);
  state.guestCount = value;

  const selectedTable = tables.find((table) => table.id === state.selectedTableId);
  if (selectedTable && value > selectedTable.capacity) {
    state.selectedTableId = null;
  }

  refreshBookingSummary();
});

resetSelectionButton.addEventListener("click", () => {
  state.selectedTableId = null;
  state.selectedGames.clear();
  bookingForm.reset();
  guestCountInput.value = 4;
  state.guestCount = 4;
  renderBoardGames();
  renderTableSummary();
  renderTables();
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const customerName = document.getElementById("customerName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();

  if (!customerName || !phoneNumber) {
    alert("Please complete both the customer name and phone number.");
    return;
  }

  if (!state.selectedTableId) {
    alert("Please select a table before confirming the booking.");
    return;
  }

  const selectedTable = tables.find((table) => table.id === state.selectedTableId);
  if (state.guestCount > selectedTable.capacity) {
    alert(`Table ${selectedTable.name} supports up to ${selectedTable.capacity} guests.`);
    return;
  }

  if (!getTableAvailability(state.selectedTableId)) {
    alert("The selected table is already booked at this time. Please choose another table.");
    return;
  }

  const booking = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    customerName,
    phoneNumber,
    tableId: state.selectedTableId,
    tableName: selectedTable.name,
    date: state.date,
    time: state.time,
    guestCount: state.guestCount,
    games: Array.from(state.selectedGames).map((gameId) => {
      const game = boardGames.find((item) => item.id === gameId);
      return game ? game.name : "";
    })
  };

  state.bookings.push(booking);
  saveBookings();

  alert(
    `Booking confirmed\nCustomer: ${customerName}\nTable: ${selectedTable.name}\nDate: ${formatDate(state.date)}\nTime: ${state.time}\nGames: ${booking.games.length ? booking.games.join(", ") : "-"}`
  );

  state.selectedTableId = null;
  state.selectedGames.clear();
  bookingForm.reset();
  guestCountInput.value = 4;
  state.guestCount = 4;
  renderBoardGames();
  renderTableSummary();
  renderTables();
});

initDateAndTime();
renderTables();
renderBoardGames();
renderTableSummary();
