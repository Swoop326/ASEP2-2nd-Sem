document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('claimsContainer');

  try {
    const res = await fetch('/api/admin/all');
    if (!res.ok) throw new Error('Failed to fetch claims.');
    const claims = await res.json();

    console.log('✅ Claims fetched:', claims);

    if (!Array.isArray(claims) || claims.length === 0) {
      container.innerHTML = '<p>No claim requests found.</p>';
      return;
    }

    claims.forEach(claim => {
      console.log('📦 Claim:', claim);

      const card = document.createElement('div');
      card.className = 'claim-card';

      let html = `<h3>${claim.itemName || 'Unnamed Item'}</h3>`;

      if (claim.fullName) html += `<p><strong>Name:</strong> ${claim.fullName}</p>`;
      if (claim.email) html += `<p><strong>Email:</strong> ${claim.email}</p>`;
      if (claim.phone) html += `<p><strong>Phone:</strong> ${claim.phone}</p>`;
      if (claim.lostPlace) html += `<p><strong>Lost Place:</strong> ${claim.lostPlace}</p>`;

      if (claim.lostDate) {
        const date = new Date(claim.lostDate);
        html += `<p><strong>Lost Date:</strong> ${isNaN(date) ? 'Invalid Date' : date.toLocaleDateString()}</p>`;
      }

      if (claim.proofText) html += `<p><strong>Description:</strong> ${claim.proofText}</p>`;
      if (claim.uniqueInfo) html += `<p><strong>Unique Info:</strong> ${claim.uniqueInfo}</p>`;

      if (claim.proofImage) {
        html += `<p><strong>Proof Image:</strong><br><img src="${claim.proofImage}" alt="Proof Image" class="proof-image"></p>`;
      }

      html += `
        <div class="actions">
          <button class="approve-btn" data-id="${claim._id}">Approve</button>
          <button class="reject-btn" data-id="${claim._id}">Reject</button>
        </div>`;

      card.innerHTML = html;
      container.appendChild(card);
    });

    // Handle button clicks
    container.addEventListener('click', async (e) => {
      const isApprove = e.target.classList.contains('approve-btn');
      const isReject = e.target.classList.contains('reject-btn');

      if (isApprove || isReject) {
        const claimId = e.target.dataset.id;
        const action = isApprove ? 'approve' : 'reject';
        const confirmText = `Are you sure you want to ${action} this claim?`;

        if (!confirm(confirmText)) return;

        // Disable both buttons while processing
        const buttons = e.target.parentElement.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);

        try {
          const res = await fetch(`/api/admin/${action}/${claimId}`, { method: 'POST' });
          const data = await res.json();

          if (!res.ok) throw new Error(data.message || 'Action failed.');

          alert(data.message || `${action}d successfully.`);
          location.reload();

        } catch (err) {
          console.error(`❌ Error during ${action}:`, err);
          alert(`Failed to ${action} claim: ${err.message}`);
          buttons.forEach(btn => btn.disabled = false);
        }
      }
    });

  } catch (err) {
    console.error('❌ Error loading admin panel:', err);
    container.innerHTML = '<p>Error loading claims. Please try again later.</p>';
  }
});
