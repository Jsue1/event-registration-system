const eventForm = document.getElementById("event-form");
const registrationForm = document.getElementById("registration-form");
const eventsList = document.getElementById("events-list");
const selectedEvent = document.getElementById("selected-event");
const notice = document.getElementById("notice");

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function showMessage(message, isError = false) {
  notice.textContent = message;
  notice.style.color = isError ? "#b42318" : "#245b38";
}

async function loadStats() {
  const stats = await api("/api/stats");
  document.getElementById("event-total").textContent = stats.events;
  document.getElementById("registration-total").textContent = stats.registrations;
}

async function loadEvents() {
  const events = await api("/api/events");
  selectedEvent.innerHTML = "";

  if (events.length === 0) {
    selectedEvent.innerHTML = '<option value="">Create an event first</option>';
    eventsList.innerHTML = '<p class="empty">No events yet. Create your first event above.</p>';
  } else {
    selectedEvent.innerHTML = '<option value="">Select an event</option>';
    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = event.title;
      selectedEvent.appendChild(option);
    });

    eventsList.innerHTML = "";
    events.forEach((event) => {
      const card = document.createElement("article");
      card.className = "event-card";

      const top = document.createElement("div");
      top.className = "event-card-top";
      const details = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = event.title;
      const meta = document.createElement("div");
      meta.className = "event-meta";
      meta.textContent = `Date: ${event.event_date}  ·  Location: ${event.location}  ·  Participants: ${event.participant_count}`;
      details.append(title, meta);
      top.append(details);
      card.append(top);

      if (event.description) {
        const description = document.createElement("p");
        description.className = "event-description";
        description.textContent = event.description;
        card.append(description);
      }

      const actions = document.createElement("div");
      actions.className = "event-actions";
      const viewButton = document.createElement("button");
      viewButton.className = "small-button view-button";
      viewButton.textContent = "View participants";
      viewButton.addEventListener("click", () => toggleRegistrations(event.id, card));

      const deleteButton = document.createElement("button");
      deleteButton.className = "small-button delete-button";
      deleteButton.textContent = "Delete event";
      deleteButton.addEventListener("click", async () => {
        if (!confirm(`Delete "${event.title}" and its registrations?`)) return;
        try {
          await api(`/api/events/${event.id}`, { method: "DELETE" });
          showMessage("Event deleted.");
          await refresh();
        } catch (error) { showMessage(error.message, true); }
      });

      actions.append(viewButton, deleteButton);
      card.append(actions);
      eventsList.append(card);
    });
  }

  await loadStats();
}

async function toggleRegistrations(eventId, card) {
  const existing = card.querySelector(".registration-list");
  if (existing) { existing.remove(); return; }

  try {
    const registrations = await api(`/api/events/${eventId}/registrations`);
    const section = document.createElement("div");
    section.className = "registration-list";
    const heading = document.createElement("strong");
    heading.textContent = "Registered participants";
    section.append(heading);

    if (registrations.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No participants registered yet.";
      section.append(empty);
    } else {
      registrations.forEach((person) => {
        const row = document.createElement("div");
        row.className = "registration-row";
        const label = document.createElement("span");
        label.textContent = `${person.participant_name} (${person.email})`;
        const remove = document.createElement("button");
        remove.className = "small-button delete-button";
        remove.textContent = "Remove";
        remove.addEventListener("click", async () => {
          try {
            await api(`/api/registrations/${person.id}`, { method: "DELETE" });
            showMessage("Participant registration removed.");
            await refresh();
          } catch (error) { showMessage(error.message, true); }
        });
        row.append(label, remove);
        section.append(row);
      });
    }
    card.append(section);
  } catch (error) { showMessage(error.message, true); }
}

eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: document.getElementById("event-title").value,
    event_date: document.getElementById("event-date").value,
    location: document.getElementById("event-location").value,
    description: document.getElementById("event-description").value
  };
  try {
    await api("/api/events", { method: "POST", body: JSON.stringify(payload) });
    eventForm.reset();
    showMessage("Event created successfully.");
    await refresh();
  } catch (error) { showMessage(error.message, true); }
});

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const eventId = selectedEvent.value;
  if (!eventId) { showMessage("Please select an event.", true); return; }

  const payload = {
    participant_name: document.getElementById("participant-name").value,
    email: document.getElementById("participant-email").value
  };
  try {
    await api(`/api/events/${eventId}/registrations`, {
      method: "POST", body: JSON.stringify(payload)
    });
    registrationForm.reset();
    showMessage("Participant registered successfully.");
    await refresh();
  } catch (error) { showMessage(error.message, true); }
});

async function refresh() {
  try { await loadEvents(); }
  catch (error) {
    eventsList.innerHTML = '<p class="empty">Cannot connect to the backend. Make sure both Docker containers are running.</p>';
    showMessage(error.message, true);
  }
}

document.getElementById("refresh-button").addEventListener("click", refresh);
refresh();
