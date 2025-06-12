document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemImage = urlParams.get("image");
  const itemName = urlParams.get("name");
  const itemId = urlParams.get("id"); // MongoDB _id

  const itemList = document.getElementById("itemList");

  // Create image card
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img id="itemImage" src="${itemImage}" alt="Item Image" />
    <h3 id="itemName">${itemName}</h3>
    <button id="claimItemBtn">This is my item</button>
  `;
  itemList.appendChild(card);

  // Show form when button clicked
  document.getElementById("claimItemBtn").addEventListener("click", () => {
    const claimForm = document.getElementById("claimForm");
    claimForm.style.display = "flex"; // Changed from block to flex
    document.getElementById("claimItemName").textContent = itemName;

    // Scroll smoothly into view
    setTimeout(() => {
      claimForm.scrollIntoView({ behavior: "smooth" });
    }, 100);
  });

  // Expose itemId globally for submission
  window.claimedItemId = itemId;

  // Restrict lostDate input to today or earlier
  const lostDateInput = document.getElementById("lostDate");
  if (lostDateInput) {
    const today = new Date().toISOString().split("T")[0];
    lostDateInput.setAttribute("max", today);
  }
});

// Form submit handler
async function submitClaim(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const countryCode = document.getElementById("countryCode").value;
  const phone = document.getElementById("phone").value.trim();
  const lostPlace = document.getElementById("lostPlace").value.trim();
  const lostDate = document.getElementById("lostDate").value;
  const proofText = document.getElementById("proofText").value.trim();
  const uniqueInfo = document.getElementById("uniqueInfo").value.trim();
  const proofImageFile = document.getElementById("proofImage").files[0];

  if (!proofImageFile) {
    alert("Please upload a proof image.");
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  const fullPhone = countryCode + phone;

  const formData = new FormData();
  formData.append("itemId", window.claimedItemId);
  formData.append("fullName", fullName);
  formData.append("email", email);
  formData.append("phone", fullPhone);
  formData.append("lostPlace", lostPlace);
  formData.append("lostDate", lostDate);
  formData.append("proofText", proofText);
  formData.append("uniqueInfo", uniqueInfo);
  formData.append("proofImage", proofImageFile);

  try {
    const response = await fetch("/api/claims", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    console.log("Response text:", text);

    try {
      const data = JSON.parse(text);
      if (response.ok) {
        alert("Your claim has been submitted successfully.");
        window.location.href = "/itemlisting.html";
      } else {
        alert("Error submitting claim: " + (data.message || text));
      }
    } catch {
      alert("Error submitting claim: server returned non-JSON response");
    }
  } catch (error) {
    alert("Network error while submitting claim.");
    console.error(error);
  }
}
