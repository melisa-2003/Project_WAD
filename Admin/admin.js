// ========================================
// GLOBAL LOGOUT FUNCTION
// ========================================
function logout() {
  const confirmLogout = confirm('Are you sure you want to log out?');
  
  if (!confirmLogout) return;
  
  // Clear ALL session and local storage
  sessionStorage.clear();
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userData');
  
  // Clear any admin-specific data
  const adminEmail = 'admin@dayangsari.com';
  localStorage.removeItem('cart_' + adminEmail);
  localStorage.removeItem('wishlist_' + adminEmail);
  localStorage.removeItem('orderHistory_' + adminEmail);
    
  // Redirect to main index
  window.location.href = '../index.html';
}

// ========================================
// DASHBOARD FUNCTIONS
// ========================================
function initializeDashboard() {
    if (!window.location.pathname.includes('admin.html')) return;
    
    console.log('📊 Initializing dashboard...');
    
    // Initialize Charts
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    const salesChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Sales (RM)',
                data: [0, 0, 0, 0],
                borderColor: '#8b4513',
                backgroundColor: 'rgba(212,165,116,0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { 
                legend: { 
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return 'RM ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'RM ' + value.toFixed(0);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    // Store chart globally for updates
    window.dashboardSalesChart = salesChart;
    
    // Load real data
    loadDashboardData();
    
    console.log('✅ Dashboard initialized');
}

function loadDashboardData() {
    console.log('📈 Loading dashboard data...');
    
    // Get analytics data
    const analytics = JSON.parse(localStorage.getItem('siteAnalytics')) || initializeAnalytics();
    
    // Calculate current month stats
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthRevenue = (analytics.monthlyRevenue && analytics.monthlyRevenue[currentMonth]) || 0;
    
    // Count orders this month
    let monthOrders = 0;
    if (analytics.orders) {
        Object.keys(analytics.orders).forEach(date => {
            if (date.startsWith(currentMonth)) {
                monthOrders += analytics.orders[date];
            }
        });
    }
    
    // Count pending orders from all customers
    let pendingOrders = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orderHistory_')) {
            const orders = JSON.parse(localStorage.getItem(key)) || [];
            pendingOrders += orders.filter(o => o.status === 'pending').length;
        }
    }
    
    // Count total unique customers
    const uniqueCustomers = new Set();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('registeredUser_')) {
            const email = key.replace('registeredUser_', '');
            if (email !== 'admin@dayangsari.com') {
                uniqueCustomers.add(email);
            }
        }
    }
    
    // Count total products
    const allProducts = getAllProducts();
    const inStockProducts = allProducts.filter(p => p.stock > 0).length;
    
    // Update dashboard cards
    const totalSalesEl = document.getElementById('total-sales');
    const totalOrdersEl = document.getElementById('total-orders');
    const totalCustomersEl = document.getElementById('total-customers');
    const totalProductsEl = document.getElementById('total-products');
    
    if (totalSalesEl) {
        totalSalesEl.textContent = `RM ${monthRevenue.toFixed(2)}`;
    }
    
    if (totalOrdersEl) {
        totalOrdersEl.textContent = monthOrders;
        const subtitle = totalOrdersEl.nextElementSibling;
        if (subtitle && subtitle.classList.contains('card-subtitle')) {
            subtitle.textContent = `Pending: ${pendingOrders}`;
        }
    }
    
    if (totalCustomersEl) {
        totalCustomersEl.textContent = uniqueCustomers.size;
    }
    
    if (totalProductsEl) {
        totalProductsEl.textContent = inStockProducts;
    }
    
    // Update sales chart with last 4 weeks data
    updateDashboardSalesChart(analytics);
    
    // Load recent orders
    loadRecentOrders();
    
    console.log('✅ Dashboard data loaded:', {
        revenue: monthRevenue,
        orders: monthOrders,
        pending: pendingOrders,
        customers: uniqueCustomers.size,
        products: inStockProducts
    });
}

function updateDashboardSalesChart(analytics) {
    if (!window.dashboardSalesChart) return;
    
    const today = new Date();
    const labels = [];
    const data = [];
    
    // Get last 4 weeks of data
    for (let week = 3; week >= 0; week--) {
        let weekTotal = 0;
        for (let day = 0; day < 7; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (week * 7 + day));
            const dateStr = date.toISOString().split('T')[0];
            weekTotal += (analytics.revenue && analytics.revenue[dateStr]) || 0;
        }
        labels.push(`Week ${4 - week}`);
        data.push(weekTotal);
    }
    
    window.dashboardSalesChart.data.labels = labels;
    window.dashboardSalesChart.data.datasets[0].data = data;
    window.dashboardSalesChart.update();
}

