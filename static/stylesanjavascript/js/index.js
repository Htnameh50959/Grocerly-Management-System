// --- Universal Internet Connection Monitor ---
function showOfflineOverlay(message = "No Internet Connection") {
    let overlay = document.getElementById("offline-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "offline-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(30,30,30,0.98)";
        overlay.style.color = "#fff";
        overlay.style.zIndex = "99999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.fontSize = "2rem";
        overlay.innerHTML = `<span style="font-size:3rem;margin-bottom:20px; color:#8affa3">&#9888;</span><div style=" color:#8affa3">${message}</div><div style="font-size:1rem;margin-top:20px; color:#8affa3">Please check your internet connection.</div>`;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = "flex";
    }
    document.querySelectorAll("input, button, select, textarea, a").forEach(el => {
        el.disabled = true;
        el.style.pointerEvents = "none";
    });
}

function hideOfflineOverlay() {
    const overlay = document.getElementById("offline-overlay");
    if (overlay) overlay.style.display = "none";
    document.querySelectorAll("input, button, select, textarea, a").forEach(el => {
        el.disabled = false;
        el.style.pointerEvents = "";
    });
}

function checkOnlineStatus() {
    if (!navigator.onLine) {
        showOfflineOverlay();
    } else {
        hideOfflineOverlay();
    }
}

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);
document.addEventListener("DOMContentLoaded", checkOnlineStatus);

// Universal Modal Functions
function openModal(modal) {
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("show");
    }, 10);

   
}

function closeModal(modal) {
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);

}

document.addEventListener("DOMContentLoaded", function () {
    const roleSelect = document.getElementById("loginRole");
    const pincodeGroup = document.getElementById("pincode-group");
    const admincodeGroup = document.getElementById("adminpin-group");
    const useroremailingroup = document.getElementById("useroremailin-group");
    const passwordgroup = document.getElementById("password-group");
    const submit = document.getElementById("submit");
    const checkAdminBtn = document.getElementById("checkadminpin");
    const loadingIcon = document.getElementById("loading-icon1");

    checkAdminBtn.style.display = "none";

    roleSelect.addEventListener("change", function () {
        const role = roleSelect.value;

        if (role === "distributor") {
            pincodeGroup.style.display = "block";
            admincodeGroup.style.display = "none";
            useroremailingroup.style.display = "block";
            passwordgroup.style.display = "block";
            submit.style.display = "block";
            checkAdminBtn.style.display = "none";
        } else if (role === "admin") {
            pincodeGroup.style.display = "none";
            admincodeGroup.style.display = "block";
            useroremailingroup.style.display = "none";
            passwordgroup.style.display = "none";
            submit.style.display = "none";
            checkAdminBtn.style.display = "block";
        } else {
            pincodeGroup.style.display = "none";
            admincodeGroup.style.display = "none";
            useroremailingroup.style.display = "block";
            passwordgroup.style.display = "block";
            submit.style.display = "block";
            checkAdminBtn.style.display = "none";
        }
    });

    checkAdminBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const adminPin = document.getElementById("admincode").value.trim();

        if (!adminPin) {
            alert("Please enter the admin pin.");
            return;
        }

        loadingIcon.style.display = "inline";

        try {
            const response = await fetch("/admin/verify_admin_pin", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({ pin: adminPin }),
            });

            const data = await response.json();
            loadingIcon.style.display = "none";

            if (data.success) {
                document.getElementById("admincode").value = "";
                showToast("Admin pin verified successfully!");
                admincodeGroup.style.display = "none";
                useroremailingroup.style.display = "block";
                passwordgroup.style.display = "block";
                submit.style.display = "block";
                checkAdminBtn.style.display = "none";
            } else {
                alert(data.message || "Invalid Admin Pin");
                document.getElementById("admincode").value = "";
            }
        } catch (error) {
            loadingIcon.style.display = "none";
            alert("Error verifying pin. Please try again.");
            console.error("Admin pin verification error:", error);
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const productCategories = document.querySelectorAll(".product-categery");

    productCategories.forEach((category) => {
        category.addEventListener("click", function () {
            productCategories.forEach((cat) => cat.classList.remove("active"));
            this.classList.add("active");

            const radio = this.querySelector("input[type='radio']");
            if (radio) {
                radio.checked = true;
                const selectedValue = radio.value;
                getProducts(selectedValue);
            }
        });
    });
});

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    toastMessage.innerText = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}

