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
    // Optionally, disable all forms and buttons
    document.querySelectorAll("input, button, select, textarea, a").forEach(el => {
        el.disabled = true;
        el.style.pointerEvents = "none";
    });
}
function hideOfflineOverlay() {
    const overlay = document.getElementById("offline-overlay");
    if (overlay) overlay.style.display = "none";
    // Re-enable all forms and buttons
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
window.addEventListener('online',  checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);
// On page load
document.addEventListener("DOMContentLoaded", checkOnlineStatus);





// Toast functionality
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    toastMessage.innerText = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}
// Add User Modal functionality
const adduser = document.getElementById("adduser");
document.getElementById("adduserbutton").addEventListener("click", (event) => {
    event.preventDefault();
    adduser.style.display = "block";
    setTimeout(() => {
        adduser.style.opacity = "1";
        adduser.style.transform = "translate(-50%, -50%) scale(1)";
        adduser.classList.add("show");
    }, 10);
});
document.getElementById("close-adduser").addEventListener("click", () => {
        for (let key in fields) fields[key].style.display = "none";
    adduser.style.opacity = "0";
    adduser.style.transform = "translate(-50%, -50%) scale(0.9)";
    setTimeout(() => {
        adduser.style.display = "none";
    }, 300);
});
// Role selection functionality
const roleSelect = document.getElementById("addrole");
const fields = {
    pincode: document.getElementById("pincode-group"),
    customer: document.getElementById("customer-group"),
    distributor: document.getElementById("distributor-group"),
    adminpin: document.getElementById("admin-pin"),
    admin: document.getElementById("admin-group"),
    email: document.getElementById("email-group"),
    password: document.getElementById("password-group"),
};
const submit = document.getElementById("submit");

document.addEventListener("DOMContentLoaded", function () {
    submit.style.display = "none";

    roleSelect.addEventListener("change", function () {
        const role = roleSelect.value;
        submit.style.display = "none";
        for (let key in fields) fields[key].style.display = "none";

        if (role === "distributor") {
            fields.pincode.style.display = "block";
            fields.distributor.style.display = "block";
            fields.email.style.display = "block";
            fields.password.style.display = "block";
            submit.style.display = "block";
        } else if (role === "admin") {
            fields.adminpin.style.display = "block";
        } else if (role === "customer") {
            fields.customer.style.display = "block";
            fields.email.style.display = "block";
            fields.password.style.display = "block";
            submit.style.display = "block";
        }
    });
});

document.getElementById("verify-admin-pin").addEventListener("click", async () => {
    const pinInput = document.getElementById("adminpininput");
    const pin = pinInput.value.trim();
    const loadingIcon = document.getElementById("loading-icon");

    if (!pin) {
        showToast("Please enter the admin pin.", "error");
        return;
    }

    loadingIcon.style.display = "inline";

    try {
        const response = await fetch("/admin/verify_admin_pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin }),
        });

        const result = await response.json();
        loadingIcon.style.display = "none";

        if (result.success) {
            showToast("Admin pin verified successfully!");
            fields.adminpin.style.display = "none";
            pinInput.value = "";
            fields.admin.style.display = "block";
            fields.email.style.display = "block";
            fields.password.style.display = "block";
            submit.style.display = "block";
            roleSelect.value = "admin";
        } else {
            showToast(result.message || "Incorrect admin pin.", "error");
        }
    } catch (error) {
        loadingIcon.style.display = "none";
        showToast("Something went wrong. Try again.", "error");
        console.error("Admin pin verification failed:", error);
    }
});