function loadRecentOrders() {
    const tbody = document.getElementById('recent-orders-body');
    if (!tbody) return;
    
    // Collect all orders from all customers
    const allOrders = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('orderHistory_')) {
            const customerEmail = key.replace('orderHistory_', '');
            const orders = JSON.parse(localStorage.getItem(key)) || [];
            
            orders.forEach(order => {
                allOrders.push({
                    id: `ORD-${customerEmail.substring(0, 3).toUpperCase()}-${Date.parse(order.time)}`,
                    customer: order.name,
                    customerEmail: customerEmail,
                    total: order.total,
                    status: order.status || 'completed',
                    payment: order.paymentCompleted ? 'paid' : 'pending',
                    date: order.time,
                    orderDate: new Date(order.orderDate || order.time)
                });
            });
        }
    }
    
    // Sort by date (newest first) and take top 5
    const recentOrders = allOrders
        .sort((a, b) => b.orderDate - a.orderDate)
        .slice(0, 5);
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
                    No recent orders
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>
                ${order.customer}<br>
                <small style="color: #666;">${order.customerEmail}</small>
            </td>
            <td><strong>RM ${order.total.toFixed(2)}</strong></td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${capitalizeFirst(order.status)}
                </span>
            </td>
            <td>${formatDateShort(order.date)}</td>
        </tr>
    `).join('');
}

// NEW: Format date in short format for recent orders
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

// NEW: Refresh dashboard data
function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    loadDashboardData();
    showToast('Dashboard refreshed!', 'success', 2000);
}

// NEW: Get dashboard summary
function getDashboardSummary() {
    const analytics = JSON.parse(localStorage.getItem('siteAnalytics')) || {};
    
    // Current month
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthRevenue = (analytics.monthlyRevenue && analytics.monthlyRevenue[currentMonth]) || 0;
    
    // Count orders
    let totalOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orderHistory_')) {
            const orders = JSON.parse(localStorage.getItem(key)) || [];
            totalOrders += orders.length;
            pendingOrders += orders.filter(o => o.status === 'pending').length;
            processingOrders += orders.filter(o => o.status === 'processing').length;
            shippedOrders += orders.filter(o => o.status === 'shipped').length;
            deliveredOrders += orders.filter(o => o.status === 'delivered').length;
        }
    }
    
    // Count customers
    let totalCustomers = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('registeredUser_')) {
            const email = key.replace('registeredUser_', '');
            if (email !== 'admin@dayangsari.com') {
                totalCustomers++;
            }
        }
    }
    
    // Products
    const allProducts = getAllProducts();
    const inStockProducts = allProducts.filter(p => p.stock > 0).length;
    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;
    
    const summary = {
        '📊 FINANCIAL': {
            'This Month Revenue': `RM ${monthRevenue.toFixed(2)}`,
            'Total All-Time Revenue': `RM ${Object.values(analytics.revenue || {}).reduce((a, b) => a + b, 0).toFixed(2)}`
        },
        '📦 ORDERS': {
            'Total Orders': totalOrders,
            'Pending': pendingOrders,
            'Processing': processingOrders,
            'Shipped': shippedOrders,
            'Delivered': deliveredOrders
        },
        '👥 CUSTOMERS': {
            'Total Customers': totalCustomers,
            'New This Month': (analytics.newCustomers && Object.keys(analytics.newCustomers)
                .filter(date => date.startsWith(currentMonth))
                .reduce((sum, date) => sum + analytics.newCustomers[date], 0)) || 0
        },
        '📦 PRODUCTS': {
            'Total Products': allProducts.length,
            'In Stock': inStockProducts,
            'Low Stock': lowStockProducts,
            'Out of Stock': outOfStockProducts
        }
    };
    
    console.log('📊 DASHBOARD SUMMARY');
    console.log('═══════════════════════════════════════');
    console.table(summary['📊 FINANCIAL']);
    console.table(summary['📦 ORDERS']);
    console.table(summary['👥 CUSTOMERS']);
    console.table(summary['📦 PRODUCTS']);
    console.log('═══════════════════════════════════════');
    
    return summary;
}

// NEW: Get business insights
function getBusinessInsights() {
    const analytics = JSON.parse(localStorage.getItem('siteAnalytics')) || {};
    
    // Calculate conversion rate
    const totalVisits = Object.values(analytics.pageViews || {}).reduce((sum, dayViews) => {
        return sum + (dayViews['home'] || 0) + (dayViews['index'] || 0);
    }, 0);
    
    let totalOrders = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orderHistory_')) {
            const orders = JSON.parse(localStorage.getItem(key)) || [];
            totalOrders += orders.length;
        }
    }
    
    const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits * 100) : 0;
    
    // Get top product
    let topProduct = 'None';
    let topRevenue = 0;
    
    if (analytics.popularProducts) {
        Object.entries(analytics.popularProducts).forEach(([id, stats]) => {
            if (stats.revenue > topRevenue) {
                topRevenue = stats.revenue;
                const product = products[id];
                topProduct = product ? product.name : `Product ${id}`;
            }
        });
    }
    
    // Calculate average order value
    const totalRevenue = Object.values(analytics.revenue || {}).reduce((a, b) => a + b, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get most used payment method
    let topPaymentMethod = 'None';
    let maxCount = 0;
    
    if (analytics.paymentMethods) {
        Object.entries(analytics.paymentMethods).forEach(([method, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topPaymentMethod = method;
            }
        });
    }
    
    const insights = {
        '🎯 KEY METRICS': {
            'Conversion Rate': `${conversionRate.toFixed(2)}%`,
            'Avg Order Value': `RM ${avgOrderValue.toFixed(2)}`,
            'Total Site Visits': totalVisits,
            'Total Orders': totalOrders
        },
        '🏆 TOP PERFORMERS': {
            'Best Selling Product': topProduct,
            'Revenue from Top Product': `RM ${topRevenue.toFixed(2)}`,
            'Most Used Payment': topPaymentMethod,
            'Times Used': maxCount
        }
    };
    
    console.log('💡 BUSINESS INSIGHTS');
    console.log('═══════════════════════════════════════');
    console.table(insights['🎯 KEY METRICS']);
    console.table(insights['🏆 TOP PERFORMERS']);
    console.log('═══════════════════════════════════════');
    
    return insights;
}

// NEW: Quick stats for dashboard
function quickStats() {
    console.log('⚡ QUICK STATS');
    console.log('═══════════════════════════════════════');
    
    const analytics = JSON.parse(localStorage.getItem('siteAnalytics')) || {};
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    console.log(`💰 This Month: RM ${(analytics.monthlyRevenue && analytics.monthlyRevenue[currentMonth] || 0).toFixed(2)}`);
    console.log(`📦 Total Orders: ${Object.values(analytics.orders || {}).reduce((a, b) => a + b, 0)}`);
    console.log(`👥 Total Customers: ${[...new Set(Object.keys(localStorage).filter(k => k.startsWith('registeredUser_')))].length - 1}`); // -1 for admin
    console.log(`📊 Total Products: ${getAllProducts().length}`);
    console.log('═══════════════════════════════════════');
}

// NEW: Export dashboard report
function exportDashboardReport() {
    const summary = getDashboardSummary();
    const insights = getBusinessInsights();
    
    const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let report = `DAYANGSARI ENTERPRISE - DASHBOARD REPORT\n`;
    report += `Generated: ${reportDate}\n`;
    report += `${'='.repeat(60)}\n\n`;
    
    // Financial
    report += `📊 FINANCIAL SUMMARY\n`;
    report += `${'-'.repeat(60)}\n`;
    Object.entries(summary['📊 FINANCIAL']).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
    });
    report += `\n`;
    
    // Orders
    report += `📦 ORDERS STATUS\n`;
    report += `${'-'.repeat(60)}\n`;
    Object.entries(summary['📦 ORDERS']).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
    });
    report += `\n`;
    
    // Customers
    report += `👥 CUSTOMER METRICS\n`;
    report += `${'-'.repeat(60)}\n`;
    Object.entries(summary['👥 CUSTOMERS']).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
    });
    report += `\n`;
    
    // Products
    report += `📦 PRODUCT INVENTORY\n`;
    report += `${'-'.repeat(60)}\n`;
    Object.entries(summary['📦 PRODUCTS']).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
    });
    report += `\n`;
    
    // Insights
    report += `💡 BUSINESS INSIGHTS\n`;
    report += `${'-'.repeat(60)}\n`;
    Object.entries(insights['🎯 KEY METRICS']).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
    });
    report += `\n`;
    Object.entries(insights['🏆 TOP PERFORMERS']).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
    });
    
    report += `\n${'='.repeat(60)}\n`;
    report += `End of Report\n`;
    
    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Dashboard report exported successfully!');
}

console.log('✅ Admin Dashboard Sync System Loaded');
console.log('💡 Available commands:');
console.log('  - refreshDashboard() - Reload all dashboard data');
console.log('  - getDashboardSummary() - View complete summary');
console.log('  - getBusinessInsights() - View business insights');
console.log('  - quickStats() - Quick overview');
console.log('  - exportDashboardReport() - Export full report');

// ========================================
// PRODUCTS MANAGEMENT
// ========================================
let productsData = [];
let filteredProducts = [];

function initializeProducts() {
    if (!window.location.pathname.includes('admin-products.html')) return;
    
    console.log('🔧 Initializing products page...');
    
    // Load products from database
    loadProducts();
    
    // Update stats if they exist
    if (typeof updateProductStats === 'function') {
        updateProductStats();
    }
    
    // Add event listeners
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addNewProduct);
    }
    
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    const stockFilter = document.getElementById('filter-stock');
    if (stockFilter) {
        stockFilter.addEventListener('change', applyFilters);
    }
    
    console.log('✅ Products page initialized');
}

function loadProducts() {
    console.log('📦 Admin: Loading products...');
    
    // Try to get products from database
    try {
        productsData = getAllProducts();
        
        // Check if we got any products
        if (!productsData || productsData.length === 0) {
            console.warn('⚠️ No products found in database');
            console.log('💡 The database might not be initialized yet');
            console.log('💡 Open index.html first to initialize the database');
            
            productsData = [];
            filteredProducts = [];
            renderProductsTable();
            
            // Show helpful message in console
            console.log('\n=== TROUBLESHOOTING ===');
            console.log('1. Open index.html in browser');
            console.log('2. Wait for page to load completely');
            console.log('3. Open console and run: checkProductSync()');
            console.log('4. Then come back to this admin page and refresh');
            console.log('========================\n');
            
            return;
        }
        
        // Success! We have products
        console.log(`✅ Loaded ${productsData.length} products into admin panel`);
        
        // Set filtered products to all products
        filteredProducts = [...productsData];
        
        // Render the table
        renderProductsTable();
        
        // Update dashboard count if element exists
        const totalProductsEl = document.getElementById('total-products');
        if (totalProductsEl) {
            totalProductsEl.textContent = productsData.length;
        }
        
        // Log stats
        console.log('📊 Products Stats:', {
            total: productsData.length,
            inStock: productsData.filter(p => p.stock > 0).length,
            lowStock: productsData.filter(p => p.stock > 0 && p.stock <= 10).length,
            outOfStock: productsData.filter(p => p.stock === 0).length
        });
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        console.log('💡 Make sure you have added all sync functions to script.js');
        console.log('💡 Functions needed: getAllProducts(), initializeProductsDatabase()');
        
        // Set empty arrays to prevent errors
        productsData = [];
        filteredProducts = [];
        renderProductsTable();
    }
}

function updateProductStats() {
  const total = filteredProducts.length;
  const inStock = filteredProducts.filter(p => p.stock > 10).length;
  const lowStock = filteredProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outStock = filteredProducts.filter(p => p.stock === 0).length;
  
  // Update stat cards
  const statsTotal = document.getElementById('stats-total');
  const statsInStock = document.getElementById('stats-in-stock');
  const statsLowStock = document.getElementById('stats-low-stock');
  const statsOutStock = document.getElementById('stats-out-stock');
  
  if (statsTotal) statsTotal.textContent = total;
  if (statsInStock) statsInStock.textContent = inStock;
  if (statsLowStock) statsLowStock.textContent = lowStock;
  if (statsOutStock) statsOutStock.textContent = outStock;
}

// ADD NEW PRODUCT (UPDATED)
function addNewProduct() {
    showAddProductModal();
}

// Show Add Product Modal
function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'product-modal-overlay';
    modal.id = 'addProductModal';
    
    modal.innerHTML = `
        <div class="product-modal">
            <div class="product-modal-header">
                <h2>Add New Product</h2>
                <button class="modal-close-btn" onclick="closeProductModal()">×</button>
            </div>
            
            <div class="product-modal-body">
                <form id="addProductForm" onsubmit="submitNewProduct(event)">
                    
                    <!-- Product Image Upload -->
                    <div class="form-group">
                        <label>Product Image</label>
                        <div class="image-upload-container">
                            <div class="image-preview" id="imagePreview">
                                <span class="upload-placeholder">📷 Click to upload image</span>
                            </div>
                            <input type="file" id="productImage" accept="image/*" onchange="previewProductImage(event)" style="display: none;">
                            <button type="button" class="btn-upload" onclick="document.getElementById('productImage').click()">
                                Choose Image
                            </button>
                            <small>Supported: JPG, PNG, JPEG (Max 5MB)</small>
                        </div>
                    </div>
                    
                    <!-- Product Name -->
                    <div class="form-group">
                        <label for="productName">Product Name *</label>
                        <input type="text" id="productName" required placeholder="e.g., Biskut Chocolate Chip">
                    </div>
                    
                    <!-- Category -->
                    <div class="form-group">
                        <label for="productCategory">Category *</label>
                        <select id="productCategory" required>
                            <option value="">-- Select Category --</option>
                            <option value="cookies">Traditional Biscuits</option>
                            <option value="snacks">Snacks & Crackers</option>
                            <option value="cakes">Layered Cakes</option>
                        </select>
                    </div>
                    
                    <!-- Price and Stock Row -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productPrice">Price (RM) *</label>
                            <input type="number" id="productPrice" step="0.01" min="0" required placeholder="25.00">
                        </div>
                        
                        <div class="form-group">
                            <label for="productStock">Stock Quantity *</label>
                            <input type="number" id="productStock" min="0" required placeholder="100">
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div class="form-group">
                        <label for="productDescription">Description</label>
                        <textarea id="productDescription" rows="3" placeholder="Enter product description..."></textarea>
                    </div>
                    
                    <!-- Has Variants Checkbox -->
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="hasVariants" onchange="toggleVariantsSection()">
                            <span>This product has variants (e.g., Regular/Premium)</span>
                        </label>
                    </div>
                    
                    <!-- Variants Section (Hidden by default) -->
                    <div id="variantsSection" style="display: none;">
                        <div class="variants-header">
                            <h4>Product Variants</h4>
                            <button type="button" class="btn-add-variant" onclick="addVariantField()">+ Add Variant</button>
                        </div>
                        <div id="variantsList"></div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="product-modal-footer">
                        <button type="button" class="btn-cancel" onclick="closeProductModal()">Cancel</button>
                        <button type="submit" class="btn-save">Add Product</button>
                    </div>
                    
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Preview Product Image
function previewProductImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        event.target.value = '';
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please select a valid image file');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// Toggle Variants Section
function toggleVariantsSection() {
    const hasVariants = document.getElementById('hasVariants').checked;
    const variantsSection = document.getElementById('variantsSection');
    
    if (hasVariants) {
        variantsSection.style.display = 'block';
        // Add first variant field automatically
        if (document.getElementById('variantsList').children.length === 0) {
            addVariantField();
        }
    } else {
        variantsSection.style.display = 'none';
        document.getElementById('variantsList').innerHTML = '';
    }
}