// Login Modal
const loginLink = document.getElementById("login-link");
const loginContainer = document.querySelector(".login-container");

if (loginLink) {
    loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(loginContainer);
    });
}

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const userInput = document.getElementById("useroremailin").value.trim();
    const passInput = document.getElementById("passin").value.trim();
    const role = document.getElementById("loginRole").value;
    const pincode = document.getElementById("pincode").value.trim();

    if (userInput === "") {
        showToast("Please enter your email", "error");
        return;
    }
    if (passInput === "") {
        showToast("Please enter your password", "error");
        return;
    }

    document.getElementById("loading-icon1").style.display = "block";

    const payload = JSON.stringify({
        pincode: pincode,
        useroremailin: userInput,
        passin: passInput,
        role: role,
    });

    fetch("/index/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: payload,
    })
        .then((response) => response.json())
        .then((login) => {
            document.getElementById("loading-icon1").style.display = "none";
            showToast(login.message, login.status);

            if (login.status === "success") {
                document.getElementById("login-form").reset();
                closeModal(loginContainer);

                document.getElementById("useroremailin").value = "";
                document.getElementById("passin").value = "";

                if (login.role === "admin") {
                    window.location.href = "/admin";
                } else if (login.role === "distributor") {
                    window.location.href = "/distributor";
                } else {
                    setTimeout(() => location.reload(), 1000);
                }
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            showToast("For a time we can not complete this request. Please try again later.", "error");
            document.getElementById("loading-icon1").style.display = "none";
        });
});

document.getElementById("close-login").addEventListener("click", () => {
    closeModal(loginContainer);
});

loginContainer.addEventListener("click", (e) => {
    if (e.target === loginContainer) {
        closeModal(loginContainer);
    }
});


document.getElementById("next").addEventListener("click", () => {
    const fullnameGroup = document.getElementById("fullnamegroup");
    const usernamegroup = document.getElementById("usernamegroup");
    const emailgroup = document.getElementById("emailgroup");
    const pass1group = document.getElementById("pass1group");
    const pass2group = document.getElementById("pass2group");
    const next =document.getElementById("next");
    const btn =document.getElementById("btn")

   
        fullnameGroup.style.display = "none";
        usernamegroup.style.display = "none";
        emailgroup.style.display = "none";
        pass1group.style.display = "block";
        pass2group.style.display = "block";
        next.style.display = "none";
        btn.style.display = "block";

    

    
});

// Register Modal
const registerLink = document.getElementById("register-link");
const registerLink1 = document.getElementById("register-link1");
const registerContainer = document.querySelector(".register-container");

if (registerLink) {
    registerLink.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(registerContainer);
    });
}

if (registerLink1) {
    registerLink1.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal(loginContainer);
        setTimeout(() => {
            openModal(registerContainer);
        }, 300);
    });
}

const registerForm = document.getElementById("btn");

registerForm.addEventListener("click", function (event) {
    event.preventDefault();

    const fullnameElement = document.getElementById("register-fullname");
    const usernameElement = document.getElementById("register-username");
    const emailElement = document.getElementById("register-email");
    const password1Element = document.getElementById("pass");
    const password2Element = document.getElementById("pass2");

    const fullname = fullnameElement ? fullnameElement.value.trim() : "";
    const username = usernameElement ? usernameElement.value.trim() : "";
    const email = emailElement ? emailElement.value.trim() : "";
    const password1 = password1Element ? password1Element.value.trim() : "";
    const password2 = password2Element ? password2Element.value.trim() : "";

    if (fullname == "") {
        showToast("Please enter your Full Name", "error");
        return;
    }
    if (username === "") {
        showToast("Please enter your username", "error");
        return;
    }
    if (email === "") {
        showToast("Please enter your email", "error");
        return;
    }
    if (password1 === "") {
        showToast("Please enter your password", "error");
        return;
    }
    if (password1.length < 8) {
        showToast("Password must be at least 8 characters", "error");
        return;
    }
    if (password1 !== password2) {
        showToast("Passwords do not match", "error");
        return;
    }

    document.getElementById("loading-icon2").style.display = "block";

    const payload = {
        registerfullname: fullname,
        registerUsername: username,
        registerEmail: email,
        password1: password1,
        password2: password2,
        role: "customer",
    };

    fetch("/index/Register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("loading-icon2").style.display = "none";

            const jsonString = data.d || data;
            const result = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;

            showToast(result.message, result.status);

            if (result.status === "success") {
                document.getElementById("sign-up-1").reset();
                closeModal(registerContainer);
                openModal(loginContainer);
            }
        });
});

