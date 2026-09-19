// Global variable to store the cart ID for removal confirmation
let pendingCartId = null;

// Use localStorage for static demo cart
let staticCart = JSON.parse(localStorage.getItem('mealmate_cart')) || [];
let cartIdCounter = parseInt(localStorage.getItem('mealmate_cart_id')) || 1;

function saveCart() {
    localStorage.setItem('mealmate_cart', JSON.stringify(staticCart));
    localStorage.setItem('mealmate_cart_id', cartIdCounter.toString());
}

// ===== ALERT FUNCTION =====
function showAlert(message, isError = false) {
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.classList.add('custom-alert');
    if (isError) {
        alertBox.classList.add('error');
    }
    document.body.appendChild(alertBox);
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => alertBox.remove(), 500);
    }, 3000);
}

// ===== CONFIRMATION MODAL FUNCTIONS =====
function showConfirmationModal(cartId, itemName) {
    const modal = document.getElementById('confirmationModal');
    const message = document.getElementById('confirmationMessage');
    
    if (itemName) {
        message.textContent = `Are you sure you want to remove "${itemName}" from your cart?`;
    } else {
        message.textContent = 'Are you sure you want to remove this item from your cart?';
    }
    
    pendingCartId = cartId;
    modal.classList.add('active');
}

function hideConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('active');
    pendingCartId = null;
}

