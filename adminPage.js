document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  loadReports();
});

function setupNavbar() {
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const greetingEl = document.getElementById("greeting");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username") || "";

  if (isLoggedIn && username) {
    greetingEl.textContent = `Hello, ${username}!`;
    userDropdownMenu.innerHTML = `
      <li><a class="dropdown-item" href="profile.html">Profile</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" id="logoutLink" href="#">Logout</a></li>
    `;
    document.getElementById('logoutLink').addEventListener('click', () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  } else {
    greetingEl.textContent = "";
    window.location.href = "signin.html"; // Redirect non-admin users
  }
}

async function loadReports() {
  try {
    const res = await fetch('http://localhost:3000/api/reports');
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const reports = await res.json();
    renderReports(reports);
  } catch (err) {
    console.error('Could not load reports:', err);
    document.querySelector('#reportsTable tbody').innerHTML =
      `<tr><td colspan="5" class="text-danger text-center py-3">Failed to load reports.</td></tr>`;
  }
}

function renderReports(reports) {
  const tbody = document.querySelector('#reportsTable tbody');
  tbody.innerHTML = '';

  if (!reports.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3">No reports found.</td></tr>`;
    return;
  }

  reports.forEach(r => {
    const tr = document.createElement('tr');

    const idCell = document.createElement('td');
    idCell.textContent = r._id;
    tr.appendChild(idCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = r.listingId && r.listingId.Title ? r.listingId.Title : 'Listing Removed';
    tr.appendChild(nameCell);

    const reasonCell = document.createElement('td');
    reasonCell.textContent = r.reason;
    tr.appendChild(reasonCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(r.createdAt).toLocaleString();
    tr.appendChild(dateCell);

    const actionCell = document.createElement('td');
    const listingId = r.listingId && r.listingId._id ? r.listingId._id : null;

    if (listingId) {
      const viewLink = document.createElement('a');
      viewLink.href = `Product.html?id=${listingId}`;
      viewLink.target = "_blank";
      viewLink.textContent = 'View Listing';
      viewLink.className = 'btn btn-sm btn-outline-danger me-2';
      actionCell.appendChild(viewLink);
    } else {
      actionCell.textContent = 'Listing no longer available';
    }

    // Add Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.addEventListener('click', () => deleteReport(r._id));
    actionCell.appendChild(deleteBtn);

    tr.appendChild(actionCell);
    tbody.appendChild(tr);
  });
}

async function deleteReport(reportId) {
  if (!confirm('Are you sure you want to delete this report?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/reports/${reportId}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Report deleted successfully.');
    loadReports(); // Reload the reports after deletion
  } catch (err) {
    console.error('Could not delete report:', err);
    alert('Failed to delete the report. Please try again.');
  }
}