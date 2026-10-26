(() => {
  const requestForm = document.getElementById("requestSetupForm");
  const completeForm = document.getElementById("completeSetupForm");
  if (!requestForm || !completeForm) return;

  const requestMessage = document.getElementById("requestMessage");
  const completeMessage = document.getElementById("completeMessage");

  function show(el, text, state = "error") {
    el.textContent = text;
    el.dataset.state = state;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("verified") === "1") {
    requestForm.hidden = true;
    completeForm.hidden = false;
  }

  requestForm.addEventListener("submit", async event => {
    event.preventDefault();
    const button = requestForm.querySelector('[type="submit"]');
    button.disabled = true;
    show(requestMessage, "Sending verification code…", "pending");

    try {
      const response = await fetch("/api/auth/setup-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          schoolId: document.getElementById("schoolId").value.trim(),
          email: document.getElementById("email").value.trim()
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send code.");
      window.location.assign(result.next || "/verify-otp.html");
    } catch (error) {
      show(requestMessage, error.message || "Please try again.");
    } finally {
      button.disabled = false;
    }
  });

  completeForm.addEventListener("submit", async event => {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      show(completeMessage, "The passwords do not match.");
      return;
    }

    const button = completeForm.querySelector('[type="submit"]');
    button.disabled = true;
    show(completeMessage, "Saving password…", "pending");

    try {
      const response = await fetch("/api/auth/setup-password/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password, confirmPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save password.");
      show(completeMessage, result.message || "Password saved.", "success");
      window.location.assign(result.next || "/login.html");
    } catch (error) {
      show(completeMessage, error.message || "Please try again.");
    } finally {
      button.disabled = false;
    }
  });
})();
