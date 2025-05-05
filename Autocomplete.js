export default class Autocomplete {
  constructor(inputSelector, products) {
    this.input = document.querySelector(inputSelector);
    if (!this.input) {
      console.error(`Input element with selector "${inputSelector}" not found`);
      return;
    }

    // Clean up any existing dropdown from previous instance
    const existingDropdown = this.input.closest('.input-group').querySelector('.autocomplete-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Update input state based on login
    this.input.disabled = !isLoggedIn;
    this.input.placeholder = isLoggedIn ? "Search..." : "Please login to search";

    this.inputContainer = this.input.closest('.input-group');
    this.inputContainer.style.position = 'relative';

    this.products = products;
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'autocomplete-dropdown dropdown-menu';
    this.dropdown.style.position = 'absolute';
    this.dropdown.style.width = this.input.offsetWidth + 'px';
    this.dropdown.style.display = 'none';
    this.dropdown.style.top = '100%';
    this.dropdown.style.left = '0';
    this.dropdown.style.zIndex = '1000';
    this.inputContainer.appendChild(this.dropdown);

    // Remove any existing event listeners
    const newInput = this.input.cloneNode(true);
    this.input.parentNode.replaceChild(newInput, this.input);
    this.input = newInput;

    if (isLoggedIn) {
      this.input.addEventListener('input', this.handleInput.bind(this));
      this.input.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  handleInput() {
    const searchTerm = this.input.value.toLowerCase();
    const filtered = this.products.filter(p => {
      // Handle both Title and title properties
      const productTitle = (p.Title || p.title || '').toLowerCase();
      return productTitle.includes(searchTerm);
    });

    // Clear old suggestions
    this.dropdown.innerHTML = '';

    // Hide if no input or no matches
    if (!searchTerm || filtered.length === 0) {
      this.dropdown.style.display = 'none';
      return;
    }

    // Create suggestions
    filtered.forEach(product => {
      const a = document.createElement('a');
      a.href = '#';
      a.classList.add('dropdown-item');
      
      // Handle both Title and title properties
      const productTitle = product.Title || product.title;
      const matchIndex = productTitle.toLowerCase().indexOf(searchTerm);
      
      if (matchIndex !== -1) {
        const before = productTitle.slice(0, matchIndex);
        const match = productTitle.slice(matchIndex, matchIndex + searchTerm.length);
        const after = productTitle.slice(matchIndex + searchTerm.length);
        a.innerHTML = `${before}<strong>${match}</strong>${after}`;
      } else {
        a.textContent = productTitle;
      }

      // On suggestion click
      a.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.input.value = productTitle;
        this.dropdown.style.display = 'none';
        
        // Navigate to product details page
        this.openProductDetails(product);
      });

      this.dropdown.appendChild(a);
    });

    // Show dropdown
    this.dropdown.style.display = 'block';
  }

  handleBlur() {
    // Delay hiding to allow clicks
    setTimeout(() => {
      this.dropdown.style.display = 'none';
    }, 150);
  }

  openProductDetails(product) {
    // We only need to pass the ID since Product.html fetches the full details
    const query = new URLSearchParams({
      id: product._id || product.id  // Handle both _id and id properties
    }).toString();
    
    window.location.href = `Product.html?${query}`;
  }
}