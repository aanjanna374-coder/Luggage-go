(() => {
    const body = document.body;
    const page = body.dataset.page;
    const depth = Number(body.dataset.depth || 0);
    const root = "../".repeat(depth);
    const statuses = ["Booked", "Pickup Assigned", "Picked Up", "In Transit", "Destination Reached", "Delivered"];
    const element = (tag, text, className) => {
        const node = document.createElement(tag);
        if (text !== undefined && text !== null) node.textContent = text;
        if (className) node.className = className;
        return node;
    };
    const read = (key, fallback = []) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "null");
            return value === null ? fallback : value;
        } catch {
            return fallback;
        }
    };
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const bookings = () => read("bookings");
    const complaints = () => read("complaints");
    function staffAccounts() {
        if (localStorage.getItem("staffAccounts") === null) {
            const demoStaff = [{ staffId: "STF-001", name: "Nani", email: "staff@gmail.com", password: "staff123", phone: "", address: "", position: "Delivery Staff", department: "Delivery Operations", status: "Active" }];
            write("staffAccounts", demoStaff);
        }
        const records = read("staffAccounts");
        const demoStaff = records.find(item => item.email.toLowerCase() === "nani@gmail.com");
        if (demoStaff && demoStaff.name === "Nani") {
            const oldKey = demoStaff.email.split("@")[0];
            const newKey = "staff";
            demoStaff.email = "staff@gmail.com";
            const assigned = bookings();
            assigned.forEach(booking => { if (booking.assignedDriver === oldKey) booking.assignedDriver = newKey; });
            write("bookings", assigned);
            const profile = read(`staffProfile_driver_${oldKey}`, null);
            if (profile) {
                Object.assign(profile, { name: demoStaff.name, email: demoStaff.email });
                write(`staffProfile_driver_${newKey}`, profile);
                localStorage.removeItem(`staffProfile_driver_${oldKey}`);
            }
            write("staffAccounts", records);
        }
        return records;
    }
    const money = value => value || "-";
    const getSignedInEmail = () => {
        const value = localStorage.getItem("loggedInUser");
        try {
            const identity = JSON.parse(value);
            return identity?.email || value || "";
        } catch {
            return value || "";
        }
    };
    const userName = () => getSignedInEmail().split("@")[0] || "Staff member";

    const roleLinks = {
        admin: [
            ["Overview", "admin/dashboard.html"], ["Bookings", "admin/bookings.html"],
            ["Customers", "admin/users.html"], ["Drivers", "admin/drivers.html"], ["Staff", "admin/staff.html"],
            ["Workers", "admin/workers.html"], ["Support", "admin/support.html"],
            ["Vehicles", "admin/vehicles.html"], ["Reports", "admin/reports.html"]
        ],
        driver: [["Overview", "admin/driver/dashboard.html"], ["Assignments", "admin/driver/assignments.html"], ["Profile", "admin/driver/profile.html"]],
        worker: [["Overview", "admin/driver/worker/dashboard.html"], ["Luggage", "admin/driver/worker/luggage.html"], ["Profile", "admin/driver/worker/profile.html"]],
        support: [["Overview", "admin/driver/worker/support/dashboard.html"], ["Complaints", "admin/driver/worker/support/complaints.html"], ["Profile", "admin/driver/worker/support/profile.html"]],
        customer: [["Overview", "index.html"], ["Book delivery", "booking.html"], ["Track", "tracking.html"], ["My luggage", "my-booking.html"], ["Notifications", "notifications.html"], ["Profile", "profile.html"], ["Support", "contact.html"]]
    };

    function addHeader(role) {
        const header = element("header", undefined, "navbar");
        const brand = element("a", "LuggageGo", "brand");
        brand.href = root + (role === "customer" ? "index.html" : roleLinks[role][0][1]);
        header.append(brand);
        const nav = element("nav");
        for (const [label, href] of roleLinks[role]) {
            const link = element("a", label);
            link.href = root + href;
            if (location.pathname.endsWith("/" + href)) link.classList.add("active");
            nav.append(link);
        }
        header.append(nav);
        const user = element("div", undefined, "nav-user");
        const display = element("span", userName());
        const logout = element("button", "Logout");
        logout.type = "button";
        logout.addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("userRole");
            location.href = root + "home.html";
        });
        user.append(display, logout);
        header.append(user);
        body.insertBefore(header, body.firstChild);
    }

    function setup(title, description, role) {
        addHeader(role);
        const main = document.getElementById("opsRoot") || element("main");
        main.className = "container page";
        if (!main.id) main.id = "opsRoot";
        main.replaceChildren();
        const heading = element("div", undefined, "section-heading");
        heading.append(element("h1", title), element("p", description));
        main.append(heading);
        return main;
    }

    function makeTable(headers, rows, emptyText, emptyHref) {
        if (!rows.length) {
            const empty = element("div", undefined, "panel empty-state");
            empty.append(element("p", emptyText));
            if (emptyHref) {
                const link = element("a", "Create a booking", "btn primary");
                link.href = root + emptyHref;
                empty.append(link);
            }
            return empty;
        }
        const wrap = element("div", undefined, "panel table-wrap");
        const table = element("table", undefined, "ops-table");
        const head = element("thead");
        const headRow = element("tr");
        headers.forEach(label => headRow.append(element("th", label)));
        head.append(headRow);
        table.append(head);
        const bodyRows = element("tbody");
        rows.forEach(values => {
            const row = element("tr");
            values.forEach(value => {
                const cell = element("td");
                if (value instanceof Node) cell.append(value);
                else cell.textContent = value === undefined || value === null || value === "" ? "-" : String(value);
                row.append(cell);
            });
            bodyRows.append(row);
        });
        table.append(bodyRows);
        wrap.append(table);
        return wrap;
    }

    function statusSelect(value, onChange) {
        const select = element("select", undefined, "status-select");
        statuses.forEach(status => {
            const option = element("option", status);
            option.value = status;
            option.selected = status === (value || "Booked");
            select.append(option);
        });
        select.addEventListener("change", () => onChange(select.value));
        return select;
    }

    function complaintStatusSelect(value, onChange) {
        const select = element("select", undefined, "status-select");
        ["Open", "In Progress", "Resolved"].forEach(status => {
            const option = element("option", status);
            option.value = status;
            option.selected = status === (value || "Open");
            select.append(option);
        });
        select.addEventListener("change", () => onChange(select.value));
        return select;
    }

    function updateBooking(id, patch) {
        const list = bookings();
        const item = list.find(record => record.id === id);
        if (item) Object.assign(item, patch);
        write("bookings", list);
    }

    function renderBookings(main, mode) {
        const allBookings = bookings();
        const list = mode === "driver"
            ? allBookings.filter(booking => booking.assignedDriver === userName())
            : allBookings;
        const rows = list.map(booking => {
            const identity = element("strong", booking.id || "Booking");
            let action;
            let assignment;
            if (mode === "admin") {
                assignment = assignmentSelect(booking.assignedDriver, assignedDriver => {
                    updateBooking(booking.id, { assignedDriver });
                    renderBookings(main, mode);
                });
                action = statusSelect(booking.status, status => {
                    updateBooking(booking.id, { status });
                    renderBookings(main, mode);
                });
            } else {
                action = Button(nextAction(booking.status, mode), "btn primary", () => {
                    updateBooking(booking.id, { status: nextStatus(booking.status, mode) });
                    renderBookings(main, mode);
                });
                action.disabled = booking.status === "Delivered";
                action.classList.toggle("disabled", action.disabled);
            }
            return mode === "admin"
                ? [identity, booking.customer || booking.email || "Customer", `${booking.pickup || "-"} → ${booking.destination || "-"}`, `${booking.bags || 0} bags / ${booking.weight || 0} kg`, money(booking.amount), booking.assignedDriver || "Unassigned", assignment, booking.status || "Booked", action]
                : [identity, booking.customer || booking.email || "Customer", `${booking.pickup || "-"} → ${booking.destination || "-"}`, `${booking.bags || 0} bags / ${booking.weight || 0} kg`, money(booking.amount), booking.status || "Booked", action];
        });
        const headers = mode === "admin"
            ? ["Tracking ID", "Customer", "Route", "Luggage", "Fare", "Assigned staff", "Assign", "Status", "Update status"]
            : ["Tracking ID", "Customer", "Route", "Luggage", "Fare", "Status", "Update status"];
        const emptyText = mode === "driver"
            ? "No deliveries have been assigned to you yet."
            : "No bookings yet. New customer bookings will appear here.";
        const table = makeTable(headers, rows, emptyText, mode === "admin" ? "booking.html" : undefined);
        const old = main.querySelector(".table-wrap, .empty-state");
        if (old) old.replaceWith(table); else main.append(table);
    }

    function assignmentSelect(value, onChange) {
        const select = element("select", undefined, "status-select");
        const options = [["", "Unassigned"], ...staffAccounts().filter(item => item.status === "Active").map(item => [item.email.split("@")[0], `${item.name} · ${item.email}`])];
        if (value && !options.some(([optionValue]) => optionValue === value)) options.push([value, value]);
        options.forEach(([optionValue, label]) => {
            const option = element("option", label);
            option.value = optionValue;
            option.selected = optionValue === (value || "");
            select.append(option);
        });
        select.addEventListener("change", () => onChange(select.value));
        return select;
    }

    function nextStatus(status, mode) {
        const current = statuses.indexOf(status || "Booked");
        if (mode === "worker") return current < 2 ? "Picked Up" : current < 3 ? "In Transit" : status;
        return current < 2 ? "Picked Up" : current < 3 ? "In Transit" : current < 4 ? "Destination Reached" : "Delivered";
    }

    function nextAction(status, mode) {
        if (status === "Delivered") return "Delivered";
        if (mode === "worker") return status === "Picked Up" ? "Confirm handoff" : "Verify pickup";
        return ({ "Booked": "Confirm pickup", "Pickup Assigned": "Confirm pickup", "Picked Up": "Start transit", "In Transit": "Confirm destination", "Destination Reached": "Mark delivered" })[status] || "Update delivery";
    }

    function Button(label, className, handler) {
        const button = element("button", label, className);
        button.type = "button";
        button.addEventListener("click", handler);
        return button;
    }

    function renderDirectory(main, kind) {
        const config = {
            drivers: ["Drivers", "Manage driver accounts and availability.", "drivers"],
            workers: ["Workers", "Manage luggage-handling staff.", "workers"],
            vehicles: ["Vehicles", "Keep the transport fleet up to date.", "vehicles"]
        }[kind];
        const list = read(`directory_${kind}`);
        const form = element("form", undefined, "panel ops-form");
        form.append(element("h2", `Add ${kind.slice(0, -1)}`));
        const name = element("input"); name.name = "name"; name.placeholder = kind === "vehicles" ? "Vehicle registration" : "Full name"; name.required = true;
        const detail = element("input"); detail.name = "detail"; detail.placeholder = kind === "vehicles" ? "Vehicle type" : "Phone number"; detail.required = true;
        const submit = element("button", "Add record", "btn primary"); submit.type = "submit";
        form.append(name, detail, submit);
        form.addEventListener("submit", event => {
            event.preventDefault();
            list.unshift({ id: `${kind.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`, name: name.value.trim(), detail: detail.value.trim(), status: "Available" });
            write(`directory_${kind}`, list);
            location.reload();
        });
        const rows = list.map((record, index) => [record.id, record.name, record.detail, record.status || "Available", Button("Remove", "btn", () => { list.splice(index, 1); write(`directory_${kind}`, list); renderDirectory(main, kind); })]);
        const table = makeTable(["ID", kind === "vehicles" ? "Registration" : "Name", kind === "vehicles" ? "Type" : "Phone", "Status", ""], rows, `No ${kind} added yet. Use the form to add the first record.`);
        main.append(form, table);
    }

    function renderStaffDirectory(main) {
        const list = staffAccounts();
        const form = element("form", undefined, "panel ops-form");
        form.append(element("h2", "Add staff member"));
        const fields = [
            ["name", "Full name", "text"],
            ["email", "Work email", "email"],
            ["password", "Temporary password", "password"],
            ["phone", "Phone", "tel"],
            ["address", "Address", "text"],
            ["position", "Position", "text"],
            ["department", "Department", "text"]
        ];
        fields.forEach(([key, label, type]) => {
            const wrapper = element("label", label);
            const input = element("input");
            input.name = key;
            input.type = type;
            input.required = ["name", "email", "password", "position", "department"].includes(key);
            if (key === "password") input.minLength = 6;
            wrapper.append(input);
            form.append(wrapper);
        });
        const submit = element("button", "Add staff", "btn primary");
        submit.type = "submit";
        form.append(submit);
        form.addEventListener("submit", event => {
            event.preventDefault();
            const values = Object.fromEntries(new FormData(form));
            values.email = values.email.trim().toLowerCase();
            const editingId = form.dataset.editingId;
            if (list.some(item => item.email.toLowerCase() === values.email && item.staffId !== editingId)) {
                let message = form.querySelector(".error");
                if (!message) { message = element("p", undefined, "error"); form.append(message); }
                message.textContent = "A staff account with this email already exists.";
                return;
            }
            if (editingId) {
                const current = list.find(item => item.staffId === editingId);
                if (!current) return;
                const previousKey = current.email.split("@")[0];
                const nextKey = values.email.split("@")[0];
                const nextPassword = values.password || current.password;
                Object.assign(current, values, { password: nextPassword, staffId: current.staffId, status: current.status || "Active" });
                if (previousKey !== nextKey) {
                    const assigned = bookings();
                    assigned.forEach(booking => { if (booking.assignedDriver === previousKey) booking.assignedDriver = nextKey; });
                    write("bookings", assigned);
                }
                const savedProfile = read(`staffProfile_driver_${previousKey}`, null);
                if (savedProfile) {
                    Object.assign(savedProfile, { staffId: current.staffId, name: current.name, email: current.email, phone: current.phone, address: current.address, position: current.position, department: current.department, status: current.status });
                    write(`staffProfile_driver_${nextKey}`, savedProfile);
                    if (previousKey !== nextKey) localStorage.removeItem(`staffProfile_driver_${previousKey}`);
                }
            } else {
                const nextId = Math.max(0, ...list.map(item => Number(String(item.staffId || "").replace(/\D/g, "")) || 0)) + 1;
                list.push({ ...values, staffId: `STF-${String(nextId).padStart(3, "0")}`, status: "Active" });
            }
            write("staffAccounts", list);
            location.reload();
        });
        const rows = list.map((staff, index) => [
            staff.staffId,
            staff.name,
            staff.email,
            staff.position,
            staff.department,
            staff.phone || "Not provided",
            staff.status,
            (() => {
                const actions = element("div", undefined, "staff-row-actions");
                actions.append(Button("Edit", "btn", () => {
                    form.dataset.editingId = staff.staffId;
                    form.querySelector("h2").textContent = `Edit ${staff.name}`;
                    for (const key of ["name", "email", "phone", "address", "position", "department"]) form.elements[key].value = staff[key] || "";
                    form.elements.password.value = "";
                    form.elements.password.required = false;
                    form.elements.password.closest("label").hidden = true;
                    form.querySelector("button[type=submit]").textContent = "Save changes";
                    form.scrollIntoView({ behavior: "smooth", block: "start" });
                }));
                actions.append(Button("Delete", "btn", () => {
                    if (!window.confirm(`Delete ${staff.name}'s staff account?`)) return;
                    list.splice(index, 1);
                    write("staffAccounts", list);
                    const staffKey = staff.email.split("@")[0];
                    const assigned = bookings();
                    assigned.forEach(booking => { if (booking.assignedDriver === staffKey) booking.assignedDriver = ""; });
                    write("bookings", assigned);
                    localStorage.removeItem(`staffProfile_driver_${staffKey}`);
                    location.reload();
                }));
                return actions;
            })()
        ]);
        main.append(form, makeTable(["Staff ID", "Name", "Email", "Position", "Department", "Phone", "Status", ""], rows, "No staff accounts. Add the first staff member above."));
    }

    function registeredUsers() {
        const users = [];
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key || !key.startsWith("customer_")) continue;
            const user = read(key, null);
            if (user) users.push(user);
        }
        return users;
    }

    function renderUsers(main) {
        const users = registeredUsers();
        const rows = users.map(user => [user.name, user.email, user.phone, user.address]);
        main.append(makeTable(["Name", "Email", "Phone", "Address"], rows, "No customer accounts are registered yet."));
    }

    function renderComplaints(main) {
        const list = complaints();
        const rows = list.map(item => {
            const status = complaintStatusSelect(item.status || "Open", value => {
                const current = complaints();
                const record = current.find(entry => entry.id === item.id);
                if (record) record.status = value;
                write("complaints", current);
                renderComplaints(main);
            });
            return [item.id, item.name, item.email, item.subject, item.message, status];
        });
        const panel = makeTable(["ID", "Customer", "Email", "Subject", "Message", "Status"], rows, "No support requests yet.");
        const old = main.querySelector(".table-wrap, .empty-state");
        if (old) old.replaceWith(panel); else main.append(panel);
    }

    function renderSupportDashboard(main) {
        const list = complaints();
        const open = list.filter(item => item.status !== "Resolved").length;
        const resolved = list.filter(item => item.status === "Resolved").length;
        const stats = element("div", undefined, "stats");
        [[open, "Open requests"], [resolved, "Resolved"], [list.length, "Total requests"], ["< 1 day", "Response target"]].forEach(([value, label]) => {
            const card = element("div", undefined, "stat-card");
            card.append(element("h2", value), element("p", label)); stats.append(card);
        });
        const link = element("a", "Open support queue", "btn primary");
        link.href = root + "admin/driver/worker/support/complaints.html";
        const panel = element("div", undefined, "panel"); panel.append(element("h2", "Recent customer requests"), link);
        main.append(stats, panel);
        renderComplaints(main);
    }

    function renderContact() {
        const form = document.getElementById("contactForm");
        if (!form) return;
        form.addEventListener("submit", event => {
            event.preventDefault();
            const list = complaints();
            const id = `CMP${Date.now().toString().slice(-7)}`;
            list.unshift({ id, name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), subject: form.elements.subject.value.trim(), message: form.elements.message.value.trim(), status: "Open", createdAt: new Date().toISOString() });
            write("complaints", list);
            form.reset();
            let feedback = document.getElementById("contactMessage");
            if (!feedback) { feedback = element("p", undefined, "message"); feedback.id = "contactMessage"; form.append(feedback); }
            feedback.textContent = `Request ${id} received. Support will follow up by email.`;
        });
    }

    function renderReports(main) {
        const list = bookings();
        const delivered = list.filter(item => item.status === "Delivered").length;
        const active = list.length - delivered;
        const total = list.reduce((sum, item) => sum + (Number(String(item.amount || "").replace(/[^0-9.]/g, "")) || 0), 0);
        const stats = element("div", undefined, "stats");
        [[list.length, "Total bookings"], [active, "Active"], [delivered, "Delivered"], [`₹${total.toLocaleString("en-IN")}`, "Recorded fare"]].forEach(([value, label]) => {
            const card = element("div", undefined, "stat-card"); card.append(element("h2", value), element("p", label)); stats.append(card);
        });
        const exportButton = Button("Download booking CSV", "btn primary", () => {
            const columns = ["id", "customer", "email", "pickup", "destination", "bags", "weight", "amount", "status"];
            const csv = [columns.join(","), ...list.map(item => columns.map(key => `"${String(item[key] || "").replaceAll('"', '""')}"`).join(","))].join("\n");
            const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            const link = element("a"); link.href = url; link.download = "luggage-bookings.csv"; link.click(); URL.revokeObjectURL(url);
        });
        const panel = element("div", undefined, "panel ops-toolbar"); panel.append(element("h2", "Booking activity"), exportButton);
        main.append(stats, panel, makeTable(["Tracking ID", "Route", "Status", "Fare"], list.map(item => [item.id, `${item.pickup || "-"} → ${item.destination || "-"}`, item.status, money(item.amount)]), "No booking data is available yet.", "booking.html"));
    }

    function renderNotifications(main) {
        const events = [
            ...bookings().map(item => ({ date: item.createdAt || "", title: `Booking ${item.id}`, detail: `${item.pickup || "-"} → ${item.destination || "-"} · ${item.status || "Booked"}` })),
            ...complaints().map(item => ({ date: item.createdAt || "", title: `Support request ${item.id}`, detail: `${item.subject} · ${item.status}` }))
        ].sort((a, b) => b.date.localeCompare(a.date));
        const rows = events.map(item => [item.title, item.detail, item.date ? new Date(item.date).toLocaleString() : ""]);
        main.append(makeTable(["Update", "Details", "Date"], rows, "You’re all caught up. Booking and support updates will appear here."));
    }

    function renderStaffProfile(main, role) {
        const email = getSignedInEmail().toLowerCase();
        const account = staffAccounts().find(item => item.email.toLowerCase() === email) || {};
        const defaults = {
            staffId: "STF-001",
            position: "Delivery Staff",
            department: "Delivery Operations",
            status: "Active",
            name: userName(),
            email: getSignedInEmail(),
            phone: "",
            address: ""
        };
        const profile = { ...defaults, ...account };
        const view = element("section", undefined, "panel staff-profile-view");
        const overview = element("div", undefined, "staff-profile-overview");
        const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "ST";
        overview.append(element("div", initials, "staff-profile-avatar"));
        const identity = element("div", undefined, "staff-profile-identity");
        identity.append(element("h2", profile.name || "Staff member"), element("p", `${profile.position || "Staff"} · ${profile.department || "Operations"}`));
        overview.append(identity, element("span", profile.status || "Active", "shift-state"));
        view.append(overview);
        const details = element("dl", undefined, "staff-profile-details");
        const detailFields = [
            ["staffId", "Staff ID", profile.staffId || "Not provided"],
            ["email", "Work email", profile.email || "Not provided"],
            ["phone", "Phone", profile.phone || "Not provided"],
            ["address", "Address", profile.address || "Not provided"],
            ["position", "Position", profile.position || "Not provided"],
            ["department", "Department", profile.department || "Not provided"],
            ["status", "Employment status", profile.status || "Not provided"]
        ];
        detailFields.forEach(([key, label, value]) => {
            const row = element("div");
            row.append(element("dt", label), element("dd", value));
            row.dataset.profileField = key;
            details.append(row);
        });
        view.append(details);
        main.append(view);
    }

    function refreshDashboard() {
        const list = bookings();
        const cards = [...document.querySelectorAll(".stat-card")];
        if (page === "admin-dashboard") {
            const values = [registeredUsers().length, list.length, list.filter(item => item.status === "In Transit").length, list.filter(item => item.status === "Delivered").length, list.filter(item => item.status !== "Delivered").length, `₹${list.reduce((sum, item) => sum + (Number(String(item.amount || "").replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString("en-IN")}`, read("directory_vehicles").length, staffAccounts().length];
            cards.forEach((card, index) => { const value = card.querySelector("h2"); if (value && values[index] !== undefined) value.textContent = values[index]; });
        }
        if (page === "driver-dashboard") {
            const mine = list.filter(item => item.assignedDriver === userName());
            const active = mine.filter(item => item.status !== "Delivered");
            const counts = [active.length, mine.filter(item => item.status === "Picked Up").length, mine.filter(item => item.status === "In Transit").length, mine.filter(item => item.status === "Delivered").length];
            cards.forEach((card, index) => { const value = card.querySelector("h2"); if (value && counts[index] !== undefined) value.textContent = counts[index]; });

            const shiftDate = document.getElementById("shiftDate");
            const current = active[0];
            const empty = document.getElementById("assignmentEmpty");
            const details = document.getElementById("assignmentDetails");
            const shiftState = document.getElementById("shiftState");

            if (shiftDate) shiftDate.textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
            if (shiftState) shiftState.textContent = current ? "ON ROUTE" : "READY";
            if (empty) empty.hidden = Boolean(current);
            if (details) details.hidden = !current;

            const emptyText = document.getElementById("assignmentEmptyText");
            if (emptyText) emptyText.textContent = "New customer bookings will appear here automatically.";
            const workList = document.getElementById("assignedWorkList");
            if (workList) renderBookings(workList, "driver");

            if (current) {
                const setText = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
                setText("staffBookingId", current.id);
                setText("staffBookingStatus", current.status || "Booked");
                setText("staffPickup", current.pickup || "Pickup location");
                setText("staffDestination", current.destination || "Delivery location");
                setText("staffBags", `${current.bags || 0} bags`);
                setText("staffWeight", `${current.weight || 0} kg`);
                const progress = document.getElementById("routeProgressBar");
                if (progress) progress.style.width = `${Math.max(0, statuses.indexOf(current.status || "Booked")) / (statuses.length - 1) * 100}%`;
            }
        }
        if (page === "worker-dashboard") {
            const counts = [list.filter(item => item.status !== "Delivered").length, list.filter(item => ["Picked Up", "In Transit"].includes(item.status)).length, list.filter(item => item.status === "In Transit").length, list.filter(item => item.status === "Delivered").length];
            cards.forEach((card, index) => { const value = card.querySelector("h2"); if (value && counts[index] !== undefined) value.textContent = counts[index]; });
            const current = list.find(item => item.status !== "Delivered");
            const panel = document.querySelector("main .panel");
            if (panel) {
                panel.replaceChildren(element("h2", current ? "Current assignment" : "No active assignments"));
                if (current) {
                    panel.append(element("h3", current.id), element("p", `${current.pickup || "-"} → ${current.destination || "-"}`), element("p", `Weight: ${current.weight || 0} KG · ${current.bags || 0} bags`), element("span", current.status || "Booked", "badge badge-blue"));
                    const link = element("a", "View assignments", "btn primary");
                    link.href = root + "admin/driver/worker/luggage.html";
                    panel.append(link);
                } else {
                    panel.append(element("p", "New customer bookings will appear here."));
                }
            }
        }
        if (page === "worker-dashboard") {
            const buttons = [...document.querySelectorAll(".panel .btn")];
            buttons.forEach((button, index) => button.addEventListener("click", () => {
                const next = list.find(item => item.status !== "Delivered");
                if (!next) return;
                updateBooking(next.id, { status: index === 0 ? "Picked Up" : "In Transit" });
                location.reload();
            }));
        }
        if (page === "support-dashboard") {
            const list = complaints();
            const values = [list.filter(item => item.status !== "Resolved").length, list.filter(item => item.status === "Resolved").length, list.filter(item => item.status === "In Progress").length, list.length];
            cards.forEach((card, index) => { const value = card.querySelector("h2"); if (value && values[index] !== undefined) value.textContent = values[index]; });
            const labels = ["Open Complaints", "Resolved", "In Progress", "Total Requests"];
            cards.forEach((card, index) => { const label = card.querySelector("p"); if (label && labels[index]) label.textContent = labels[index]; });
            const panel = document.querySelector("main .panel");
            if (panel) {
                panel.replaceChildren(element("h2", "Recent customer request"));
                if (list[0]) {
                    panel.append(element("h3", list[0].id), element("p", `Customer: ${list[0].name}`), element("p", `Issue: ${list[0].subject}`), element("span", list[0].status || "Open", "badge badge-orange"));
                } else {
                    panel.append(element("p", "No customer requests have been received yet."));
                }
                const link = element("a", "Open support queue", "btn primary");
                link.href = root + "admin/driver/worker/support/complaints.html";
                panel.append(link);
            }
        }
    }

    if (["driver-dashboard", "driver-assignments", "driver-profile"].includes(page) && localStorage.getItem("userRole") === "staff") {
        const currentEmail = getSignedInEmail().toLowerCase();
        if (!staffAccounts().some(item => item.email.toLowerCase() === currentEmail && item.status === "Active")) {
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("userRole");
            location.href = root + "home.html";
            return;
        }
    }

    if (page === "contact") {
        renderContact();
        return;
    }
    if (page === "admin-dashboard" || page === "driver-dashboard" || page === "worker-dashboard" || page === "support-dashboard") {
        refreshDashboard();
        return;
    }

    const definitions = {
        "admin-bookings": ["Bookings", "Review luggage orders and update their delivery status.", "admin"],
        "admin-staff": ["Staff", "Manage staff accounts and assigned work.", "admin"],
        "admin-users": ["Customers", "Registered customer accounts.", "admin"],
        "admin-drivers": ["Drivers", "Manage drivers and availability.", "admin"],
        "admin-workers": ["Workers", "Manage luggage operations staff.", "admin"],
        "admin-vehicles": ["Vehicles", "Manage fleet records.", "admin"],
        "admin-reports": ["Reports", "Booking activity and recorded fares.", "admin"],
        "admin-support": ["Support queue", "Review and resolve customer requests.", "admin"],
        "driver-assignments": ["Assignments", "Claim deliveries and update their progress.", "driver"],
        "worker-luggage": ["Luggage handling", "Confirm pickup and handoff milestones.", "worker"],
        "worker-profile": ["Worker profile", "Manage your staff contact details.", "worker"],
        "driver-profile": ["Staff profile", "Your account information and contact details.", "driver"],
        "support-complaints": ["Complaints", "Review customer requests and update resolution status.", "support"],
        "support-profile": ["Support profile", "Manage your staff contact details.", "support"],
        notifications: ["Notifications", "Recent booking and support updates.", "customer"]
    };
    const definition = definitions[page];
    if (!definition) return;
    const [title, description, role] = definition;
    const main = setup(title, description, role);

    if (page === "admin-bookings") renderBookings(main, "admin");
    else if (page === "admin-staff") renderStaffDirectory(main);
    else if (page === "driver-assignments") renderBookings(main, "driver");
    else if (page === "worker-luggage") renderBookings(main, "worker");
    else if (page === "admin-users") renderUsers(main);
    else if (["admin-drivers", "admin-workers", "admin-vehicles"].includes(page)) renderDirectory(main, page.slice(6));
    else if (page === "admin-reports") renderReports(main);
    else if (["admin-support", "support-complaints"].includes(page)) renderComplaints(main);
    else if (page === "notifications") renderNotifications(main);
    else renderStaffProfile(main, role);
})();
