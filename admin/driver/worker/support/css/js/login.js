let selectedRole = "user";


const roleButtons =
    document.querySelectorAll(".role");


roleButtons.forEach(button => {

    button.addEventListener("click", function () {

        roleButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        selectedRole =
            this.dataset.role;

    });

});


document
.getElementById("showPassword")
.addEventListener("click", function () {

    const password =
        document.getElementById("loginPassword");

    if (password.type === "password") {

        password.type = "text";

        this.textContent = "🙈";

    } else {

        password.type = "password";

        this.textContent = "👁";

    }

});


document
.getElementById("loginForm")
.addEventListener("submit", function(event) {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail")
        .value.trim();

    const password =
        document.getElementById("loginPassword")
        .value.trim();


    const message =
        document.getElementById("loginMessage");


    const accounts = {

        user: {
            email: "user@gmail.com",
            password: "user123",
            page: "home.html"
        },

        admin: {
            email: "admin@gmail.com",
            password: "admin123",
            page: "admin/dashboard.html"
        },

        staff: {
            email: "staff@gmail.com",
            password: "staff123",
            page: "admin/driver/dashboard.html"
        }

    };


    const account =
        accounts[selectedRole];


    /*
    USER REGISTERED ACCOUNT
    */

    const registered =
        JSON.parse(
            localStorage.getItem(
                "customer_" + email
            )
        );


    if (
        selectedRole === "user" &&
        registered &&
        registered.password === password
    ) {

        localStorage.setItem(
            "loggedInUser",
            email
        );

        localStorage.setItem(
            "userRole",
            "user"
        );

        message.style.color =
            "#168044";

        message.textContent =
            "Login successful!";

        setTimeout(() => {

            location.href =
                "home.html";

        }, 600);

        return;

    }


    /*
    DEMO ACCOUNTS
    */

    if (
        email === account.email &&
        password === account.password
    ) {

        localStorage.setItem(
            "loggedInUser",
            email
        );

        localStorage.setItem(
            "userRole",
            selectedRole
        );


        message.style.color =
            "#168044";

        message.textContent =
            "Login successful!";


        setTimeout(() => {

            location.href =
                account.page;

        }, 600);

    } else {

        message.style.color =
            "#d32f2f";

        message.textContent =
            "Invalid email or password.";

    }

});