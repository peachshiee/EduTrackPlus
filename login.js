(() => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const message = document.getElementById("formMessage");
  const submit = form.querySelector('[type="submit"]');

  function showMessage(text, state = "error") {
    if (!message) {
      console.error("Missing #formMessage element:", text);
      return;
    }

    message.textContent = text;
    message.dataset.state = state;
    message.hidden = false;
  }

  form.addEventListener("submit", async event => {
    console.log("LOGIN HANDLER TRIGGERED");
    event.preventDefault();

    const payload = {
  username: document.getElementById("username")?.value.trim(),
  password: document.getElementById("password")?.value
};

if (!payload.username || !payload.password) {
  showMessage("Please enter your School ID and password.");
  return;
}

    if (submit) submit.disabled = true;
    showMessage("Checking your account...", "pending");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      });

      const raw = await response.text();
      let result = {};

      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        console.error("Unexpected login response:", raw);
        throw new Error(
          `The server returned an unexpected response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          `Sign-in failed (HTTP ${response.status}).`
        );
      }

      showMessage(
        result.message || "A verification code was sent to your email.",
        "success"
      );

      if (result.next) {
        window.location.assign(result.next);
      } else {
        window.location.assign("/verify-otp.html");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      showMessage(
        error.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();