// Add User functionality
function addUser(event) {
    const roleSelect = document.getElementById("addrole");
    const role = roleSelect.value;
    const username =
        (document.getElementById("distributorname")?.value?.trim()) ||
        (document.getElementById("customerusername")?.value?.trim()) ||
        (document.getElementById("admin")?.value?.trim()) ||
        "";
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value.trim();
    const distributorname = document.getElementById("distributorname")?.value || "";
    const fullname = document.getElementById("customerfullname")?.value || "";
    const pincode = document.getElementById("pincode")?.value || "";
    event.preventDefault();
    const userData = {
        role,
        username,
        email,
        password,
        distributorname,
        fullname,
        pincode
    };
    fetch("/admin/AddUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ userData })
    })
        .then(response => response.json())
        .then(result => {
            const res = result;
            showToast(res.message, res.success);
        })
        .catch(error => {
            console.error("Error adding user:", error);
            showToast("Error: " + error.message, false);
        });
    adduser.style.opacity = "0";
    adduser.style.transform = "translate(-50%, -50%) scale(0.9)";
    setTimeout(() => {
        adduser.style.display = "none";
    }, 300);
}
// Dashboard show/hide functionality
function showDashboard() {
    document.getElementById("dashboardstatistics").style.display = "block";
    document.getElementById("order-list").style.display = "none";
}
function hideDashboard() {
    document.getElementById("dashboardstatistics").style.display = "none";
    document.getElementById("order-list").style.display = "inline-flex";
}
// Show on initial page load
document.addEventListener("DOMContentLoaded", () => {
    showDashboard(); // default
});
// Hide dashboard when switching to users
document.getElementById("Users").addEventListener("click", function () {
    hideDashboard();
});
document.getElementById("Distributor").addEventListener("click", function () {
    hideDashboard();
});
document.getElementById("allorders").addEventListener("click", function () {
    hideDashboard();
});
document.getElementById("todayorders").addEventListener("click", function () {
    hideDashboard();
});
document.getElementById("complaints").addEventListener("click", function () {
    hideDashboard();
});
document.getElementById("Admin").addEventListener("click", function () {
    hideDashboard();
});
// Dashboard Stats functionality
document.addEventListener("DOMContentLoaded", () => {
    showDashboard();
    loadDashboardStats();
});

