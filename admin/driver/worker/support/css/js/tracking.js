function trackLuggage() {

    const id =
        document
        .getElementById("trackingId")
        .value.trim();


    const result =
        document.getElementById(
            "trackingResult"
        );


    let bookings =
        JSON.parse(
            localStorage.getItem("bookings")
            || "[]"
        );


    let booking =
        bookings.find(
            item => item.id === id
        );


    /*
    DEMO TRACKING
    */

    if (
        !booking &&
        id === "LUG202600123"
    ) {

        booking = {

            id: "LUG202600123",

            pickup: "Hyderabad",

            destination: "Vijayawada",

            weight: 40,

            status: "In Transit"

        };

    }


    if (!booking) {

        result.classList.remove("hidden");

        result.innerHTML = `

        <h2>
            ❌ Tracking ID Not Found
        </h2>

        <p>
            Please check your tracking ID.
        </p>

        `;

        return;

    }


    const statuses = [

        "Booked",

        "Pickup Assigned",

        "Picked Up",

        "In Transit",

        "Destination Reached",

        "Delivered"

    ];


    let current =
        statuses.indexOf(
            booking.status
        );


    if (current < 0) {
        current = 0;
    }


    let html = `

    <div style="text-align:center">

        <h2>
            ${booking.id}
        </h2>

        <p>
            ${booking.pickup}
            →
            ${booking.destination}
        </p>

        <br>

        <div class="timeline">

    `;


    statuses.forEach(
        (status, index) => {

            const state =
                index < current
                ? "done"
                : index === current
                    ? "current"
                    : "";


            html += `

            <div class="step ${state}">

                <div class="dot">

                    ${index <= current
                        ? "✓"
                        : "○"}

                </div>

                <small>
                    ${status}
                </small>

            </div>

            `;

        }
    );


    html += `

        </div>

        <h3>
            Current Status:
            ${booking.status}
        </h3>

    </div>

    `;


    result.classList.remove(
        "hidden"
    );

    result.innerHTML = html;

}


window.addEventListener(
    "load",
    function() {

        const requestedId =
            new URLSearchParams(location.search)
            .get("id");

        const lastId =
            requestedId || localStorage.getItem(
                "lastTrackingId"
            );


        if (lastId) {

            document
            .getElementById(
                "trackingId"
            )
            .value = lastId;

            if (requestedId) {
                trackLuggage();
            }

        }

    }
);