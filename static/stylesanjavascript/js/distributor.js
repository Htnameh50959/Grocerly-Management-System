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
window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);
// On page load
document.addEventListener("DOMContentLoaded", checkOnlineStatus);



document.addEventListener("DOMContentLoaded", () => {
    username = document.getElementById("usernameforplaceorder").textContent.trim();
    if (username == "") {
        window.location.href = "/";
    } else {
        todayorders();
    }
    let intervalId = null;
    document.getElementById("allorders").addEventListener("click", () => {
        fetchOrders();
    });
    document.getElementById("todayorders").addEventListener("click", () => {
        if (intervalId) clearInterval(intervalId);
        todayorders();
        intervalId = setInterval(todayorders, 60000);
    });
    let lastOrderCount = 0;
    function fetchOrders() {
        showProductSkeletons();
        fetch("/distributor/get_orders", {
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
    function todayorders() {
        showProductSkeletons();
        fetch("/distributor/TodayOrders", {
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

                // Filter: Only today's and not completed
                const todayOrders = ordersData.filter((order) => {
                    return (
                        order.orderDate &&
                        order.orderDate.startsWith(todayStr) &&
                        order.status !== "Order Completed"
                    );
                });

                let currentOrderCount = 0;
                const heading = document.getElementById("h1");
                heading.textContent = "Orders";
                orderList.style.flexWrap = "";
                document.getElementById("formsearch").style.display = "inline-flex";

                if (todayOrders.length === 0) {
                    orderList.innerHTML = "<p style='color:red; text-align:center;'>No Orders found.</p>";
                    return;
                }

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

    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toast-message");
        toastMessage.innerText = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 5000);
    }
    // delete an update
    document.addEventListener("submit", function (event) {
        event.preventDefault();
        if (event.target.classList.contains("update-status-form")) {
            const form = event.target;
            const orderId = form.getAttribute("data-order-id");
            const status = form.querySelector('select[name="status"]').value;
            fetch("/distributor/update_order_status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId: orderId, status: status }),
            })
                .then((response) => response.json())
                .then((data) => {
                    showToast("Order status updated!", "success");

                })
                .catch((error) => {
                    console.error("Error updating order status:", error);
                    showToast("Failed to update order status.", "error");
                });
        }
        if (event.target.classList.contains("delete-order-form")) {
            const form = event.target;
            const orderId = form.getAttribute("data-order-id");
            fetch("/distributor/delete_order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId: orderId }),
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
                    showToast("Logout failed. Please try again.", "error");
                }
            })
            .catch((error) => {
                console.error("Logout error:", error);
                showToast("Logout failed. Please try again.", "error");
            });
    });


    // Complaints
    const complaintsButton = document.getElementById("complaints");
    const complaintList = document.getElementById("order-list");
    complaintsButton.addEventListener("click", async () => {
        complaintList.innerHTML = ""; // Clear list before adding new content
        showProductSkeletons1() 
        try {
            const response = await fetch("/distributor/get_complaints", {
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

            const complaints = data.complaints || [];
            const orderList = document.getElementById("order-list");
            orderList.innerHTML = "";

            // Add heading
            const heading = document.getElementById("h1");
            heading.textContent = "Complaints";
            document.getElementById("formsearch").style.display = "inline-flex";
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
});



// Search functionality
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search").addEventListener("input", function () {
        const searchTerm = this.value.trim().toLowerCase();

        // Search in complaints
        const complaints = document.querySelectorAll(".complaint-item");
        complaints.forEach((complaint) => {
            const complaintId = complaint.querySelector(".complaint-header")?.textContent.toLowerCase().trim() || "";
            const complaintDate = complaint.querySelector(".complaint-details div:nth-child(1)")?.textContent.toLowerCase().trim() || "";
            const complaintName = complaint.querySelector(".complaint-details div:nth-child(2)")?.textContent.toLowerCase().trim() || "";
            const complaintUsername = complaint.querySelector(".complaint-details div:nth-child(3)")?.textContent.toLowerCase().trim() || "";
            const complaintEmail = complaint.querySelector(".complaint-details div:nth-child(4)")?.textContent.toLowerCase().trim() || "";
            const complaintPhone = complaint.querySelector(".complaint-details div:nth-child(5)")?.textContent.toLowerCase().trim() || "";
            const complaintMessage = complaint.querySelector(".complaint-details div:nth-child(6)")?.textContent.toLowerCase().trim() || "";
            const complaintContent = complaint.textContent.toLowerCase();
            complaint.style.display =
                complaintId.includes(searchTerm) ||
                    complaintDate.includes(searchTerm) ||
                    complaintName.includes(searchTerm) ||
                    complaintUsername.includes(searchTerm) ||
                    complaintEmail.includes(searchTerm) ||
                    complaintPhone.includes(searchTerm) ||
                    complaintMessage.includes(searchTerm) ||
                    complaintContent.includes(searchTerm)
                    ? "block"
                    : "none";
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

document.addEventListener("DOMContentLoaded", () => {

    const orderList = document.getElementById("order-list");
    document.getElementById("complaints").addEventListener("click", function () {
        if (window.innerWidth <= 768) {
            orderList.style.flexWrap = "nowrap";
        }
        else {
            orderList.style.flexWrap = "wrap";
        }
    })
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
