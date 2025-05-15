let currentPage = {};
const rowsPerPage = 50;

function displayPaginatedData(tableId) {
    let tableBody = document.getElementById(tableId).querySelector("tbody");
    let allRows = [...tableBody.querySelectorAll("tr:not(.no-data)")];

    if (!currentPage[tableId]) currentPage[tableId] = 1; // Default page 1
    let totalPages = Math.ceil(allRows.length / rowsPerPage);
    let start = (currentPage[tableId] - 1) * rowsPerPage;
    let end = start + rowsPerPage;

    allRows.forEach((row, index) => {
        row.style.display = index >= start && index < end ? "" : "none";
    });

    updatePaginationButtons(tableId, totalPages);
}

function changePage(tableId, step) {
    let totalRows = document.getElementById(tableId).querySelectorAll("tbody tr:not(.no-data)").length;
    let totalPages = Math.ceil(totalRows / rowsPerPage);

    currentPage[tableId] += step;
    if (currentPage[tableId] < 1) currentPage[tableId] = 1;
    if (currentPage[tableId] > totalPages) currentPage[tableId] = totalPages;

    displayPaginatedData(tableId);
}

function updatePaginationButtons(tableId, totalPages) {
    let prevButton = document.getElementById("prevPage");
    let nextButton = document.getElementById("nextPage");
    let pageInfo = document.getElementById("page-info");

    if (!prevButton || !nextButton) return; // Ensure buttons exist

    if (!currentPage[tableId]) currentPage[tableId] = 1; // Default to page 1
    totalPages = Math.max(1, totalPages); // Ensure totalPages is valid

    if (!pageInfo) {
        let paginationDiv = document.querySelector(".pagination-container");
        pageInfo = document.createElement("span");
        pageInfo.id = "page-info";
        paginationDiv.appendChild(pageInfo);
    }

    pageInfo.innerText = `Page ${currentPage[tableId]} of ${totalPages}`;

    // Reset event listeners
    prevButton.onclick = () => changePage(tableId, -1);
    nextButton.onclick = () => changePage(tableId, 1);

    // Disable "Prev" if on the first page
    if (currentPage[tableId] === 1) {
        prevButton.classList.add("pagination-disabled");
        prevButton.onclick = null;
    } else {
        prevButton.classList.remove("pagination-disabled");
    }

    // Disable "Next" if on the last page
    if (currentPage[tableId] === totalPages) {
        nextButton.classList.add("pagination-disabled");
        nextButton.onclick = null;
    } else {
        nextButton.classList.remove("pagination-disabled");
    }
}



// Initialize Pagination for a Table
function setupPagination(tableId) {
    let tableBody = document.getElementById(tableId)?.querySelector("tbody");
    let allRows = tableBody ? [...tableBody.querySelectorAll("tr:not(.no-data)")] : [];
    let paginationElement = document.querySelector(".pagination");

    if (!paginationElement) return; // Ensure pagination element exists

    if (allRows.length > rowsPerPage) {
        currentPage[tableId] = 1;
        displayPaginatedData(tableId);
        paginationElement.classList.remove("hidden"); // Show pagination only if needed
    } else {
        paginationElement.classList.add("hidden"); // Hide if not enough rows
    }
}


