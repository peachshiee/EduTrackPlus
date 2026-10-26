(() => {
  const form = document.getElementById("otpForm");
  if (!form) return;

  const codeInput = document.getElementById("code");
  const message = document.getElementById("formMessage");
  const submit = form.querySelector('[type="submit"]');

  codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const code = codeInput.value.trim();
    if (!/^\d{6}$/.test(code)) {
      message.textContent = "Enter the six-digit code.";
      message.dataset.state = "error";
      return;
    }

    submit.disabled = true;
    message.textContent = "Verifying code…";
    message.dataset.state = "pending";

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Code verification failed.");
      message.textContent = result.message || "Verified.";
      message.dataset.state = "success";
      window.location.assign(result.next || "/login.html");
    } catch (error) {
      message.textContent = error.message || "Unable to verify. Please try again.";
      message.dataset.state = "error";
    } finally {
      submit.disabled = false;
    }
  });
})();
