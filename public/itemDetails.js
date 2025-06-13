let currentItem = null;

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  const itemType = urlParams.get('type');

  if (!itemId || !itemType) {
    alert("Missing item details in URL.");
    return;
  }

  const endpoint = itemType === 'found'
    ? `http://localhost:5500/api/found/${itemId}`
    : `http://localhost:5500/api/lost/${itemId}`;

  try {
    const response = await fetch(endpoint);
    const item = await response.json();

    if (!response.ok) throw new Error(item.message || 'Item not found');

    currentItem = item;

    document.getElementById('item-title').textContent = item.title || item.itemName || 'N/A';
    document.getElementById('item-category').textContent = item.category || 'N/A';
    document.getElementById('item-date').textContent = new Date(item.date).toLocaleDateString();
    document.getElementById('item-location').textContent = item.location || 'N/A';
    document.getElementById('item-description').textContent = item.description || 'N/A';
    document.getElementById('item-contact').textContent = item.ownerContact || 'Not provided';

    const itemImage = document.getElementById('item-image');
    if (item.imageUrl) {
      itemImage.src = item.imageUrl;
      itemImage.onerror = () => {
        itemImage.alt = "Image not available";
        itemImage.style.display = "none";
      };
    }

    const claimButton = document.getElementById('claim-btn');
    claimButton.style.display = itemType === 'found' ? 'block' : 'none';

  } catch (error) {
    console.error("Error loading item details:", error);
    alert("Error loading item details.");
  }
});

function handleClaim() {
  if (!currentItem) {
    alert("Item not loaded yet. Please wait.");
    return;
  }

  const image = currentItem.imageUrl || '';
  const name = currentItem.title || currentItem.itemName || '';
  const id = currentItem._id;

  window.location.href = `claimitem.html?image=${encodeURIComponent(image)}&name=${encodeURIComponent(name)}&id=${id}`;
}
