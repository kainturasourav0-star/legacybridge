// Acme Inventory & Supply Chain Suite v4.2 - Application Logic

const ALL_SALES_DATA = [
    { region: "North America", sku: "ACM-8812", productName: "UltraSensor Pro", unitsSold: 4120, unitPrice: 25.00, revenue: 103000.00, status: "VERIFIED" },
    { region: "Europe West", sku: "ACM-9941", productName: "HydraValves X", unitsSold: 2840, unitPrice: 30.00, revenue: 85200.00, status: "VERIFIED" },
    { region: "Asia Pacific", sku: "ACM-4410", productName: "OptiRelay 400", unitsSold: 6190, unitPrice: 25.00, revenue: 154750.00, status: "VERIFIED" },
    { region: "Latin America", sku: "ACM-2298", productName: "MicroActuator G2", unitsSold: 1340, unitPrice: 25.00, revenue: 33500.00, status: "VERIFIED" },
    { region: "Middle East", sku: "ACM-1104", productName: "ThermalFuse Max", unitsSold: 950, unitPrice: 30.00, revenue: 28500.00, status: "VERIFIED" }
];

let currentPage = 1;
const pageSize = 3;
let isUiBroken = false;
let isLoggedIn = false;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Check if session stored or parameter passed
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autologin") === "true") {
        loginDirect();
    }
    renderTable();
    startSessionTimer();
});

function handleLogin(e) {
    if (e) e.preventDefault();
    loginDirect();
}

function loginDirect() {
    isLoggedIn = true;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("erp-main-app").style.display = "flex";
    renderTable();
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById("erp-main-app").style.display = "none";
    document.getElementById("login-container").style.display = "block";
}

function toggleMfaModal() {
    const modal = document.getElementById("mfa-modal");
    modal.style.display = (modal.style.display === "none" || !modal.style.display) ? "flex" : "none";
}

function resolveMfa() {
    document.getElementById("mfa-modal").style.display = "none";
    if (!isLoggedIn) {
        loginDirect();
    }
}

function renderTable() {
    const tbody = document.getElementById("sales-table-body");
    tbody.innerHTML = "";

    const startIndex = (currentPage - 1) * pageSize;
    const pageData = ALL_SALES_DATA.slice(startIndex, startIndex + pageSize);

    pageData.forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "data-row";
        tr.innerHTML = `
            <td><strong>${row.region}</strong></td>
            <td><code>${row.sku}</code></td>
            <td>${row.productName}</td>
            <td align="right">${row.unitsSold.toLocaleString()}</td>
            <td align="right">$${row.unitPrice.toFixed(2)}</td>
            <td align="right"><strong>$${row.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
            <td><span class="badge-reconciled">${row.status}</span></td>
        `;
        tbody.appendChild(tr);
    });

    // Update pagination controls
    const totalRecords = ALL_SALES_DATA.length;
    const currentEnd = Math.min(startIndex + pageSize, totalRecords);
    document.getElementById("page-records-range").textContent = `${startIndex + 1}-${currentEnd}`;
    document.getElementById("page-num-display").textContent = `Page ${currentPage} of ${Math.ceil(totalRecords / pageSize)}`;

    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");

    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentEnd >= totalRecords);

    // Update raw payload for automated verification
    const rawContainer = document.getElementById("raw-erp-export-json");
    if (rawContainer) {
        rawContainer.textContent = JSON.stringify({
            page: currentPage,
            items: pageData,
            all: ALL_SALES_DATA
        });
    }
}

function nextPage() {
    if (currentPage * pageSize < ALL_SALES_DATA.length) {
        currentPage++;
        renderTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function switchView(viewName) {
    console.log("Navigating to view:", viewName);
}

// -------------------------------------------------------------
// THE "BREAK THE UI" LIVE HACKATHON DEMO SWITCH
// -------------------------------------------------------------
function toggleBreakUi() {
    isUiBroken = !isUiBroken;
    const indicator = document.getElementById("break-ui-indicator");
    const btnText = document.getElementById("break-ui-text");
    const disruptionBanner = document.getElementById("disruption-banner");

    const nextBtn = document.getElementById("btn-next-page") || document.querySelector("[data-role='next-page-action']");
    const navBranch = document.getElementById("nav-reports-branch");
    const reportLabel = document.getElementById("label-q3-report");

    if (isUiBroken) {
        indicator.textContent = "🟢";
        btnText.textContent = "Restore Original UI Layout";
        disruptionBanner.style.display = "block";

        // 1. Rename button and mutate ID/attributes (Breaks CSS selectors like #btn-next-page)
        if (nextBtn) {
            nextBtn.id = "dyn-nav-fwd-9941";
            nextBtn.setAttribute("data-role", "next-page-action");
            nextBtn.textContent = "Advance Listing >>";
            nextBtn.style.backgroundColor = "#E2E8F0";
        }

        // 2. Move reports menu to bottom of tree
        if (navBranch) {
            const tree = document.getElementById("navigation-tree");
            tree.appendChild(navBranch);
        }

        // 3. Mutate menu label
        if (reportLabel) {
            reportLabel.textContent = "📈 Regional Sales Ledger (Matrix)";
        }

        console.log("⚠️ UI BROKEN: Selectors randomized. Agent relies on semantic vision!");
    } else {
        indicator.textContent = "🔴";
        btnText.textContent = "Break the UI (Test Agent Resilience)";
        disruptionBanner.style.display = "none";

        // Restore original UI
        if (nextBtn) {
            nextBtn.id = "btn-next-page";
            nextBtn.removeAttribute("data-role");
            nextBtn.textContent = "Next Page >>";
            nextBtn.style.backgroundColor = "";
        }

        if (reportLabel) {
            reportLabel.textContent = "📊 Q3 Regional Sales Ledger";
        }

        console.log("✅ UI RESTORED to standard layout.");
    }
}

function startSessionTimer() {
    let seconds = 862;
    setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const elem = document.getElementById("session-timer");
        if (elem) {
            elem.textContent = `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Global hook for headless or browser agents
window.__LEGACY_ERP_STATE__ = {
    isLoggedIn: () => isLoggedIn,
    isUiBroken: () => isUiBroken,
    getAllData: () => ALL_SALES_DATA,
    login: loginDirect
};
