const weightInput =
    document.getElementById("weight");

const bagsInput =
    document.getElementById("bags");

const fare =
    document.getElementById("fare");


function calculateFare() {

    const weight =
        Number(weightInput.value) || 0;

    const bags =
        Number(bagsInput.value) || 0;


    const total =
        200 +
        (weight * 25) +
        (bags * 100);


    fare.textContent =
        "₹" + total.toLocaleString("en-IN");

}


weightInput.addEventListener(
    "input",
    calculateFare
);

bagsInput.addEventListener(
    "input",
    calculateFare
);


calculateFare();


document
.getElementById("bookingForm")
.addEventListener("submit", function(event) {

    event.preventDefault();


    const trackingId =
        "LUG" +
        Date.now()
        .toString()
        .slice(-9);


    const booking = {

        id: trackingId,
        assignedDriver: "staff",

        customer:
            document
            .getElementById("customerName")
            .value,

        phone:
            document
            .getElementById("customerPhone")
            .value,

        email:
            document
            .getElementById("customerEmail")
            .value,

        pickup:
            document
            .getElementById("pickupCity")
            .value,

        destination:
            document
            .getElementById("destinationCity")
            .value,

        pickupAddress:
            document
            .getElementById("pickupAddress")
            .value,

        deliveryAddress:
            document
            .getElementById("deliveryAddress")
            .value,

        pickupDate:
            document
            .getElementById("pickupDate")
            .value,

        deliveryDate:
            document
            .getElementById("deliveryDate")
            .value,

        bags:
            document
            .getElementById("bags")
            .value,

        weight:
            document
            .getElementById("weight")
            .value,

        type:
            document
            .getElementById("luggageType")
            .value,

        notes:
            document
            .getElementById("notes")
            .value,

        amount:
            fare.textContent,

        status:
            "Booked"

    };


    let bookings =
        JSON.parse(
            localStorage.getItem("bookings")
            || "[]"
        );


    bookings.unshift(booking);


    localStorage.setItem(
        "bookings",
        JSON.stringify(bookings)
    );


    localStorage.setItem(
        "lastTrackingId",
        trackingId
    );


    const message =
        document.getElementById(
            "bookingMessage"
        );


    message.style.color =
        "#168044";

    message.innerHTML =
        `
        Booking Successful!<br>
        Your Tracking ID is
        <strong>${trackingId}</strong>
        `;


    this.reset();

    calculateFare();

});