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




function editmessage(product) {
    showToast("Going to Edit Products section!", "success");
    document.getElementById("search-message").innerText = "Going to edit Products section to edit the product.!";
    editProduct(product);
    setTimeout(() => {
        document.getElementById("allproducts").style.display = "none";
        document.getElementById("addproduct").style.display = "none";
        showSection(editProductSection);
        document.getElementById("search-message").innerText = "";
    }, 2000);
    document.getElementById("search-results-of-catagory").innerHTML = ""; // Clear previous search results
}

async function searchProductsByCategory() {
    const category = document.getElementById("selectcatagory1").value.trim();
    const loadingIcon = document.getElementById("loading-icon-category");
    const searchResults = document.getElementById("search-results-of-catagory");

    searchResults.innerHTML = "";
    loadingIcon.style.display = "block";

    try {
        const response = await fetch("/add_edit_product/searchProductsByCategory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: category })
        });

        const data = await response.json();
        loadingIcon.style.display = "none";

        if (!data.products || data.products.length === 0) {
            searchResults.innerHTML = "<h4 id='search-message'>No products found.</h4>";
            return;
        }

        data.products.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product");

            productDiv.innerHTML = `
                <img id="product-image" src="${product.image}" alt="${product.product_name}" />
                <h3>${product.product_name}</h3>
                <p>Price: ₹${product.price}</p>
                <p>Description: ${product.description}</p>
                <button class="edit-button" onclick='editmessage(${JSON.stringify(product)})'>Edit</button>
                <button onclick='deleteProduct(${JSON.stringify(product)})'>Delete</button>
            `;

            searchResults.appendChild(productDiv);
        });

        document.getElementById("selectcatagory1").value = ""; // Clear dropdown
    } catch (error) {
        loadingIcon.style.display = "none";
        showToast("Error fetching products: " + error.message, "error");
    }
}

async function deleteProduct(product) {
    const confirmation = confirm(`Are you sure you want to delete "${product.product_name}"?`);
    if (!confirmation) return;

    try {
        const response = await fetch("/add_edit_product/deleteProduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: product._id, category: product.category })
        });

        const result = await response.json();
        console.log(result);

        if (result.status == "success") {
            showToast("Product deleted successfully!", "success");
            searchProductsByCategory(); // Refresh list
        } else {
            showToast("Failed to delete product: " + result.message, "error");
            searchProductsByCategory(); // Refresh list

        }
    } catch (error) {
        showToast("Error deleting product: " + error.message, "error");
    }

}



//<!-- Editable Products -->


async function searchProducts() {
    const loadingIcon = document.getElementById("loading-icon-category");
    const searchTerm = document.getElementById("search").value.trim().toLowerCase();
    const searchResults = document.getElementById("search-results");


    searchResults.innerHTML = "";
    loadingIcon.style.display = "block";

    const response = await fetch("/add_edit_product/searchProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: searchTerm })
    })
    const data = await response.json();
    loadingIcon.style.display = "none";

    searchResults.innerHTML = "";
    data.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.innerHTML = `
        <img id="product-image" src="${product.image}" alt="${product.product_name}" />
                <h3>${product.product_name}</h3>
                <p>Price: ₹${product.price}</p>
                <p>Description: ${product.description}</p>
                <button class="edit-button" onclick='editProduct(${JSON.stringify(product)})'>Edit</button>
        `;
        searchResults.appendChild(productDiv);
    });

}


