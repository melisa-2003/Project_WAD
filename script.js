/* ========================================
   CAKE PAGE LOADER SCRIPT
   Add this to the TOP of your script.js file
   ======================================== */

// Show loader immediately
document.addEventListener('DOMContentLoaded', function() {
    // Ensure loader is visible
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.display = 'flex';
    }
});

// Hide loader when page is fully loaded
window.addEventListener('load', function() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        // Add a small delay for better UX
        setTimeout(function() {
            loader.classList.add('loaded');
            
            // Remove from DOM after transition completes
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }, 0); // Minimum display time
    }
});

// Handle page navigation (for SPAs or dynamic content)
function showLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.remove('loaded');
        loader.style.display = 'flex';
    }
}

function hideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(function() {
            loader.classList.add('loaded');
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }, 500);
    }
}

// Optional: Show loader on link clicks (if you want)
// Uncomment this if you want loader to show when navigating between pages

document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target && target.href && !target.target && !target.getAttribute('onclick')) {
        // Only show loader for internal links
        const currentDomain = window.location.hostname;
        const linkDomain = new URL(target.href).hostname;
        
        if (currentDomain === linkDomain) {
            showLoader();
        }
    }
});

// Toggle Mobile Menu
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}

// Add to Cart (basic placeholder)
function addToCart(id, name, price) {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    const userWantsToSignIn = confirm("You need to sign in to add items to cart. Would you like to sign in now?");
    if (userWantsToSignIn) {
      window.location.href = 'signin.html';
    }
    return;
  }
  
  // Show toast notification instead of alert
  showToast(`${name || 'Product'} has been added to the cart!`, 'success', 3000);
}

// Contact Form Submission
function submitForm(event) {
  event.preventDefault();
  showToast('Thank you for reaching out! We will get back to you soon.', 'success', 4000);
  event.target.reset();
}

// Handle Sign In with proper validation
function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!email || !password) {
        showToast('Please enter both email and password', 'error', 3000);
        return;
    }

    // Check for admin login
    if (email === 'admin@dayangsari.com' && password === 'admin123') {
        // Set admin login status
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userData', JSON.stringify({ 
            email: email, 
            name: 'Admin',
            role: 'admin' 
        }));
        
        showToast('Admin logged in successfully!', 'success', 2000);
        setTimeout(() => {
            window.location.href = 'Admin/admin.html';
        }, 1000);
        return;
    }

    // Check if user is registered
    const registeredUser = localStorage.getItem('registeredUser_' + email);
    
    if (!registeredUser) {
        // User not found - show error message only
        showToast('Account not found. Please sign up first!', 'error', 4000);
        return;
    }

    // User exists - verify password
    const userData = JSON.parse(registeredUser);
    
    if (userData.password !== password) {
        showToast('Incorrect password. Please try again.', 'error', 3000);
        return;
    }

    // Successful login
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userData', JSON.stringify({
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        role: 'customer'
    }));
    
    showToast(`Welcome back, ${userData.name}!`, 'success', 2000);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Handle Sign Up with proper validation
function handleSignUp(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate all fields are filled
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error', 3000);
        return;
    }

    // Validate email format - must be @gmail.com
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
        showToast('Please use a valid Gmail address (@gmail.com)', 'error', 3000);
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error', 3000);
        return;
    }

    // Validate password requirements
    if (password.length < 8) {
        showToast('Password must be at least 8 characters long', 'error', 3000);
        return;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        showToast('Password must contain at least one uppercase letter', 'error', 3000);
        return;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        showToast('Password must contain at least one lowercase letter', 'error', 3000);
        return;
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        showToast('Password must contain at least one special character (!@#$%^&*)', 'error', 3000);
        return;
    }

    // Check if email is already registered
    const existingUser = localStorage.getItem('registeredUser_' + email);
    if (existingUser) {
        showToast('This email is already registered. Please sign in instead.', 'error', 4000);
        return;
    }

    // Prevent registration with admin email
    if (email.toLowerCase() === 'admin@dayangsari.com') {
        showToast('This email cannot be used for customer registration', 'error', 3000);
        return;
    }

    // Create new user
    const userData = {
        name: name,
        email: email,
        password: password, // In production, this should be hashed!
        phone: '',
        role: 'customer',
        registeredDate: new Date().toISOString()
    };
    
    // Save user data to localStorage
    localStorage.setItem('registeredUser_' + email, JSON.stringify(userData));

    showToast('Account created successfully!', 'success', 2000);
    
    setTimeout(() => {
        // Show success message and redirect
        alert(`Welcome ${name}! Your account has been created.\n\nPlease sign in to continue.`);
        window.location.href = 'signin.html';
    }, 1000);
}

// Helper function to check if email exists
function checkEmailExists(email) {
    return localStorage.getItem('registeredUser_' + email) !== null;
}

// Setup email validation (optional real-time checking)
function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (!email) return;
        
        // Only check format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return; // Invalid format
        }
    });
}

// Setup password match indicator for signup page
function setupPasswordMatchIndicator() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const indicator = document.getElementById('passwordMatchIndicator');
    
    // Only run if elements exist (signup page)
    if (!password || !confirmPassword || !indicator) return;
    
    function checkPasswordMatch() {
        const pass = password.value;
        const confirm = confirmPassword.value;
        
        if (confirm === '') {
            indicator.style.display = 'none';
            return;
        }
        
        if (pass === confirm) {
            indicator.className = 'password-match-indicator match';
            indicator.textContent = '✓ Passwords match';
        } else {
            indicator.className = 'password-match-indicator no-match';
            indicator.textContent = '✗ Passwords do not match';
        }
    }
    
    confirmPassword.addEventListener('input', checkPasswordMatch);
    password.addEventListener('input', checkPasswordMatch);
}

// Scroll to Top Button Functionality
const scrollTopBtn = document.getElementById('scrollTop');

// Show/hide button based on scroll position
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Logout function
function logout() {
  const confirmLogout = confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    showToast('You have been logged out successfully!', 'info', 3000);
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// ========================================
// DROPDOWN HANDLER FUNCTIONALITY
// Add this function to your script.js
// ========================================

function setupDropdownHandlers() {
  const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
  
  dropdownTriggers.forEach(trigger => {
    // Remove any existing listeners to prevent duplicates
    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);
    
    // Add click event to toggle dropdown
    newTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdown = this.closest('.nav-dropdown');
      const isActive = dropdown.classList.contains('active');
      
      // Close all other dropdowns
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        d.classList.remove('active');
      });
      
      // Toggle current dropdown
      if (!isActive) {
        dropdown.classList.add('active');
      }
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
  });
}

// UPDATE the updateNavigation function to call setupDropdownHandlers
// Find your existing updateNavigation function and modify it like this:

function updateNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        const userName = user?.name || 'User';
        
        //Get current cart count
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // User is logged in - show: Home | Products | About | My Account (with dropdown) | Cart
        navLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="product.html">Products</a></li>
            <li><a href="about.html">About Us</a></li>
            <li class="nav-dropdown">
                <a href="#" class="dropdown-trigger">
                    ${userName} ▾
                </a>
                <ul class="dropdown-menu">
                    <li><a href="myaccount.html">My Account</a></li>
                    <li><a href="#" onclick="logout(); return false;">Logout</a></li>
                </ul>
            </li>
            <li>
                <a href="cart.html" class="cart-link">
                    <img src="asset/shopping-bag.png" alt="Cart" class="cart-icon" onerror="this.parentElement.innerHTML='Cart<span class=\\'cart-badge\\' id=\\'cartBadge\\' style=\\'display: ${totalItems > 0 ? 'inline-flex' : 'none'}\\'>${totalItems}</span>'">
                    <span class="cart-badge" id="cartBadge" style="display: ${totalItems > 0 ? 'inline-flex' : 'none'}">${totalItems}</span>
                </a>
            </li>
        `;
        
        // Setup dropdown handlers after navigation is rendered
        setTimeout(setupDropdownHandlers, 0);
    } else {
        // User is NOT logged in - show: Home | Products | About | Sign In
        navLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="product.html">Products</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="signin.html">Sign In</a></li>
        `;
    }
}

// Call updateNavigation when page loads
document.addEventListener('DOMContentLoaded', updateNavigation);

// ========================================
// PRODUCT DATA WITH CATEGORIES
// ========================================

