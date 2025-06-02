<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payroll</title>
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/payrollsetup.css">
    <link rel="stylesheet" href="css/general.css">
    <link rel="stylesheet" href="css/modals.css">
    <link rel="stylesheet" href="css/pagination.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="header-left">
            <img class="logo" src="img/HF-logo.png" alt="Company logo">
            <p class="company-name">Hyper Future</p>
        </div>
        <div class="header-right">
            <div></div>
        </div>
    </header>

    <nav class="sidebar">   
        <div>
            <button class="sidebar-button" data-page="attendanceContent">
               <i class="fa-solid fa-clipboard-list att-icon"></i>
               Attendance
            </button>
            <button class="sidebar-button setup" data-page="payrollSetup">
            <i class="fa-solid fa-gear att-icon"></i>
               Payroll Setup
            </button>
            <button class="sidebar-button" data-page="payrollReport">
               <i class="fa-solid fa-money-check-dollar payroll-icon"></i>
                Payroll Report
            </button>    
        </div> 

        <a href="logout.php" class="logout-button">
            <i class="fa-solid fa-right-from-bracket att-icon logout-icon"></i>
            Logout
        </a>
    </nav>

    <main>
        <div class="page-name">
            <span id="page-name">Attendance Report |&nbsp;</span>
            <span id="file-name-title"></span>
        </div>

        <div class="main-content" id="attendance-content">
            <div class="flex-main-top" id="top-container">
                <div class="search-bar">

                    <input type="text" placeholder="Search" id="search-input" disabled>
                    <i class="fa-solid fa-magnifying-glass search-icon icon-disabled" id="search-icon"></i>
                    <button onclick="openModal('import-excel')" class="btn-upload">
                        <i class="fa-solid fa-file-arrow-up"></i>
                        Upload File
                    </button>
                    <button class="btn-upload" onclick="openModal('downloadFile')">
                        <i class="fa-solid fa-file-arrow-down"></i>
                        Download File
                    </button>
                    <button class="btn-inc js-inc-record hidden" onclick="showIncRecord()">Inc records</button>    
                </div>
            <button class="btn-calc" id="btn-setup">
                <i class="fa-solid fa-circle-plus"></i>
                Calculate
            </button>

            </div>
            <table class="excel" id="excel-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Time-In</th>
                        <th>Time-Out</th>
                    </tr>
                </thead>
                <tbody id="table-body">
                    <tr class="no-data">
                        <td colspan="5" style="text-align: center;" >No data available</td>
                            <!-- excel data -->
                    </tr>
                    
                </tbody>
            </table>

            <table class="excel hidden" id="calculate-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Date Range</th>
                        <th>Days</th>
                        <th>Total Hours</th>
                        <th>OT Hours</th>
                        <th>Late</th>
                        <th>Undertime</th>
                        <th>Absent</th>
                        <th>INC</th>
                        <th>OT Pay</th>
                        <th>Gross Pay</th>
                        <th>Deduction</th>
                        <th>Net Pay</th>        
                    </tr>
                </thead>
                <tbody id="calculated-table-body">
                    <tr class="no-data">
                        <td colspan="13" style="text-align: center;" rowspan="10">No data available</td>
                    </tr>
                </tbody>
            </table>

            <table class="excel hidden" id="incRecord">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Time-In</th>
                        <th>Time-Out</th>
                    </tr>
                </thead>
                <tbody id="table-inc-record">
                    <tr class="no-data">
                        <td colspan="5" style="text-align: center;" rowspan="10">No data available</td>
                    </tr>
                    <!-- excel data -->
                </tbody>
            </table>

            <div class="hidden" id="payroll-setup-content">
                <!-- Holiday -->
                <div class="section holiday-section">
                    <h3>Holidays:</h3>

                    <div class="holiday-wrapper">
                        <div class="entry-group holiday-inputs">
                            <input class="setup-input" type="date" name="holiday-date[]">
                            <select class="select-input" name="holiday-percentage[]">
                                <option value="none" selected>holiday rate</option>
                                <option value="thirtyPercent">130% (None if absent)</option>
                                <option value="doublePay">Double Pay (single pay if absent)</option>
                            </select>
                        </div>
                    </div>
                    <button type="button" class="add-btn" id="add-holiday-btn">
                        <i class="fa-solid fa-plus"></i>
                         Add Holiday
                    </button>
                </div>
                 <!-- Supervisors -->
                <div class="section supervisor-section">
                    <h3>Supervisors / TL:</h3>

                    <div class="supervisor-wrapper">
                        <div class="entry-group supervisor-inputs">
                            <select class="select-input sup-emp-select" name="sup-emp-id[]">
                                <option value="" selected>Select Employee</option>
                            </select>
                            <input class="setup-input" type="number" name="sup-rate[]" min="0" placeholder="Rate per Day">
                        </div>
                    </div>

                    <button type="button" class="add-btn" id="add-supervisor-btn">
                        <i class="fa-solid fa-plus"></i>
                        Add Employee
                    </button>
                </div>
                <!-- Overtime -->
                <div class="section overtime-section">
                    <h3>Overtime:</h3>

                    <div class="overtime-wrapper">
                        <div class="entry-group overtime-inputs">
                            <select class="select-input sup-emp-select" name="sup-emp-id[]">
                                <option value="" selected>Select Employee</option>
                            </select>
                            <input class="setup-input" type="number" name="ot-hours[]" min="0" placeholder="Hour/s">
                            <select class="select-input" name="holiday-percentage[]">
                                <option value="1" selected>OT rate</option>
                                <option value="1">100%</option>
                                <option value="1.3">130%</option>
                                <option value="2">200%</option>
                            </select>
                        </div>
                    </div>

                    <button type="button" class="add-btn" id="add-overtime-btn">
                        <i class="fa-solid fa-plus"></i>
                        Add Employee
                    </button>
                </div>
                <!-- Rate per day -->
                <div class="section rate-section">
                    <h3>Rate per day:</h3>
                    <div class="entry-group overtime-inputs">
                        <input class="setup-input" type="number" id="ms" placeholder="IT | 9am - 6pm">
                        <input class="setup-input" type="number" id="2ms" name="2ndmorningshift" placeholder="Google App | 8am - 8pm">
                        <input class="setup-input" type="number" id="ns" name="nightshift" placeholder="Night Shift | 8pm - 8am">
                    </div>
                </div>


                <button class="btn-calculate" id="check-NA-records">
                    <i class="fa-solid fa-circle-plus"></i>
                    Calculate Payroll
                </button>
            </div>

            <div class="pagination hidden">
                <div class="pagination-container">
                    <div id="prevPage" class="pagination-btn">Prev</div> 
                    <span id="page-info"></span>
                    <div id="nextPage" class="pagination-btn">Next</div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modals -->
     <!-- Import Excel -->
    <div id="import-excel" class="import-excel hidden">
        <div class="modal-content">
            <!-- Drag and Drop Area -->
            <div id="drop-area" class="drop-area">
                <div id="file-name">
                    <p>Drag & Drop file</p>
                    <p>or</p>
                    <p>Click here</p>
                </div>
                <input type="file" id="fileInput" accept=".xlsx, .xls" hidden>
            </div>

            <div class="button-group">
                <button onclick="closeModal('import-excel')" class="btn-cancel">Cancel</button>
                <button onclick="uploadFile()" class="btn-import">Import</button>
            </div>
        </div>
    </div>
    <!-- N/A Modal -->
    <div id="na-shifts-modal" class="na-record hidden">
        <div class="na-modal-content">
            <h2 style="color: #ff9800;">Warning!</h2>
            <p>The system detected some employees with shifts marked as <span class="na-highlight">N/A</span>. Please review and update their shifts accordingly.</p>
            <div class="table-wrapper">
                <table class="excel" id="na-shifts-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Date</th>
                            <th>Time-In</th>
                            <th>Time-Out</th>
                            <th>Current Shift</th>
                            <th>Update Shift</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <div class="button-group">
                <button onclick="closeModal('na-shifts-modal')" class="btn-cancel">Cancel</button>
                <button onclick="saveNaRecords()" class="btn-proceed">Save Changes</button>
            </div>
        </div>
    </div>
    <!-- Download -->
    <div id="downloadFile" class="download hidden">
        <div class="download-content">
            <p>Are you sure you want to download this file?</p>
            <div class="button-group">
                <button onclick="closeModal('downloadFile')" class="btn-cancel">Cancel</button>
                <button class="btn-proceed" onclick="downloadFile()">Download</button>   
            </div>
        </div>
    </div>
     <!-- Modals -->
      
    <script src="js/modals.js"></script>
    <script src="js/import_excel.js"></script>
    <script src="js/loadContent.js"></script>
    <script src="js/calculatePayroll.js"></script>
    <script src="js/pagination.js"></script>
    <script src="js/search.js"></script>
    <script src="js/payrollSetup.js"></script>
</body>
</html>



<!-- Add another Side Button for Separation of the Holiday, Supervisor, and Overtime
	Remove the calculate" button on the first and put it in the new side button,

	After clicking the new side button

	+ Add holiday, (name) (date) (paid/not paid) if paid; then add paid (kasi minsan 30% lang tas minsan double pay)

	+ In Supervisor (Id no.) ++ then dun sa calculate mag add ka ng another for the per day ng supervisor (kunwari dalawang id no ang lilitaw is:

	IT
	[ salary ]

	google app 
	[ salary ]

	google app gabi
	[ salary ]

	20065
	[ salary ]

	Sir Kaniel id no.
	[ salary ] 

	+ for ot naman is manually din to be continued.. -->