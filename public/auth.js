// 🚀 Signup Functionality (Redirects to Login)
document.getElementById("signup-form")?.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents page refresh

    const userData = {
        username: document.getElementById("username").value,
        phone: document.getElementById("phone").value, // ✅ Required phone number
        password: document.getElementById("password").value
    };

    // ✅ Only add email if provided
    const email = document.getElementById("email").value;
    if (email) {
        userData.email = email;
    }

    try {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        console.log("✅ Signup Response:", result); // ✅ Debugging step

        if (response.ok) {
            sessionStorage.setItem("userSignedUp", "true"); // ✅ Store signup status
            alert("✅ Signup successful! Please log in.");
            window.location.href = "login.html"; // ✅ Redirect to login page after signup
        } else {
            alert("❌ Signup failed: " + result.error);
        }
    } catch (error) {
        console.error("❌ Signup Error:", error);
        alert("❌ Network error! Please try again.");
    }
});

// 🔑 Login Functionality (User manually clicks login)
document.getElementById("login-form")?.addEventListener("submit", async function (event) {
    event.preventDefault(); // 🚀 Prevents auto-refresh

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log("✅ Login Response:", data); // ✅ Debugging step

        if (response.ok) {
            sessionStorage.setItem("userLoggedIn", "true"); // ✅ Store session temporarily
            sessionStorage.setItem("username", username);
            alert("✅ Login successful!");
            console.log("🔄 Redirecting user to homepage...");
            window.location.href = "homepage.html"; // ✅ Redirect to homepage after login
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (error) {
        console.error("❌ Login request failed:", error);
        alert("❌ Network error! Check your connection.");
    }
});

// ✅ Redirect users to homepage if they are already logged in
window.addEventListener("load", function () {
    const currentPage = window.location.pathname.split("/").pop(); // Get current page name

    // ✅ If user is already logged in, prevent access to login or signup page
    if (currentPage === "login.html" && sessionStorage.getItem("userLoggedIn")) {
        console.log("🔄 Redirecting logged-in user to homepage...");
        window.location.href = "homepage.html"; 
    }

    if (currentPage === "signup.html" && sessionStorage.getItem("userSignedUp")) {
        console.log("🔄 Redirecting signed-up user to login...");
        window.location.href = "login.html"; 
    }

    // ✅ If user is not logged in, prevent access to homepage
    if (currentPage === "homepage.html" && !sessionStorage.getItem("userLoggedIn")) {
        console.log("🔄 Redirecting unauthenticated user to login...");
        window.location.href = "login.html"; 
    }
});

// 🔄 Logout Functionality (Homepage)
document.getElementById("logout-btn")?.addEventListener("click", function () {
    console.log("🔄 Logging out user...");
    sessionStorage.removeItem("userLoggedIn");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userSignedUp"); // ✅ Remove signup status
    alert("✅ Logged out successfully!");
    window.location.href = "login.html"; // Redirect to login page
});

