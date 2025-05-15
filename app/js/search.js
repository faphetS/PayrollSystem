document.addEventListener("DOMContentLoaded", function () {
    let searchInput = document.getElementById("search-input");
    let searchIcon = document.querySelector(".search-icon");
    let pagination = document.querySelector(".pagination");

    let storedData = localStorage.getItem("attendanceData");
    let uploadedData = storedData ? JSON.parse(storedData) : [];

    if (uploadedData.length > 0) {
        searchInput.removeAttribute("disabled");
        searchIcon.classList.remove("icon-disabled");
    } else {
        searchInput.setAttribute("disabled", "true");
        searchIcon.classList.add("icon-disabled");
    }

    function togglePagination(enable) {
        let pagination = document.querySelector(".pagination");
    
        if (enable) {
            pagination.classList.remove("hidden");  // Shows pagination
        } else {
            pagination.classList.add("hidden");  // Hides pagination
        }
        console.log(pagination.classList);
    }

    
    function search() {
        let query = searchInput.value.trim().toLowerCase();
        let MAX_ROWS_TO_SEARCH = 100;
        let noDataFound = true;
    
        let visibleTables = document.querySelectorAll(".excel:not(.hidden)");
    
        // If input is empty, reset without reloading
        if (query === "") {
            togglePagination(true);  // Show pagination when query is empty
            document.querySelector(".pagination").style.display = "flex";
            resetTableVisibility();  // Reset table visibility and apply pagination
            return;
        } else {
            togglePagination(true); 
        }
    
        visibleTables.forEach(table => {
            let tableBody = table.querySelector("tbody");
            let tableColumnsCount = table.querySelector("thead tr").children.length;
    
            // Hide all rows before searching
            let tableRows = tableBody.querySelectorAll("tr");
            tableRows.forEach(row => row.style.display = "none");
    
            // Remove existing messages and insert loading animation
            clearOldMessages(tableBody);
            showLoadingAnimation(tableBody, tableColumnsCount);
        });
    
        setTimeout(function () {
            visibleTables.forEach(table => {
                let tableBody = table.querySelector("tbody");
                let tableColumnsCount = table.querySelector("thead tr").children.length;
                let tableRows = tableBody.querySelectorAll("tr");
                let matchCount = 0;
                noDataFound = true;
    
                tableRows.forEach(row => {
                    let cells = row.querySelectorAll("td");
                    let match = Array.from(cells).some(cell =>
                        cell.innerText.toLowerCase().includes(query)
                    );
    
                    if (match && matchCount < MAX_ROWS_TO_SEARCH) {
                        row.style.display = "";
                        matchCount++;
                        noDataFound = false;
                    }
                });
                if (noDataFound) {
                    showNoDataMessage(tableBody, tableColumnsCount);
                }
                removeLoadingAnimation(tableBody);
                setupPagination(table);
            });
        }, 500); // Slight delay for UI update
    }

function resetTableVisibility() {
    let visibleTables = document.querySelectorAll(".excel:not(.hidden)");
    visibleTables.forEach(table => {
         let tableBody = table.querySelector("tbody");
        clearOldMessages(tableBody);
        let tableRows = table.querySelectorAll("tbody tr");
        tableRows.forEach(row => row.style.display = "");

        // After resetting table visibility, reset pagination
        let tableId = table.id;  // Get table ID
        setupPagination(tableId);  // Reapply pagination to the table
        pagination.classList.remove("hidden");
    });
}

    function clearOldMessages(tableBody) {
        let oldMessages = tableBody.querySelectorAll(".no-data, .loading-data");
        oldMessages.forEach(msg => msg.remove());
    }

    function showLoadingAnimation(tableBody, colspan) {
        let loadingRow = document.createElement("tr");
        loadingRow.classList.add("loading-data");
        loadingRow.innerHTML = `<td colspan="${colspan}" style="text-align: center;">
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
        </td>`;
        tableBody.appendChild(loadingRow);
    }

    function removeLoadingAnimation(tableBody) {
        let loadingRow = tableBody.querySelector(".loading-data");
        if (loadingRow) {
            tableBody.removeChild(loadingRow);
        }
    }

    function showNoDataMessage(tableBody, colspan) {
        let noDataRow = document.createElement("tr");
        noDataRow.classList.add("no-data");
        noDataRow.innerHTML = `<td colspan="${colspan}" style="text-align: center;">No data available</td>`;
        tableBody.appendChild(noDataRow);
    }

    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            search();
        }
    });

    searchIcon.addEventListener("click", function () {
        search();
    });
});