const closeRegisterButton = document.getElementById("close-register");
closeRegisterButton.addEventListener("click", () => {
    closeModal(registerContainer);
});

registerContainer.addEventListener("click", (e) => {
    if (e.target === registerContainer) {
        closeModal(registerContainer);
    }
});

// Logout
const logoutLink = document.getElementById("logout-link");
if (logoutLink) {
    logoutLink.addEventListener("click", () => {
        fetch("/logout", {
            method: "GET",
        })
            .then((response) => {
                if (response.headers.get("content-type")?.includes("application/json")) {
                    return response.json();
                } else {
                    throw new Error("Invalid JSON response (HTML received instead)");
                }
            })
            .then((result) => {
                showToast(result.message, result.status);
                if (result.status === "success") {
                    setTimeout(() => location.reload(), 1000);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                showToast("For a time we can not complete this request. Please try again later.", "error");
            });
    });
}

// Products
getProducts("Fresh_Produce");
// ...existing code...

function hideProductSkeletons() {
    const area = document.getElementById("dispalyproducts");
    area.innerHTML = "";
}

function getProducts(category) {
    showProductSkeletons();
    fetch("/index/GetProducts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ category: category }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "error") {
                hideProductSkeletons();
                showToast(data.message, "error");
                return;
            }
            const products = data.products;
            document.getElementById("selectedproductsname").innerHTML = category.replace(/_/g, " ");
            const displayArea = document.getElementById("dispalyproducts");
            displayArea.innerHTML = "";
            products.forEach((product) => {
                productData[product.product_name] = product;
                const productDiv = document.createElement("div");
                productDiv.className = "product-item";
                productDiv.innerHTML = `
                 <img id="product-image" src="${product.image}" alt="${product.product_name}">
                 <h3>${product.product_name}</h3>
                 <p>${product.description}</p>
                 <p>Price per 1/2Kg: ₹${product.price}</p>
                 <div class="quantity-controls">
                     <button class="decrement" onclick="updateQuantity('${product.product_name}', -1)">-</button>
                     <span class="quantity-product" id="quantity-${product.product_name}">0</span>
                     <button class="increment" onclick="updateQuantity('${product.product_name}', 1)">+</button>
                 </div>
             `;
                displayArea.appendChild(productDiv);
            });
        })
        .catch((error) => {
            hideProductSkeletons();
            showToast("Failed to load products. Please try again later.", "error");
            console.error("Error fetching products:", error);
        });
}

// ...existing code...

const quantities = {};
const productData = {};

function updateQuantity(productName, change) {
    const span = document.getElementById(`quantity-${productName}`);
    let quantity = parseInt(span.textContent);
    quantity = Math.max(0, quantity + change);
    span.textContent = quantity;
}

window.updateQuantity = function (productName, change) {
    if (!quantities[productName]) {
        quantities[productName] = 0;
    }
    quantities[productName] = Math.max(0, quantities[productName] + change);
    document.getElementById(`quantity-${productName}`).innerText = quantities[productName];
    updateCartNumber();
    if (change > 0) {
        showToast(`${productName} added to cart`, "success");
    } else if (change < 0 && quantities[productName] === 0) {
        showToast(`${productName} removed from cart`, "error");
    }
};

function updateCartNumber() {
    const totalQuantity = Object.values(quantities).reduce((total, qty) => total + qty, 0);
    document.getElementById("Cartnumber").innerText = totalQuantity;
    document.getElementById('total-orders').textContent = totalQuantity;
}