// Add Variant Field
let variantCounter = 0;
function addVariantField() {
    variantCounter++;
    const variantsList = document.getElementById('variantsList');
    
    const variantDiv = document.createElement('div');
    variantDiv.className = 'variant-item';
    variantDiv.id = `variant-${variantCounter}`;
    variantDiv.innerHTML = `
        <div class="variant-fields">
            <input type="text" placeholder="Variant name (e.g., Regular)" class="variant-name" required>
            <input type="number" step="0.01" min="0" placeholder="Price (RM)" class="variant-price" required>
            <button type="button" class="btn-remove-variant" onclick="removeVariant(${variantCounter})">×</button>
        </div>
    `;
    
    variantsList.appendChild(variantDiv);
}

// Remove Variant Field
function removeVariant(variantId) {
    const variantDiv = document.getElementById(`variant-${variantId}`);
    if (variantDiv) {
        variantDiv.remove();
    }
}

// Close Product Modal
function closeProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
    variantCounter = 0;
}

// Submit New Product
function submitNewProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const categoryId = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const hasVariants = document.getElementById('hasVariants').checked;
    
    // Get category name
    const categoryMap = {
        'cookies': 'Traditional Biscuits',
        'snacks': 'Snacks & Crackers',
        'cakes': 'Layered Cakes'
    };
    const categoryName = categoryMap[categoryId];
    
    // Get image
    const imageFile = document.getElementById('productImage').files[0];
    let imagePath = null;
    
    if (imageFile) {
        // For demo purposes, store as data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePath = e.target.result;
            saveProduct();
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveProduct();
    }
    
    function saveProduct() {
        // Collect variants if applicable
        let variants = [];
        if (hasVariants) {
            const variantItems = document.querySelectorAll('.variant-item');
            variantItems.forEach(item => {
                const variantName = item.querySelector('.variant-name').value.trim();
                const variantPrice = parseFloat(item.querySelector('.variant-price').value);
                if (variantName && !isNaN(variantPrice)) {
                    variants.push({ name: variantName, price: variantPrice });
                }
            });
            
            if (variants.length === 0) {
                alert('Please add at least one variant or uncheck "Has Variants"');
                return;
            }
        }
        
        // Create product data
        const productData = {
            name: name,
            category: categoryName,
            categoryId: categoryId,
            price: price,
            stock: stock,
            description: description || `Delicious ${name} made fresh daily.`,
            image: imagePath,
            hasVariants: hasVariants,
            variants: variants,
            features: [
                '✓ Fresh ingredients',
                '✓ Handmade with love',
                '✓ Halal certified',
                '✓ Perfect for any occasion'
            ]
        };
        
        // Add to database
        const newProduct = addNewProductToDatabase(productData);
        
        if (newProduct) {
            showToast(`✅ ${name} added successfully!`, 'success', 3000);
            closeProductModal();
            loadProducts(); // Reload the table
        } else {
            alert('❌ Failed to add product');
        }
    }
}