// User management functionality
let intervalId = null;
document.getElementById("Users").addEventListener("click", function () {
    if (intervalId) clearInterval(intervalId);
    getusers("customer");
});
document.getElementById("Distributor").addEventListener("click", function () {
    if (intervalId) clearInterval(intervalId);
    getusers("distributor");
});
// Admin pin functionality
document.addEventListener("DOMContentLoaded", function () {
    const adminButton = document.getElementById("Admin");
    const adminPinPopup = document.getElementById("adminpin");
    const adminPinForm = document.getElementById("adminpinform");
    const closeBtn = document.getElementById("close-adminpin");
    adminButton.addEventListener("click", function () {
        adminPinPopup.style.display = "block";
        setTimeout(() => {
            adminPinPopup.style.opacity = "1";
            adminPinPopup.style.transform = "translate(-50%, -50%) scale(1)";
            adminPinPopup.classList.add("show");
        }, 10);
    });
    adminPinForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const pin = document.getElementById("pin").value.trim();
        if (pin === "1234") {
            if (intervalId) clearInterval(intervalId);
            getusers("admin");
            document.getElementById("pin").value = "";
            adminPinPopup.style.display = "none";
        } else {
            alert("Incorrect pin");
        }
    });
    closeBtn.addEventListener("click", function () {
        closePopup();
    });
    function closePopup() {
        adminPinPopup.style.opacity = "0";
        adminPinPopup.style.transform = "translate(-50%, -50%) scale(0.8)";
        setTimeout(() => {
            adminPinPopup.style.display = "none";
            adminPinPopup.classList.remove("show");
            document.getElementById("pin").value = "";
        }, 300);
    }
});
// get users functionality
function getusers(role) {
    const List = document.getElementById("order-list");
    const formSearch = document.getElementById("formsearch");
    const titleElement = document.getElementById("h1");
    formSearch.style.display = "flex";

    const titleMap = {
        customer: "Customers",
        distributor: "Distributors",
        admin: "Admins"
    };
    titleElement.innerText = titleMap[role] || "Users";
    showProductSkeletons1()
    fetch("/admin/GetUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role }),
    })
        .then((response) => response.json())
        .then((data) => {
            const usersData = data.users || [];
            // ✅ Clear the list
            List.innerHTML = "";
            if (usersData.length === 0) {
                List.innerHTML = "<p>No users found.</p>";
                return;
            }
            List.style.flexWrap = "wrap";
            usersData.forEach((user) => {
                const usersContainer = document.createElement("div");
                usersContainer.className = "users-container";
                let extraField = "";
                let extraField1 = "";
                if (user.role === "customer") {
                    extraField = `
                        <div class="userdiv">
                            <strong>Full Name :</strong>
                            <h3 id="userfullname">${user.fullname || "N/A"}</h3>
                        </div>`;
                } else if (user.role === "distributor") {
                    extraField1 = `
                        <div class="userdiv">
                            <strong>Distributor Name:</strong>
                            <h3 id="userdistributorname">${user.distributorname || "N/A"}</h3>
                        </div>
                        <div class="userdiv">
                            <strong>Pincode :</strong>
                            <h3 id="userpincode">${user.pincode || "N/A"}</h3>
                        </div>`;
                }
                usersContainer.innerHTML = `
                    ${extraField}
                    ${extraField1}
                    <div class="userdiv"><strong>Username :</strong><h3 id="userusername">${user.username}</h3></div>
                    <div class="userdiv"><strong>Email :</strong><h3 id="useremail">${user.email}</h3></div>
                    <div class="userdiv"><strong>Role :</strong><h3>${user.role}</h3></div>
                    <div id="userbuttons">
                        <form class="edit-user-form" data-user-id="${user._id}">
                            <button type="submit" id="edit">Edit</button>
                        </form>
                        <form class="delete-user-form" data-user-id="${user._id}">
                            <button type="submit" id="delete">Delete</button>
                        </form>
                    </div>
                `;
                List.appendChild(usersContainer);
            });
        })
        .catch((error) => {
            console.error("Error fetching users:", error);
            List.innerHTML = "<p style='color:red; text-align:center; font-size:20px;'>Error loading users.</p>";
        });
}
// delete user functionality
document.addEventListener("submit", function (event) {
    event.preventDefault();
    if (event.target.classList.contains("delete-user-form")) {
        const form = event.target;
        const userId = form.getAttribute("data-user-id");
        const role = document.getElementById("h1").innerText.toLowerCase();
        let role1 = "";
        if (role === "admins") {
            role1 = "admin";
        } else if (role === "distributors") {
            role1 = "distributor";
        } else if (role === "customers") {
            role1 = "customer";
        }

        fetch("/admin/Deleteuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                showToast("user is deleted!", "success");
                getusers(role1);
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
                showToast("Failed to delete user.", "error");
            });
    }
});
// Search functionality
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search").addEventListener("input", function () {
        const searchTerm = this.value.trim().toLowerCase();
        // Search in users
        const users = document.querySelectorAll(".users-container");
        users.forEach((user) => {
            const fullName = user.querySelector("#userfullname")?.textContent.toLowerCase().trim() || "";
            const userName = user.querySelector("#userusername")?.textContent.toLowerCase().trim() || "";
            const email = user.querySelector("#useremail")?.textContent.toLowerCase().trim() || "";
            const distributorName = user.querySelector("#userdistributorname")?.textContent.toLowerCase().trim() || "";
            const pincode = user.querySelector("#userpincode")?.textContent.toLowerCase().trim() || "";
            user.style.display = fullName.includes(searchTerm) || userName.includes(searchTerm) || email.includes(searchTerm) || distributorName.includes(searchTerm) || pincode.includes(searchTerm) ? "block" : "none";
        });
        // Search in orders
        const orders = document.querySelectorAll(".order-container");
        orders.forEach((order) => {
            const orderId = order.querySelector(".order-header")?.textContent.toLowerCase().trim() || "";
            const orderDate = order.querySelector("#orderdata")?.textContent.toLowerCase().trim() || "";
            const orderUsername = order.querySelector("#orderusername")?.textContent.toLowerCase().trim() || "";
            const orderEmail = order.querySelector("#orderemail")?.textContent.toLowerCase().trim() || "";
            const orderPhone = order.querySelector("#orderphonenumber")?.textContent.toLowerCase().trim() || "";
            const orderPincode = order.querySelector("#orderpincode")?.textContent.toLowerCase().trim() || "";
            const orderStatus = order.querySelector("#orderstatus")?.textContent.toLowerCase().trim() || "";
            const orderContent = order.textContent.toLowerCase();
            order.style.display =
                orderId.includes(searchTerm) ||
                    orderDate.includes(searchTerm) ||
                    orderUsername.includes(searchTerm) ||
                    orderEmail.includes(searchTerm) ||
                    orderPhone.includes(searchTerm) ||
                    orderPincode.includes(searchTerm) ||
                    orderStatus.includes(searchTerm) ||
                    orderContent.includes(searchTerm)
                    ? "block"
                    : "none";
        });
    });
});
// Order management functionality
document.addEventListener("DOMContentLoaded", () => {
    username = document.getElementById("usernameforplaceorder").textContent.trim();
    if (username == "") {
        window.location.href = "index.aspx";
    }
    document.getElementById("allorders").addEventListener("click", () => {
        if (intervalId) clearInterval(intervalId);
        fetchOrders();
        intervalId = setInterval(fetchOrders, 60000);
    });
    document.getElementById("todayorders").addEventListener("click", () => {
        if (intervalId) clearInterval(intervalId);
        todayorders();
        intervalId = setInterval(todayorders, 60000);
    });
    let lastOrderCount = 0;
 //all orders functionality
   function fetchOrders() {
            showProductSkeletons()
        fetch("/admin/get_orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // still sending an empty body
        })
            .then((response) => response.json())
            .then((data) => {
                const orders = data.orders || [];
                const orderList = document.getElementById("order-list");
                orderList.innerHTML = "";
                let currentOrderCount = 0;
                document.getElementById("formsearch").style.display = "inline-flex";
                const heading = document.getElementById("h1");
                heading.textContent = "Orders";
                orderList.style.flexWrap = "";
                if (orders.length === 0) {
                    orderList.innerHTML = "<p style='color:red; text-align:center;'>No Orders found.</p>";
                    return;
                }
                orders.reverse().forEach((order) => {
                    currentOrderCount++;
                    const orderContainer = document.createElement("div");
                    orderContainer.className = "order-container";
                    orderContainer.innerHTML = `
                <div class="order-header">Order ID: ${order._id}</div>
                <div class="order-details">
                    <div class="order-detail"><strong>Date:</strong> ${order.orderDate}</div>
                    <div class="order-detail"><strong>Username:</strong> ${order.username}</div>
                    <div class="order-detail"><strong>Email:</strong> ${order.email}</div>
                    <div class="order-detail"><strong>Phone:</strong> ${order.phone_number}</div>
                    <div class="order-detail"><strong>Products:</strong> <p>${order.items
                            ? Object.keys(order.items)
                                .map((item) => `${item} (${order.items[item]})`)
                                .join(", ")
                            : ""}</p></div>
                    <div class="order-detail"><strong>Price:</strong> ${order.totalPrice}₹</div>
                    <div class="order-detail"><strong>Address:</strong> ${order.address}</div>
                    <div class="order-detail"><strong>Pincode:</strong> ${order.pincode}</div>
                    <div class="order-detail"><strong>Status:</strong> ${order.status}</div>
                </div>
                <div class="order-actions">
                    <form class="update-status-form" data-order-id="${order._id}">
                        <select name="status">
                            <option value="Packing" ${order.status === "Packing" ? "selected" : ""}>Packing</option>
                            <option value="Out for Delivery" ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
                            <option value="Order Completed" ${order.status === "Order Completed" ? "selected" : ""}>Order Completed</option>
                        </select>
                        <button type="submit" id="update">Update</button>
                    </form>
                    <form class="delete-order-form" data-order-id="${order._id}">
                        <button type="submit" id="delete">Delete</button>
                    </form>
                </div>
            `;
                    setTimeout(() => {
                        orderContainer.classList.add("fade-in");
                    }, currentOrderCount * 100);
                    orderList.appendChild(orderContainer);
                });
                document.getElementById("totalorder").textContent = currentOrderCount;
                if (currentOrderCount > lastOrderCount) {
                    showToast("New order received!", "success");
                }
                lastOrderCount = currentOrderCount;
            })
            .catch((error) => {
                console.error("Error fetching orders:", error);
                showToast("Failed to fetch orders.", "error");
            });
    }
    // todayorders functionality
    function todayorders() {
            showProductSkeletons()
        fetch("/admin/TodayOrders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((data) => {
                const todayStr = new Date().toISOString().split("T")[0];
                const ordersData = data.orders || [];
                const orderList = document.getElementById("order-list");
                orderList.innerHTML = "";
                // ✅ Correct filter: no "orders.orders"
                const todayOrders = ordersData.filter((order) => {
                    return order.orderDate && order.orderDate.startsWith(todayStr);
                });
                let currentOrderCount = 0;
                const heading = document.getElementById("h1");
                heading.textContent = "Orders";
                orderList.style.flexWrap = "";
                if (todayOrders.length === 0) {
                    orderList.innerHTML = "<p style='color:red; text-align:center;'>No Orders found.</p>";
                    return;
                }
                document.getElementById("formsearch").style.display = "inline-flex";
                todayOrders.reverse().forEach((order) => {
                    currentOrderCount++;
                    const orderContainer = document.createElement("div");
                    orderContainer.className = "order-container";
                    orderContainer.innerHTML = `
                <div class="order-header">Order ID: ${order._id}</div>
                <div class="order-details">
                    <div class="order-detail"><strong>Date:</strong><p>${order.orderDate}</p></div>
                    <div class="order-detail"><strong>Username:</strong><p>${order.username}</p></div>
                    <div class="order-detail"><strong>Email:</strong><p>${order.email}</p></div>
                    <div class="order-detail"><strong>Phone:</strong><p>${order.phone_number}</p></div>
                    <div class="order-detail"><strong>Products:</strong><p>${order.items
                            ? Object.entries(order.items)
                                .map(([item, qty]) => `${item} (${qty})`)
                                .join(", ")
                            : ""
                        }</p></div>
                    <div class="order-detail"><strong>Price:</strong><p>${order.totalPrice} ₹</p></div>
                    <div class="order-detail"><strong>Address:</strong><p>${order.address}</p></div>
                    <div class="order-detail"><strong>Pincode:</strong><p>${order.pincode}</p></div>
                    <div class="order-detail"><strong>Status:</strong><p>${order.status}</p></div>
                </div>
                <div class="order-actions">
                    <form class="update-status-form" data-order-id="${order._id}">
                        <select name="status">
                            <option value="Packing" ${order.status === "Packing" ? "selected" : ""}>Packing</option>
                            <option value="Out for Delivery" ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
                            <option value="Order Completed" ${order.status === "Order Completed" ? "selected" : ""}>Order Completed</option>
                        </select>
                        <button type="submit">Update</button>
                    </form>
                    <form class="delete-order-form" data-order-id="${order._id}">
                        <button type="submit">Delete</button>
                    </form>
                </div>
            `;
                    setTimeout(() => {
                        orderContainer.classList.add("fade-in");
                    }, currentOrderCount * 100);
                    orderList.appendChild(orderContainer);
                });
                document.getElementById("totalorder").textContent = currentOrderCount;
                if (typeof lastOrderCount !== "undefined" && currentOrderCount > lastOrderCount) {
                    showToast("New order received!", "success");
                }
                lastOrderCount = currentOrderCount;
            })
            .catch((error) => {
                console.error("Error fetching orders:", error);
                showToast("Failed to fetch orders.", "error");
            });
    }
    //update order status and delete order functionality
    document.addEventListener("submit", function (event) {
        event.preventDefault();
        if (event.target.classList.contains("update-status-form")) {
            const form = event.target;
            const orderId = form.getAttribute("data-order-id");
            const status = form.querySelector('select[name="status"]').value;
            fetch("/admin/UpdateOrderStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderId,
                    status: status,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    showToast("Order status updated!", "success");
                    fetchOrders();
                })
                .catch((error) => {
                    console.error("Error updating order status:", error);
                    showToast("Failed to update order status.", "error");
                });
        }
        if (event.target.classList.contains("delete-order-form")) {
            const form = event.target;
            const orderId = form.getAttribute("data-order-id");
            fetch("/admin/DeleteOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderId,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    showToast("Order deleted!", "success");
                    fetchOrders();
                })
                .catch((error) => {
                    console.error("Error deleting order:", error);
                    showToast("Failed to delete order.", "error");
                });
        }
    });
});
// Logout functionality
document.getElementById("logout-link").addEventListener("click", function () {
    fetch("/logout", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((result) => {
            const res = result;
            if (res.status === "success") {
                window.location.href = "/";
            } else {
                alert(res.message);
            }
        })
        .catch((error) => {
            console.error("Logout error:", error);
            alert("Logout failed. Please try again.");
        });
});
// get complaints functionality
  const complaintsButton = document.getElementById("complaints");
    const complaintList = document.getElementById("order-list");
    complaintsButton.addEventListener("click", async () => {
        complaintList.innerHTML = ""; // Clear list before adding new content
    showProductSkeletons1()

        try {
            const response = await fetch("/admin/get_complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            if (data.status !== "success") {
                showToast("Failed to fetch complaints: " + (data.message || ""), "error");
                return;
            }
            document.getElementById("order-list").innerHTML = "";
            const complaints = data.complaints || [];
            // Add heading
            const heading = document.getElementById("h1");
            heading.textContent = "Complaints";
            document.getElementById("formsearch").style.display = "inline-flex";
            complaintList.style.flexWrap = "wrap";
            if (!complaints || complaints.length === 0) {
                complaintList.innerHTML = "<p style='color:red; text-align:center;'>No complaints found.</p>";
                return;
            }
            complaints.forEach((complaint) => {
                const item = document.createElement("div");
                item.className = "complaint-item";
                item.innerHTML = `
                    <div class="complaint-header"><strong>Complaint ID:</strong> ${complaint._id}</div>
                    <div class="complaint-details">
                        <div><strong>Date:</strong> ${complaint.submittedAt || "N/A"}</div>
                        <div><strong>Name:</strong> ${complaint.name || "N/A"}</div>
                        <div><strong>Username:</strong> ${complaint.username || "N/A"}</div>
                        <div><strong>Email:</strong> ${complaint.email || "N/A"}</div>
                        <div><strong>Phone:</strong> ${complaint.phone_number || "N/A"}</div>
                        <div><strong>Message:</strong> ${complaint.message || "N/A"}</div>
                    </div>
                `;
                complaintList.appendChild(item);
            });
        } catch (error) {
            console.error("Error fetching complaints:", error);
            showToast("An error occurred while fetching complaints.", "error");
        }
    });

function loadDashboardStats() {
    fetch("/admin/GetDashboardStats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then((res) => res.json())
    .then((response) => {
        const data = response.data || {};
        document.getElementById("total-users").textContent = data.total_users || 0;
        document.getElementById("customer-count").textContent = data.customer_count || 0;
        document.getElementById("distributor-count").textContent = data.distributor_count || 0;
        document.getElementById("total-orders").textContent = data.total_orders || 0;
        document.getElementById("total-revenue").textContent = parseFloat(data.total_revenue || 0).toFixed(2);
        document.getElementById("total-complaints").textContent = data.totalcomplaints || 0;
        document.getElementById("today-orders").textContent = data.today_orders || 0;

        const statusDiv = document.getElementById("order-status-counts");
        statusDiv.innerHTML = "<h4>Orders by Status:</h4>";
        if (data.ordersByStatus) {
            for (const [status, count] of Object.entries(data.ordersByStatus)) {
                const p = document.createElement("p");
                p.textContent = `${status}: ${count}`;
                statusDiv.appendChild(p);
            }
        } else {
            statusDiv.innerHTML += "<p>No order status data found.</p>";
        }
    })
    .catch((err) => console.error("Dashboard stats error:", err));
}
setInterval(loadDashboardStats, 1 * 60 * 1000);
window.addEventListener("DOMContentLoaded", loadDashboardStats);

const orderList = document.getElementById("order-list");

// Buttons that should display orders in a column
["allorders", "todayorders"].forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        orderList.style.flexDirection = "column";
        orderList.style.justifyContent = "flex-start";
    });
});

// Buttons that should display content in a row and center it
["Users", "Distributor", "Admins"].forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        orderList.style.flexDirection = "row";
        orderList.style.justifyContent = "center";
    });
});




function showProductSkeletons() {
    const area = document.getElementById("order-list");
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
function showProductSkeletons1() {
    const area = document.getElementById("order-list");
    area.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        area.innerHTML += `
      <div class="product-skeleton1">
        <div class="skeleton1 skeleton-img1"></div>
        <div class="skeleton1" style="width:70%;height:22px;margin:8px 0"></div>
        <div class="skeleton1" style="width:40%;height:16px;"></div>
      </div>
    `;
    }
}