// Helper to render user menu on every load
function updateUserMenu() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || '';
  const greetingEl = document.getElementById('greeting');
  const menu = document.getElementById('userDropdownMenu');

  if (isLoggedIn) {
    greetingEl.textContent = `Hello, ${username}!`;
    menu.innerHTML = `
      <li><a class="dropdown-item" href="profile.html">Profile</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
    `;
    document.getElementById('logoutLink')
            .addEventListener('click', async () => {
              localStorage.clear();
              const products = await (await fetch('http://localhost:3000/api/listings')).json();
              new Autocomplete('.search-input', products);
              location.reload();
            });
  } else {
    greetingEl.textContent = '';
    menu.innerHTML = `
      <li class="px-3 py-2">
        <div id="g_id_signin"></div>
      </li>
    `;
    google.accounts.id.renderButton(
      document.getElementById('g_id_signin'),
      { theme: 'outline', size: 'small' }
    );
  }
  loadWishlistDropdown();
}

// Initialize GSI and then render user menu
// This function is called when the page loads and when the user logs in and logs out i have the API key but 
window.onload = () => {
  google.accounts.id.initialize({
    client_id: '922908217557-2osq9upebgcpke4jl560hqbl77eodu5i.apps.googleusercontent.com',
    callback: HandleAuth,
    ux_mode: 'popup',
    cancel_on_tap_outside: false
  });
  updateUserMenu();
};

// Fetch & render products
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:3000/api/listings');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    let products = await res.json();
    products = products.reverse();
    renderProducts(products);

    const autocomplete = new Autocomplete('.search-input', products);
  } catch (err) {
    console.error(err);
    document.getElementById('product-grid').innerHTML =
      `<p class="text-danger">Failed to load products.</p>`;
  }
  loadWishlistDropdown();
});

function renderProducts(items) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  items.forEach(prod => {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 product-card" data-price="${prod.Price || prod.price}">
        <img src="${prod.Images?.[0] || prod.image || ''}"
             class="card-img-top"
             alt="${prod.Title || prod.title}" />
        <div class="card-body">
          <h5 class="card-title">${prod.Title || prod.title}</h5>
          <p class="card-text">${prod.Description || prod.description}</p>
          <p class="text-success">$${prod.Price || prod.price}</p>
              ${isLoggedIn
                ? `<button class="btn btn-success"
                    onclick="buyNow(
                      '${prod._id}',
                      '${(prod.Title||prod.title)}',
                      '${(prod.Description||prod.description)}',
                      '${prod.Price||prod.price}',
                      '${(prod.Images?.[0]||prod.image||'')}'
                    )">
                    Buy Now
                  </button>`
                : ``
              }
            </div>
          </div>`;
    grid.appendChild(col);
  });
}

// Google callback
async function HandleAuth(response) {
  if (!response.credential) return;
  const { name, email: rawEmail } = jwt_decode(response.credential);
  const email = rawEmail.trim().toLowerCase();

  try {
    const res = await fetch('http://localhost:3000/api/user', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, email })
    });
    if (res.status === 403) {
      alert((await res.json()).message);
      return;
    }
    if (!res.ok) throw await res.json();

    const { id } = await res.json();
    localStorage.setItem('userId', id);
    localStorage.setItem('username', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');

    updateUserMenu();
    const products = await (await fetch('http://localhost:3000/api/listings')).json();
    renderProducts(products);
    new Autocomplete('.search-input', products);
  } catch (err) {
    console.error(err);
    alert(err.message||'Auth failed');
  }
}

// Buy-Now redirect to the product page
function buyNow(id, title, description, price, image) {
  const q = new URLSearchParams({
    id, title, description, price, image
  }).toString();
  window.location.href = `Product.html?${q}`;
}

// Attach the buyNow function to the global window object
window.buyNow = buyNow;

document.getElementById("priceFilter").addEventListener("change", function () {
  const sortOrder = this.value;
  const productCards = Array.from(document.querySelectorAll(".product-card"));

  productCards.sort((a, b) => {
    const priceA = parseFloat(a.dataset.price);
    const priceB = parseFloat(b.dataset.price);
    return sortOrder === "lowToHigh" ? priceA - priceB : priceB - priceA;
  });

  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  productCards.forEach(card => {
    const wrapper = document.createElement("div");
    wrapper.className = "col-sm-6 col-md-4 col-lg-3 mb-4";
    wrapper.appendChild(card);
    grid.appendChild(wrapper);
  });
});

// Show welcome modal when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('hasVisited')) {
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'), {
      backdrop: 'static',
      keyboard: true
    });
    welcomeModal.show();
    localStorage.setItem('hasVisited', 'true');
  }

  try {
    const res = await fetch('http://localhost:3000/api/listings');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    let products = await res.json();
    products = products.reverse();
    renderProducts(products);

    new Autocomplete('.search-input', products);
  } catch (err) {
    console.error(err);
    document.getElementById('product-grid').innerHTML =
      `<p class="text-danger">Failed to load products.</p>`;
  }
});

async function loadWishlistDropdown() {
  const wishlistMenu = document.getElementById('wishlistDropdownMenu');
  const userId = localStorage.getItem('userId');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn || !userId) {
    wishlistMenu.innerHTML = '<li><a class="dropdown-item text-muted">Please login to see wishlist</a></li>';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}/wishlist`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const items = await res.json();

    if (!items || items.length === 0) {
      wishlistMenu.innerHTML = '<li><a class="dropdown-item text-muted">Your wishlist is empty</a></li>';
      return;
    }

    wishlistMenu.innerHTML = items.map(item => `
      <li>
        <a class="dropdown-item" href="Product.html?id=${item._id}">
          <div class="d-flex align-items-center">
            <img src="${item.Images?.[0] || '/placeholder.png'}" 
                 alt="${item.Title}" 
                 style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;">
            <div>
              <div>${item.Title}</div>
              <small class="text-success">$${item.Price}</small>
            </div>
          </div>
        </a>
      </li>
    `).join('') + '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-center" href="profile.html#wishlist">View All</a></li>';

  } catch (err) {
    console.error('Could not load wishlist:', err);
    wishlistMenu.innerHTML = '<li><a class="dropdown-item text-danger">Error loading wishlist</a></li>';
  }
}