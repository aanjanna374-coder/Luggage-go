(() => {
    const read = key => {
        try { return JSON.parse(localStorage.getItem(key) || "[]"); }
        catch { return []; }
    };
    const bookings = read("bookings");
    const complaints = read("complaints");
    const activeUpdates = bookings.filter(item => item.status !== "Delivered").length + complaints.filter(item => item.status !== "Resolved").length;
    const userData = localStorage.getItem("loggedInUser");
    let email = userData || "";
    try { email = JSON.parse(userData)?.email || email; } catch {}
    const name = email.split("@")[0] || "Traveler";

    const nameNode = document.getElementById("userName");
    const welcomeNode = document.getElementById("welcomeName");
    if (nameNode) nameNode.textContent = name;
    if (welcomeNode) welcomeNode.textContent = name;

    const luggageCount = document.querySelector('.sidebar nav a[href="my-booking.html"] b');
    if (luggageCount) luggageCount.textContent = String(bookings.length);
    document.querySelectorAll(".notification-number, .icon-button span").forEach(node => {
        node.textContent = String(activeUpdates);
        node.hidden = activeUpdates === 0;
    });

    document.querySelector(".icon-button")?.addEventListener("click", () => {
        location.href = "notifications.html";
    });
    document.querySelector(".help-card button")?.addEventListener("click", () => {
        location.href = "contact.html";
    });
    document.querySelector(".promo-content button")?.addEventListener("click", () => {
        location.href = "booking.html";
    });
    document.querySelector(".logout")?.addEventListener("click", event => {
        event.preventDefault();
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("userRole");
        location.href = "home.html";
    });

    const search = document.querySelector(".search input");
    search?.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        const query = search.value.trim().toLowerCase();
        if (!query) return;
        const booking = bookings.find(item => String(item.id || "").toLowerCase().includes(query));
        if (!booking) {
            window.alert("No booking matches that tracking ID.");
            return;
        }
        localStorage.setItem("lastTrackingId", booking.id);
        location.href = `tracking.html?id=${encodeURIComponent(booking.id)}`;
    });
})();