const products = {
    // TRADITIONAL BISCUITS CATEGORY
    1: {
        name: "Biskut Chocolate Chip",
        category: "Traditional Biscuits",
        categoryId: "cookies",
        price: 25.00,
        image: "asset/products/chocolate_chip.jfif",
        description: "Classic chocolate chip cookies with premium chocolate chips. Crispy on the outside, soft and chewy on the inside.",
        features: [
            "✓ Premium chocolate chips",
            "✓ Crispy and chewy texture",
            "✓ Halal certified",
            "✓ Perfect for tea time"
        ]
    },
    2: {
        name: "Biskut Semperit",
        category: "Traditional Biscuits",
        categoryId: "cookies",
        price: 20.00,
        image: "asset/products/semperit.jfif",
        description: "Melt-in-your-mouth butter cookies. These traditional cookies have a crumbly texture that dissolves delightfully on your tongue.",
        features: [
            "✓ Premium butter cookies",
            "✓ Crumbly texture",
            "✓ Classic festive cookie",
            "✓ Various shapes available"
        ]
    },
    3: {
        name: "Biskut Cornflakes Madu",
        category: "Traditional Biscuits",
        categoryId: "cookies",
        price: 20.00,
        image: "asset/products/cornflake_madu.jfif",
        description: "Crunchy cornflakes cookies with a sweet honey glaze. A perfect combination of crunch and sweetness.",
        features: [
            "✓ Crunchy cornflakes",
            "✓ Natural honey glaze",
            "✓ Light and crispy",
            "✓ Kids favorite"
        ]
    },
    4: {
        name: "Biskut Cadbury",
        category: "Traditional Biscuits",
        categoryId: "cookies",
        price: 25.00,
        image: "asset/products/chocolate_cadbury.jfif",
        description: "Rich chocolate cookies made with Cadbury chocolate. Indulgent and decadent for chocolate lovers.",
        features: [
            "✓ Made with Cadbury chocolate",
            "✓ Rich chocolate flavor",
            "✓ Premium quality",
            "✓ Perfect gift option"
        ]
    },
    5: {
        name: "Biskut Makmur",
        category: "Traditional Biscuits",
        categoryId: "cookies",
        price: 20.00,
        image: "asset/products/makmur.jfif",
        description: "Traditional Malay cookies filled with rich cashew nut filling. A festive favorite that melts in your mouth.",
        features: [
            "✓ Cashew nut filling",
            "✓ Buttery pastry",
            "✓ Traditional recipe",
            "✓ Festive delicacy"
        ]
    },
    6: {
        name: "Tart Nanas",
        category: "Traditional Biscuits",
        categoryId: "cookies",
        price: 25.00,
        image: "asset/products/tart_nanas.jfif",
        description: "Sweet and tangy pineapple jam wrapped in buttery pastry. Each tart is carefully handcrafted to perfection.",
        features: [
            "✓ Fresh pineapple filling",
            "✓ Buttery pastry crust",
            "✓ Handmade with care",
            "✓ Popular festive treat"
        ]
    },

    // SNACKS CATEGORY
    7: {
        name: "Kuih Sepit Original",
        category: "Snacks & Crackers",
        categoryId: "snacks",
        price: 28.00,
        image: "asset/products/sepit.jfif",
        description: "Crispy wafer-thin love letter cookies. Delicately folded and perfectly crisp, these traditional treats are irresistible.",
        features: [
            "✓ Ultra-thin and crispy",
            "✓ Coconut milk flavor",
            "✓ Traditional folding technique",
            "✓ Festive favorite"
        ]
    },
    8: {
        name: "Popia Simpul",
        category: "Snacks & Crackers",
        categoryId: "snacks",
        price: 30.00,
        image: "asset/products/popia_udang.jfif",
        hasVariants: true,
        variants: [
            {name: "Serunding Ayam", price: 30.00},
            {name: "Serunding Daging", price: 30.00},
            {name: "Udang Kering", price: 30.00}
        ],
        description: "Crispy spring rolls filled with savory prawn filling. A perfect snack for any occasion.",
        features: [
            "✓ Fresh prawn filling",
            "✓ Crispy texture",
            "✓ Savory and delicious",
            "✓ Great for parties"
        ]
    },
    9: {
        name: "Popia Cheese",
        category: "Snacks & Crackers",
        categoryId: "snacks",
        price: 28.00,
        image: "asset/products/popia_cheese.jfif",
        description: "Crispy spring rolls with creamy cheese filling. A modern twist on a traditional favorite.",
        features: [
            "✓ Creamy cheese filling",
            "✓ Crispy golden crust",
            "✓ Kids friendly",
            "✓ Perfect snack"
        ]
    },
    10: {
        name: "Popia Seaweed",
        category: "Snacks & Crackers",
        categoryId: "snacks",
        price: 28.00,
        image: "asset/products/popia_seaweed.jfif",
        description: "Crispy spring rolls with savory seaweed filling. A healthy and tasty snack option.",
        features: [
            "✓ Nutritious seaweed",
            "✓ Light and crispy",
            "✓ Unique flavor",
            "✓ Healthier option"
        ]
    },
    11: {
        name: "Cupcake Coklat",
        category: "Snacks & Crackers",
        categoryId: "snacks",
        price: 25.00,
        image: "asset/products/cupcake_chocolate.jfif",
        description: "Moist chocolate cupcakes topped with creamy chocolate frosting. Perfect for any celebration.",
        features: [
            "✓ Moist and fluffy",
            "✓ Rich chocolate flavor",
            "✓ Creamy frosting",
            "✓ Party favorite"
        ]
    },

    // CAKES CATEGORY - WITH VARIANTS
    12: {
        name: "Kek Belacan",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/belacan.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Traditional layered cake with unique belacan flavor. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Multiple intricate layers",
            "✓ Unique Sarawak flavor",
            "✓ Choice of Regular or Premium"
        ]
    },
    13: {
        name: "Kek Lumut",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lumut.jpeg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Beautiful green layered cake with pandan flavor. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Natural pandan flavor",
            "✓ Vibrant green layers",
            "✓ Choice of Regular or Premium"
        ]
    },
    14: {
        name: "Kek Pilih Kasih",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/pilih_kasih.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Layered cake with alternating flavors. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Multiple flavors",
            "✓ Beautiful patterns",
            "✓ Choice of Regular or Premium"
        ]
    },
    15: {
        name: "Kek Idola",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_idola.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Popular layered cake loved by many. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Fan favorite",
            "✓ Rich and moist",
            "✓ Choice of Regular or Premium"
        ]
    },
    16: {
        name: "Kek Lapis Horlicks",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_horlicks.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Layered cake infused with Horlicks flavor. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Horlicks flavor",
            "✓ Unique taste",
            "✓ Choice of Regular or Premium"
        ]
    },
    17: {
        name: "Kek Lapis Holiday Inn",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_holiday_inn.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Signature layered cake with hotel-quality taste. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Hotel signature recipe",
            "✓ Premium taste",
            "✓ Choice of Regular or Premium"
        ]
    },
    18: {
        name: "Kek Lapis Red Velvet",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_red_velvet.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Beautiful red velvet layered cake. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Classic red velvet",
            "✓ Cream cheese hint",
            "✓ Choice of Regular or Premium"
        ]
    },
    19: {
        name: "Kek BLC",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_blc.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Special BLC layered cake. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Unique BLC recipe",
            "✓ Traditional method",
            "✓ Choice of Regular or Premium"
        ]
    },
    20: {
        name: "Kek Lapis India",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_india.jpg",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Spiced layered cake with Indian influences. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Aromatic spices",
            "✓ Unique flavor profile",
            "✓ Choice of Regular or Premium"
        ]
    },
    21: {
        name: "Kek Lapis Evergreen",
        category: "Layered Cakes",
        categoryId: "cakes",
        image: "asset/products/lapis_evergreen.jfif",
        hasVariants: true,
        variants: [
            { name: "Regular", price: 150.00, size: "8x8" },
            { name: "Premium", price: 200.00, size: "8x8" }
        ],
        description: "Classic evergreen layered cake. Available in Regular and Premium variants.",
        features: [
            "✓ Size: 8x8",
            "✓ Timeless classic",
            "✓ Always popular",
            "✓ Choice of Regular or Premium"
        ]
    },

    // SPECIAL CAKES (10x10 - NO VARIANTS)
    22: {
        name: "Kuih Bingka",
        category: "Layered Cakes",
        categoryId: "cakes",
        price: 45.00,
        size: "10x10",
        image: "asset/products/bingka.jpg",
        description: "Traditional Malay baked tapioca cake. Larger 10x10 size perfect for sharing.",
        features: [
            "✓ Size: 10x10",
            "✓ Traditional recipe",
            "✓ Soft and moist",
            "✓ Great for gatherings"
        ]
    },
    23: {
        name: "Kek Talam Berlauk",
        category: "Layered Cakes",
        categoryId: "cakes",
        price: 45.00,
        size: "10x10",
        image: "asset/products/talam_berlauk.jpeg",
        description: "Two-layered steamed cake with savory and sweet layers. Size 10x10.",
        features: [
            "✓ Size: 10x10",
            "✓ Two distinct layers",
            "✓ Sweet and savory",
            "✓ Traditional steamed cake"
        ]
    },
    24: {
        name: "Kek Lapis Ros",
        category: "Layered Cakes",
        categoryId: "cakes",
        price: 45.00,
        size: "10x10",
        image: "asset/products/lapis_ros.jpeg",
        description: "Beautiful rose-patterned layered cake. Size 10x10.",
        features: [
            "✓ Size: 10x10",
            "✓ Beautiful rose pattern",
            "✓ Intricate design",
            "✓ Perfect centerpiece"
        ]
    }
};

// Category name mapping
const categoryNames = {
    cookies: "Traditional Biscuits",
    snacks: "Snacks & Crackers",
    cakes: "Layered Cakes"
};

// ========================================
// PRODUCT PAGE FILTER FUNCTIONALITY
// ========================================

let currentCategory = "all";
let allProducts = [];

// Initialize products array from object
function initializeProductsArray() {
    allProducts = Object.keys(products).map(id => ({
        id: id,
        ...products[id]
    }));
}

// Initialize page
function initializePage() {
    // Check if we're on the product page
    if (window.location.pathname.includes('product.html')) {
        initializeProductsArray();
        displayProducts(allProducts);
    }
}

// ========================================
// FEATURED PRODUCTS FOR HOME PAGE
// ========================================

function loadFeaturedProducts() {
    // Only run on index.html
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
        return;
    }
    
    const container = document.getElementById('featuredProductsGrid');
    if (!container) return;
    
    // Get most purchased products
    const topProducts = getMostPurchasedProducts(3);
    
    // If no purchase data, use default featured products
    const featuredProducts = topProducts.length >= 3 ? topProducts : [
        { id: '1', badge: 'Bestseller', purchaseCount: 0 },
        { id: '2', badge: 'Popular', purchaseCount: 0 },
        { id: '3', badge: 'New', purchaseCount: 0 }
    ];
    
    container.innerHTML = featuredProducts.map((featured, index) => {
        const product = products[featured.id];
        if (!product) return '';
        
        // Determine badge based on rank and purchase count
        let badge = 'Featured';
        if (featured.purchaseCount > 0) {
            if (index === 0) badge = 'Bestseller';
            else if (index === 1) badge = 'Popular';
            else badge = 'Trending';
        } else {
            if (index === 0) badge = 'Bestseller';
            else if (index === 1) badge = 'Popular';
            else badge = 'New';
        }
        
        // Determine price display
        let priceDisplay;
        if (product.hasVariants) {
            const minPrice = Math.min(...product.variants.map(v => v.price));
            priceDisplay = `RM ${minPrice.toFixed(2)}`;
        } else {
            priceDisplay = `RM ${product.price.toFixed(2)}`;
        }
        
        return `
            <div class="product-card" onclick="location.href='product-detail.html?id=${featured.id}'">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='<div class=\\'product-image-placeholder\\'>${product.emoji || '🥮'}</div><span class=\\'product-badge\\'>${badge}</span>'">
                    <span class="product-badge">${badge}</span>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3>${product.name}</h3>
                    <p>${product.description.substring(0, 60)}...</p>
                    <div class="product-price">${priceDisplay}</div>
                    <button class="product-btn">See More</button>
                </div>
            </div>
        `;
    }).join('');
}

// Get most purchased products from all order histories
function getMostPurchasedProducts(limit = 3) {
    const productPurchaseCount = {};
    
    // Get all registered users
    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('registeredUser_')) {
            const userData = JSON.parse(localStorage.getItem(key));
            allUsers.push(userData.email);
        }
    }
    
    // Count purchases from all users' order histories
    allUsers.forEach(email => {
        const orderKey = 'orderHistory_' + email;
        const orderHistory = JSON.parse(localStorage.getItem(orderKey)) || [];
        
        orderHistory.forEach(order => {
            if (order.cart && Array.isArray(order.cart)) {
                order.cart.forEach(item => {
                    // Extract base product ID (remove variant info if present)
                    const productId = item.id.toString();
                    
                    if (!productPurchaseCount[productId]) {
                        productPurchaseCount[productId] = 0;
                    }
                    productPurchaseCount[productId] += item.quantity;
                });
            }
        });
    });
    
    // Convert to array and sort by purchase count
    const sortedProducts = Object.entries(productPurchaseCount)
        .map(([id, count]) => ({ id, purchaseCount: count }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, limit);
    
    return sortedProducts;
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    
    // Update active tab
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    filterProducts();
}