// EDIT PRODUCT (UPDATED)
function editProduct(productId) {
    const product = getProductById(productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    
    const newName = prompt('Edit product name:', product.name);
    if (!newName) return;
    
    const newPrice = parseFloat(prompt('Edit price (RM):', product.price));
    if (isNaN(newPrice)) {
        alert('Invalid price');
        return;
    }
    
    const newStock = parseInt(prompt('Edit stock:', product.stock));
    if (isNaN(newStock)) {
        alert('Invalid stock quantity');
        return;
    }
    
    const newDescription = prompt('Edit description:', product.description || '');
    
    // Update using the sync function
    const success = updateProduct(productId, {
        name: newName,
        price: newPrice,
        stock: newStock,
        description: newDescription,
        status: newStock > 0 ? 'in-stock' : 'out-of-stock'
    });
    
    if (success) {
        alert('✅ Product updated successfully!');
        loadProducts(); // Reload the table
    } else {
        alert('❌ Failed to update product');
    }
}

// DELETE PRODUCT (UPDATED)
function deleteProduct(productId) {
    const product = getProductById(productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    
    const confirmDelete = confirm(
        `⚠️ Delete Product?\n\n` +
        `Name: ${product.name}\n` +
        `Price: RM ${product.price}\n` +
        `Stock: ${product.stock}\n\n` +
        `This action cannot be undone!`
    );
    
    if (!confirmDelete) return;
    
    const success = deleteProductFromDatabase(productId);
    
    if (success) {
        alert('✅ Product deleted successfully!');
        loadProducts(); // Reload the table
    } else {
        alert('❌ Failed to delete product');
    }
}

function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  
  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #999;">
          No products found. Click "Add New Product" to get started.
        </td>
      </tr>
    `;
    updateProductStats();
    return;
  }
  
  tbody.innerHTML = filteredProducts.map(product => {
    const lastUpdated = product.updatedAt 
      ? new Date(product.updatedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : 'N/A';
    
    // Fix image path for admin folder (need to go up one level with ../)
    let imagePath = product.image || '';
    
    // If path already starts with ../, use as is
    // Otherwise, add ../ to go up from Admin folder to project root
    if (!imagePath.startsWith('../') && imagePath !== '') {
      imagePath = '../' + imagePath;
    }
    
    return `
      <tr>
        <td><strong>${product.id}</strong></td>
        <td>
          ${product.image 
            ? `<img src="${imagePath}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'width: 50px; height: 50px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;\\'>📦</div>';">` 
            : '<div style="width: 50px; height: 50px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📦</div>'
          }
        </td>
        <td><strong>${product.name}</strong></td>
        <td>${capitalizeFirst(product.category)}</td>
        <td><strong>RM ${product.price.toFixed(2)}</strong></td>
        <td>
          <span class="stock-indicator ${getStockClass(product.stock)}">
            ${product.stock} units
          </span>
        </td>
        <td>
          <span class="status-badge ${getStockStatusClass(product.stock)}">
            ${getStockStatus(product.stock)}
          </span>
        </td>
        <td><small>${lastUpdated}</small></td>
        <td>
          <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
  
  updateProductStats();
}

function getStockClass(stock) {
  if (stock === 0) return 'stock-out';
  if (stock < 10) return 'stock-low';
  return 'stock-in';
}

function getStockStatus(stock) {
  if (stock === 0) return 'Out of Stock';
  if (stock < 10) return 'Low Stock';
  return 'In Stock';
}

function getStockStatusClass(stock) {
  if (stock === 0) return 'status-out-of-stock';
  if (stock < 10) return 'status-low-stock';
  return 'status-in-stock';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function applyFilters() {
  const searchQuery = document.getElementById('search-products')?.value || '';
  const categoryFilter = document.getElementById('filter-category')?.value || '';
  const stockFilter = document.getElementById('filter-stock')?.value || '';
  
  let filtered = [...productsData];
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.id.toString().includes(query)
    );
  }
  
  if (categoryFilter) {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }
  
  if (stockFilter) {
    filtered = filtered.filter(product => {
      const stockStatus = getStockStatus(product.stock).toLowerCase().replace(/\s+/g, '-');
      return stockStatus === stockFilter;
    });
  }
  
  filteredProducts = filtered;
  renderProductsTable();
}

function editProduct(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) {
    alert('Product not found');
    return;
  }
  
  const newName = prompt('Edit product name:', product.name);
  if (!newName) return;
  
  const newPrice = parseFloat(prompt('Edit price (RM):', product.price));
  const newStock = parseInt(prompt('Edit stock:', product.stock));
  
  if (isNaN(newPrice) || isNaN(newStock)) {
    alert('Invalid price or stock quantity');
    return;
  }
  
  product.name = newName;
  product.price = newPrice;
  product.stock = newStock;
  product.status = newStock > 0 ? 'in-stock' : 'out-of-stock';
  
  applyFilters();
  alert('Product updated successfully!');
}

function deleteProduct(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) {
    alert('Product not found');
    return;
  }
  
  const confirmDelete = confirm(`Are you sure you want to delete "${product.name}"?`);
  if (!confirmDelete) return;
  
  productsData = productsData.filter(p => p.id !== productId);
  filteredProducts = filteredProducts.filter(p => p.id !== productId);
  
  renderProductsTable();
  alert('Product deleted successfully!');
}

// ========================================
// ORDERS MANAGEMENT
// ========================================
let ordersData = [];
let filteredOrders = [];

function initializeOrders() {
  if (!window.location.pathname.includes('admin-orders.html')) return;
  
  loadOrders();
  
  const exportBtn = document.getElementById('export-orders-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportOrders);
  }
  
  const searchInput = document.getElementById('search-orders');
  if (searchInput) {
    searchInput.addEventListener('input', applyOrderFilters);
  }
  
  const statusFilter = document.getElementById('filter-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', applyOrderFilters);
  }
  
  const dateFromFilter = document.getElementById('filter-date-from');
  const dateToFilter = document.getElementById('filter-date-to');
  
  if (dateFromFilter) {
    dateFromFilter.addEventListener('change', applyOrderFilters);
  }
  if (dateToFilter) {
    dateToFilter.addEventListener('change', applyOrderFilters);
  }
}

