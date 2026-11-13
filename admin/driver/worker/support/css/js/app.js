function logout() {

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "userRole"
    );


    const path = location.pathname;
    const depth = path.includes("/admin/driver/worker/support/")
        ? 4
        : path.includes("/admin/driver/worker/")
            ? 3
            : path.includes("/admin/driver/")
                ? 2
                : path.includes("/admin/")
                    ? 1
                    : 0;

    location.href = `${"../".repeat(depth)}home.html`;

}


window.addEventListener(
    "load",
    function() {

        const storedIdentity =
            localStorage.getItem(
                "loggedInUser"
            );

        let email = storedIdentity;

        try {

            const identity =
                JSON.parse(storedIdentity);

            if (
                identity &&
                typeof identity.email === "string"
            ) {
                email = identity.email;
            }

        } catch {}


        const display =
            document.getElementById(
                "userDisplay"
            );


        if (display) {

            display.textContent =
                email
                ? email.split("@")[0]
                : "User";

        }


        /*
        PROFILE
        */

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        const profileAddress =
            document.getElementById(
                "profileAddress"
            );


        const user = email
            ? JSON.parse(
                localStorage.getItem(
                    "customer_" + email
                ) || "null"
            )
            : null;

        if (profileName)
            profileName.textContent =
                user?.name || email?.split("@")[0] || "Customer";

        if (profileEmail)
            profileEmail.textContent =
                user?.email || email || "Email not provided";

        if (profilePhone)
            profilePhone.textContent =
                user?.phone || "Not provided";

        if (profileAddress)
            profileAddress.textContent =
                user?.address || "Not provided";


        /*
        HOME STATISTICS
        */

        const bookings =
            JSON.parse(
                localStorage.getItem(
                    "bookings"
                ) || "[]"
            );


        const active =
            bookings.filter(
                b =>
                    b.status !==
                    "Delivered"
            ).length;


        const delivered =
            bookings.filter(
                b =>
                    b.status ===
                    "Delivered"
            ).length;


        const activeElement =
            document.getElementById(
                "activeBookings"
            );


        const deliveredElement =
            document.getElementById(
                "deliveredBookings"
            );


        const totalElement =
            document.getElementById(
                "totalBookings"
            );


        if (activeElement)
            activeElement.textContent =
                active;


        if (deliveredElement)
            deliveredElement.textContent =
                delivered;


        if (totalElement)
            totalElement.textContent =
                bookings.length;


        /*
        MY BOOKINGS
        */

        const list =
            document.getElementById(
                "bookingsList"
            );


        if (list) {

            if (bookings.length === 0) {

                list.innerHTML = `

                <div class="panel">

                    <h2>
                        No Bookings Yet
                    </h2>

                    <p>
                        Your bookings will
                        appear here.
                    </p>

                    <br>

                    <a
                    href="booking.html"
                    class="btn primary">

                    Book Luggage

                    </a>

                </div>

                `;

            }

            else {

                list.innerHTML =
                    bookings.map(
                        booking => `

                    <div class="booking-card">

                        <div
                        class="booking-card-grid">

                            <div>

                                <strong>
                                    ${booking.id}
                                </strong>

                            </div>


                            <div>

                                ${booking.pickup}

                                →

                                ${booking.destination}

                            </div>


                            <div>

                                ${booking.weight}
                                KG

                                <br>

                                ${booking.bags}
                                Bags

                            </div>


                            <div>

                                <strong>
                                    ${booking.amount}
                                </strong>

                                <br>

                                <span class="badge badge-blue">

                                    ${booking.status}

                                </span>

                            </div>

                        </div>

                    </div>

                    `
                    ).join("");

            }

        }

    }
);