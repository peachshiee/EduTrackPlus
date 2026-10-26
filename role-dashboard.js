(() => {
  const root = document.querySelector("[data-required-role]");
  if (!root) return;

  const requiredRole = root.dataset.requiredRole;
  const roleEndpoint = {
    student: "/api/student/summary",
    professor: "/api/professor/summary",
    school_admin: "/api/admin/summary"
  }[requiredRole];

  async function start() {
    try {
      const meResponse = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!meResponse.ok) {
        window.location.replace("/login.html");
        return;
      }

      const me = await meResponse.json();
      if (me.user.role !== requiredRole) {
        const target = {
          student: "/student-dashboard.html",
          professor: "/professor-dashboard.html",
          school_admin: "/admin-dashboard.html"
        }[me.user.role];
        window.location.replace(target || "/login.html");
        return;
      }

      const name = document.querySelector("[data-user-name]");
      if (name) name.textContent = `${me.user.firstName} ${me.user.lastName}`;

      const schoolId = document.querySelector("[data-user-school-id]");
      if (schoolId) schoolId.textContent = me.user.schoolId;

      if (roleEndpoint) {
        const response = await fetch(roleEndpoint, { credentials: "same-origin" });
        if (!response.ok) throw new Error("Could not load role dashboard.");
        const result = await response.json();
        const status = document.querySelector("[data-dashboard-status]");
        if (status) status.textContent = result.message;
      }
    } catch {
      const status = document.querySelector("[data-dashboard-status]");
      if (status) status.textContent = "Dashboard information could not be loaded. Please refresh.";
    }
  }

  const logout = document.querySelector("[data-logout]");
  if (logout) {
    logout.addEventListener("click", async event => {
      event.preventDefault();
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin"
        });
      } finally {
        window.location.assign("/login.html");
      }
    });
  }

  start();
})();