function searchProducts() {
    const query = document.getElementById("searchBox").value.trim().toLowerCase();

    fetch("/index/SearchProducts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ query: query })
    })
        .then(response => response.json())
        .then(data => {
            const products = data;
            const container = document.getElementById("dispalyproducts");
            container.innerHTML = "";

            if (products.length === 0) {
                container.innerHTML = "<div style='color:red; align:center; text-align:center;'>No products found.</div>";
            } else {
                products.forEach(product => {
                    const div = document.createElement("div");
                    div.className = "product-item";
                    div.innerHTML = `
                     <img id="product-image" src="${product.image}" alt="${product.product_name}">
                     <h3>${product.product_name}</h3>
                     <p>${product.description}</p>
                     <p>Price per 1/2Kg: ₹${product.price}</p>
                     <div class="quantity-controls">
                         <button class="decrement" onclick="updateQuantity('${product.product_name}', -1)">-</button>
                         <span class="quantity-product" id="quantity-${product.product_name}">0</span>
                         <button class="increment" onclick="updateQuantity('${product.product_name}', 1)">+</button>
                     </div>`;
                    container.appendChild(div);
                });
            }
        })
        .catch(error => {
            console.error("Search error:", error);
        });
}

// Cart Modal
const cartButton = document.getElementById("cart");
const cartbutton = document.getElementById("cart-summary-link");
const cartModal = document.getElementById("cart-modal");
const closeCartButton = document.getElementById("close-cart");
const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout");

function toggleCartModal() {
    if (cartModal.classList.contains("show")) {
        closeModal(cartModal);
    } else {
        openModal(cartModal);
        displayCartItems();
    }
}

cartButton.addEventListener("click", toggleCartModal);
cartbutton.addEventListener("click", toggleCartModal);

function toggleCartSummary() {
    const cartsymbol = document.querySelector(".cart-summary");
    if (cartsymbol) {
        cartsymbol.style.display = window.innerWidth <= 768 ? "block" : "none";
    }
}

window.addEventListener("resize", toggleCartSummary);

function displayCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

    Object.keys(quantities).forEach((productName) => {
        if (quantities[productName] > 0) {
            const product = productData[productName];
            if (product) {
                const price = product.price * quantities[productName];
                totalPrice += price;

                cartItemsContainer.innerHTML += `
                     <div class='cart-item'>
                         <img src="${product.image}" width="80" height="80">
                         <span>${productName} - ${quantities[productName]} x ₹${product.price} = ₹${price}</span>
                     </div>
                 `;
            }
        }
    });
    totalPriceElement.innerText = totalPrice;
}

closeCartButton.addEventListener("click", () => {
    closeModal(cartModal);
});

cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
        closeModal(cartModal);
    }
});

clearCartButton.addEventListener("click", () => {
    Object.keys(quantities).forEach((productName) => {
        quantities[productName] = 0;
    });
    updateCartNumber();
    displayCartItems();
    showToast("Cart cleared successfully!", "success");
});

// Checkout Modal
const radios = document.querySelectorAll("#credit-card, #cash-on-delivery, #net-banking, #upi");
radios.forEach((radio) => {
    radio.disabled = false;
    radio.style.display = "inline-block";
});

const checkoutModal = document.getElementById("checkout-modal");
const closeCheckoutButton = document.getElementById("close-checkout");
const confirmOrderButton = document.getElementById("confirm-order");

checkoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/index/loginornot");
        const data = await response.json();

        if (data.status === "error" && data.message === "User is not logged in.") {
            showToast("Please login to proceed with checkout.", "error");
            closeModal(cartModal);
            openModal(loginContainer);
            return;
        }

        if (Object.values(quantities).some((quantity) => quantity > 0)) {
            openModal(checkoutModal);
        } else {
            showToast("Your cart is empty. Add items to proceed.", "error");
        }

    } catch (err) {
        console.error(err);
        showToast("Something went wrong. Please try again later.", "error");
    }
});

closeCheckoutButton.addEventListener("click", () => {
    closeModal(checkoutModal);
});

checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) {
        closeModal(checkoutModal);
    }
});