// Filter and display products
function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    // Check if elements exist (we're on product page)
    if (!searchInput || !sortSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    
    // Filter by category
    let filtered = currentCategory === "all" 
        ? [...allProducts] 
        : allProducts.filter(p => p.categoryId === currentCategory);
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort products
    switch(sortValue) {
        case 'price-low':
            filtered.sort((a, b) => {
                const priceA = a.hasVariants ? a.variants[0].price : a.price;
                const priceB = b.hasVariants ? b.variants[0].price : b.price;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filtered.sort((a, b) => {
                const priceA = a.hasVariants ? a.variants[a.variants.length - 1].price : a.price;
                const priceB = b.hasVariants ? b.variants[b.variants.length - 1].price : b.price;
                return priceB - priceA;
            });
            break;
        case 'name-az':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-za':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    displayProducts(filtered);
}

// Display products 
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    if (productsToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = productsToDisplay.map(product => {
        // Determine price display
        let priceDisplay;
        if (product.hasVariants && product.variants && product.variants.length > 0) {
            const prices = product.variants.map(v => v.price || product.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                //All same price
                priceDisplay = `RM ${minPrice.toFixed(2)}`;
            } else {
                //Different prices
                priceDisplay = `RM ${minPrice.toFixed(2)} - RM ${maxPrice.toFixed(2)}`;
            }
        } else {
            priceDisplay = `RM ${product.price.toFixed(2)}`;
        }
        
        return `
            <div class="product-card" style="position: relative;">
                <div class="product-image" onclick="location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
                    <img src="${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='<div class=\\'product-image-placeholder\\'>${product.emoji || '🥮'}</div>'">
                </div>
                <span class="product-category-badge">${product.category}</span>
                <h3 onclick="location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <p>${priceDisplay}</p>
                <button onclick="location.href='product-detail.html?id=${product.id}'">See More</button>
            </div>
        `;
    }).join('');
}

// ========================================
// PRODUCT DETAIL PAGE FUNCTIONALITY
// ========================================

// Load product details based on URL parameter
window.addEventListener('load', function() {
    // Check if we're on the product detail page
    if (window.location.pathname.includes('product-detail.html')) {
        loadProductDetails();
    } else if (window.location.pathname.includes('product.html')) {
        initializePage();
    }
});

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId && products[productId]) {
        const product = products[productId];

        const productImageDiv = document.getElementById('productImage');
        productImageDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.parentElement.innerHTML='<div class=\\'detail-product-image-placeholder\\'>🥮</div>'">
        `;
        
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productCategory').textContent = product.category;

        // Handle price and variants
        if (product.hasVariants && product.variants && product.variants.length > 0) {
            // Create variant selector
            const priceDiv = document.getElementById('productPrice');
            
            // Get first variant price (or use base price as fallback)
            const firstPrice = product.variants[0].price || product.price;

            priceDiv.innerHTML = `
                <div class="variant-selector">
                    <label for="variantSelect">Choose Variant:</label>
                    <select id="variantSelect" onchange="updatePrice()">
                        ${product.variants.map((variant, index) => {
                            const variantPrice = variant.price || product.price;
                            return `<option value="${index}">${variant.name} - RM ${variantPrice.toFixed(2)}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="selected-price" id="selectedPrice">RM ${firstPrice.toFixed(2)}</div>
            `;
            
            // Store variants for later use
            window.currentProductVariants = product.variants;
        } else {
            // Single price product
            let priceText = `RM ${product.price.toFixed(2)}`;
            if (product.size) {
                priceText += ` (${product.size})`;
            }
            document.getElementById('productPrice').textContent = priceText;
        }
        
        document.getElementById('productDescription').querySelector('p').textContent = product.description;
        
        const featuresList = document.getElementById('productFeatures');
        featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
        
        // Store product data for cart
        const firstVariantPrice = (product.hasVariants && product.variants && product.variants[0]) 
            ? (product.variants[0].price || product.price) 
            : product.price;

        window.currentProduct = {
            id: productId,
            name: product.name,
            price: firstVariantPrice,
            image: product.image,
            hasVariants: product.hasVariants || false,
            selectedVariant: (product.hasVariants && product.variants) ? 0 : null
        };

        updateWishlistButton();
    } else {
        // Redirect to products page if invalid ID
        window.location.href = 'product.html';
    }
}

// Update price when variant is selected
function updatePrice() {
    const variantSelect = document.getElementById('variantSelect');
    const selectedIndex = parseInt(variantSelect.value);
    const selectedVariant = window.currentProductVariants[selectedIndex];
    
    document.getElementById('selectedPrice').textContent = `RM ${selectedVariant.price.toFixed(2)}`;
    
    // Update current product price and variant
    window.currentProduct.price = selectedVariant.price;
    window.currentProduct.selectedVariant = selectedIndex;
    window.currentProduct.variantName = selectedVariant.name;
}

// ========================================
// HELPER FUNCTION: Check if all values in array are the same
// ========================================

function allSamePrice(prices) {
    if (prices.length === 0) return true;
    const firstPrice = prices[0];
    return prices.every(price => price === firstPrice);
}

function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue < 10) {
        quantityInput.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

function addToCartFromDetail() {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    const userWantsToSignIn = confirm("You need to sign in to add items to cart. Would you like to sign in now?");
    if (userWantsToSignIn) {
      window.location.href = 'signin.html';
    }
    return;
  }
  
  const quantity = parseInt(document.getElementById('quantity').value);
  const product = window.currentProduct;
  
  if (product) {
    const productData = products[product.id];
    let displayName = product.name;
    
    // Add variant name to display if applicable
    if (product.hasVariants && product.variantName) {
      displayName += ` (${product.variantName})`;
    }
    
    const cartItem = {
      id: product.id,
      name: displayName,
      baseProductName: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      variantIndex: product.selectedVariant
    };
    
    addToCartStorage(cartItem);
    
    // Show toast notification instead of alert
    showToast(`${quantity} x ${displayName} added to cart!`, 'success', 3000);
  }
}

// ========================================
// CART MANAGEMENT FUNCTIONS
// ========================================

// Get cart from localStorage
function getCart() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const cartKey = 'cart_' + user.email;
    const cart = localStorage.getItem(cartKey);
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    const user = getCurrentUser();
    if (!user) return;
    
    const cartKey = 'cart_' + user.email;
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

// Add item to cart (renamed to avoid conflict)
function addToCartStorage(item) {
    let cart = getCart();
    
    // For products with variants, check both id and variant
    const existingIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && 
        (item.variantIndex === null || cartItem.variantIndex === item.variantIndex)
    );
    
    if (existingIndex > -1) {
        // Update quantity if item exists
        cart[existingIndex].quantity += item.quantity;
    } else {
        // Add new item
        cart.push(item);
    }
    
    saveCart(cart);
    updateCartBadge();
}

// Remove item from cart
function removeFromCart(index) {
    const confirmRemove = confirm("Remove this item from cart?");
    if (!confirmRemove) return;
    
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    
    updateCartBadge();
    // Reload the page to update cart display
    window.location.reload();
}

// Update cart item quantity
function updateCartQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    if (newQuantity > 10) {
        alert("Maximum quantity is 10 per item.");
        return;
    }
    
    let cart = getCart();
    cart[index].quantity = newQuantity;
    saveCart(cart);
    
    updateCartBadge();
    // Reload the page to update cart display
    window.location.reload();
}

// Clear entire cart
function clearCart() {
    const user = getCurrentUser();
    if (!user) return;
    
    const cartKey = 'cart_' + user.email;
    localStorage.removeItem(cartKey);
    updateCartBadge();
}

// ========================================
// WISHLIST FUNCTIONALITY
// ========================================

// Get wishlist from localStorage
function getWishlist() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const wishlistKey = 'wishlist_' + user.email;
    const wishlist = localStorage.getItem(wishlistKey);
    return wishlist ? JSON.parse(wishlist) : [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
    const user = getCurrentUser();
    if (!user) return;
    
    const wishlistKey = 'wishlist_' + user.email;
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

// Check if product is in wishlist
function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
}

// Toggle wishlist (add/remove)
function toggleWishlist() {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        const userWantsToSignIn = confirm("You need to sign in to add items to wishlist. Would you like to sign in now?");
        if (userWantsToSignIn) {
            window.location.href = 'signin.html';
        }
        return;
    }
    
    const product = window.currentProduct;
    if (!product) return;
    
    let wishlist = getWishlist();
    const existingIndex = wishlist.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        saveWishlist(wishlist);
        showToast(`${product.name} removed from wishlist`, 'info', 2000);
    } else {
        // Add to wishlist
        const productData = products[product.id];
        
        // Determine the price to save
        let savePrice;
        if (productData.hasVariants && productData.variants && productData.variants.length > 0) {
            savePrice = productData.variants[0].price || productData.price;
        } else {
            savePrice = productData.price;
        }

        const wishlistItem = {
            id: product.id,
            name: product.name,
            price: savePrice,
            image: product.image,
            hasVariants: productData.hasVariants || false
        };

        wishlist.push(wishlistItem);
        saveWishlist(wishlist);
        showToast(`${product.name} added to wishlist!`, 'success', 2000);
    }
    
    // Update button appearance with animation
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.style.animation = 'none';
        setTimeout(() => {
            wishlistBtn.style.animation = '';
        }, 10);
    }
    
    updateWishlistButton();
}

// Update wishlist button appearance
function updateWishlistButton() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (!wishlistBtn) return;
    
    const product = window.currentProduct;
    if (!product) return;
    
    const heartOutline = wishlistBtn.querySelector('.heart-outline');
    const heartFilled = wishlistBtn.querySelector('.heart-filled');
    
    if (isInWishlist(product.id)) {
        // Product is in wishlist - show filled heart
        wishlistBtn.classList.add('active');
        
        if (heartOutline && heartFilled) {
            heartOutline.style.display = 'none';
            heartFilled.style.display = 'block';
        } else {
            // Fallback to emoji if images aren't loaded
            wishlistBtn.textContent = '❤️';
        }
    } else {
        // Product is not in wishlist - show outline heart
        wishlistBtn.classList.remove('active');
        
        if (heartOutline && heartFilled) {
            heartOutline.style.display = 'block';
            heartFilled.style.display = 'none';
        } else {
            // Fallback to emoji if images aren't loaded
            wishlistBtn.textContent = '🤍';
        }
    }
}

// Remove item from wishlist (for wishlist page)
function removeFromWishlist(productId) {
    const confirmRemove = confirm("Remove this item from wishlist?");
    if (!confirmRemove) return;
    
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist(wishlist);
    
    showToast('Item removed from wishlist', 'info', 2000);
    
    // Reload wishlist section
    loadWishlistSection();
    
    // Also update overview if we're on account page
    const overviewSection = document.getElementById('overview-section');
    if (overviewSection && overviewSection.classList.contains('active')) {
        loadOverviewData();
    }
}

