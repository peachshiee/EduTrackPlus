(() => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const role = document.getElementById("role");
  const inviteWrap = document.getElementById("adminInviteWrap");
  const message = document.getElementById("formMessage");
  const submit = form.querySelector('[type="submit"]');

  function showMessage(text, state = "error") {
    if (!message) return;
    message.textContent = text;
    message.dataset.state = state;
  }

  function updateInviteVisibility() {
    if (inviteWrap && role) {
      inviteWrap.hidden = role.value !== "school_admin";
    }
  }

  role?.addEventListener("change", updateInviteVisibility);
  updateInviteVisibility();

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const getValue = id =>
      document.getElementById(id)?.value?.trim() || "";

    const payload = {
      firstName: getValue("firstName"),
      lastName: getValue("lastName"),
      email: getValue("email"),
      address: getValue("address"),
      schoolId: getValue("schoolId"),
      courseYear: getValue("courseYear"),
      role: role?.value || "",
      password: document.getElementById("password")?.value || "",
      adminInviteCode: getValue("adminInviteCode")
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.address ||
      !payload.schoolId ||
      !payload.password
    ) {
      showMessage("Please complete all required fields.");
      return;
    }

    if (submit) submit.disabled = true;
    showMessage("Creating your account...", "pending");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          `Registration failed (HTTP ${response.status}).`
        );
      }

      showMessage(
        "Registration submitted successfully! Check your email for the six-digit verification code. Redirecting...",
        "success"
      );

      const nextPage = result.next || "/verify-otp.html";

      // Briefly show confirmation before opening the verification page.
      setTimeout(() => {
        window.location.assign(nextPage);
      }, 1200);

    } catch (error) {
      console.error("Registration error:", error);
      showMessage(
        error.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();