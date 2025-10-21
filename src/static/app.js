document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper: CSS-safe id (small escape to avoid spaces/quotes)
  function cssEscape(str) {
    return String(str).replace(/[^a-zA-Z0-9_-]/g, "-");
  }

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

  // Fetch activities from API and render UI
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const activities = await response.json();

      // Clear loading message and UI
      activitiesList.innerHTML = "";
      // Clear existing options (keep placeholder at index 0)
      Array.from(activitySelect.options).slice(1).forEach(o => o.remove());

      Object.entries(activities).forEach(([name, details]) => {
        const participants = Array.isArray(details.participants) ? details.participants : [];
        const spotsLeft = (details.max_participants || 0) - participants.length;

        // Card container
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        // Header area (built with elements to avoid injection)
        const headerDiv = document.createElement("div");
        headerDiv.className = "activity-header";

        const titleRow = document.createElement("div");
        titleRow.className = "activity-title";

        const h4 = document.createElement("h4");
        h4.textContent = name;

        const spotsSpan = document.createElement("span");
        spotsSpan.className = "spots-left";
        spotsSpan.setAttribute("aria-hidden", "true");
        spotsSpan.textContent = `${spotsLeft} plazas`;

        titleRow.appendChild(h4);
        titleRow.appendChild(spotsSpan);

        const descP = document.createElement("p");
        descP.className = "activity-desc";
        descP.textContent = details.description || "";

        const schedP = document.createElement("p");
        schedP.className = "activity-schedule";
        schedP.innerHTML = `<strong>Horario:</strong> ${details.schedule || ""}`;

        headerDiv.appendChild(titleRow);
        headerDiv.appendChild(descP);
        headerDiv.appendChild(schedP);
        activityCard.appendChild(headerDiv);

        // Participants section (visible, styled)
        const participantsSection = document.createElement("section");
        participantsSection.className = "participants-section";
        const escaped = cssEscape(name);
        participantsSection.setAttribute("aria-labelledby", `participants-${escaped}-label`);

        const participantsHeader = document.createElement("div");
        participantsHeader.className = "participants-header";

        const headerH5 = document.createElement("h5");
        headerH5.id = `participants-${escaped}-label`;
        headerH5.className = "participants-title";
        headerH5.textContent = "Participantes";

        const countSpan = document.createElement("span");
        countSpan.className = "badge participants-count";
        countSpan.textContent = `${participants.length}`;

        participantsHeader.appendChild(headerH5);
        participantsHeader.appendChild(countSpan);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        participantsList.setAttribute("role", "list");
        participantsList.setAttribute("aria-label", `Participantes de ${name}`);

        if (participants.length > 0) {
          participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            if (typeof p === "string") li.textContent = p;
            else if (p && typeof p === "object") li.textContent = p.name || p.email || JSON.stringify(p);
            else li.textContent = String(p);
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

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>No se pudieron cargar las actividades. Inténtalo más tarde.</p>";
      console.error("Error fetching activities:", error);
    }
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
        { method: "POST" }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message || "Inscripción realizada.", "success");
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || result.message || "Ocurrió un error", "error");
      }
    } catch (error) {
      showMessage("No se pudo completar la inscripción. Inténtalo de nuevo.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize
  fetchActivities();
});
