// ========================================
// ORDER TRACKING PAGE JAVASCRIPT
// ======================================== */

// Initialize order tracking page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('order_tracking.html')) {
        initializeOrderTracking();
    }
});


function initializeOrderTracking() {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        alert("Please sign in to track your orders.");
        window.location.href = 'signin.html';
        return;
    }

    // Get order data
    const urlParams = new URLSearchParams(window.location.search);
    const orderIndex = urlParams.get('order');
    
    if (orderIndex !== null) {
        // Load specific order
        loadSpecificOrder(parseInt(orderIndex));
    } else {
        // Load most recent order
        loadMostRecentOrder();
    }
}

// ========================================
// LOAD ORDER DATA
// ========================================

function loadMostRecentOrder() {
    const user = getCurrentUser();
    const orderKey = "orderHistory_" + user.email;
    const history = JSON.parse(localStorage.getItem(orderKey)) || [];

    if (history.length === 0) {
        alert("No orders found.");
        window.location.href = 'myaccount.html';
        return;
    }

    // Get the most recent order
    const order = history[history.length - 1];
    displayOrderTracking(order, history.length - 1);
}

function loadSpecificOrder(orderIndex) {
    const user = getCurrentUser();
    const orderKey = "orderHistory_" + user.email;
    const history = JSON.parse(localStorage.getItem(orderKey)) || [];

    if (orderIndex >= history.length || orderIndex < 0) {
        alert("Order not found.");
        window.location.href = 'myaccount.html';
        return;
    }

    const order = history[orderIndex];
    displayOrderTracking(order, orderIndex);
}

// ========================================
// DISPLAY ORDER TRACKING
// ========================================

function displayOrderTracking(order, orderIndex) {
    // Generate order number
    const orderNumber = 'ORD' + (1000 + orderIndex);
    document.getElementById('orderNumber').textContent = orderNumber;

    // Display order date
    document.getElementById('orderDate').textContent = order.time;

    // Generate QR Code for order
    generateOrderQRCode(orderNumber);

    // Determine order status and update timeline
    updateOrderStatus(order);

    // Display carrier info (simulated)
    displayCarrierInfo(order);

    // Display package details
    displayPackageDetails(order, orderNumber);

    // Display order items
    displayOrderItems(order);

    // Display shipping address
    document.getElementById('shippingAddress').textContent = order.address;
}

function confirmDelivery() {
    const confirmReceived = confirm(
        "✅ Confirm Order Received?\n\n" +
        "By clicking OK, you confirm that you have received this order.\n\n" +
        "This will mark the order as DELIVERED and complete the transaction."
    );
    
    if (!confirmReceived) return;
    
    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in');
        return;
    }
    
    // Get current order from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderIndex = urlParams.get('order');
    
    const orderKey = "orderHistory_" + user.email;
    let history = JSON.parse(localStorage.getItem(orderKey)) || [];
    
    if (orderIndex !== null && orderIndex < history.length) {
        // ✅ Update status to DELIVERED
        history[orderIndex].status = ORDER_STATUS.DELIVERED;
        history[orderIndex].deliveredAt = new Date().toLocaleString();
        
        localStorage.setItem(orderKey, JSON.stringify(history));
        
        alert('✅ Thank you! Your order has been marked as DELIVERED.\n\nWe hope you enjoy your products!');
        
        // Reload page to show updated status
        window.location.reload();
    } else {
        alert('Order not found');
    }
}

// ========================================
// UPDATE ORDER STATUS & TIMELINE
// ========================================

function updateOrderStatus(order) {
    let currentStatus = ORDER_STATUS.PROCESSING; // Default
    
    if (order.status === ORDER_STATUS.DELIVERED) {
        currentStatus = ORDER_STATUS.DELIVERED;
    } else if (order.status === ORDER_STATUS.SHIPPED) {
        currentStatus = ORDER_STATUS.SHIPPED;
    } else if (order.status === ORDER_STATUS.PROCESSING) {
        currentStatus = ORDER_STATUS.PROCESSING;
    } else if (order.paymentCompleted) {
        currentStatus = ORDER_STATUS.PROCESSING;
    } else {
        currentStatus = ORDER_STATUS.PENDING;
    }

    updateTimeline(currentStatus);

    const statusTexts = {
        [ORDER_STATUS.PENDING]: 'Payment pending',
        [ORDER_STATUS.PROCESSING]: 'Your order is being prepared',
        [ORDER_STATUS.SHIPPED]: 'Your order is on the way',
        [ORDER_STATUS.DELIVERED]: 'Your order has been delivered'
    };

    document.getElementById('orderStatusText').textContent = 
        statusTexts[currentStatus] || statusTexts[ORDER_STATUS.PROCESSING];
}

function updateTimeline(currentStatus) {
    const steps = [
        ORDER_STATUS.PROCESSING,  // "Ordered" → "Processing"
        'ready',                   // Keep "Ready" step
        ORDER_STATUS.SHIPPED,      // "In Transit" → "Shipped"
        ORDER_STATUS.DELIVERED     // "Delivered"
    ];
    
    const currentIndex = steps.indexOf(currentStatus);

    steps.forEach((step, index) => {
        const stepElement = document.getElementById(`step-${step}`);
        const connector = document.getElementById(`connector-${index + 1}`);

        if (!stepElement) return;

        if (index < currentIndex) {
            stepElement.classList.add('completed');
            stepElement.classList.remove('active');
            if (connector) connector.classList.add('completed');
        } else if (index === currentIndex) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else {
            stepElement.classList.remove('completed', 'active');
            if (connector) connector.classList.remove('completed');
        }
    });
}