// Load wishlist section (for account page)
function loadWishlistSection() {
    const wishlist = getWishlist();
    const container = document.getElementById('wishlistGrid');
    
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = '<p class="no-data">Your wishlist is empty</p>';
        return;
    }
    
    container.innerHTML = wishlist.map(item => {
        // Determine price display
        let priceDisplay;
        const productData = products[item.id];
        
        if (productData && productData.hasVariants && productData.variants && productData.variants.length > 0) {
            // Get all variant prices (use base price if variant price is missing)
            const prices = productData.variants.map(v => v.price || productData.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            // Check if all prices are the same
            if (minPrice === maxPrice) {
                priceDisplay = `RM ${minPrice.toFixed(2)}`;
            } else {
                priceDisplay = `RM ${minPrice.toFixed(2)} - RM ${maxPrice.toFixed(2)}`;
            }
        } else {
            // Use the price from wishlist item or product data
            const price = item.price || (productData ? productData.price : 0);
            priceDisplay = `RM ${price.toFixed(2)}`;
        }
        
        return `
            <div class="wishlist-item">
                <button class="wishlist-remove" onclick="removeFromWishlist('${item.id}')">×</button>
                <div class="wishlist-item-image">
                    ${item.image 
                        ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='<div style=\\'font-size: 4rem;\\'>${item.emoji || '🥮'}</div>'">` 
                        : `<div style="font-size: 4rem;">${item.emoji || '🥮'}</div>`
                    }
                </div>
                <h4>${item.name}</h4>
                <p>${priceDisplay}</p>
                <button class="wishlist-btn" onclick="window.location.href='product-detail.html?id=${item.id}'">
                    View Product
                </button>
            </div>
        `;
    }).join('');
}

// UPDATE the loadProductDetails function to include wishlist check

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId && products[productId]) {
        const product = products[productId];
        
        // Update product image
        const productImageDiv = document.getElementById('productImage');
        productImageDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.parentElement.innerHTML='<div class=\\'detail-product-image-placeholder\\'>${product.emoji || '🥮'}</div>'">
        `;

        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productCategory').textContent = product.category;

        // Handle price and variants
        if (product.hasVariants) {
            const priceDiv = document.getElementById('productPrice');
            priceDiv.innerHTML = `
                <div class="variant-selector">
                    <label for="variantSelect">Choose Variant:</label>
                    <select id="variantSelect" onchange="updatePrice()">
                        ${product.variants.map((variant, index) => 
                            `<option value="${index}">${variant.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="selected-price" id="selectedPrice">RM ${product.variants[0].price.toFixed(2)}</div>
            `;
            
            window.currentProductVariants = product.variants;
        } else {
            let priceText = `RM ${product.price.toFixed(2)}`;
            if (product.size) {
                priceText += ` (${product.size})`;
            }
            document.getElementById('productPrice').textContent = priceText;
        }
        
        document.getElementById('productDescription').querySelector('p').textContent = product.description;
        
        const featuresList = document.getElementById('productFeatures');
        featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
        
        window.currentProduct = {
            id: productId,
            name: product.name,
            price: product.hasVariants ? product.variants[0].price : product.price,
            image: product.image,
            hasVariants: product.hasVariants,
            selectedVariant: product.hasVariants ? 0 : null
        };
        
        // NEW: Check if product is in wishlist and update button
        updateWishlistButton();
    } else {
        window.location.href = 'product.html';
    }
}

// UPDATE the loadOverviewData function to include wishlist count
// Find this function and update the wishlist count line:

function loadOverviewData() {
    const user = getCurrentUser();
    const orderKey = "orderHistory_" + user.email;
    const history = JSON.parse(localStorage.getItem(orderKey)) || [];
    const wishlist = getWishlist(); // NEW
    
    const totalOrders = history.length;
    const pendingOrders = history.filter(o => o.status === 'pending').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('wishlistCount').textContent = wishlist.length; // NEW

    loadRecentOrders();
}

// UPDATE the showSection function to load wishlist when clicked
// Find this function and add the wishlist case:

function showSection(sectionName) {
    // Prevent default link behavior if event exists
    if (typeof event !== 'undefined') {
        event.preventDefault();
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active nav item in sidebar
    const navItems = document.querySelectorAll('.sidebar-menu a');
    navItems.forEach(item => {
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Load section-specific data
    switch(sectionName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'wishlist':
            loadWishlistSection();
            break;
        case 'settings':
            loadProfileSettings();
            break;
    }
}

// Check if user is logged in
function isUserLoggedIn() {
    // Check if user data exists in sessionStorage or localStorage
    return sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
}

// Get current logged in user
function getCurrentUser() {
    const userDataSession = sessionStorage.getItem('userData');
    const userDataLocal = localStorage.getItem('userData');
    
    if (userDataSession) {
        return JSON.parse(userDataSession);
    } else if (userDataLocal) {
        return JSON.parse(userDataLocal);
    }
    return null;
}

// Promo code data
function getPromoData(code) {
    const promoCodes = {
        'RAYA2025': { discount: 20.00, description: 'RM20 off for Raya' },
        'WELCOME10': { discount: 10.00, description: 'RM10 off for new customers' },
        'FESTIVE15': { discount: 15.00, description: 'RM15 off festive special' }
    };
    
    return promoCodes[code.toUpperCase()] || null;
}

/* ========================================
   TOAST NOTIFICATION FUNCTIONS
   Add these functions to your script.js
   ======================================== */

// Create toast container if it doesn't exist
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  return container;
}

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
  const container = ensureToastContainer();
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Determine icon based on type
  let icon;
  switch(type) {
    case 'success':
      icon = '✓';
      break;
    case 'error':
      icon = '✕';
      break;
    case 'warning':
      icon = '⚠';
      break;
    case 'info':
      icon = 'ℹ';
      break;
    default:
      icon = '✓';
  }
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
        <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">x</button>
  `;
  
  // Add to container
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, duration);
}

// ========================================
// CHECKOUT PAGE FUNCTIONALITY
// Add this section to script.js
// ========================================

// Initialize checkout page if we're on checkout.html
function initializeCheckout() {
    // Check if we're on the checkout page
    if (!window.location.pathname.includes('checkout.html')) {
        return; // Exit if not on checkout page
    }

    const user = getCurrentUser(); 

    if (!isUserLoggedIn()) {
        alert("Please sign in before checkout.");
        window.location.href = 'signin.html';
        return;
    }

    // Auto-fill user info
    document.getElementById('checkoutEmail').value = user?.email || "";
    document.getElementById('checkoutPhone').value = user?.phone || "";

    // Initialize variables
    window.promoDiscount = 0;
    window.shippingCost = 0;

    loadCheckoutSavedAddresses();

    // Load initial summary
    loadSummary();

    // Add event listener for state selection
    const stateSelect = document.getElementById('state');
    if (stateSelect) {
        stateSelect.addEventListener('change', function() {
            calculateShipping();
            checkCODAvailability();
        });
    }

    //Add event listener for city input
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('input', checkCODAvailability);
        cityInput.addEventListener('blur', checkCODAvailability);
    }

    // Add event listener for promo code button
    const promoBtn = document.querySelector('.promo-section button');
    if (promoBtn) {
        promoBtn.addEventListener('click', applyPromo);
    }

    // Phone number input restriction
    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput) {
        // Only allow numbers
        phoneInput.addEventListener('input', function(e) {
            // Remove any non-numeric characters
            this.value = this.value.replace(/[^0-9]/g, '');
        
            // Limit to 10 digits
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    
        // Prevent paste of non-numeric content
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 10);
            this.value = numbersOnly;
        });
    }

    // Postcode input restriction (UPDATED - exactly 5 digits)
    const postcodeInput = document.getElementById('postcode');
    if (postcodeInput) {
        postcodeInput.addEventListener('input', function(e) {
            // Remove any non-numeric characters
            this.value = this.value.replace(/[^0-9]/g, '');
        
            // Limit to 5 digits
            if (this.value.length > 5) {
                this.value = this.value.slice(0, 5);
            }
        });
    
        // Prevent paste of non-numeric content
        postcodeInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 5);
            this.value = numbersOnly;
        });
    }
}

// ==========================================
// DISTANCE-BASED SHIPPING LOGIC
// ==========================================
function calculateShipping() {
    // Get the selected state value
    const stateValue = document.getElementById("state").value.trim();
    
    const stateLower = stateValue.toLowerCase();

    // Default Rate (if no state selected)
    let cost = 0; 

    if (stateValue === "") {
        cost = 0; // No state selected yet
    } 
    // Zone 1: SARAWAK (Home State)
    else if (stateValue === "sarawak") {
        cost = 8.00;
    }
    // Zone 2: SABAH & LABUAN
    else if (stateValue === "sabah" || stateValue === "labuan") {
        cost = 11.00;
    }
    // Zone 3: PENINSULAR MALAYSIA (all other states)
    else {
        cost = 18.00; 
    }

    window.shippingCost = cost;
    loadSummary();
}

// ==========================================
// CHECK COD AVAILABILITY
// ==========================================
function checkCODAvailability() {
    const city = document.getElementById("city").value.trim().toLowerCase();
    const state = document.getElementById("state").value.trim();
    const stateLower = state.toLowerCase();
    
    const codCard = document.getElementById("codPaymentCard");
    const codRadio = document.getElementById("codPaymentRadio");
    const codMsg = document.getElementById("codUnavailableMsg");
    
    if (!codCard || !codRadio || !codMsg) return;
    
    // Check if location qualifies for COD
    const isSarawak = state === "sarawak";
    const isKuching = city === "kuching";
    const isKotaSamarahan = city === "kota samarahan" || city === "samarahan";
    
    const codAvailable = isSarawak && (isKuching || isKotaSamarahan);
    
    if (codAvailable) {
        // Enable COD
        codCard.classList.remove("disabled");
        codRadio.disabled = false;
        codMsg.style.display = "none";
    } else {
        // Disable COD
        codCard.classList.add("disabled");
        codRadio.disabled = true;
        codRadio.checked = false; // Uncheck if it was selected
        codMsg.style.display = "block";
        
        // If COD was selected, show alert
        if (codRadio.checked) {
            alert("Cash on Delivery is only available in Kuching and Kota Samarahan, Sarawak. Please select another payment method.");
        }
    }
}

// Calculate Totals
function calculateCartTotals() {
    const cart = getCart();
    const user = getCurrentUser();
    
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const total = subtotal + window.shippingCost - window.promoDiscount;

    return {
        subtotal,
        shipping: window.shippingCost,
        promoDiscount: window.promoDiscount,
        final: total < 0 ? 0 : total
    };
}

// Load Summary to UI
function loadSummary() {
    const totals = calculateCartTotals();

    document.getElementById("subtotal").textContent = `RM ${totals.subtotal.toFixed(2)}`;
    document.getElementById("shipping").textContent = `RM ${totals.shipping.toFixed(2)}`;
    document.getElementById("promoDiscount").textContent = `RM ${totals.promoDiscount.toFixed(2)}`;
    document.getElementById("finalTotal").textContent = `RM ${totals.final.toFixed(2)}`;
}

// Apply Promo Code
function applyPromo() {
    const codeInput = document.getElementById("promoCode").value.trim();
    const code = codeInput.toLowerCase(); 
    const msg = document.getElementById("promoMessage");

    if (code === "" || code === "-" || code === "na" || code === "n/a" || code === "none") {
        window.promoDiscount = 0;
        
        msg.textContent = "ℹ No code applied.";
        msg.style.color = "#004085"; 
        msg.style.backgroundColor = "#cce5ff";
        msg.style.borderColor = "#b8daff";
        msg.style.display = "block"; 
        
        loadSummary(); 
        return;
    }

    // Check Valid Code
    const promo = getPromoData(codeInput); 

    if (!promo) {
        window.promoDiscount = 0;
        // Error Message (Red)
        msg.textContent = "❌ Invalid promo code";
        msg.style.color = "#721c24";
        msg.style.backgroundColor = "#f8d7da";
        msg.style.borderColor = "#f5c6cb";
        msg.style.display = "block";
    } else {
        window.promoDiscount = promo.discount;
        // Success Message (Green)
        msg.textContent = `✓ Promo applied: RM ${promo.discount.toFixed(2)} OFF`;
        msg.style.color = "#155724";
        msg.style.backgroundColor = "#d4edda";
        msg.style.borderColor = "#c3e6cb";
        msg.style.display = "block";
    }

    loadSummary();
}

const ORDER_STATUS = {
  PENDING: 'pending',           // Payment not completed
  PROCESSING: 'processing',     // Payment completed, preparing order
  SHIPPED: 'shipped',           // Admin marked as shipped
  DELIVERED: 'delivered'        // Customer confirmed delivery
};

// Place Order
function placeOrder() {
    const cart = getCart();
    const user = getCurrentUser();
    
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Get all form values (keep your existing validation)
    const name = document.getElementById("checkoutName").value.trim();
    const email = document.getElementById("checkoutEmail").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const addr1 = document.getElementById("addrLine1").value.trim();
    const postcode = document.getElementById("postcode").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();

    // [Keep all your existing validation code here]
    if (!name || !email || !phone || !addr1 || !postcode || !city || !state) {
        alert("Please fill in all required fields");
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        alert("Please select a payment method.");
        return;
    }

    calculateShipping(); 
    
    const capitalizedState = capitalizeStateName(state);
    const fullAddress = `${addr1}, ${postcode} ${city}, ${capitalizedState}`;
    const totals = calculateCartTotals();

    const orderData = {
        name, 
        email, 
        phone: '+60' + phone,
        address: fullAddress,
        cart,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        promoDiscount: totals.promoDiscount,
        total: totals.final,
        paymentMethod: paymentMethod.value,
        time: new Date().toLocaleString(),
        status: ORDER_STATUS.PENDING,  // ✅ Default status
        paymentCompleted: false,
        orderDate: new Date().toISOString()
    };

    // Save order data
    const orderKey = "orderHistory_" + user.email;
    let history = JSON.parse(localStorage.getItem(orderKey)) || [];
    history.push(orderData);
    localStorage.setItem(orderKey, JSON.stringify(history));
    localStorage.setItem("lastOrder", JSON.stringify(orderData));

    clearCart(); 

    // Redirect based on payment method
    if (paymentMethod.value === "Cash on Delivery") {
        // COD: Mark as processing immediately
        orderData.status = ORDER_STATUS.PROCESSING;
        orderData.paymentCompleted = true;
        localStorage.setItem("lastOrder", JSON.stringify(orderData));
        history[history.length - 1] = orderData;
        localStorage.setItem(orderKey, JSON.stringify(history));
        window.location.href = "checkout_success.html";
    } else if (paymentMethod.value === "FPX (Online Banking)") {
        window.location.href = "payment_fpx.html";
    } else if (paymentMethod.value === "E-Wallet") {
        window.location.href = "payment_ewallet.html";
    }
}

