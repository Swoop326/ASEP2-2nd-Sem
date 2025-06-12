// Save as lostitem.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lostItemForm");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const contactInput = document.getElementById("contact");
  const countryCodeSelect = document.getElementById("countryCode");
  const submitBtn = form.querySelector(".submit-btn");

  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("max", today);

  dateInput.addEventListener("change", () => {
    const selectedDate = new Date(dateInput.value);
    const now = new Date();
    if (selectedDate.toDateString() === now.toDateString()) {
      const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
      timeInput.setAttribute("min", timeStr);
    } else {
      timeInput.removeAttribute("min");
    }
  });

  contactInput.addEventListener("input", () => {
    contactInput.value = contactInput.value.replace(/\D/g, "").substring(0, 10);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = new FormData(form);
    const fullContact = countryCodeSelect.value.replace("+", "") + contactInput.value;
    formData.set("contact", fullContact);

    try {
      const response = await fetch("http://localhost:5500/api/lost", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Lost item submitted!");
        form.reset();
        countryCodeSelect.value = "+91";
      } else {
        alert(result.error || "Submission failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error occurred.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Report";
    }
  });
});