function loadOrders() {
  ordersData = [];
  
  // Loop through all localStorage keys to find customer order histories
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    // Check if this is an order history key
    if (key.startsWith('orderHistory_')) {
      const customerEmail = key.replace('orderHistory_', '');
      const customerOrders = JSON.parse(localStorage.getItem(key)) || [];
      
      // Add customer email to each order for tracking
      customerOrders.forEach((order, index) => {
        ordersData.push({
          id: `ORD-${customerEmail.substring(0, 3).toUpperCase()}-${Date.parse(order.time)}`,
          customer: order.name,
          customerEmail: customerEmail,
          products: order.cart || [],
          total: order.total,
          payment: order.paymentCompleted || order.status === 'completed' ? 'paid' : 'pending',
          status: order.status || 'pending',
          date: order.time,
          shippingAddress: order.address,
          paymentMethod: order.paymentMethod || 'N/A',
          subtotal: order.subtotal || 0,
          shipping: order.shipping || 0,
          promoDiscount: order.promoDiscount || 0
        });
      });
    }
  }
  
  // Sort orders by date (newest first)
  ordersData.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  filteredOrders = [...ordersData];
  renderOrdersTable();
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;
  
  if (filteredOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: #999;">
          No orders found.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>
        ${order.customer}<br>
        <small style="color: #666;">${order.customerEmail}</small>
      </td>
      <td>
        <small>${order.products.length} item${order.products.length > 1 ? 's' : ''}</small>
      </td>
      <td><strong>RM ${order.total.toFixed(2)}</strong></td>
      <td>
        <span class="status-badge ${order.payment === 'paid' ? 'status-delivered' : 'status-pending'}">
          ${capitalizeFirst(order.payment)}
        </span>
      </td>
      <td>
        <span class="status-badge status-${order.status}">
          ${capitalizeFirst(order.status)}
        </span>
      </td>
      <td>${formatDate(order.date)}</td>
      <td>
        <button class="view-btn" onclick="viewOrderDetails('${order.id}')">View</button>
        <button class="edit-btn" onclick="updateOrderStatus('${order.id}')">Update</button>
        <button class="delete-btn" onclick="deleteOrder('${order.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function markOrderAsShipped(orderId) {
    // Find the order across all customers
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('orderHistory_')) {
            const customerEmail = key.replace('orderHistory_', '');
            let orderHistory = JSON.parse(localStorage.getItem(key)) || [];
            
            // Find the order in this customer's history
            const orderIndex = orderHistory.findIndex(order => {
                const generatedId = `ORD-${customerEmail.substring(0, 3).toUpperCase()}-${Date.parse(order.time)}`;
                return generatedId === orderId;
            });
            
            if (orderIndex !== -1) {
                // ✅ Update status to SHIPPED
                orderHistory[orderIndex].status = ORDER_STATUS.SHIPPED;
                orderHistory[orderIndex].shippedAt = new Date().toLocaleString();
                
                // Save tracking info (from your existing modal)
                orderHistory[orderIndex].trackingInfo = {
                    trackingNumber: document.getElementById('trackingNumber').value,
                    carrier: document.getElementById('carrier').value,
                    shippedFrom: document.getElementById('fromLocation').value,
                    shippedTo: document.getElementById('toLocation').value
                };
                
                localStorage.setItem(key, JSON.stringify(orderHistory));
                
                alert(`✅ Order ${orderId} marked as SHIPPED!\n\nCustomer will see status update in their tracking page.`);
                
                // Reload orders table
                loadOrders();
                closeTrackingModal();
                return;
            }
        }
    }
    
    alert('Order not found');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function applyOrderFilters() {
  const searchQuery = document.getElementById('search-orders')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('filter-status')?.value || '';
  const dateFrom = document.getElementById('filter-date-from')?.value || '';
  const dateTo = document.getElementById('filter-date-to')?.value || '';
  
  let filtered = [...ordersData];
  
  if (searchQuery) {
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(searchQuery) ||
      order.customer.toLowerCase().includes(searchQuery) ||
      order.customerEmail.toLowerCase().includes(searchQuery)
    );
  }
  
  if (statusFilter) {
    filtered = filtered.filter(order => order.status === statusFilter);
  }
  
  if (dateFrom) {
    filtered = filtered.filter(order => new Date(order.date) >= new Date(dateFrom));
  }
  
  if (dateTo) {
    filtered = filtered.filter(order => new Date(order.date) <= new Date(dateTo));
  }
  
  filteredOrders = filtered;
  renderOrdersTable();
}

function viewOrderDetails(orderId) {
  const order = ordersData.find(o => o.id === orderId);
  if (!order) {
    alert('Order not found');
    return;
  }
  
  const productsList = order.products.map(p => 
    `- ${p.name} (x${p.quantity}) - RM ${(p.price * p.quantity).toFixed(2)}`
  ).join('\n');
  
  const orderDetails = `
  Order ID: ${order.id}
  Customer: ${order.customer}
  Email: ${order.customerEmail}
  Status: ${order.status.toUpperCase()}
  Payment: ${order.payment.toUpperCase()}
  Date: ${formatDate(order.date)}

  Products:
  ${productsList}

  Total: RM ${order.total.toFixed(2)}

  Shipping Address:
  ${order.shippingAddress || 'Not provided'}
    `;
    
    alert(orderDetails);
}

function updateOrderStatus(orderId) {
  const order = ordersData.find(o => o.id === orderId);
  if (!order) {
    alert('Order not found');
    return;
  }
  
  // Show tracking modal instead of simple prompt
  showTrackingModal(order);
}