function capitalizeStateName(stateName) {
    if (!stateName) return '';
    
    // Handle special cases
    const stateNameMap = {
        'sarawak': 'Sarawak',
        'sabah': 'Sabah',
        'labuan': 'Labuan',
        'johor': 'Johor',
        'kedah': 'Kedah',
        'kelantan': 'Kelantan',
        'melaka': 'Melaka',
        'negeri-sembilan': 'Negeri Sembilan',
        'pahang': 'Pahang',
        'penang': 'Penang',
        'perak': 'Perak',
        'perlis': 'Perlis',
        'selangor': 'Selangor',
        'terengganu': 'Terengganu',
        'kuala-lumpur': 'Kuala Lumpur',
        'putrajaya': 'Putrajaya'
    };

    const normalized = stateName.toLowerCase().trim();
    return stateNameMap[normalized] || stateName;
}

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

// ========================================
// CART PAGE FUNCTIONALITY
// Add this section to script.js (after checkout functions)
// ========================================

// Initialize cart page if we're on cart.html
function initializeCart() {
    // Check if we're on the cart page
    if (!window.location.pathname.includes('cart.html')) {
        return; // Exit if not on cart page
    }

    // Check if user is logged in
    if (!isUserLoggedIn()) {
        alert("Please sign in to view your cart.");
        window.location.href = 'signin.html';
        return;
    }

    loadCart();
}

// Load and display cart items
function loadCart() {
    const cart = getCart();
    const container = document.getElementById('cartItemsContainer');
    
    if (!container) return;
    
    if (cart.length === 0) {
        // Show empty cart message
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious kuih to your cart!</p>
                <button class="btn btn-primary" onclick="window.location.href='product.html'">
                    Start Shopping
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.textContent='${item.emoji || '🥮'}'">` 
                    : (item.emoji || '🥮')
                }
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">RM ${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-total">
                <p>RM ${itemTotal.toFixed(2)}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
        `;
        container.appendChild(cartItem);
    });

    // Update summary
    document.getElementById('subtotal').textContent = `RM ${subtotal.toFixed(2)}`;
    document.getElementById('checkoutBtn').disabled = false;
}

// ========================================
// CART BADGE FUNCTIONALITY
// Add these functions to your script.js
// ========================================

// Update cart badge count
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (!cartBadge) return;
    
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartBadge.textContent = totalItems;
    
    // Hide badge if cart is empty, show if it has items
    if (totalItems === 0) {
        cartBadge.style.display = 'none';
        cartBadge.classList.remove('has-items');
    } else {
        cartBadge.style.display = 'inline-flex';
        // Add animation class when items are added
        cartBadge.classList.add('has-items');
        // Remove animation class after it completes
        setTimeout(() => {
            cartBadge.classList.remove('has-items');
        }, 500);
    }
}

// Call updateCartBadge when page loads
document.addEventListener('DOMContentLoaded', function() {

    console.log('Page loaded, initializing...');
    initializeProductsDatabase();
    updateCartBadge();
    updateNavigation();
    initializePage();
    initializeCart();
    initializeCheckout();
    initializeEnhancedAccount();
    initializeCheckoutSuccess();
    preventPaymentPageAccess();
    setupEmailValidation();
    setupPasswordMatchIndicator();
    loadFeaturedProducts();

    console.log('✅ Initialization complete');
});

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        // Show password
        input.type = 'text';
        button.classList.add('toggled');
        
        // Toggle icons
        if (eyeOpen && eyeClosed) {
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            // Fallback to emoji if images aren't loaded
            button.textContent = '🙈';
        }
    } else {
        // Hide password
        input.type = 'password';
        button.classList.remove('toggled');
        
        // Toggle icons
        if (eyeOpen && eyeClosed) {
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        } else {
            // Fallback to emoji if images aren't loaded
            button.textContent = '👁️';
        }
    }
}

// UPDATE the addToCartStorage function to update badge
// Find this function in your script.js and add the updateCartBadge() call:

// Proceed to checkout
function proceedToCheckout() {
    // Check if cart is empty
    const cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty. Add some items before checking out!");
        return;
    }

    sessionStorage.setItem("checkout_started", "true");

    // Redirect to checkout page
    window.location.href = "checkout.html";
}

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    
    // Add event listener for checkout button if it exists
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});

// ========================================
// ENHANCED MY ACCOUNT PAGE FUNCTIONALITY
// Add these functions to your script.js
// ========================================

// FIXED initializeEnhancedAccount - ensures wishlist is loaded
function initializeEnhancedAccount() {
    if (!window.location.pathname.includes('myaccount.html')) {
        return;
    }

    const user = getCurrentUser();

    if (!isUserLoggedIn() || !user) {
        alert("Please sign in to access your account.");
        window.location.href = 'signin.html';
        return;
    }

    // Populate sidebar user info
    document.getElementById('sidebarName').textContent = user.name || 'User';
    document.getElementById('sidebarEmail').textContent = user.email || '';

    // Load overview data (includes wishlist count)
    loadOverviewData();

    // Load profile settings
    loadProfileSettings();

    // Show overview section by default
    showSection('overview');
}

// Make sure these functions are called when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    updateNavigation();
    initializePage();
    initializeCart();
    initializeCheckout();
    initializeEnhancedAccount();
    
    // If on product detail page, check wishlist status
    if (window.location.pathname.includes('product-detail.html')) {
        // Wait a bit for currentProduct to be set
        setTimeout(updateWishlistButton, 100);
    }
});

// ========================================
// OVERVIEW SECTION
// ========================================

function loadOverviewData() {
    const user = getCurrentUser();
    const orderKey = "orderHistory_" + user.email;
    const history = JSON.parse(localStorage.getItem(orderKey)) || [];
    const wishlist = getWishlist();
    
    // Calculate statistics
    const totalOrders = history.length;
    const pendingOrders = history.filter(o => o.status === 'pending').length;
    const wishlistCount = wishlist.length;
    
    // Update overview cards
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('wishlistCount').textContent = wishlistCount;

    // Load recent orders
    loadRecentOrders();
}

function loadRecentOrders() {
    const user = getCurrentUser();
    const orderKey = "orderHistory_" + user.email;
    const history = JSON.parse(localStorage.getItem(orderKey)) || [];
    const container = document.getElementById('recentOrdersList');

    if (!history || history.length === 0) {
        container.innerHTML = '<p class="no-data">No recent orders</p>';
        return;
    }

    // Show last 3 orders
    const recentOrders = history.slice(-3).reverse();
    
    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <h4>Order #${order.time.split(',')[0]}</h4>
            <p><strong>Date:</strong> ${order.time}</p>
            <p><strong>Total:</strong> RM ${order.total.toFixed(2)}</p>
            <p><strong>Items:</strong> ${order.cart.length} item(s)</p>
            <span class="order-status status-completed">Completed</span>
        </div>
    `).join('');
}

// ========================================
// ORDERS SECTION
// ========================================

function showOrderTab(tab) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Show selected tab content
    const tabContents = document.querySelectorAll('.order-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    const targetTab = document.getElementById(`${tab}-orders`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function loadOrders() {
    const user = getCurrentUser();
    const orderKey = "orderHistory_" + user.email;
    const history = JSON.parse(localStorage.getItem(orderKey)) || [];

    // Load past orders (completed)
    loadPastOrders(history);
    
    // Load pending orders
    loadPendingOrders(history);
    
    // Load returns/cancellations
    loadReturnsOrders(history);
}

function loadPastOrders(history) {
    const container = document.getElementById('pastOrdersList');
    const completedOrders = history.filter(o => !o.status || o.status === 'completed');

    if (completedOrders.length === 0) {
        container.innerHTML = '<p class="no-data">No past orders</p>';
        return;
    }

    container.innerHTML = completedOrders.reverse().map((order, index) => {
        // Get the actual index in the full history array
        const actualIndex = history.length - 1 - index;
        
        return `
            <div class="order-item">
                <h4>Order #${completedOrders.length - index}</h4>
                <p><strong>Date:</strong> ${order.time}</p>
                <p><strong>Total:</strong> RM ${order.total.toFixed(2)}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod || 'N/A'}</p>
                <p><strong>Items:</strong> ${order.cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                <span class="order-status status-completed">Completed</span>
            </div>
        `;
    }).join('');
}

function viewOrderTracking(orderIndex) {
    window.location.href = `order_tracking.html?order=${orderIndex}`;
}

function loadPendingOrders(history) {
    const container = document.getElementById('pendingOrdersList');
    const pendingOrders = history.filter(o => o.status === 'pending');

    if (pendingOrders.length === 0) {
        container.innerHTML = '<p class="no-data">No pending orders</p>';
        return;
    }

    container.innerHTML = pendingOrders.map((order, index) => `
        <div class="order-item">
            <h4>Order #PEND-${index + 1}</h4>
            <p><strong>Date:</strong> ${order.time}</p>
            <p><strong>Total:</strong> RM ${order.total.toFixed(2)}</p>
            <p><strong>Items:</strong> ${order.cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
            <span class="order-status status-pending">Pending Payment</span>
            <button class="btn-primary" style="margin-top: 1rem;" onclick="completePendingOrder(${index})">
                Complete Payment
            </button>
        </div>
    `).join('');
}

function loadReturnsOrders(history) {
    const container = document.getElementById('returnsOrdersList');
    const returnedOrders = history.filter(o => o.status === 'returned' || o.status === 'cancelled');

    if (returnedOrders.length === 0) {
        container.innerHTML = '<p class="no-data">No returns or cancellations</p>';
        return;
    }

    container.innerHTML = returnedOrders.map((order, index) => `
        <div class="order-item">
            <h4>Order #RET-${index + 1}</h4>
            <p><strong>Date:</strong> ${order.time}</p>
            <p><strong>Total:</strong> RM ${order.total.toFixed(2)}</p>
            <p><strong>Items:</strong> ${order.cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
            <span class="order-status status-cancelled">${order.status === 'cancelled' ? 'Cancelled' : 'Returned'}</span>
        </div>
    `).join('');
}

function completePendingOrder(pendingIndex) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in to complete payment.');
        window.location.href = 'signin.html';
        return;
    }
    
    const orderKey = "orderHistory_" + user.email;
    let history = JSON.parse(localStorage.getItem(orderKey)) || [];
    
    // Get all pending orders
    const pendingOrders = history.filter(o => o.status === 'pending');
    
    if (!pendingOrders[pendingIndex]) {
        alert('Order not found.');
        return;
    }
    
    const pendingOrder = pendingOrders[pendingIndex];
    
    // Find this order's actual index in the full history
    const actualIndex = history.findIndex(o => 
        o.time === pendingOrder.time && 
        o.total === pendingOrder.total &&
        o.status === 'pending'
    );
    
    if (actualIndex === -1) {
        alert('Order not found in history.');
        return;
    }
    
    // Confirm with user
    const confirmPayment = confirm(
        `Complete payment for order placed on ${pendingOrder.time}?\n\n` +
        `Total Amount: RM ${pendingOrder.total.toFixed(2)}\n` +
        `Items: ${pendingOrder.cart.length} item(s)\n\n` +
        `Click OK to proceed to payment.`
    );
    
    if (!confirmPayment) return;
    
    // Store the order data for payment
    const orderForPayment = {
        ...pendingOrder,
        actualHistoryIndex: actualIndex, // Store the index for later update
        isRetryingPayment: true // Flag to indicate this is a retry
    };
    
    localStorage.setItem("lastOrder", JSON.stringify(orderForPayment));
    
    // Redirect to payment page based on payment method
    const paymentMethod = pendingOrder.paymentMethod || '';
    
    if (paymentMethod.includes('FPX') || paymentMethod.includes('Online Banking')) {
        window.location.href = 'payment_fpx.html';
    } else if (paymentMethod.includes('E-Wallet')) {
        window.location.href = 'payment_ewallet.html';
    } else {
        // If payment method not specified or COD (shouldn't happen), 
        // let user choose
        showPaymentMethodSelection(orderForPayment);
    }
}