function getOrderStatusText(status) {
    const statusMap = {
        [ORDER_STATUS.PENDING]: 'Payment Pending',
        [ORDER_STATUS.PROCESSING]: 'Processing',
        [ORDER_STATUS.SHIPPED]: 'Shipped / In Transit',
        [ORDER_STATUS.DELIVERED]: 'Delivered'
    };
    
    return statusMap[status] || 'Unknown';
}

// ========================================
// HELPER: Check if customer can confirm delivery
// ========================================

function canConfirmDelivery(order) {
    return order.status === ORDER_STATUS.SHIPPED && 
           order.paymentCompleted === true;
}

// ========================================
// DISPLAY CARRIER INFO
// ========================================

function displayCarrierInfo(order) {
    // Simulate carrier information
    const carriers = [
        { name: 'FedEx', logo: 'asset/carriers/fedex.png' },
        { name: 'DHL', logo: 'asset/carriers/dhl.png' },
        { name: 'Pos Laju', logo: 'asset/carriers/poslaju.png' }
    ];

    // Randomly select a carrier (in real app, this would be from order data)
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];

    // Generate tracking number
    const trackingNumber = '#1ZE8R860' + Math.random().toString().slice(2, 11);

    // Update carrier info
    const carrierLogo = document.getElementById('carrierLogo');
    if (carrierLogo) {
        carrierLogo.src = carrier.logo;
        carrierLogo.alt = carrier.name;
    }

    document.getElementById('trackingNumber').textContent = trackingNumber;

    // Simulate location based on order status
    const now = new Date();
    const timeStr = `Today at ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    
    document.getElementById('carrierUpdate').textContent = timeStr;
    
    // Determine location based on shipping state
    let fromLocation = 'Kuching, Sarawak, Malaysia';
    
    if (order.address.toLowerCase().includes('kuala lumpur')) {
        fromLocation = 'Distribution Center, Selangor';
    } else if (order.address.toLowerCase().includes('sabah')) {
        fromLocation = 'Kota Kinabalu Hub, Sabah';
    }

    document.getElementById('carrierLocation').textContent = 'From: ' + fromLocation;
    document.getElementById('destinationLocation').textContent = 'To: ' + order.address.split(',')[1].trim();
}

// ========================================
// DISPLAY PACKAGE DETAILS
// ========================================

function displayPackageDetails(order, orderNumber) {
    // Generate package ID
    const packageId = 'MS' + Math.floor(Math.random() * 1000000);
    document.getElementById('packageId').textContent = packageId;

    // Package description
    const itemCount = order.cart.length;
    const totalItems = order.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('packageDescription').textContent = 
        `Package contains ${totalItems} item(s) from ${itemCount} product(s)`;

    // Package route
    document.getElementById('packageFrom').textContent = 'From: Kuching, Sarawak';
    
    // Extract city from address
    const addressParts = order.address.split(',');
    const toCity = addressParts.length > 1 ? addressParts[1].trim() : 'Malaysia';
    document.getElementById('packageTo').textContent = 'To: ' + toCity;

    // Package date
    document.getElementById('packageDate').textContent = order.time.split(',')[0];

    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    if (order.status === 'delivered') {
        statusBadge.textContent = 'DELIVERED';
        statusBadge.classList.add('delivered');
    } else if (order.status === 'in_transit' || order.status === 'shipped') {
        statusBadge.textContent = 'IN TRANSIT';
        statusBadge.classList.add('shipped');
    } else {
        statusBadge.textContent = 'TO BE SHIPPED';
    }

    // Package dimensions (simulated)
    document.getElementById('packageAmount').textContent = '30x20x15 CM / 2KG';
}

// ========================================
// DISPLAY ORDER ITEMS
// ========================================

function displayOrderItems(order) {
    const container = document.getElementById('orderItemsList');
    
    if (!order.cart || order.cart.length === 0) {
        container.innerHTML = '<p style="color: #999;">No items in this order</p>';
        return;
    }

    container.innerHTML = order.cart.map(item => `
        <div class="order-item-row">
            <div class="order-item-image">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='🥮'">` 
                    : '🥮'
                }
            </div>
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <p>RM ${item.price.toFixed(2)} each</p>
            </div>
            <div class="order-item-quantity">
                x${item.quantity}
            </div>
            <div class="order-item-price">
                RM ${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}

// ========================================
// ACTION FUNCTIONS
// ========================================

function viewShipmentDetails() {
    const trackingNumber = document.getElementById('trackingNumber').textContent;
    alert(`Tracking Number: ${trackingNumber}\n\nIn a real application, this would open the carrier's tracking page.`);
}

function viewOrderDetails() {
    window.location.href = 'myaccount.html?section=orders';
}

function contactSupport() {
    if (typeof toggleChatbot === 'function') {
        // Open the chatbot window
        const chatbotWindow = document.getElementById('chatbotWindow');
        if (chatbotWindow && !chatbotWindow.classList.contains('active')) {
            toggleChatbot();
        }
        
        // Find the current order number to provide context
        const orderNumber = document.getElementById('orderNumber').textContent;
        
        // Add a specialized message to the chat
        setTimeout(() => {
            addChatMessage(`I need help with order ${orderNumber}`, 'user');
            addChatMessage(`I've noted that you're asking about **${orderNumber}**. How can I help you with this specific order?`, 'bot');
        }, 600);
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function isUserLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
}

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