function showTrackingModal(order) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'tracking-modal-overlay';
  modal.id = 'trackingModal';
  
  modal.innerHTML = `
    <div class="tracking-modal">
      <div class="tracking-modal-header">
        <h2>Update Shipping Status - ${order.id}</h2>
        <button class="modal-close-btn" onclick="closeTrackingModal()">×</button>
      </div>
      
      <div class="tracking-modal-body">
        <!-- Package Info Card -->
        <div class="package-info-card">
          <div class="package-icon">📦</div>
          <div class="package-details">
            <h3>${order.id}</h3>
            <p>Customer: ${order.customer}</p>
            <p>Email: ${order.customerEmail}</p>
            <p>${order.products.length} item(s) • RM ${order.total.toFixed(2)}</p>
          </div>
          <div class="package-status-badge status-${order.status}">
            ${capitalizeFirst(order.status)}
          </div>
        </div>
        
        <!-- Shipping Form -->
        <div class="shipping-form">
          <h3>Shipping Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>From Location</label>
              <input type="text" id="fromLocation" value="Kuching, Sarawak" required>
            </div>
            
            <div class="form-group">
              <label>To Location</label>
              <input type="text" id="toLocation" value="${order.shippingAddress || 'N/A'}" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Carrier</label>
              <select id="carrier">
                <option value="poslaju">Pos Laju</option>
                <option value="fedex">FedEx</option>
                <option value="dhl">DHL</option>
                <option value="gdex">GDEx</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Tracking Number</label>
              <input type="text" id="trackingNumber" placeholder="Enter tracking number" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Order Status</label>
            <select id="orderStatus" onchange="updateStatusPreview()">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Additional Notes</label>
            <textarea id="shippingNotes" rows="3" placeholder="Add any special notes or instructions..."></textarea>
          </div>
        </div>
        
        <!-- Status Preview -->
        <div class="status-preview" id="statusPreview">
          <h3>Status Badge Preview</h3>
          <span class="preview-badge status-${order.status}">TO BE SHIPPED</span>
        </div>
      </div>
      
      <div class="tracking-modal-footer">
        <button class="btn-cancel" onclick="closeTrackingModal()">Cancel</button>
        <button class="btn-save" onclick="saveShippingInfo('${order.id}')">Save & Update</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

function closeTrackingModal() {
  const modal = document.getElementById('trackingModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

function updateStatusPreview() {
  const statusSelect = document.getElementById('orderStatus');
  const preview = document.getElementById('statusPreview');
  const selectedStatus = statusSelect.value;
  
  const statusTexts = {
    'pending': 'TO BE SHIPPED',
    'processing': 'PROCESSING',
    'shipped': 'SHIPPED',
    'delivered': 'DELIVERED',
    'cancelled': 'CANCELLED'
  };
  
  preview.querySelector('.preview-badge').className = `preview-badge status-${selectedStatus}`;
  preview.querySelector('.preview-badge').textContent = statusTexts[selectedStatus];
}

function saveShippingInfo(orderId) {
    const fromLocation = document.getElementById('fromLocation').value;
    const toLocation = document.getElementById('toLocation').value;
    const carrier = document.getElementById('carrier').value;
    const trackingNumber = document.getElementById('trackingNumber').value;
    const orderStatus = document.getElementById('orderStatus').value;
    const notes = document.getElementById('shippingNotes').value;
    
    if (!fromLocation || !toLocation || !trackingNumber) {
        alert('Please fill in all required fields');
        return;
    }
    
    // ✅ Update the order status across all customers
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('orderHistory_')) {
            const customerEmail = key.replace('orderHistory_', '');
            let orderHistory = JSON.parse(localStorage.getItem(key)) || [];
            
            const orderIndex = orderHistory.findIndex(order => {
                const generatedId = `ORD-${customerEmail.substring(0, 3).toUpperCase()}-${Date.parse(order.time)}`;
                return generatedId === orderId;
            });
            
            if (orderIndex !== -1) {
                // Update order status
                orderHistory[orderIndex].status = orderStatus;
                orderHistory[orderIndex].shippingInfo = {
                    fromLocation,
                    toLocation,
                    carrier,
                    trackingNumber,
                    notes,
                    updatedAt: new Date().toLocaleString()
                };
                
                // Add timestamp for when it was shipped
                if (orderStatus === ORDER_STATUS.SHIPPED) {
                    orderHistory[orderIndex].shippedAt = new Date().toLocaleString();
                }
                
                localStorage.setItem(key, JSON.stringify(orderHistory));
                
                closeTrackingModal();
                loadOrders();
                
                alert(`✅ Order ${orderId} updated to: ${orderStatus.toUpperCase()}\n\nTracking: ${trackingNumber}`);
                return;
            }
        }
    }
}

function deleteOrder(orderId) {
  const order = ordersData.find(o => o.id === orderId);
  if (!order) {
    alert('Order not found');
    return;
  }
  
  const confirmDelete = confirm(
    `Are you sure you want to delete order ${orderId}?\n\nCustomer: ${order.customer}\nTotal: RM ${order.total.toFixed(2)}\n\nThis action cannot be undone.`
  );
  
  if (!confirmDelete) return;
  
  ordersData = ordersData.filter(o => o.id !== orderId);
  filteredOrders = filteredOrders.filter(o => o.id !== orderId);
  
  renderOrdersTable();
  alert('Order deleted successfully!');
}

function exportOrders() {
  if (filteredOrders.length === 0) {
    alert('No orders to export');
    return;
  }
  
  const headers = ['Order ID', 'Customer', 'Email', 'Products', 'Total (RM)', 'Payment', 'Status', 'Date'];
  const csvContent = [
    headers.join(','),
    ...filteredOrders.map(order => {
      const productsText = order.products.map(p => `${p.name} (x${p.quantity})`).join('; ');
      return [
        order.id,
        `"${order.customer}"`,
        order.customerEmail,
        `"${productsText}"`,
        order.total.toFixed(2),
        order.payment,
        order.status,
        order.date
      ].join(',');
    })
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  
  alert(`Exported ${filteredOrders.length} orders successfully!`);
}

// ========================================
// CUSTOMERS MANAGEMENT
// ========================================
let customersData = [];
let filteredCustomers = [];

function initializeCustomers() {
  if (!window.location.pathname.includes('admin-customers.html')) return;
  
  loadCustomers();
  
  const exportBtn = document.getElementById('export-customers-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCustomers);
  }
  
  const searchInput = document.getElementById('search-customers');
  if (searchInput) {
    searchInput.addEventListener('input', applyCustomerFilters);
  }
  
  const typeFilter = document.getElementById('filter-customer-type');
  if (typeFilter) {
    typeFilter.addEventListener('change', applyCustomerFilters);
  }
}

function loadCustomers() {
    console.log('👥 Loading customers from database...');
    
    customersData = [];
    
    // Get all registered users from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Find registered user accounts
        if (key.startsWith('registeredUser_')) {
            const email = key.replace('registeredUser_', '');
            
            // Skip admin account
            if (email === 'admin@dayangsari.com') continue;
            
            const userData = JSON.parse(localStorage.getItem(key));
            
            // Get order history for this customer
            const orderKey = 'orderHistory_' + email;
            const orderHistory = JSON.parse(localStorage.getItem(orderKey)) || [];
            
            // Calculate customer stats
            const totalOrders = orderHistory.length;
            const totalSpent = orderHistory.reduce((sum, order) => sum + order.total, 0);
            
            // Find last order date
            let lastOrderDate = null;
            if (orderHistory.length > 0) {
                const sortedOrders = orderHistory.sort((a, b) => 
                    new Date(b.orderDate || b.time) - new Date(a.orderDate || a.time)
                );
                lastOrderDate = sortedOrders[0].orderDate || sortedOrders[0].time;
            }
            
            // Determine customer type
            let customerType = 'new';
            if (totalOrders === 0) {
                customerType = 'new';
            } else if (totalOrders >= 1 && totalOrders < 5) {
                customerType = 'regular';
            } else if (totalOrders >= 5) {
                customerType = 'vip';
            }
            
            // Get first order to determine join date
            const joinDate = userData.registeredDate || 
                             (orderHistory.length > 0 ? orderHistory[0].orderDate || orderHistory[0].time : new Date().toISOString());
            
            // Get address from most recent order
            let address = 'Not provided';
            if (orderHistory.length > 0) {
                const recentOrder = orderHistory[orderHistory.length - 1];
                address = recentOrder.address || 'Not provided';
            }
            
            // Create customer object
            const customer = {
                id: 'CUST-' + email.substring(0, 5).toUpperCase(),
                name: userData.name || 'N/A',
                email: email,
                phone: userData.phone || orderHistory[0]?.phone || 'Not provided',
                totalOrders: totalOrders,
                totalSpent: totalSpent,
                type: customerType,
                joined: joinDate,
                lastOrder: lastOrderDate,
                address: address
            };
            
            customersData.push(customer);
        }
    }
    
    // Sort by total spent (highest first)
    customersData.sort((a, b) => b.totalSpent - a.totalSpent);
    
    console.log(`✅ Loaded ${customersData.length} customers`);
    
    // Update filtered customers and render
    filteredCustomers = [...customersData];
    renderCustomersTable();
    updateCustomerStats();
}

function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    if (filteredCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #999;">
                    No customers found.
                </td>
            </tr>
        `;
        updateCustomerStats();
        return;
    }
    
    tbody.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td><strong>${customer.id}</strong></td>
            <td>${customer.name}</td>
            <td>
                <a href="mailto:${customer.email}" style="color: #8b4513; text-decoration: none;">
                    ${customer.email}
                </a>
            </td>
            <td>${customer.phone}</td>
            <td><strong>${customer.totalOrders}</strong></td>
            <td><strong>RM ${customer.totalSpent.toFixed(2)}</strong></td>
            <td>
                <span class="status-badge ${getCustomerTypeClass(customer.type)}">
                    ${capitalizeFirst(customer.type)}
                </span>
            </td>
            <td>${formatDate(customer.joined)}</td>
            <td>
                <button class="view-btn" onclick="viewCustomerDetails('${customer.id}')">View</button>
                <button class="delete-btn" onclick="deleteCustomer('${customer.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    updateCustomerStats();
}

function updateCustomerStats() {
    // Update dashboard stats if we're on dashboard
    const totalCustomersEl = document.getElementById('total-customers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = customersData.length;
    }
}

function getCustomerTypeClass(type) {
  switch(type) {
    case 'vip':
      return 'status-delivered';
    case 'new':
      return 'status-processing';
    case 'regular':
    default:
      return 'status-pending';
  }
}

function applyCustomerFilters() {
    const searchQuery = document.getElementById('search-customers')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('filter-customer-type')?.value || '';
    
    let filtered = [...customersData];
    
    // Search filter
    if (searchQuery) {
        filtered = filtered.filter(customer => 
            customer.name.toLowerCase().includes(searchQuery) ||
            customer.email.toLowerCase().includes(searchQuery) ||
            customer.phone.toLowerCase().includes(searchQuery) ||
            customer.id.toLowerCase().includes(searchQuery)
        );
    }
    
    // Type filter
    if (typeFilter) {
        filtered = filtered.filter(customer => customer.type === typeFilter);
    }
    
    filteredCustomers = filtered;
    renderCustomersTable();
}