function loadPendingOrders(history) {
    const container = document.getElementById('pendingOrdersList');
    const pendingOrders = history.filter(o => o.status === 'pending');

    if (pendingOrders.length === 0) {
        container.innerHTML = '<p class="no-data">No pending orders</p>';
        return;
    }

    container.innerHTML = pendingOrders.map((order, index) => `
        <div class="order-item">
            <div class="order-info">
                <h4>Order #${order.time.split(',')[0].replace(/\//g, '')}</h4>
                <p><strong>Date:</strong> ${order.time}</p>
                <p><strong>Total:</strong> RM ${order.total.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Not selected'}</p>
                <p><strong>Items:</strong> ${order.cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                <p style="color: #ff9800; font-size: 0.9rem; margin-top: 0.5rem;">
                    ⚠️ Payment not completed. Please complete payment to process your order.
                </p>
                <span class="order-status status-pending">Pending Payment</span>
            </div>
            <button class="btn-primary track-order-btn" style="margin-top: 1rem;" onclick="completePendingOrder(${index})">
                Complete Payment
            </button>
        </div>
    `).join('');
}

// ========================================
// SETTINGS SECTION
// ========================================

function loadProfileSettings() {
    const user = getCurrentUser();
    
    // Populate profile form
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';

    // Load saved addresses instead of cards
    loadSavedAddresses();
}

function updateProfile(event) {
    event.preventDefault();
    
    const user = getCurrentUser();
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;

    // Update user data
    user.name = name;
    user.email = email;
    user.phone = phone;

    // Save to storage
    sessionStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userData', JSON.stringify(user));

    // Update sidebar
    document.getElementById('sidebarName').textContent = name;
    document.getElementById('sidebarEmail').textContent = email;

    showToast('Profile updated successfully!', 'success', 3000);
}

function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match!', 'error', 3000);
        return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters!', 'error', 3000);
        return;
    }

    // In a real app, verify current password with backend
    // For demo purposes, just show success
    showToast('Password changed successfully!', 'success', 3000);
    
    // Clear form
    document.getElementById('passwordForm').reset();
}

function loadSavedAddresses() {
    const user = getCurrentUser();
    const addressKey = 'savedAddresses_' + user.email;
    const savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    
    const container = document.getElementById('savedAddresses');
    
    if (savedAddresses.length === 0) {
        container.innerHTML = '<p class="no-data">No saved addresses</p>';
        return;
    }

    container.innerHTML = savedAddresses.map((address, index) => `
        <div class="address-item">
            <div class="address-info-display">
                <div class="address-icon-display">📍</div>
                <div class="address-details">
                    <p>
                        <strong>${address.label}</strong>
                        ${address.isDefault ? '<span class="default-badge">DEFAULT</span>' : ''}
                    </p>
                    <p>${address.address}</p>
                    <p>${address.postcode} ${address.city}, ${address.state}</p>
                </div>
            </div>
            <div class="address-actions">
                ${!address.isDefault ? `<button onclick="setDefaultAddress(${index})" class="btn-default" title="Set as default">Set Default</button>` : ''}
                <button onclick="editAddress(${index})" class="btn-edit">Edit</button>
                <button onclick="removeAddress(${index})" class="btn-remove">Remove</button>
            </div>
        </div>
    `).join('');
}

function addAddress() {
    const address = prompt('Enter full address:');
    if (!address || address.trim() === '') return;
    
    const postcode = prompt('Enter postcode (5 digits):');
    if (!postcode || !/^\d{5}$/.test(postcode)) {
        alert('Please enter a valid 5-digit postcode');
        return;
    }
    
    const city = prompt('Enter city:');
    if (!city || city.trim() === '') return;
    
    const state = prompt('Enter state:');
    if (!state || state.trim() === '') return;
    
    const label = prompt('Label this address (e.g., Home, Office):');
    if (!label || label.trim() === '') return;

    const user = getCurrentUser();
    const addressKey = 'savedAddresses_' + user.email;
    let savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];

    const newAddress = {
        label: label.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
        city: city.trim(),
        state: state.trim(),
        dateAdded: new Date().toISOString()
    };

    savedAddresses.push(newAddress);
    localStorage.setItem(addressKey, JSON.stringify(savedAddresses));
    
    loadSavedAddresses();
    showToast('Address added successfully!', 'success', 3000);
}

function setDefaultAddress(index) {
    const user = getCurrentUser();
    if (!user) return;
    
    const addressKey = 'savedAddresses_' + user.email;
    let savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    
    // Remove default flag from all addresses
    savedAddresses.forEach(addr => addr.isDefault = false);
    
    // Set the selected address as default
    if (savedAddresses[index]) {
        savedAddresses[index].isDefault = true;
        localStorage.setItem(addressKey, JSON.stringify(savedAddresses));
        showToast('Default address updated!', 'success', 2000);
        loadSavedAddresses(); // Reload the addresses list
    }
}

function editAddress(index) {
    const user = getCurrentUser();
    const addressKey = 'savedAddresses_' + user.email;
    let savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    
    if (index >= savedAddresses.length) return;
    
    const currentAddress = savedAddresses[index];
    
    const address = prompt('Enter full address:', currentAddress.address);
    if (!address || address.trim() === '') return;
    
    const postcode = prompt('Enter postcode (5 digits):', currentAddress.postcode);
    if (!postcode || !/^\d{5}$/.test(postcode)) {
        alert('Please enter a valid 5-digit postcode');
        return;
    }
    
    const city = prompt('Enter city:', currentAddress.city);
    if (!city || city.trim() === '') return;
    
    const state = prompt('Enter state:', currentAddress.state);
    if (!state || state.trim() === '') return;
    
    const label = prompt('Label this address (e.g., Home, Office):', currentAddress.label);
    if (!label || label.trim() === '') return;
    
    // Ask if this should be the default address
    const makeDefault = confirm('Set this as your default checkout address?');

    savedAddresses[index] = {
        label: label.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
        city: city.trim(),
        state: state.trim(),
        isDefault: makeDefault ? true : currentAddress.isDefault || false,
        dateAdded: currentAddress.dateAdded,
        dateModified: new Date().toISOString()
    };
    
    // If making this default, remove default from others
    if (makeDefault) {
        savedAddresses.forEach((addr, i) => {
            if (i !== index) addr.isDefault = false;
        });
    }

    localStorage.setItem(addressKey, JSON.stringify(savedAddresses));
    
    loadSavedAddresses();
    showToast('Address updated successfully!', 'success', 3000);
}

function removeAddress(index) {
    const confirmRemove = confirm('Are you sure you want to remove this address?');
    if (!confirmRemove) return;
    
    const user = getCurrentUser();
    const addressKey = 'savedAddresses_' + user.email;
    let savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    
    savedAddresses.splice(index, 1);
    localStorage.setItem(addressKey, JSON.stringify(savedAddresses));
    
    loadSavedAddresses();
    showToast('Address removed', 'info', 2000);
}

