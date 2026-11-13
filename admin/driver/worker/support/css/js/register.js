document
.getElementById("registerForm")
.addEventListener("submit", function(event) {

    event.preventDefault();


    const name =
        document.getElementById("name")
        .value.trim();

    const phone =
        document.getElementById("phone")
        .value.trim();

    const email =
        document.getElementById("email")
        .value.trim().toLowerCase();

    const address =
        document.getElementById("address")
        .value.trim();

    const password =
        document.getElementById("password")
        .value;

    const confirmPassword =
        document.getElementById("confirmPassword")
        .value;


    const message =
        document.getElementById("registerMessage");


    if (!/^[0-9]{10}$/.test(phone)) {

        message.style.color = "red";

        message.textContent =
            "Enter a valid 10-digit phone number.";

        return;

    }


    if (password.length < 6) {

        message.style.color = "red";

        message.textContent =
            "Password must contain at least 6 characters.";

        return;

    }


    if (password !== confirmPassword) {

        message.style.color = "red";

        message.textContent =
            "Passwords do not match.";

        return;

    }

    if (localStorage.getItem("customer_" + email)) {

        message.style.color = "red";
        message.textContent = "An account with this email already exists.";
        return;

    }


    const user = {

        name: name,
        phone: phone,
        email: email,
        address: address,
        password: password

    };


    localStorage.setItem(
        "customer_" + email,
        JSON.stringify(user)
    );


    message.style.color =
        "#168044";

    message.textContent =
        "Registration successful!";


    setTimeout(() => {

        location.href =
            "home.html";

    }, 1000);

});