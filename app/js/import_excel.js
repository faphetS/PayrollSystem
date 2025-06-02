document.addEventListener("DOMContentLoaded", function () {
    let dropArea = document.getElementById("drop-area");
    let fileInput = document.getElementById("fileInput");

    localStorage.removeItem("incRecordData");
    localStorage.removeItem("calculatedPayrollData");
    localStorage.removeItem("attendanceData");

    if (dropArea && fileInput) { // Prevent errors if elements don't exist
        // Drag & Drop Events
        dropArea.addEventListener("dragover", function (event) {
            event.preventDefault();
            dropArea.classList.add("highlight");
        });

        dropArea.addEventListener("dragleave", function () {
            dropArea.classList.remove("highlight");
        });

        dropArea.addEventListener("drop", function (event) {
            event.preventDefault();
            dropArea.classList.remove("highlight");

            let files = event.dataTransfer.files;
            if (files.length > 0) {
                // Create a DataTransfer object to simulate a real file input change
                let dataTransfer = new DataTransfer();
                for (let i = 0; i < files.length; i++) {
                    dataTransfer.items.add(files[i]);
                }

                fileInput.files = dataTransfer.files;

                // Manually trigger a change event
                fileInput.dispatchEvent(new Event("change"));
            }
        });

        // Click to trigger file input
        dropArea.addEventListener("click", function () {
            fileInput.click();
        });
    }

    
    let storedData = localStorage.getItem("attendanceData");
    uploadedData = storedData ? JSON.parse(storedData) : [];  // ✅ Ensure `uploadedData` is defined
    
    setTimeout(() => {
        let tableBody = document.getElementById("table-body");
        if (tableBody) {
            if (uploadedData.length > 0) {
                renderTable();
            } else {
                tableBody.innerHTML = `<tr class="no-data">
                    <td colspan="4" style="text-align: center;">No data available</td>
                </tr>`;
            }
        }
    }, 100);
});

async function uploadFile() {
    let fileInput = document.getElementById("fileInput");
    let file = fileInput?.files[0];

    if (!file) return false;

    // Close the modal before starting the upload
    closeModal('import-excel');

    // Display loading animation
    let loadingMessage = document.createElement("div");
    loadingMessage.classList.add("loading-message", "loading-data");
    loadingMessage.innerHTML = `Loading
        <span class='dot'>.</span>
        <span class='dot'>.</span>
        <span class='dot'>.</span>
        <span class='dot'>.</span>`;
    document.body.appendChild(loadingMessage);

    let formData = new FormData();
    formData.append("excel_file", file);

    try {
        let response = await fetch("services/ExcelService.php", {
            method: "POST",
            body: formData
        });

        let data = await response.json();

        if (data.success) {
            localStorage.removeItem("attendanceData");
            localStorage.removeItem("incRecordData");
            localStorage.removeItem("calculatedPayrollData");

            let incompleteRecords = localStorage.getItem("incRecordData");
            incompleteRecords = incompleteRecords ? JSON.parse(incompleteRecords) : [];

            // const payrollBtn = document.querySelector(`.sidebar-button[data-page="payrollReport"]`);

            // let calculatedData = JSON.parse(localStorage.getItem("calculatedPayrollData"))
            // if (calculatedData) {
            //     payrollBtn.removeAttribute("disabled");
            // } else {
            //     payrollBtn.setAttribute("disabled", "true");
            // }

            if (incompleteRecords.length > 0) {
                incRecordButton.classList.remove("hidden");
            } else {
                incRecordButton.classList.add("hidden");
            }

            uploadedData = data.data;
            localStorage.setItem("attendanceData", JSON.stringify(uploadedData));
            renderTable();

            // Show success message
            loadingMessage.classList.add("fade-out");
            loadingMessage.innerHTML = `✅ File imported successfully!`;
            

            setTimeout(() => {
                document.body.removeChild(loadingMessage);
            }, 5000);
        } else {
            throw new Error(`FILE UPLOAD FAILED\n\n${data.error}`);
        }

        return true;
    } catch (error) {
        console.error("Upload error:", error);
        alert(error.message || "An unexpected error occurred.");

        // ✅ Always remove the loader if error occurs
        if (document.body.contains(loadingMessage)) {
            document.body.removeChild(loadingMessage);
        }

        return false;
    }
}