confirmOrderButton.addEventListener("click", () => {
    const address = document.getElementById("address").value.trim();
    const phoneNumber = document.getElementById("phone-number").value;
    const pincode = document.getElementById("pincode1").value.trim();
    const paymentOptionElement = document.querySelector('input[name="payment"]:checked');
    const paymentOption = paymentOptionElement ? paymentOptionElement.value : null;

    if (address === "") {
        showToast("Please enter your address.", "error");
        return;
    }
    if (phoneNumber === "") {
        showToast("Please enter your phone number.", "error");
        return;
    }
    if (phoneNumber.length != 10) {
        showToast("Please enter a valid phone number.", "error");
        return;
    }
    if (isNaN(phoneNumber)) {
        showToast("Please enter a valid phone number.", "error");
        return;
    }
    if (pincode === "") {
        showToast("Please enter your pincode.", "error");
        return;
    }
    if (!paymentOption) {
        showToast("Please select a payment option.", "error");
        return;
    }

    const orderDetails = {
        address: address,
        phone_number: phoneNumber,
        pincode: pincode,
        paymentOption: paymentOption,
        items: quantities,
        totalPrice: parseFloat(document.getElementById("total-price").innerText.replace("₹", "")),
    };

    fetch("/index/placeorder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
    })
        .then((response) => response.json())
        .then((data) => {
            const placeOrder = data;
            showToast(placeOrder.message, placeOrder.status);
            if (placeOrder.status === "success") {
                Object.keys(quantities).forEach((productName) => {
                    quantities[productName] = 0;
                });
                updateCartNumber();
                displayCartItems();
                closeModal(checkoutModal);
                closeModal(cartModal);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            showToast("For a time we can not complete this request. Please try again later.", "error");
        });
});

// Contact Modal
const contactLink = document.getElementById("contact-link");
const contactSection = document.getElementById("contact-section");
const closeContactSectionBtn = document.getElementById("close-contact-section");
const showFormBtn = document.getElementById("show-contact-form");
const formContainer = document.getElementById("complaint-form-container");
const closeFormBtn = document.getElementById("close-contact");
const form = document.getElementById("contact-form");
const loadingIcon = document.getElementById("loading-icon3");

contactLink?.addEventListener("click", () => {
    if (contactSection.classList.contains("show")) {
        closeModal(contactSection);
    } else {
        openModal(contactSection);
    }
});

closeContactSectionBtn.addEventListener("click", () => {
    closeModal(contactSection);
});

contactSection.addEventListener("click", (e) => {
    if (e.target === contactSection) {
        closeModal(contactSection);
    }
});

showFormBtn.addEventListener("click", () => {
    formContainer.style.display = "block";
});

closeFormBtn.addEventListener("click", () => {
    formContainer.style.display = "none";
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loadingIcon.style.display = "inline-block";

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("message").value.trim();
    const orderid = document.getElementById("orderid").value.trim();

    const response = await fetch('/index/submitComplaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, orderid })
    });
    const data = await response.json();
    loadingIcon.style.display = "none";
    showToast(data.message, data.status);
    if (data.status === "success") {
        form.reset();
        formContainer.style.display = "none";
    }
});

// Order Modal
const orderLink = document.getElementById("orders-link");
const orderSection = document.getElementById("order-section");
const orderList = document.getElementById("order-list");
const cancelOrderModal = document.getElementById("cancel-order-modal");
const cancelOrderForm = document.getElementById("cancel-order-form");
const closeCancelModal = document.getElementById("close-cancel-modal");
let currentOrderIdToCancel = null;