// ===== CART BADGE UPDATE =====
function updateCartBadge(count) {
    let badge = document.querySelector('.cart-badge');
    const cartIcon = document.getElementById('main-cart-icon');
    
    if (count > 0) {
        if (!badge) {
            let container = document.querySelector('.cart-badge-container');
            if (!container && cartIcon) {
                container = document.createElement('div');
                container.className = 'cart-badge-container';
                cartIcon.parentNode.insertBefore(container, cartIcon);
                container.appendChild(cartIcon);
            }
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            if (container) {
                container.appendChild(badge);
            }
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}

// ===== UPDATE SLIDING CART =====
function updateSlidingCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total-price');
    
    if(!cartContainer) return;

    cartContainer.innerHTML = '';
    
    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    
    staticCart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += (item.price * item.quantity);
    });

    updateCartBadge(totalItems);

    if (staticCart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
        cartTotal.textContent = 'Rs.0.00';
    } else {
        staticCart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.setAttribute('data-cart-id', item.cart_id);
            
            itemDiv.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.food_name}" 
                         onerror="this.src='../assets/images/menu/default.jpg';">
                </div>
                <div class="cart-item-details">
                    <h4>${item.food_name}</h4>
                    <p class="price">Rs.${parseFloat(item.price).toFixed(2)} each</p>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn" onclick="updateCartQuantity(${item.cart_id}, -1)" aria-label="Decrease quantity">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="updateCartQuantity(${item.cart_id}, 1)" aria-label="Increase quantity">+</button>
                        <button class="cart-remove-btn" onclick="showConfirmationModal(${item.cart_id}, '${item.food_name.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(itemDiv);
        });
        cartTotal.textContent = \`Rs.\${parseFloat(totalPrice).toFixed(2)}\`;
    }
}

// ===== UPDATE CART QUANTITY =====
window.updateCartQuantity = function(cartId, change) {
    const itemIndex = staticCart.findIndex(item => item.cart_id === cartId);
    if (itemIndex > -1) {
        staticCart[itemIndex].quantity += change;
        if (staticCart[itemIndex].quantity <= 0) {
            staticCart.splice(itemIndex, 1);
            showAlert('Item removed from cart.');
        }
        saveCart();
        updateSlidingCart();
    }
};

// ===== REMOVE ITEM FROM CART =====
window.removeCartItem = function(cartId) {
    const itemIndex = staticCart.findIndex(item => item.cart_id === cartId);
    if (itemIndex > -1) {
        staticCart.splice(itemIndex, 1);
        saveCart();
        updateSlidingCart();
        showAlert('Item removed from cart successfully!');
    }
};

// ===== ADD TO CART FUNCTION =====
window.addToCart = function(buttonElement) {
    if (buttonElement) {
        buttonElement.disabled = true;
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        // Find closest menu item to extract details
        const menuItem = buttonElement.closest('.menu-item');
        const foodName = menuItem.querySelector('h3').textContent;
        const priceText = menuItem.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace('Rs.', ''));
        const imageSrc = menuItem.querySelector('img').src;

        setTimeout(() => {
            // Check if already in cart
            const existingItem = staticCart.find(item => item.food_name === foodName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                staticCart.push({
                    cart_id: cartIdCounter++,
                    food_name: foodName,
                    price: price,
                    quantity: 1,
                    image: imageSrc
                });
            }
            
            saveCart();
            showAlert('Added to cart successfully!');
            updateSlidingCart();
            
            buttonElement.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => {
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalText;
            }, 1500);
        }, 500); // Simulate network delay
    }
};

// ===== TOGGLE CART PANEL =====
window.toggleCart = function() {
    const cart = document.getElementById('sliding-cart');
    const overlay = document.querySelector('.sliding-cart-overlay');
    const cartIcon = document.getElementById('main-cart-icon');
    
    if(!cart) return;

    cart.classList.toggle('open');
    overlay.style.display = cart.classList.contains('open') ? 'block' : 'none';
    
    if (cart.classList.contains('open')) {
        cartIcon.classList.add('hidden');
        updateSlidingCart();
        document.body.style.overflow = 'hidden';
    } else {
        cartIcon.classList.remove('hidden');
        document.body.style.overflow = '';
    }
};

// ===== SEARCH AND FILTER INITIALIZATION =====
function initializeSearch() {
    const searchInput = document.getElementById('menuSearch');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterMenu);
    }
    
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                filterMenu();
            });
        });
    }
}

// ===== FILTER MENU ITEMS =====
window.filterMenu = function() {
    const searchInput = document.getElementById('menuSearch');
    const activeButton = document.querySelector('.category-btn.active');
    const noResultsDiv = document.getElementById('noResultsMessage');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = activeButton ? activeButton.getAttribute('data-category') : 'all';
    
    let visibleCount = 0;
    const categorySections = document.querySelectorAll('.category-section');
    
    categorySections.forEach(section => {
        const sectionCategory = section.getAttribute('data-category');
        const menuItems = section.querySelectorAll('.menu-item');
        let visibleInCategory = 0;
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDesc = item.querySelector('p').textContent.toLowerCase();
            
            const matchesSearch = searchTerm === '' || 
                                itemName.includes(searchTerm) || 
                                itemDesc.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || 
                                   sectionCategory === selectedCategory;
            
            if (matchesSearch && matchesCategory) {
                item.style.display = 'flex';
                visibleInCategory++;
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        section.style.display = visibleInCategory > 0 ? 'block' : 'none';
    });
    
    if (noResultsDiv) {
        if (visibleCount === 0) {
            noResultsDiv.classList.add('show');
        } else {
            noResultsDiv.classList.remove('show');
        }
    }
};

// ===== BACK TO TOP BUTTON =====
function initializeBackToTop() {
    let backToTopBtn = document.querySelector('.back-to-top');
    
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTopBtn);
    }
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== INITIALIZATION ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    updateSlidingCart();
    initializeSearch();
    initializeBackToTop();
    
    const confirmBtn = document.getElementById('confirmRemove');
    const cancelBtn = document.getElementById('cancelRemove');
    const modal = document.getElementById('confirmationModal');
    const closeBtn = document.querySelector('.close-confirm-btn');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (pendingCartId) {
                removeCartItem(pendingCartId);
                hideConfirmationModal();
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideConfirmationModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideConfirmationModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'confirmationModal') {
                hideConfirmationModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const cart = document.getElementById('sliding-cart');
            if (cart && cart.classList.contains('open')) {
                toggleCart();
            }
            if (modal && modal.classList.contains('active')) {
                hideConfirmationModal();
            }
        }
    });
    
    // Replace onclick attributes to pass element directly for static demo
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.removeAttribute('onclick');
        button.addEventListener('click', function() {
            addToCart(this);
        });
    });
});