function renderTable() {
    let tableBody = document.getElementById("table-body");
    let search = document.getElementById("search-input");
    let searchIcon = document.querySelector("#search-icon");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (uploadedData.length > 0) {
        document.getElementById("excel-table").classList.remove("hidden");
        document.getElementById("calculate-table").classList.add("hidden");
        document.getElementById("incRecord").classList.add("hidden");
        let fileInput = document.getElementById("fileInput");
        let fileNameTitle = document.getElementById("file-name-title");
        search.disabled = false;
        searchIcon.classList.remove("icon-disabled");


        uploadedData.forEach(row => {
            let personID = row.person_id.startsWith("'") ? row.person_id.substring(1) : row.person_id;
            let checkIn = row.check_in;
            let checkOut = row.check_out;
            let checkInHours = checkIn ? parseInt(checkIn.split(":")[0]) : NaN; // If no check-in time, set to NaN
            let checkOutHours = checkOut ? parseInt(checkOut.split(":")[0]) : NaN; // If no check-out time, set to NaN
            let date = row.date;
        
            let shift = "N/A";
        
            // Check for missing check-in and check-out
            if (isNaN(checkInHours) && isNaN(checkOutHours)) {
                shift = "Absent"; // Both check-in and check-out are invalid
            } else if (isNaN(checkInHours) || isNaN(checkOutHours)) {
                shift = "Inc"; // One of check-in or check-out is invalid
            } else {
                if ((checkInHours >= 18 && checkInHours <= 23) && (checkOutHours >= 1 && checkOutHours <= 10)) {
                    shift = "Night | 20 - 08";
                } else if ((checkInHours >= 8 && checkInHours <= 10) && (checkOutHours >= 17 && checkOutHours < 19)) {
                    shift = "Morning | 9 - 18";
                } else if ((checkInHours >= 7 && checkInHours <= 12) && (checkOutHours >= 19 && checkOutHours <= 23)) {
                    shift = "Morning | 8 - 20";
                } else {
                    shift = "N/A";
                }
            }
        
            // Create the row for the table
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${personID}</td>
                            <td>${date}</td>
                            <td>${shift}</td>
                            <td>${checkIn || 'N/A'}</td>   
                            <td>${checkOut || 'N/A'}</td>
                            `;
            tableBody.appendChild(tr);
        
            // Update uploadedData with the shift (after condition checks)
            row.date = date;
            row.shift = shift;
        });


    
        const uniqueEmployees = {};
        uploadedData.forEach(entry => {
            uniqueEmployees[entry.person_id] = entry.name;
        });
    
        // Fill all supervisor <select> dropdowns
        const selects = document.querySelectorAll('.sup-emp-select');
        selects.forEach(select => {
            for (const [id, name] of Object.entries(uniqueEmployees)) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = id;
                select.appendChild(option);
            }
        });

        let fileName = fileInput.files[0].name;
        fileNameTitle.innerHTML = ` ${fileName}`;

    
        localStorage.removeItem("attendanceData");
        localStorage.setItem("attendanceData", JSON.stringify(uploadedData));
        closeModal('import-excel');
        setupPagination("excel-table");
        
    } else {
        tableBody.innerHTML = `<tr class="no-data">
                                    <td colspan="5" style="text-align: center;">No data available</td>
                               </tr>`;
        search.disabled = true;
    }
}



// Show selected file name
document.getElementById("fileInput")?.addEventListener("change", function() {
    let fileNameDiv = document.getElementById("file-name"); 

    if (this.files.length > 0) {
        let fileName = this.files[0].name;
        fileNameDiv.innerHTML = `<p>${fileName}</p>`; // Show file name
    } else {
        fileNameDiv.innerHTML = `
            <p>Drag & Drop file</p> 
            <p>or</p>
            <p>Click here</p>
        `; // Keep default text
    }
});

//EXPORT EXCEL
async function downloadFile() {
    let rawTable = document.getElementById("excel-table");
    let incTable = document.getElementById("incRecord");
    let payrollTable = document.getElementById("calculate-table");

    let tableData = null;
    let endpoint = "";
    let filename = "";

    if (!rawTable.classList.contains("hidden")) {
        tableData = JSON.parse(localStorage.getItem("attendanceData"));
        endpoint = "services/exportExcel.php";
        filename = "Attendance_Report.xlsx";
    } else if (!incTable.classList.contains("hidden")) {
        tableData = JSON.parse(localStorage.getItem("incRecordData"));
        endpoint = "services/exportIncData.php";
        filename = "Incomplete_Records.xlsx";
    } else if (!payrollTable.classList.contains("hidden")) {
        tableData = JSON.parse(localStorage.getItem("calculatedPayrollData"));
        endpoint = "services/exportPayrollData.php";
        filename = "Payroll_Report.xlsx";
    } else {
        console.error("No visible table found for export.");
        return;
    }

    if (!tableData || tableData.length === 0) {
        console.error("No data available to export.");
        return;
    }

    try {
        let response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tableData })
        });

        if (!response.ok) throw new Error("Failed to download the file.");

        closeModal('downloadFile');
        let blob = await response.blob();
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Download error:", error);
    }
}