// Load saved addresses in checkout page
function loadCheckoutSavedAddresses() {
    const user = getCurrentUser();
    if (!user) return;
    
    const addressKey = 'savedAddresses_' + user.email;
    const savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    
    const container = document.getElementById('savedAddressesDropdown');
    if (!container) return;
    
    // Clear existing options except the first one
    container.innerHTML = '<option value="">-- Select a saved address --</option>';
    
    if (savedAddresses.length === 0) {
        container.innerHTML = '<option value="">-- No saved addresses --</option>';
        container.disabled = true;
        return;
    }
    
    // Add saved addresses as options
    savedAddresses.forEach((address, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${address.label} - ${address.city}`;
        container.appendChild(option);
    });
    
    container.disabled = false;
}

function useSavedAddress() {
    const user = getCurrentUser();
    if (!user) return;
    
    const dropdown = document.getElementById('savedAddressesDropdown');
    const selectedIndex = dropdown.value;
    
    if (selectedIndex === '') return;
    
    const addressKey = 'savedAddresses_' + user.email;
    const savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    const selectedAddress = savedAddresses[selectedIndex];
    
    if (!selectedAddress) return;
    
    // Fill the form fields
    document.getElementById('addrLine1').value = selectedAddress.address;
    document.getElementById('postcode').value = selectedAddress.postcode;
    document.getElementById('city').value = selectedAddress.city;
    document.getElementById('state').value = selectedAddress.state.toLowerCase();
    
    // Trigger change events to update shipping and COD availability
    document.getElementById('state').dispatchEvent(new Event('change'));
    document.getElementById('city').dispatchEvent(new Event('input'));
    
    showToast('Address filled successfully!', 'success', 2000);
}

// Save current checkout address for future use
function saveCurrentCheckoutAddress() {
    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in to save addresses');
        return;
    }
    
    const address = document.getElementById('addrLine1').value.trim();
    const postcode = document.getElementById('postcode').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value;
    
    if (!address || !postcode || !city || !state) {
        alert('Please fill in all address fields before saving');
        return;
    }
    
    if (!/^\d{5}$/.test(postcode)) {
        alert('Please enter a valid 5-digit postcode');
        return;
    }
    
    const label = prompt('Label this address (e.g., Home, Office):');
    if (!label || label.trim() === '') return;
    
    const addressKey = 'savedAddresses_' + user.email;
    let savedAddresses = JSON.parse(localStorage.getItem(addressKey)) || [];
    
    const exists = savedAddresses.some(addr => 
        addr.address === address && 
        addr.postcode === postcode && 
        addr.city === city
    );
    
    if (exists) {
        alert('This address is already saved');
        return;
    }
    
    // Ask if this should be default
    const makeDefault = savedAddresses.length === 0 || confirm('Set this as your default checkout address?');
    
    const newAddress = {
        label: label.trim(),
        address: address,
        postcode: postcode,
        city: city,
        state: state,
        isDefault: makeDefault,
        dateAdded: new Date().toISOString()
    };
    
    // If making this default, remove default from others
    if (makeDefault) {
        savedAddresses.forEach(addr => addr.isDefault = false);
    }
    
    savedAddresses.push(newAddress);
    localStorage.setItem(addressKey, JSON.stringify(savedAddresses));
    
    showToast('Address saved successfully!', 'success', 3000);
    loadCheckoutSavedAddresses();
}

// Initialize enhanced account page when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedAccount();
});

// ========================================
// CHATBOT FUNCTIONALITY
// Add this entire section to the end of your script.js file
// ========================================

let chatbotOpen = false;
let awaitingReturnInfo = false;

// Toggle chatbot window
function toggleChatbot() {
    chatbotOpen = !chatbotOpen;
    const window = document.getElementById('chatbotWindow');
    const button = document.getElementById('chatbotButton');
    const badge = document.getElementById('chatbotBadge');
    
    if (chatbotOpen) {
        window.classList.add('active');
        button.classList.add('active');
        badge.style.display = 'none';
        
        // Show welcome message on first open
        if (document.getElementById('chatbotMessages').children.length === 0) {
            showWelcomeMessage();
        }
    } else {
        window.classList.remove('active');
        button.classList.remove('active');
    }
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeMsg = {
        text: "Hello, I am Cookie! 👋 Welcome to DAYANGSARI ENT! I'm here to help you with your orders, products, and any questions you might have.",
        isBot: true
    };
    
    addChatMessage(welcomeMsg);
    
    setTimeout(() => {
        const quickReplies = [
            "View Products",
            "Shipping Info",
            "Promo Codes",
            "COD Availability",
            "Return/Cancel Order",
            "Contact Us"
        ];
        addQuickReplies(quickReplies);
    }, 500);
}

// Add message to chat
function addChatMessage(message) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${message.isBot ? 'bot' : 'user'}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Determine avatar content
    let avatarContent;
    if (message.isBot) {
        // Bot avatar with image
        avatarContent = `<img src="asset/DAYANGSARI ENT Transparent.png" alt="Cookie" onerror="this.style.display='none'; this.parentElement.innerHTML='🥮'">`;
    } else {
        avatarContent = `<img src="asset/user.png" alt="User" onerror="this.parentElement.innerHTML='👤'">`;
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-bubble">${message.text}</div>
            <div class="message-time">${timeString}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add quick reply buttons
function addQuickReplies(replies) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.className = 'quick-replies';
    
    replies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply;
        button.onclick = () => handleQuickReply(reply);
        quickRepliesDiv.appendChild(button);
    });
    
    messagesContainer.appendChild(quickRepliesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="asset/DAYANGSARI ENT Transparent.png" alt="Cookie" onerror="this.style.display='none'; this.parentElement.innerHTML='🥮'">
        </div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle quick reply click
function handleQuickReply(reply) {
    // Remove quick replies after selection
    const quickReplies = document.querySelector('.quick-replies');
    if (quickReplies) {
        quickReplies.remove();
    }
    
    // Add user message
    addChatMessage({ text: reply, isBot: false });
    
    // Process the reply
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        processChatbotQuery(reply);
    }, 1000);
}

// Send message from input
function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage({ text: message, isBot: false });
    input.value = '';
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        processChatbotQuery(message);
    }, 1000);
}

// Handle enter key press
function handleChatbotKeypress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

// Process chatbot query
function processChatbotQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // Return/Cancel Request
    if (lowerQuery.includes('return') || lowerQuery.includes('cancel')) {
        handleReturnRequest();
    }
    // Products
    else if (lowerQuery.includes('product') || lowerQuery.includes('kuih') || lowerQuery.includes('cake') || lowerQuery.includes('biscuit') || lowerQuery.includes('snacks')) {
        addChatMessage({
            text: "We offer a variety of traditional Malaysian kuih and delicacies! Here are our categories:\n\n Traditional Biscuits (RM 20-25)\n Snacks & Crackers (RM 25-30)\n Layered Cakes (RM 45-200)\n\nWould you like to browse our full collection?",
            isBot: true
        });
        addQuickReplies(["View All Products", "Tell me more", "Main Menu"]);
    }
    // Shipping Info
    else if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) {
        addChatMessage({
            text: "Our shipping rates are based on your location:\n\n• Sarawak: RM 8.00\n• Sabah & Labuan: RM 11.00\n• Peninsular Malaysia: RM 18.00\n\nDelivery takes 3-5 business days. We pack everything fresh just for you!",
            isBot: true
        });
        addQuickReplies(["COD Availability", "Track Order", "Main Menu"]);
    }
    // Promo Codes
    else if (lowerQuery.includes('promo') || lowerQuery.includes('discount')) {
        addChatMessage({
            text: "Active Promo Codes:\n\n• RAYA2025 - RM20 off\n• WELCOME10 - RM10 off for new customers\n• FESTIVE15 - RM15 off festive special\n\nJust enter the code at checkout to enjoy your discount!",
            isBot: true
        });
        addQuickReplies(["How to use codes?", "Shop Now", "Main Menu"]);
    }
    // COD Availability
    else if (lowerQuery.includes('cod') || lowerQuery.includes('cash on delivery')) {
        addChatMessage({
            text: "Cash on Delivery (COD) is available ONLY for:\n\n✅ Kuching, Sarawak\n✅ Kota Samarahan, Sarawak\n\n❌ COD is NOT available for other areas.\n\nFor other locations, please use FPX (Online Banking) or E-Wallet payment methods.",
            isBot: true
        });
        addQuickReplies(["Payment Methods", "Shipping Info", "Main Menu"]);
    }
    // Contact
    else if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('email')) {
        addChatMessage({
            text: "📞 Contact DAYANGSARI ENT:\n\n📧 Email: ibu.kuihraya@gmail.com\n📱 Phone: +60 12-345 6789\n📍 Location: Kuching, Sarawak, Malaysia\n\n⏰ Business Hours:\nMon-Sat: 9 AM - 6 PM\nSun: Closed",
            isBot: true
        });
        addQuickReplies(["Visit About Page", "Main Menu"]);
    }
    // View All Products
    else if (lowerQuery.includes('view all products') || lowerQuery.includes('shop now')) {
        addChatMessage({
            text: "Great! Let me take you to our products page!",
            isBot: true
        });
        setTimeout(() => {
            window.location.href = 'product.html';
        }, 1000);
    }
    // Main Menu
    else if (lowerQuery.includes('main menu') || lowerQuery.includes('menu') || lowerQuery.includes('help') || lowerQuery.includes('show main menu')) {
        addChatMessage({
            text: "How can I help you today? 😊",
            isBot: true
        });
        addQuickReplies([
            "View Products",
            "Shipping Info",
            "Promo Codes",
            "COD Availability",
            "Return/Cancel Order",
            "Contact Us"
        ]);
    }
    // Default response
    else {
        addChatMessage({
            text: "I'm here to help! You can ask me about:\n\n• Our products and prices\n• Shipping rates and delivery\n• Promo codes and discounts\n• Cash on Delivery availability\n• Returns and cancellations\n• Contact information\n\nWhat would you like to know?",
            isBot: true
        });
        addQuickReplies(["Show Main Menu"]);
    }
}

// Handle Return/Cancel Request
function handleReturnRequest() {
    addChatMessage({
        text: "I can help you with returns and cancellations! \n\nPlease fill out this form and we'll process your request within 24 hours.",
        isBot: true
    });
    
    // Create return form
    const messagesContainer = document.getElementById('chatbotMessages');
    const formDiv = document.createElement('div');
    formDiv.className = 'return-form';
    formDiv.innerHTML = `
        <div class="return-form-group">
            <label>Request Type *</label>
            <select id="returnType" required>
                <option value="">-- Select --</option>
                <option value="Return">Return</option>
                <option value="Cancellation">Cancellation</option>
            </select>
        </div>
        <div class="return-form-group">
            <label>Order Number *</label>
            <input type="text" id="returnOrderNumber" placeholder="1234567890" required>
        </div>
        <div class="return-form-group">
            <label>Email *</label>
            <input type="email" id="returnEmail" placeholder="your.email@gmail.com" required>
        </div>
        <div class="return-form-group">
            <label>Phone Number *</label>
            <input type="text" id="returnPhone" placeholder="+60123456789" required>
        </div>
        <div class="return-form-group">
            <label>Reason *</label>
            <textarea id="returnReason" placeholder="Please explain the reason for your return/cancellation..." required></textarea>
        </div>
        <div class="return-form-actions">
            <button class="return-form-btn cancel" onclick="cancelReturnForm()">Cancel</button>
            <button class="return-form-btn submit" onclick="submitReturnForm()">Submit Request</button>
        </div>
    `;
    
    messagesContainer.appendChild(formDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Cancel return form
function cancelReturnForm() {
    const form = document.querySelector('.return-form');
    if (form) {
        form.remove();
    }
    
    addChatMessage({
        text: "No problem! Is there anything else I can help you with?",
        isBot: true
    });
    
    addQuickReplies(["Main Menu", "Contact Support"]);
}

// Submit return form
function submitReturnForm() {
    const type = document.getElementById('returnType').value;
    const orderNumber = document.getElementById('returnOrderNumber').value.trim();
    const email = document.getElementById('returnEmail').value.trim();
    const phone = document.getElementById('returnPhone').value.trim();
    const reason = document.getElementById('returnReason').value.trim();
    
    // Validation
    if (!type || !orderNumber || !email || !phone || !reason) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Save request to localStorage
    const user = getCurrentUser();
    const requestData = {
        type: type,
        orderNumber: orderNumber,
        email: email,
        phone: phone,
        reason: reason,
        timestamp: new Date().toLocaleString(),
        status: 'pending'
    };
    
    const requestKey = 'returnRequests_' + (user ? user.email : 'guest');
    let requests = JSON.parse(localStorage.getItem(requestKey)) || [];
    requests.push(requestData);
    localStorage.setItem(requestKey, JSON.stringify(requests));
    
    // Remove form
    const form = document.querySelector('.return-form');
    if (form) {
        form.remove();
    }
    
    // Success message
    addChatMessage({
        text: `Your ${type} request has been submitted successfully!\n\n Order Date: ${orderNumber}\n Submitted: ${requestData.timestamp}\n\nWe'll review your request and contact you within 24 hours at ${email}.\n\nThank you for your patience! 🙏`,
        isBot: true
    });
    
    setTimeout(() => {
        addQuickReplies(["Main Menu", "Contact Support"]);
    }, 500);
}

// Show notification badge when page loads
window.addEventListener('load', function() {
        
    // Show notification badge after delay
    setTimeout(() => {
        const badge = document.getElementById('chatbotBadge');
        if (badge && !chatbotOpen) {
            badge.style.display = 'flex';
        }
    }, 3000);
});

// ========================================
// END OF CHATBOT FUNCTIONALITY
// ========================================

// ========================================
// CHECKOUT SUCCESS PAGE JAVASCRIPT
// Add this code to the end of your script.js file
// ========================================

// Initialize checkout success page if we're on checkout_success.html
function initializeCheckoutSuccess() {
    if (!window.location.pathname.includes('checkout_success.html')) {
        return; // Exit if not on checkout success page
    }

    // CRITICAL: Replace payment pages in history
    // This prevents back button from going to payment page
    if (window.history && window.history.replaceState) {
        // Replace current state to break the back button chain
        window.history.replaceState(null, null, window.location.href);
    }

    loadOrderSummary();
    
    // IMPORTANT: Clear lastOrder after a short delay
    // This prevents re-accessing payment pages
    setTimeout(() => {
        localStorage.removeItem('lastOrder');
    }, 3000); // 3 second delay so order summary loads first
}

function preventPaymentPageAccess() {
    const paymentPages = ['payment_fpx.html', 'payment_ewallet.html'];
    const currentPage = window.location.pathname;
    
    // Check if we're on a payment page
    const isOnPaymentPage = paymentPages.some(page => currentPage.includes(page));
    
    if (isOnPaymentPage) {
        const orderData = JSON.parse(localStorage.getItem('lastOrder'));
        
        // If no order data or order is completed, redirect away
        if (!orderData || orderData.paymentCompleted === true || orderData.status === 'completed') {
            alert('This payment session is no longer valid.');
            window.location.replace('index.html');
            return false;
        }
    }
    
    return true;
}

