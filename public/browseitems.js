const lostItemsContainer = document.getElementById('lostItems');
const foundItemsContainer = document.getElementById('foundItems');
const searchBox = document.getElementById('searchBox');
const categoryFilter = document.getElementById('categoryFilter');
const mainLocationFilter = document.getElementById('mainLocationFilter');
const subLocationFilter = document.getElementById('subLocationFilter');
const otherLocationInput = document.getElementById('otherLocationInput');
const dateRangeInput = document.getElementById('dateRange');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');

function createItemCard(item) {
  const name = item.title || item.item || 'No Title';

  return `
    <div class="card">
      <img src="${item.imageUrl || '/default-image.jpg'}" alt="${name}" />
      <h3 title="${name}">${name}</h3>
      <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
      <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
      <a href="itemDetails.html?id=${item._id}&type=${item.type}" class="view-details-btn">View Details</a>
    </div>
  `;
}

const subLocationMap = {
  Buildings: ['Building 1', 'Building 2', 'Building 3', 'Building 4'],
  'Special Floors': ['-1', '-2'],
  Canteen: ['VIT Main Canteen', 'Fruit Canteen', 'New Poona Bakery'],
  Parking: ['Near Sharad Arena', 'Near Boat Club', 'Ground'],
  'Other Places': ['Library', 'Gym', 'Auditorium', 'Boat Club'],
  Others: []
};

mainLocationFilter.addEventListener('change', () => {
  const mainLoc = mainLocationFilter.value;
  subLocationFilter.innerHTML = '<option value="">Select Sub-location</option>';
  if (mainLoc === 'Others') {
    otherLocationInput.style.display = 'inline-block';
    subLocationFilter.style.display = 'none';
  } else {
    otherLocationInput.style.display = 'none';
    subLocationFilter.style.display = 'inline-block';
    if (subLocationMap[mainLoc]) {
      subLocationMap[mainLoc].forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        subLocationFilter.appendChild(option);
      });
    }
  }
});

flatpickr(dateRangeInput, {
  mode: "range",
  enableTime: false,
  dateFormat: "Y-m-d",
  locale: { rangeSeparator: " - " },
  altInput: true,
  altFormat: "F j, Y"
});

async function fetchAndRenderItems() {
  const params = new URLSearchParams();

  if (categoryFilter.value) params.append('category', categoryFilter.value);

  if (mainLocationFilter.value) {
    if (mainLocationFilter.value === 'Others' && otherLocationInput.value.trim()) {
      params.append('location', otherLocationInput.value.trim());
    } else if (subLocationFilter.value) {
      params.append('location', subLocationFilter.value);
    } else {
      params.append('location', mainLocationFilter.value);
    }
  }

  if (searchBox.value.trim()) params.append('search', searchBox.value.trim());

  if (dateRangeInput.value) {
    const dates = dateRangeInput.value.split(' - ');
    if (dates.length === 2) {
      params.append('dateFrom', dates[0]);
      params.append('dateTo', dates[1]);
    }
  }

  try {
    const res = await fetch('/api/browse/items?' + params.toString());
    if (!res.ok) throw new Error('Failed to fetch items');
    const data = await res.json();

    lostItemsContainer.innerHTML = '';
    foundItemsContainer.innerHTML = '';

    if (data.lostItems && data.lostItems.length) {
      const lostCards = data.lostItems.map(item => {
        item.type = 'lost';
        return createItemCard(item);
      });
      lostItemsContainer.innerHTML = lostCards.join('');
    } else {
      lostItemsContainer.innerHTML = '<p>No lost items found.</p>';
    }

    if (data.foundItems && data.foundItems.length) {
      const foundCards = data.foundItems.map(item => {
        item.type = 'found';
        return createItemCard(item);
      });
      foundItemsContainer.innerHTML = foundCards.join('');
    } else {
      foundItemsContainer.innerHTML = '<p>No found items found.</p>';
    }
  } catch (err) {
    console.error(err);
    lostItemsContainer.innerHTML = '<p>Error loading lost items.</p>';
    foundItemsContainer.innerHTML = '<p>Error loading found items.</p>';
  }
}

function resetFilters() {
  categoryFilter.value = '';
  mainLocationFilter.value = '';
  subLocationFilter.innerHTML = '<option value="">Select Sub-location</option>';
  otherLocationInput.value = '';
  otherLocationInput.style.display = 'none';
  subLocationFilter.style.display = 'inline-block';
  searchBox.value = '';
  dateRangeInput.value = '';

  fetchAndRenderItems();
}

applyFiltersBtn.addEventListener('click', fetchAndRenderItems);
resetFiltersBtn.addEventListener('click', resetFilters);
window.addEventListener('DOMContentLoaded', fetchAndRenderItems);
