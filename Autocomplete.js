// Autocomplete.js
export default class Autocomplete {
    constructor(inputSelector, products) {
      this.input = document.querySelector(inputSelector);
      this.inputContainer = this.input.closest('.input-group');
  
      // The parent must be positioned relatively
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
  
      this.input.addEventListener('input', this.handleInput.bind(this));
      this.input.addEventListener('blur', this.handleBlur.bind(this));
    }
  
    handleInput() {
      const searchTerm = this.input.value.toLowerCase();
      const filtered = this.products.filter(p => 
        p.title.toLowerCase().includes(searchTerm)
      );
  
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
        const matchIndex = product.title.toLowerCase().indexOf(searchTerm);
        if (matchIndex !== -1) {
          const before = product.title.slice(0, matchIndex);
          const match = product.title.slice(
            matchIndex, 
            matchIndex + searchTerm.length
          );
          const after = product.title.slice(matchIndex + searchTerm.length);
          a.innerHTML = `${before}<strong>${match}</strong>${after}`;
        } else {
          a.textContent = product.title;
        }
  
        // On suggestion click
        a.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.input.value = product.title;
          this.dropdown.style.display = 'none';
  
          // Optionally filter your product grid (make sure renderProducts is globally available):
          const exact = this.products.filter(
            p => p.title.toLowerCase() === product.title.toLowerCase()
          );
          renderProducts(exact);
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
  }  