const buttons = document.querySelectorAll(".sidebar-button");
const attendanceContent = document.getElementById("excel-table");
const payrollReport = document.getElementById("calculate-table");
const incRecordTable = document.getElementById("incRecord");
const incRecordButton = document.querySelector(".js-inc-record");
const defaultButton = document.querySelector(`.sidebar-button[data-page="attendanceContent"]`);
const uploadbtn = document.querySelector(".btn-upload");
const topContainer = document.querySelector("#top-container");
const payrollSetupContent = document.getElementById("payroll-setup-content");
const pagination = document.querySelector(".pagination");
let pageName = document.getElementById("page-name");
let incompleteRecords = localStorage.getItem("incRecordData");
incompleteRecords = incompleteRecords ? JSON.parse(incompleteRecords) : [];

document.addEventListener("DOMContentLoaded", function () {
    if (defaultButton) {
        defaultButton.click();
        defaultButton.classList.add("clicked");
    }

    const payrollBtn = document.querySelector(`.sidebar-button[data-page="payrollReport"]`);

    let calculatedData = JSON.parse(localStorage.getItem("calculatedPayrollData"))
    // if (calculatedData) {
    //     payrollBtn.removeAttribute("disabled");
    // } else {
    //     payrollBtn.setAttribute("disabled", "true");
    // }

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const page = this.getAttribute("data-page");
    
            attendanceContent.classList.add("hidden");
            payrollReport.classList.add("hidden");
    
            if (page === "attendanceContent") {
                topContainer.classList.remove("hidden");
                attendanceContent.classList.remove("hidden");
                incRecordButton.classList.add("hidden");
                uploadbtn.classList.remove("hidden");
                pageName.innerHTML = "Attendance Report |&nbsp;";
                incRecordButton.innerHTML = "Inc Records";
                incRecordTable.classList.add("hidden");
                payrollSetupContent.classList.add("hidden");
                pagination.classList.remove("hidden");
                setupPagination("excel-table");
            } 
            else if (page === "payrollReport") {
                topContainer.classList.remove("hidden");
                payrollReport.classList.remove("hidden");
                uploadbtn.classList.add("hidden");
                pageName.innerHTML = "Calculated Payroll |&nbsp;";
                incRecordTable.classList.add("hidden");
                payrollSetupContent.classList.add("hidden");
                let updatedRecords = localStorage.getItem("incRecordData");
                updatedRecords = updatedRecords ? JSON.parse(updatedRecords) : [];
                pagination.classList.remove("hidden");
                setupPagination("calculate-table");
    
                if (updatedRecords.length > 0) {
                    incRecordButton.classList.remove("hidden");
                } else {
                    incRecordButton.classList.add("hidden");
                }
            }
            else if (page === "payrollSetup") {
                payrollReport.classList.add("hidden");
                uploadbtn.classList.add("hidden");
                pageName.innerHTML = "Payroll Setup |&nbsp;";
                incRecordTable.classList.add("hidden");
                topContainer.classList.add("hidden");
                payrollSetupContent.classList.remove("hidden");
                incRecordButton.innerHTML = "Inc Records";
                incRecordTable.classList.add("hidden");
                pagination.classList.add("hidden");
                attendanceContent.classList.add("hidden");
                // handleNaRecords();
            }
            buttons.forEach(btn => btn.classList.remove("clicked"));
            this.classList.add("clicked");
        });
    });


    // Initial table rendering if data exists
    setTimeout(() => {
        const tableBody = document.getElementById("table-body");
        if (tableBody) {
            if (uploadedData.length > 0) {
                renderTable();
            } else {
                tableBody.innerHTML = `<tr class="no-data">
                    <td colspan="5" style="text-align: center;">No data available</td>
                </tr>`;
            }
        }
    }, 100);
});


const excelTable = document.getElementById("excel-table");
const calcTable = document.getElementById("calculate-table");
const incRecordBody = document.getElementById("table-inc-record");
const btnSetup = document.querySelector("#btn-setup");
const setupBtn = document.querySelector(".setup");

btnSetup.addEventListener("click", function () {
    payrollReport.classList.add("hidden");
    uploadbtn.classList.add("hidden");
    pageName.innerHTML = "Payroll Setup |&nbsp;";
    incRecordTable.classList.add("hidden");
    topContainer.classList.add("hidden");
    payrollSetupContent.classList.remove("hidden");
    incRecordButton.innerHTML = "Inc Records";
    incRecordTable.classList.add("hidden");
    pagination.classList.add("hidden");
    attendanceContent.classList.add("hidden");
    buttons.forEach(btn => btn.classList.remove("clicked"));
    setupBtn.classList.add("clicked");
})

function showIncRecord() {
    let storedRecords = localStorage.getItem("incRecordData");
    let incompleteRecords = storedRecords ? JSON.parse(storedRecords) : [];

    if (incRecordTable.classList.contains("hidden")) {
        // Hide other tables
        excelTable.classList.add("hidden");
        calcTable.classList.add("hidden");
        incRecordTable.classList.remove("hidden");
        incRecordButton.innerHTML = "Back"; 
        pageName.innerHTML = "Incomplete Records |&nbsp;";

        // Clear and populate the table
        incRecordBody.innerHTML = "";
        if (incompleteRecords.length > 0) {
            incompleteRecords.forEach(record => {
                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${record.personID}</td>
                    <td>${record.date}</td>
                    <td>${record.shift}</td>
                    <td>${record.checkIn}</td>
                    <td>${record.checkOut}</td>
                `;
                incRecordBody.appendChild(tr);
            });
            setupPagination("incRecord");
        } else {
            incRecordBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No data available</td></tr>`;
        }

        // Unhide the Inc Records button and force reflow for icon visibility
        incRecordButton.classList.remove("hidden");

    } else {
        // Show calculated table again
        pageName.innerHTML = "Calculated Payroll |&nbsp;";
        calcTable.classList.remove("hidden");
        incRecordTable.classList.add("hidden");
        incRecordButton.innerHTML = "Inc Records"; 
        setupPagination("calculate-table");
    }
}


// document.body.addEventListener("click", function(e) {
//     if (e.target && e.target.id === "check-NA-records") {
//         handleNaRecords();
//     }
// });