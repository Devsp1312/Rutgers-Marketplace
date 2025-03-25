/********************************************
 * productListing.js
 * 
 * Provides functions to render product listings 
 * in a specified container and handle "Buy Now".
 ********************************************/

/**
 * Renders an array of product objects into a given container.
 * @param {Array} products - Array of product objects.
 * @param {string} containerId - The ID of the DOM element where products should be rendered.
 */
function renderProductListings(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }
  
    // Clear any existing content
    container.innerHTML = "";
  
    products.forEach(product => {
      // Create Bootstrap column
      const colDiv = document.createElement("div");
      colDiv.classList.add("col-sm-6", "col-md-4", "col-lg-3", "mb-4");
  
      // Build the card HTML
      colDiv.innerHTML = `
        <div class="card h-100">
          <img 
            src="${product.image || ''}"
            class="card-img-top"
            alt="${product.title}"
          />
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.description}</p>
            <p class="text-success">$${product.price}</p>
            <button class="btn btn-success" onclick="buyNow(
              '${product.title}',
              '${product.description}',
              '${product.price}',
              '${product.image || ''}'
            )">Buy Now</button>
          </div>
        </div>
      `;
      container.appendChild(colDiv);
    });
  }
  
  /**
   * Handles the "Buy Now" logic by redirecting to Product.html 
   * with query parameters (title, description, price, image).
   * @param {string} title 
   * @param {string} description 
   * @param {number} price 
   * @param {string} image 
   */
  function buyNow(title, description, price, image) {
    const query = new URLSearchParams({
      title,
      description,
      price,
      image
    }).toString();
    window.location.href = `Product.html?${query}`;
  }
  