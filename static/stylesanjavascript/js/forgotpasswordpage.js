

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



function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    toastMessage.innerText = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}
document.getElementById("close-forgotpassword").addEventListener("click", () => {
    window.location.href = "/";
});

const forgotPasswordForm = document.getElementById("forgotpasswordform");
forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const useroremailin = document.getElementById("useroremailin").value;
    const loadingIcon = document.getElementById("loading-icon1");
    loadingIcon.style.display = "block";
    const submitbt = document.getElementById("submit");
    const otpContainer = document.getElementById("otp-container");

    if (useroremailin === "") {
        showToast("Please enter your username or email first.", "error");
        loadingIcon.style.display = "none";
        submitbt.style.display = "block";
        return;
    }




    const response = await fetch("/forgotpassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ useroremailin }),
    });

    const data = await response.json();
    loadingIcon.style.display = "none";
    showToast("Otp sent to your success", "success")
    otpContainer.style.display = "block";
    submitbt.style.display = "none";
    document.getElementById("verifyotpbtn").style.display = "block";

    if (data.status === "success") {
        showToast(data.message, "success");
    } else {
        showToast(data.message, "error");
    }



    document.getElementById("verifyotpbtn").addEventListener("click", async () => {
        const useroremailin = document.getElementById("useroremailin").value;
        const otp = document.getElementById("otp").value;

        const response = await fetch("/verifyotp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ useroremailin, otp }),
        });

        const result = await response.json();
        showToast(result.message, result.status);
        document.getElementById("verifyotpbtn").style.display = "none";
        if (result.status === "success") {
            document.getElementById("Password1").style.display = "block";
            document.getElementById("Password2").style.display = "block";
            document.getElementById("changepasswordbtn").style.display = "block";
            document.getElementById("verifyotpbtn").style.display = "none";
            otpContainer.style.display = "none";

        }

    });
    document.getElementById("changepasswordbtn").addEventListener("click", async () => {
        const useroremailin = document.getElementById("useroremailin").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmpassword = document.getElementById("confirmpassword").value.trim();

        if (password !== confirmpassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        const response = await fetch("/resetpassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newpassword: password, useroremailin }),
        });

        const result = await response.json();
        showToast(result.message, result.status);


        if (result.status === "success") {
            document.getElementById("useroremailin").value = "";
            document.getElementById("otp").value = "";
            document.getElementById("confirmpassword").value = "";
            document.getElementById("password").value = "";


            setTimeout(() => {
                window.location.href = "/";
            }, 3000);

        } else {
            window.location.href = "/forgotpassword";
        }
    });


    document.getElementById("resendotp").addEventListener("click", async (e) => {
        e.preventDefault();

        const useroremailin = document.getElementById("useroremailin").value;
        if (!useroremailin) {
            showToast("Please enter your username or email first.", "error");
            return;
        }

        const loadingIcon = document.getElementById("loading-icon1");
        loadingIcon.style.display = "block";

        const response = await fetch("/resendotp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ useroremailin }),
        });

        const result = await response.json();
        loadingIcon.style.display = "none";
        showToast(result.message, result.status);
    });

    const resendLink = document.getElementById("resendotp");
    resendLink.style.pointerEvents = "none";
    resendLink.style.opacity = 0.5;

    setTimeout(() => {
        resendLink.style.pointerEvents = "auto";
        resendLink.style.opacity = 1;
    }, 30000); // 30 seconds



});