function editProduct(product) {
    const table = document.getElementById("search-results-table");
    const tbody = document.getElementById("search-results-body");

    const searchResults = document.getElementById("search-results");
    searchResults.innerHTML = "";

    table.style.display = "table";

    const row = document.createElement("tr");
    const column = document.createElement("th");
    const thead = document.getElementById("search-results-thead");

    if (window.innerWidth >= 768) {
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.product_name}" width="50" /></td>
            <td><input type="text" id="edit-name" value="${product.product_name}" /></td>
            <td><input type="number" id="edit-price" value="${product.price}" /></td>
            <td><input type="text" id="edit-description" value="${product.description}" /></td>
            <td>
                <button id="update-button" onclick="updateProduct('${product._id}')">Update</button>
                <button class="delete-btn">Delete</button>
            </td>`
            ;
        tbody.appendChild(row);
        row.querySelector(".delete-btn").addEventListener("click", function () {
            row.remove();
            showToast("Product removed.", "info");
        });
    } else {
        thead.innerHTML = ""; // Remove header
        tbody.innerHTML = `
        <tr><th>Image</th></tr>
            <tr><td><img src="${product.image}" alt="${product.product_name}" width="50" /></td></tr>
            <tr><th>Name</th></tr>
            <tr><td><input type="text" id="edit-name" value="${product.product_name}" /></td></tr>
            <tr><th>Price</th></tr>
            <tr><td><input type="number" id="edit-price" value="${product.price}" /></td></tr>
            <tr><th>Description</th></tr>
            <tr><td><input type="text" id="edit-description" value="${product.description}" /></td></tr>
            <tr><td>
                <button id="update-button" onclick="updateProduct('${product._id}')">Update</button>
                <button class="delete-btn" >Delete</button>
            </td></tr>
        `;

        // Attach delete button event
        const deleteBtn = tbody.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
            tbody.innerHTML = "";
            showToast("Product removed.", "info");
        });
    }
}

async function updateProduct(productId) {
    const updatedName = document.getElementById("edit-name").value.trim();
    const updatedPrice = parseFloat(document.getElementById("edit-price").value);
    const updatedDescription = document.getElementById("edit-description").value.trim();
    if (!updatedName || isNaN(updatedPrice) || updatedPrice <= 0 || !updatedDescription) {
        return showToast("Please fill all fields correctly.", "warning");
    }
    const uploadBtn = document.getElementById("update-button");
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Updating...";
    uploadBtn.classList.add("uploading");

    const response = await fetch("/add_edit_product/updateProduct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            _id: productId,
            product_name: updatedName,
            price: updatedPrice,
            description: updatedDescription
        })
    });

    const result = await response.json();
    if (result.success) {
        showToast("Product updated successfully!", "success");
        uploadBtn.textContent = "✓ Updated";
        uploadBtn.classList.remove("uploading");
        uploadBtn.classList.add("uploaded");
        setInterval(() => {
        }, 3000);
    } else {
        showToast("Failed to update product: " + result.message, "error");
    }
}

//   <!--addproduct-->

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById("addproductform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value;
    const imageFile = document.getElementById("image").files[0];

    // Validate inputs
    if (!name || !category || !description || !price) {
        return showToast("All fields are required.", "warning");
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
        return showToast("Please enter a valid price.", "warning");
    }

    let base64Image = "";
    if (imageFile) {
        try {
            base64Image = await getBase64(imageFile);
        } catch (error) {
            console.error("Image conversion error:", error);
            return showToast("Error processing image.", "error");
        }
    }

    const product = {
        name,
        description,
        category,
        price: parseFloat(price).toFixed(2),
        image: base64Image
    };

    addProductToTable(product);
    document.getElementById("addproductform").reset();
    document.getElementById("addproductform").style.display = "none";
    showToast("Product added. Click Upload to save.", "success");
});

function addProductToTable(product) {
    const tbody = document.getElementById("productTableBody");
    const tr = document.createElement("tr");
    tr.dataset.productName = encodeURIComponent(product.name);

    tr.innerHTML = `
            <td>${product.image ? `<img src="${product.image}" class="product-image" />` : 'No Image'}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.description}</td>
            <td>₹${product.price}</td>
            <td>
                <button class="upload-btn">Upload</button>
                <button class="delete-btn">Delete</button>
            </td>`;

    tbody.appendChild(tr);

    tr.querySelector(".upload-btn").addEventListener("click", function () {
        uploadToServer(product, this);
    });

    tr.querySelector(".delete-btn").addEventListener("click", function () {
        tr.remove();
        showToast("Product removed.", "info");
    });
}

async function uploadToServer(product, button) {
    button.disabled = true;
    button.textContent = "Uploading...";
    button.classList.add("uploading");

    const requestData = {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        image: product.image || null
    };

    try {
        const response = await fetch("/AddProduct", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productData: requestData })
        });

        const data = await response.json();

        if (data.success) {
            button.textContent = "✓ Uploaded";
            button.classList.remove("uploading");
            button.classList.add("uploaded");
            showToast(data.message, "success");
        } else {
            throw new Error(data.message || "Unknown error occurred");
        }
    } catch (err) {
        console.error("Upload Error:", err);
        button.textContent = "Upload";
        button.disabled = false;
        button.classList.remove("uploading");
        showToast("Upload failed: " + err.message, "error");
    }
}

//  <!--toast  -->

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    toastMessage.innerText = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = toast.className.replace("show", ""), 5000);
}


//  <!-- Add/Edit Product Button Click with toggle -->
const addProductBtn = document.getElementById("add-products");
const editProductBtn = document.getElementById("edit-products");
const allProductsBtn = document.getElementById("all-products");

const addProductSection = document.getElementById("addproduct");
const editProductSection = document.getElementById("editproduct");
const allProductsSection = document.getElementById("allproducts");

let currentlyVisibleSection = null;


function showSection(sectionToShow) {
    if (currentlyVisibleSection === sectionToShow) {
        // Toggle off if already shown
        sectionToShow.classList.remove("show");
        sectionToShow.style.display = "none";
        currentlyVisibleSection = null;
    } else {
        // Hide all and show the selected section
        [addProductSection, editProductSection, allProductsSection].forEach(section => {
            section.classList.remove("show");
            section.style.display = "none";
        });

        sectionToShow.style.display = "block";
        setTimeout(() => sectionToShow.classList.add("show"), 10);
        currentlyVisibleSection = sectionToShow;
    }
}


addProductBtn.addEventListener("click", () => showSection(addProductSection));
editProductBtn.addEventListener("click", () => showSection(editProductSection));
allProductsBtn.addEventListener("click", () => showSection(allProductsSection));