function viewCustomerDetails(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }
    
    // Get order history
    const orderKey = 'orderHistory_' + customer.email;
    const orderHistory = JSON.parse(localStorage.getItem(orderKey)) || [];
    
    // Calculate average order value
    const avgOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
    
    // Get product preferences (most purchased products)
    const productCounts = {};
    orderHistory.forEach(order => {
        if (order.cart && Array.isArray(order.cart)) {
            order.cart.forEach(item => {
                const productName = item.baseProductName || item.name;
                productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
            });
        }
    });
    
    const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count}x)`)
        .join('\n  • ');
    
    const customerDetails = `
    ╔════════════════════════════════════════╗
    ║          CUSTOMER DETAILS              ║
    ╚════════════════════════════════════════╝

    📋 BASIC INFO
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Customer ID: ${customer.id}
    Name: ${customer.name}
    Email: ${customer.email}
    Phone: ${customer.phone}

    👤 CUSTOMER TYPE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Status: ${customer.type.toUpperCase()}
    Member Since: ${formatDate(customer.joined)}
    Last Order: ${customer.lastOrder ? formatDate(customer.lastOrder) : 'No orders yet'}

    💰 PURCHASE HISTORY
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Total Orders: ${customer.totalOrders}
    Total Spent: RM ${customer.totalSpent.toFixed(2)}
    Average Order Value: RM ${avgOrderValue.toFixed(2)}

    ${topProducts ? `🏆 TOP PRODUCTS PURCHASED
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      • ${topProducts}
    ` : ''}
    📍 DELIVERY ADDRESS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ${customer.address}

    ═══════════════════════════════════════════
    `;
    
    alert(customerDetails);
}

function editCustomer(customerId) {
  const customer = customersData.find(c => c.id === customerId);
  if (!customer) {
    alert('Customer not found');
    return;
  }
  
  const newName = prompt('Edit customer name:', customer.name);
  if (!newName) return;
  
  const newEmail = prompt('Edit email:', customer.email);
  const newPhone = prompt('Edit phone:', customer.phone);
  const newType = prompt('Edit customer type (regular/vip/new):', customer.type);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (newEmail && !emailRegex.test(newEmail)) {
    alert('Invalid email address');
    return;
  }
  
  const validTypes = ['regular', 'vip', 'new'];
  if (newType && !validTypes.includes(newType.toLowerCase())) {
    alert('Invalid customer type. Use: regular, vip, or new');
    return;
  }
  
  customer.name = newName;
  if (newEmail) customer.email = newEmail;
  if (newPhone) customer.phone = newPhone;
  if (newType) customer.type = newType.toLowerCase();
  
  applyCustomerFilters();
  alert('Customer updated successfully!');
}

function deleteCustomer(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }
    
    const confirmDelete = confirm(
        `⚠️ DELETE CUSTOMER ACCOUNT?\n\n` +
        `Customer: ${customer.name}\n` +
        `Email: ${customer.email}\n` +
        `Total Orders: ${customer.totalOrders}\n` +
        `Total Spent: RM ${customer.totalSpent.toFixed(2)}\n\n` +
        `This will permanently delete:\n` +
        `• Customer account\n` +
        `• Order history (${customer.totalOrders} orders)\n` +
        `• All customer data\n\n` +
        `⚠️ THIS CANNOT BE UNDONE!\n\n` +
        `Type the customer's email to confirm deletion.`
    );
    
    if (!confirmDelete) return;
    
    const emailConfirm = prompt(`Type "${customer.email}" to confirm deletion:`);
    
    if (emailConfirm !== customer.email) {
        alert('❌ Email does not match. Deletion cancelled.');
        return;
    }
    
    // Delete customer data
    const userKey = 'registeredUser_' + customer.email;
    const orderKey = 'orderHistory_' + customer.email;
    const cartKey = 'cart_' + customer.email;
    const wishlistKey = 'wishlist_' + customer.email;
    const addressKey = 'savedAddresses_' + customer.email;
    const customerTrackingKey = 'customer_' + customer.email;
    
    localStorage.removeItem(userKey);
    localStorage.removeItem(orderKey);
    localStorage.removeItem(cartKey);
    localStorage.removeItem(wishlistKey);
    localStorage.removeItem(addressKey);
    localStorage.removeItem(customerTrackingKey);
    
    // Remove from arrays
    customersData = customersData.filter(c => c.id !== customerId);
    filteredCustomers = filteredCustomers.filter(c => c.id !== customerId);
    
    renderCustomersTable();
    alert(`✅ Customer "${customer.name}" has been permanently deleted.`);
}

function exportCustomers() {
    if (filteredCustomers.length === 0) {
        alert('No customers to export');
        return;
    }
    
    const headers = [
        'Customer ID', 
        'Name', 
        'Email', 
        'Phone', 
        'Total Orders', 
        'Total Spent (RM)', 
        'Type', 
        'Joined Date',
        'Last Order',
        'Address'
    ];
    
    const csvContent = [
        headers.join(','),
        ...filteredCustomers.map(customer => [
            customer.id,
            `"${customer.name}"`,
            customer.email,
            customer.phone,
            customer.totalOrders,
            customer.totalSpent.toFixed(2),
            customer.type,
            customer.joined,
            customer.lastOrder || 'N/A',
            `"${customer.address}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert(`✅ Exported ${filteredCustomers.length} customers successfully!`);
}

function viewCustomerOrderHistory(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }
    
    const orderKey = 'orderHistory_' + customer.email;
    const orderHistory = JSON.parse(localStorage.getItem(orderKey)) || [];
    
    if (orderHistory.length === 0) {
        alert(`${customer.name} has no orders yet.`);
        return;
    }
    
    // Create order history summary
    let orderSummary = `📦 ORDER HISTORY - ${customer.name}\n`;
    orderSummary += `${'='.repeat(50)}\n\n`;
    
    orderHistory.reverse().forEach((order, index) => {
        orderSummary += `Order #${index + 1}\n`;
        orderSummary += `Date: ${order.time}\n`;
        orderSummary += `Total: RM ${order.total.toFixed(2)}\n`;
        orderSummary += `Status: ${(order.status || 'completed').toUpperCase()}\n`;
        orderSummary += `Payment: ${order.paymentMethod || 'N/A'}\n`;
        orderSummary += `Items: ${order.cart.length} product(s)\n`;
        orderSummary += `${'-'.repeat(50)}\n`;
    });
    
    alert(orderSummary);
}

// ADD utility function to get customer statistics:
function getCustomerStatistics() {
    const stats = {
        total: customersData.length,
        new: customersData.filter(c => c.type === 'new').length,
        regular: customersData.filter(c => c.type === 'regular').length,
        vip: customersData.filter(c => c.type === 'vip').length,
        totalRevenue: customersData.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrderValue: 0,
        totalOrders: customersData.reduce((sum, c) => sum + c.totalOrders, 0)
    };
    
    stats.avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    
    return stats;
}

// ADD function to display customer stats:
function displayCustomerStats() {
    const stats = getCustomerStatistics();
    
    console.log('👥 CUSTOMER STATISTICS');
    console.log('═══════════════════════════════════════');
    console.table({
        'Total Customers': stats.total,
        'New Customers': stats.new,
        'Regular Customers': stats.regular,
        'VIP Customers': stats.vip,
        'Total Orders': stats.totalOrders,
        'Total Revenue': `RM ${stats.totalRevenue.toFixed(2)}`,
        'Avg Order Value': `RM ${stats.avgOrderValue.toFixed(2)}`
    });
}


// ========================================
// ANALYTICS FUNCTIONS
// ========================================
let revenueChart, ordersChart, productsChart, customersChart;

function initializeAnalytics() {
  if (!window.location.pathname.includes('admin-analytics.html')) return;
  
  initializeCharts();
  loadMetrics();
  
  const timeRangeSelect = document.getElementById('time-range');
  if (timeRangeSelect) {
    timeRangeSelect.addEventListener('change', function() {
      updateChartsData(this.value);
    });
  }
  
  const downloadBtn = document.getElementById('download-report-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadReport);
  }
}

function initializeCharts() {
  initRevenueChart();
  initOrdersChart();
  initProductsChart();
  initCustomersChart();
}

function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  revenueChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Revenue (RM)',
        data: [0, 0, 0, 0],
        borderColor: '#8b4513',
        backgroundColor: 'rgba(212,165,116,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'RM ' + context.parsed.y.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'RM ' + value;
            }
          }
        }
      }
    }
  });
}