if (orderLink) {
    orderLink.addEventListener("click", async () => {
        try {
            const response = await fetch("/index/loginornot");
            const data = await response.json();

            if (data.status === "error" && data.message === "User is not logged in.") {
                showToast("Please login to see your orders.", "error");
                openModal(loginContainer);
                return;
            }
        } catch (err) {
            console.error(err);
            showToast("Something went wrong. Please try again later.", "error");
        }

        fetch("/index/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((data) => {
                const result = data.orders;
                orderList.innerHTML = "";
                result.reverse().forEach((order) => {
                    const orderDiv = document.createElement("div");
                    orderDiv.className = "order-item order-animated";

                    const canCancel = order.status === "Pending" || order.status === "Packing";
                    const cancelButtonHtml = order.status !== "Order Completed" && order.status !== "Out for Deliverys" 
                        ? `<button class="cancel-order-btn" data-order-id="${order._id}" ${!canCancel ? 'disabled' : ''}>
                            ${canCancel ? 'Cancel Order' : 'Cannot Cancel'}
                           </button>`
                        : '';

                    orderDiv.innerHTML = `
                <h3>Order ID: ${order._id}</h3>
                <p>Date: ${new Date(order.orderDate).toLocaleString()}</p>
                <p>User Name: ${order.username}</p>
                <p>Email : ${order.email}</p>
                <p>Status: ${order.status}</p>
                <p>Total Price: ₹${order.totalPrice}</p>
                <p>Phone Number: ${order.phone_number}</p>
                <p>Address: ${order.address}</p>
                <p>Pincode: ${order.pincode}</p>
                <p>Payment Option: ${order.paymentOption}</p>
                ${order.cancelReason ? `<p><strong>Cancel Reason:</strong> ${order.cancelReason}</p>` : ''}
                <div class="order-items">
                    ${order.items
                            ? Object.keys(order.items)
                                .map((productName) => `
                                    <div class="order-item-detail">
                                        <span>${productName} - ${order.items[productName]} x ₹${productData[productName]?.price || "N/A"}</span>
                                    </div>
                                `).join("")
                            : ""
                        }
                </div>
                ${cancelButtonHtml}
            `;
                    orderList.appendChild(orderDiv);
                });

                if (result.length === 0) {
                    const noOrdersDiv = document.createElement("div");
                    noOrdersDiv.className = "order-item";
                    noOrdersDiv.innerHTML = "<p>You have no orders yet.</p>";
                    orderList.appendChild(noOrdersDiv);
                }

                if (orderSection.classList.contains("show")) {
                    closeModal(orderSection);
                } else {
                    openModal(orderSection);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                showToast("An error occurred while fetching orders.", "error");
            });

        const closeOrdersButton = document.getElementById("close-orders");
        if (closeOrdersButton) {
            closeOrdersButton.addEventListener("click", () => {
                closeModal(orderSection);
            });
        }

        orderSection.addEventListener("click", (e) => {
            if (e.target === orderSection) {
                closeModal(orderSection);
            }
        });
    });
}

// Cancel Order Modal
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("cancel-order-btn") && !e.target.disabled) {
        currentOrderIdToCancel = e.target.getAttribute("data-order-id");
        openModal(cancelOrderModal);
    }
});

closeCancelModal.addEventListener("click", () => {
    closeModal(cancelOrderModal);
    document.getElementById("cancel-reason").value = "";
    currentOrderIdToCancel = null;
});

cancelOrderModal.addEventListener("click", (e) => {
    if (e.target === cancelOrderModal) {
        closeModal(cancelOrderModal);
        document.getElementById("cancel-reason").value = "";
        currentOrderIdToCancel = null;
    }
});

cancelOrderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cancelReason = document.getElementById("cancel-reason").value.trim();

    if (!cancelReason) {
        showToast("Please provide a cancellation reason.", "error");
        return;
    }

    if (!currentOrderIdToCancel) {
        showToast("No order selected for cancellation.", "error");
        return;
    }

    try {
        const response = await fetch("/index/cancel_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderId: currentOrderIdToCancel,
                cancelReason: cancelReason
            }),
        });

        const data = await response.json();

        if (data.status === "success") {
            showToast("Order cancelled successfully!", "success");
            closeModal(cancelOrderModal);
            document.getElementById("cancel-reason").value = "";
            currentOrderIdToCancel = null;
            document.getElementById("orders-link").click();
        } else {
            showToast(data.message || "Failed to cancel order.", "error");
        }
    } catch (error) {
        console.error("Error cancelling order:", error);
        showToast("An error occurred while cancelling the order.", "error");
    }
});

const container = document.getElementById("selectedProducts");
const header = document.getElementById("selectedproductsname");
const searchbox = document.getElementById("searchBox");

container.addEventListener("scroll", () => {
    if (container.scrollTop > 0) {
        header.classList.add("blurred");
        searchbox.classList.add("blurred");
    } else {
        header.classList.remove("blurred");
        searchbox.classList.add("blurred");
    }
});

function showProductSkeletons() {
    const area = document.getElementById("dispalyproducts");
    area.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        area.innerHTML += `
      <div class="product-skeleton">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton" style="width:70%;height:22px;margin:8px 0"></div>
        <div class="skeleton" style="width:40%;height:16px;"></div>
      </div>
    `;
    }
}