// Load and display order summary
function loadOrderSummary() {
    const order = JSON.parse(localStorage.getItem("lastOrder"));
    const summaryDiv = document.getElementById("orderSummary");

    if (!summaryDiv) return;

    if (!order) {
        summaryDiv.innerHTML = `
            <p style="text-align: center; color: #999;">
                No order found. <a href="index.html" style="color: var(--accent-color);">Return to home</a>
            </p>
        `;
        return;
    }

    // Format the order details
    summaryDiv.innerHTML = `
        <h3>Order Summary</h3>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Customer Name:</span>
            <span class="order-detail-value">${order.name}</span>
        </div>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Email:</span>
            <span class="order-detail-value">${order.email}</span>
        </div>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Phone:</span>
            <span class="order-detail-value">${order.phone}</span>
        </div>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Delivery Address:</span>
            <span class="order-detail-value">${order.address}</span>
        </div>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Payment Method:</span>
            <span class="order-detail-value">${order.paymentMethod || 'N/A'}</span>
        </div>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Order Date:</span>
            <span class="order-detail-value">${order.time || new Date().toLocaleString()}</span>
        </div>
        
        <hr class="order-detail-divider">
        
        <div class="order-detail-row">
            <span class="order-detail-label">Subtotal:</span>
            <span class="order-detail-value">RM ${order.subtotal.toFixed(2)}</span>
        </div>
        
        <div class="order-detail-row">
            <span class="order-detail-label">Shipping:</span>
            <span class="order-detail-value">RM ${order.shipping.toFixed(2)}</span>
        </div>
        
        ${order.promoDiscount > 0 ? `
        <div class="order-detail-row">
            <span class="order-detail-label">Promo Discount:</span>
            <span class="order-detail-value" style="color: var(--accent-color);">-RM ${order.promoDiscount.toFixed(2)}</span>
        </div>
        ` : ''}
        
        <div class="order-detail-total">
            <span>Total Amount:</span>
            <span>RM ${order.total.toFixed(2)}</span>
        </div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
            <p style="margin: 0; text-align: center; color: #666; font-size: 0.9rem;">
                <strong>📦 Order Items:</strong> ${order.cart.length} item${order.cart.length > 1 ? 's' : ''}
            </p>
            <div style="margin-top: 0.5rem; text-align: center; color: #888; font-size: 0.85rem;">
                ${order.cart.map(item => `${item.quantity}x ${item.name}`).join(' • ')}
            </div>
        </div>
    `;

    // Clear the cart after displaying the order
    clearCart();
    
    // Update cart badge
    updateCartBadge();
}

// ========================================
// 1. INITIALIZE PRODUCTS IN LOCALSTORAGE
// Call this when the website first loads
// ========================================

function initializeProductsDatabase() {
    console.log('🔄 Initializing products database...');
    
    // Check if products are already in localStorage
    const existingProducts = localStorage.getItem('productsDatabase');
    
    if (!existingProducts) {
        // First time - convert the products object to database format
        console.log('📦 First time setup - Converting products to database...');
        saveProductsToLocalStorage();
    } else {
        // Products exist - load them into the products object
        console.log('✅ Loading products from existing database...');
        loadProductsFromLocalStorage();
    }
}

// ========================================
// 2. SAVE PRODUCTS TO LOCALSTORAGE
// ========================================

function saveProductsToLocalStorage() {
    try {
        // Convert products object to array format
        const productsArray = Object.keys(products).map(id => ({
            id: parseInt(id),
            name: products[id].name,
            category: products[id].category,
            categoryId: products[id].categoryId,
            price: products[id].hasVariants && products[id].variants && products[id].variants.length > 0
                ? products[id].variants[0].price
                : products[id].price,
            image: products[id].image,
            description: products[id].description,
            features: products[id].features,
            hasVariants: products[id].hasVariants || false,
            variants: products[id].variants || [],
            size: products[id].size || null,
            stock: products[id].stock || 100, // Default stock
            status: products[id].status || 'in-stock',
            emoji: products[id].emoji || null,
            createdAt: products[id].createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
        
        localStorage.setItem('productsDatabase', JSON.stringify(productsArray));
        console.log(`✅ Saved ${productsArray.length} products to database`);
        return true;
    } catch (error) {
        console.error('❌ Error saving products:', error);
        return false;
    }
}

// ========================================
// 3. LOAD PRODUCTS FROM LOCALSTORAGE
// ========================================

function loadProductsFromLocalStorage() {
    try {
        const storedProducts = localStorage.getItem('productsDatabase');
        if (!storedProducts) return false;
        
        const productsArray = JSON.parse(storedProducts);
        
        // Update products object with database data
        productsArray.forEach(product => {
            products[product.id] = {
                name: product.name,
                category: product.category,
                categoryId: product.categoryId,
                price: product.price,
                image: product.image,
                description: product.description,
                features: product.features,
                hasVariants: product.hasVariants,
                variants: product.variants,
                size: product.size,
                stock: product.stock,
                status: product.status,
                emoji: product.emoji,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };
        });
        
        console.log(`✅ Loaded ${productsArray.length} products from database`);
        return true;
    } catch (error) {
        console.error('❌ Error loading products:', error);
        return false;
    }
}

// ========================================
// 4. GET ALL PRODUCTS AS ARRAY
// ========================================

function getAllProducts() {
    const storedProducts = localStorage.getItem('productsDatabase');
    
    if (!storedProducts) {
        // If no products in storage, initialize from the products object
        console.log('⚠️ No products in database, initializing...');
        saveProductsToLocalStorage();
        
        // Try again
        const newStoredProducts = localStorage.getItem('productsDatabase');
        if (newStoredProducts) {
            return JSON.parse(newStoredProducts);
        } else {
            console.error('❌ Failed to initialize products database');
            return [];
        }
    }
    
    return JSON.parse(storedProducts);
}

// ========================================
// 5. GET PRODUCT BY ID
// ========================================

function getProductById(productId) {
    const productsArray = getAllProducts();
    return productsArray.find(p => p.id === parseInt(productId));
}

// ========================================
// 6. UPDATE PRODUCT
// ========================================

function updateProduct(productId, updates) {
    try {
        let productsArray = getAllProducts();
        const index = productsArray.findIndex(p => p.id === parseInt(productId));
        
        if (index === -1) {
            console.error('❌ Product not found:', productId);
            return false;
        }
        
        // Update the product
        productsArray[index] = {
            ...productsArray[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem('productsDatabase', JSON.stringify(productsArray));
        
        // Also update the products object in memory
        if (products[productId]) {
            products[productId] = {
                ...products[productId],
                ...updates
            };
        }
        
        console.log(`✅ Updated product #${productId}`);
        return true;
    } catch (error) {
        console.error('❌ Error updating product:', error);
        return false;
    }
}

// ========================================
// 7. ADD NEW PRODUCT
// ========================================

function addNewProductToDatabase(productData) {
    try {
        let productsArray = getAllProducts();
        
        // Generate new ID
        const newId = Math.max(...productsArray.map(p => p.id), 0) + 1;
        
        const newProduct = {
            id: newId,
            name: productData.name,
            category: productData.category || 'Traditional Biscuits',
            categoryId: productData.categoryId || 'cookies',
            price: parseFloat(productData.price) || 0,
            image: productData.image || null,
            description: productData.description || '',
            features: productData.features || [
                '✓ Fresh ingredients',
                '✓ Handmade with love',
                '✓ Halal certified'
            ],
            hasVariants: productData.hasVariants || false,
            variants: productData.variants || [],
            size: productData.size || null,
            stock: parseInt(productData.stock) || 0,
            status: parseInt(productData.stock) > 0 ? 'in-stock' : 'out-of-stock',
            emoji: productData.emoji || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        productsArray.push(newProduct);
        localStorage.setItem('productsDatabase', JSON.stringify(productsArray));
        
        // Also add to products object
        products[newId] = newProduct;
        
        console.log(`✅ Added new product #${newId}: ${newProduct.name}`);
        return newProduct;
    } catch (error) {
        console.error('❌ Error adding product:', error);
        return null;
    }
}

// ========================================
// 8. DELETE PRODUCT
// ========================================

function deleteProductFromDatabase(productId) {
    try {
        let productsArray = getAllProducts();
        const index = productsArray.findIndex(p => p.id === parseInt(productId));
        
        if (index === -1) {
            console.error('❌ Product not found:', productId);
            return false;
        }
        
        const productName = productsArray[index].name;
        
        // Remove from array
        productsArray.splice(index, 1);
        localStorage.setItem('productsDatabase', JSON.stringify(productsArray));
        
        // Also remove from products object
        delete products[productId];
        
        console.log(`✅ Deleted product #${productId}: ${productName}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        return false;
    }
}

// ========================================
// 9. UPDATE STOCK QUANTITY
// ========================================

function updateProductStock(productId, newStock) {
    const status = newStock > 0 ? 'in-stock' : 'out-of-stock';
    return updateProduct(productId, { 
        stock: parseInt(newStock),
        status: status
    });
}

// ========================================
// 10. SEARCH PRODUCTS
// ========================================

function searchProducts(searchTerm) {
    const productsArray = getAllProducts();
    const term = searchTerm.toLowerCase();
    
    return productsArray.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
}

function forceSyncProducts() {
    const confirmSync = confirm(
        'Force sync products?\n\n' +
        'This will reload all products from the database.\n\n' +
        'Current changes will be preserved.'
    );
    
    if (!confirmSync) return;
    
    loadProductsFromLocalStorage();
    
    // Reload admin if we're on admin page
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
    
    alert('✅ Products synced successfully!');
}

// View products database
function viewProductsDatabase() {
    const productsArray = getAllProducts();
    console.table(productsArray.map(p => ({
        ID: p.id,
        Name: p.name,
        Category: p.category,
        Price: `RM ${p.price.toFixed(2)}`,
        Stock: p.stock,
        Status: p.status
    })));
    alert(`📦 Products Database\n\nTotal products: ${productsArray.length}\n\nCheck console for details.`);
}

// Reset products database (DANGER!)
function resetProductsDatabase() {
    const confirmReset = confirm(
        '⚠️ DANGER: Reset Products Database?\n\n' +
        'This will:\n' +
        '• Delete all products from database\n' +
        '• Reinitialize with default products\n\n' +
        'This cannot be undone!\n\n' +
        'Continue?'
    );
    
    if (!confirmReset) return;
    
    const finalConfirm = prompt('Type "RESET" to confirm:');
    
    if (finalConfirm !== 'RESET') {
        alert('Reset cancelled');
        return;
    }
    
    // Remove products from localStorage
    localStorage.removeItem('productsDatabase');
    
    // Reinitialize
    saveProductsToLocalStorage();
    
    alert('✅ Products database has been reset!');
    
    // Reload page
    window.location.reload();
}

// ========================================
// DIAGNOSTIC TOOL
// ========================================

function checkProductSync() {
    console.log('=== PRODUCT SYNC DIAGNOSTIC ===\n');
    
    // 1. Check products object
    console.log('1. Customer Products Object:');
    if (typeof products !== 'undefined') {
        const productCount = Object.keys(products).length;
        console.log(`   ✅ Found ${productCount} products`);
    } else {
        console.log('   ❌ Products object not found');
    }
    
    // 2. Check localStorage
    console.log('\n2. LocalStorage Database:');
    const stored = localStorage.getItem('productsDatabase');
    if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`   ✅ Found ${parsed.length} products in database`);
    } else {
        console.log('   ❌ No database found');
    }
    
    // 3. Check admin
    console.log('\n3. Admin Products Array:');
    if (typeof productsData !== 'undefined') {
        console.log(`   ✅ Admin has ${productsData.length} products`);
    } else {
        console.log('   ❌ Admin productsData not loaded');
    }
    
    // 4. Recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    if (!stored) {
        console.log('💡 Run: initializeProductsDatabase()');
    }
    if (typeof productsData !== 'undefined' && productsData.length === 0) {
        console.log('💡 Run: loadProducts()');
    }
    
    console.log('\n=== END DIAGNOSTIC ===');
}