function initOrdersChart() {
  const ctx = document.getElementById('ordersChart');
  if (!ctx) return;
  
  ordersChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [{
        label: 'Orders',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          '#FFC107',
          '#2196F3',
          '#9C27B0',
          '#4CAF50',
          '#F44336'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function initProductsChart() {
  const ctx = document.getElementById('productsChart');
  if (!ctx) return;
  
  productsChart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#ddd'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function initCustomersChart() {
  const ctx = document.getElementById('customersChart');
  if (!ctx) return;
  
  customersChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Customers',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76,175,80,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function updateChartsData(timeRange) {
  let labels, revenueData, ordersData, customersData;
  
  switch(timeRange) {
    case '7days':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      revenueData = [0, 0, 0, 0, 0, 0, 0];
      ordersData = [0, 0, 0, 0, 0, 0, 0];
      customersData = [0, 0, 0, 0, 0, 0, 0];
      break;
    case '30days':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      revenueData = [0, 0, 0, 0];
      ordersData = [0, 0, 0, 0];
      customersData = [0, 0, 0, 0];
      break;
    case '90days':
      labels = ['Month 1', 'Month 2', 'Month 3'];
      revenueData = [0, 0, 0];
      ordersData = [0, 0, 0];
      customersData = [0, 0, 0];
      break;
    case '1year':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      revenueData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      ordersData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      customersData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      break;
    default:
      return;
  }
  
  revenueChart.data.labels = labels;
  revenueChart.data.datasets[0].data = revenueData;
  revenueChart.update();
  
  customersChart.data.labels = labels;
  customersChart.data.datasets[0].data = customersData;
  customersChart.update();
}

function loadMetrics() {
  const metrics = {
    avgOrderValue: 0,
    avgOrderChange: 0,
    conversionRate: 0,
    conversionChange: 0,
    customerRetention: 0,
    retentionChange: 0,
    revenueGrowth: 0,
    revenueChange: 0
  };
  
  const metricsCards = document.querySelectorAll('.metrics-section .card');
  
  if (metricsCards.length >= 4) {
    metricsCards[0].querySelector('p').textContent = `RM ${metrics.avgOrderValue.toFixed(2)}`;
    metricsCards[0].querySelector('.card-subtitle').textContent = 
      `${metrics.avgOrderChange >= 0 ? '↑' : '↓'} ${Math.abs(metrics.avgOrderChange)}% from last month`;
    
    metricsCards[1].querySelector('p').textContent = `${metrics.conversionRate}%`;
    metricsCards[1].querySelector('.card-subtitle').textContent = 
      `${metrics.conversionChange >= 0 ? '↑' : '↓'} ${Math.abs(metrics.conversionChange)}% from last month`;
    
    metricsCards[2].querySelector('p').textContent = `${metrics.customerRetention}%`;
    metricsCards[2].querySelector('.card-subtitle').textContent = 
      `${metrics.retentionChange >= 0 ? '↑' : '↓'} ${Math.abs(metrics.retentionChange)}% from last month`;
    
    metricsCards[3].querySelector('p').textContent = `${metrics.revenueGrowth}%`;
    metricsCards[3].querySelector('.card-subtitle').textContent = 
      `${metrics.revenueChange >= 0 ? '↑' : '↓'} ${Math.abs(metrics.revenueChange)}% from last month`;
  }
}

function downloadReport() {
  const timeRange = document.getElementById('time-range').value;
  alert(`Downloading ${timeRange} report... (Feature coming soon)`);
}

// ========================================
// ACCOUNT MANAGEMENT
// ========================================
function initializeAccount() {
  if (!window.location.pathname.includes('admin-account.html')) return;
  
  // Account-specific initialization
  // Logout is handled globally, no need to add listener here
  console.log('Admin Account page initialized');
}

function changeEmail() {
  const currentEmail = document.getElementById('current-email').textContent;
  const newEmail = document.getElementById('new-email').value.trim();
  
  if (!newEmail) {
    alert('Please enter a new email address');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    alert('Please enter a valid email address');
    return;
  }
  
  if (newEmail === currentEmail) {
    alert('New email must be different from current email');
    return;
  }
  
  const confirm = window.confirm(
    `Change email from:\n${currentEmail}\n\nTo:\n${newEmail}\n\nYou will need to verify your new email address. Continue?`
  );
  
  if (!confirm) return;
  
  document.getElementById('current-email').textContent = newEmail;
  document.getElementById('new-email').value = '';
  
  alert('✅ Email updated successfully! Please check your inbox for verification link.');
}

function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Please fill in all password fields');
    return;
  }
  
  if (newPassword.length < 8) {
    alert('New password must be at least 8 characters long');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }
  
  if (currentPassword === newPassword) {
    alert('New password must be different from current password');
    return;
  }
  
  const confirm = window.confirm('Are you sure you want to change your password?');
  
  if (!confirm) return;
  
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
  
  alert('✅ Password updated successfully!');
}

function toggleWebsiteStatus() {
  const checkbox = document.getElementById('website-status');
  const statusText = document.getElementById('status-text');
  const statusIndicator = document.getElementById('status-indicator');
  
  const isOpen = checkbox.checked;
  
  if (isOpen) {
    statusText.textContent = 'Open';
    statusIndicator.className = 'status-indicator open';
    statusIndicator.innerHTML = `
      <span class="status-dot open"></span>
      <div>
        <strong>Website is currently accessible to customers</strong>
        <p class="status-description">Customers can browse and place orders</p>
      </div>
    `;
    
    alert('✅ Store is now OPEN for business!');
  } else {
    statusText.textContent = 'Closed';
    statusIndicator.className = 'status-indicator closed';
    statusIndicator.innerHTML = `
      <span class="status-dot closed"></span>
      <div>
        <strong>Website is currently closed to customers</strong>
        <p class="status-description">Visitors will see: "Sorry for the inconvenience. We're currently baking something new!"</p>
      </div>
    `;
    
    alert('🔒 Store is now CLOSED. Customers will see the maintenance message.');
  }
}

function deleteWebsite() {
  const confirmStep1 = window.confirm(
    '⚠️ DANGER ZONE ⚠️\n\n' +
    'You are about to DELETE the ENTIRE WEBSITE!\n\n' +
    'This will permanently delete:\n' +
    '• All products and inventory\n' +
    '• All customer data\n' +
    '• All order history\n' +
    '• All analytics data\n' +
    '• All website content\n\n' +
    'THIS CANNOT BE UNDONE!\n\n' +
    'Do you want to continue?'
  );
  
  if (!confirmStep1) return;
  
  const confirmStep2 = window.confirm(
    '🚨 FINAL WARNING 🚨\n\n' +
    'This is your LAST CHANCE to cancel!\n\n' +
    'Are you ABSOLUTELY SURE you want to delete everything?\n\n' +
    'Click OK to proceed with deletion.\n' +
    'Click Cancel to keep your website safe.'
  );
  
  if (!confirmStep2) {
    alert('✅ Deletion cancelled. Your website is safe.');
    return;
  }
  
  const typedConfirmation = prompt(
    'To confirm deletion, type exactly:\nDELETE EVERYTHING\n\n' +
    '(Type carefully - this is case sensitive)'
  );
  
  if (typedConfirmation !== 'DELETE EVERYTHING') {
    alert('❌ Confirmation text did not match. Deletion cancelled.');
    return;
  }
  
  alert(
    '💥 WEBSITE DELETION INITIATED\n\n' +
    'All data is being permanently deleted...\n\n' +
    'This process cannot be stopped or reversed.'
  );
  
  setTimeout(() => {
    alert('🗑️ Website deletion complete. You will be redirected.');
  }, 2000);
}

// ========================================
// INITIALIZE ALL ADMIN PAGES
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    // Remove any existing listeners
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    
    newLogoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  
  // Initialize page-specific functions
  initializeDashboard();
  initializeProducts();
  initializeOrders();
  initializeCustomers();
  initializeAnalytics();
  initializeAccount();

  // Load customers data when on customers page
    if (window.location.pathname.includes('admin-customers.html')) {
        loadCustomers();
    }

  console.log('Admin page loaded');
  console.log('✅ Admin Customers Sync System Loaded');
  console.log('💡 Available commands:');
  console.log('  - displayCustomerStats() - View customer statistics');
  console.log('  - loadCustomers() - Reload customer data');
  console.log('  - exportCustomers() - Export to CSV');
});