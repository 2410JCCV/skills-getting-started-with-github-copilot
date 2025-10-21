document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - (Array.isArray(details.participants) ? details.participants.length : 0);

        // Header area
        const headerDiv = document.createElement("div");
        headerDiv.className = "activity-header";
        headerDiv.innerHTML = `
          <div class="activity-title">
            <h4>${name}</h4>
            <span class="spots-left" aria-hidden="true">${spotsLeft} plazas</span>
          </div>
          <p class="activity-desc">${details.description}</p>
          <p class="activity-schedule"><strong>Horario:</strong> ${details.schedule}</p>
        `;

        activityCard.appendChild(headerDiv);

        // Participants section (sempre visible)
        const participantsSection = document.createElement("section");
        participantsSection.className = "participants-section";
        participantsSection.setAttribute("aria-labelledby", `participants-${cssEscape(name)}-label`);

        // Header with count badge
        const participantsHeader = document.createElement("div");
        participantsHeader.className = "participants-header";
        const headerH5 = document.createElement("h5");
        headerH5.id = `participants-${cssEscape(name)}-label`;
        headerH5.textContent = "Participantes";
        headerH5.className = "participants-title";

        const countSpan = document.createElement("span");
        countSpan.className = "participants-count badge";
        const count = Array.isArray(details.participants) ? details.participants.length : 0;
        countSpan.textContent = `${count}`;

        participantsHeader.appendChild(headerH5);
        participantsHeader.appendChild(countSpan);

        // Participants list (ul with bullets)
        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        participantsList.setAttribute("role", "list");
        participantsList.setAttribute("aria-label", `Participantes de ${name}`);

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            // Support a string or an object { name, email }
            if (typeof p === "string") {
              li.textContent = p;
            } else if (p && typeof p === "object") {
              li.textContent = p.name || p.email || JSON.stringify(p);
            } else {
              li.textContent = String(p);
            }
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "participant-empty";
          li.textContent = "Sin participantes por ahora";
          participantsList.appendChild(li);
        }

        participantsSection.appendChild(participantsHeader);
        participantsSection.appendChild(participantsList);

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown (avoid duplicates)
        if (!Array.from(activitySelect.options).some(o => o.value === name)) {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          activitySelect.appendChild(option);
        }
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>No se pudieron cargar las actividades. Inténtalo más tarde.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Helper: CSS-safe id (very small escape to avoid spaces/quotes)
  function cssEscape(str) {
    return String(str).replace(/[^a-zA-Z0-9_-]/g, "-");
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;

    if (!email || !activity) {
      showMessage("Completa el email y selecciona una actividad.", "error");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message || "Inscripción realizada.", "success");
        signupForm.reset();
        // refresh list to show new participant
        fetchActivities();
      } else {
        showMessage(result.detail || result.message || "Ocurrió un error", "error");
      }
    } catch (error) {
      showMessage("No se pudo completar la inscripción. Inténtalo de nuevo.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Utility to show messages
  function showMessage(text, type = "info") {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");
    messageDiv.setAttribute("role", "status");
    messageDiv.setAttribute("aria-live", "polite");

    // Hide message after 5 seconds
    clearTimeout(showMessage._timeout);
    showMessage._timeout = setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Initialize app
  fetchActivities();
});
