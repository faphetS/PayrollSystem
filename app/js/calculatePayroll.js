document.getElementById("check-NA-records").addEventListener("click", handleNaRecords);

function handleNaRecords() {

    const ms = document.getElementById('ms').value;
    const ms2 = document.getElementById('2ms').value;
    const ns = document.getElementById('ns').value;

    if (ms === "" || ms2 === "" || ns === "") {
        alert("Fill all fields before proceeding!");
    } else {
        let uploadedData = JSON.parse(localStorage.getItem("attendanceData")) || [];
   
        if (uploadedData.length === 0) {
            alert("No Data available, please upload first.");
            return;
        }
        let naRecords = [];

        uploadedData.forEach(row => {
            if (row.shift === "N/A") {
                naRecords.push(row); 
            }
        });
    
        if (naRecords.length > 0) {
            displayNaModal(naRecords);
        } else {
            let loadingMessage = document.createElement("div");
            loadingMessage.classList.add("loading-message", "loading-data");
            loadingMessage.innerHTML = `Loading
                <span class='dot'>.</span>
                <span class='dot'>.</span>
                <span class='dot'>.</span>
                <span class='dot'>.</span>`;
            document.body.appendChild(loadingMessage);

            // Immediately hide the table and reset button text
            incRecordTable.classList.add("hidden");
            incRecordButton.innerHTML = "Inc Records";

            // Delay processing so loading message is rendered first
            setTimeout(() => {
                const msRate = parseFloat(ms) || 0;
                const secondMsRate = parseFloat(ms2) || 0;
                const nsRate = parseFloat(ns) || 0;

                savePayrollSetup();
                calculatePayroll(msRate, secondMsRate, nsRate);

                // Remove loading after processing
                    document.body.removeChild(loadingMessage);
            }, 300)
        }

    }
 }
 
 function displayNaModal(naRecords) {
     // Get the table body for N/A modal
     let naShiftsTableBody = document.getElementById("na-shifts-table").getElementsByTagName("tbody")[0];
     naShiftsTableBody.innerHTML = '';  // Clear any existing rows
 
     // Loop through each N/A record and add it to the table
     naRecords.forEach((record, index) => {
         let row = naShiftsTableBody.insertRow();
 
         // Create table cells
         let personIDCell = row.insertCell(0);
         personIDCell.textContent = record.person_id;  // Person ID
 
         let dateCell = row.insertCell(1);
         dateCell.textContent = record.date;  // Date
 
         let checkInCell = row.insertCell(2);
         checkInCell.textContent = record.check_in;  // Raw Time-In (can be "-" or actual time)
 
         let checkOutCell = row.insertCell(3);
         checkOutCell.textContent = record.check_out;  // Raw Time-Out (can be "-" or actual time)
 
         let shiftCell = row.insertCell(4);
         shiftCell.textContent = record.shift;  // Current Shift ("N/A")
 
         let updateShiftCell = row.insertCell(5);
         // Create a dropdown to select shift
         let selectShift = document.createElement("select");
         selectShift.setAttribute("data-index", index);  // Store the index of the record
         selectShift.innerHTML = `
             <option value="N/A" selected>Choose Shift</option>
             <option value="Morning | 8 - 20">Google App | 8 - 20</option>
             <option value="Morning | 9 - 18">IT | 9 - 18</option>
             <option value="Night | 20 - 08">Night | 20 - 08</option>
             <option value="Inc">Incomplete</option>
         `;
         updateShiftCell.appendChild(selectShift);
     });
 
     // Show the N/A modal
     document.getElementById("na-shifts-modal").classList.remove("hidden");
 }
 function saveNaRecords() {
     let naShiftsTableBody = document.getElementById("na-shifts-table").getElementsByTagName("tbody")[0];
     let updatedRecords = [];
 
     // Fetch the uploadedData from localStorage
     let uploadedData = JSON.parse(localStorage.getItem("attendanceData")) || [];
 
     // Loop through each row and get the updated shift from the dropdown
     for (let i = 0; i < naShiftsTableBody.rows.length; i++) {
         let row = naShiftsTableBody.rows[i];
         let personID = row.cells[0].textContent;
         let date = row.cells[1].textContent;
         let updatedShift = row.cells[5].querySelector("select").value;
 
         // Find the corresponding record in uploadedData and update its shift
         let recordIndex = uploadedData.findIndex(record => record.person_id === personID && record.date === date);
         if (recordIndex !== -1) {
             uploadedData[recordIndex].shift = updatedShift;  // Update the shift value
             updatedRecords.push(uploadedData[recordIndex]);  // Save the updated record
         }
     }
 
     // Save the updated uploadedData to localStorage
     localStorage.setItem("attendanceData", JSON.stringify(uploadedData));
     let naMessage = document.createElement("div");
     naMessage.classList.add("loading-message2");
     naMessage.innerHTML = `✅ N/A shifts updated!`;
     document.body.appendChild(naMessage);
     // Wait before fading out
     setTimeout(() => {
         naMessage.classList.add("fade-out");

         setTimeout(() => {
             document.body.removeChild(naMessage);

         }, 3000); // Wait for fade-out animation to finish

     }, 500); // Show message for 2 seconds before starting fade

     closeModal('na-shifts-modal');


    const ms = document.getElementById('ms').value;
    const ms2 = document.getElementById('2ms').value;
    const ns = document.getElementById('ns').value;

    const msRate = parseFloat(ms) || 0;
    const secondMsRate = parseFloat(ms2) || 0;
    const nsRate = parseFloat(ns) || 0;
    savePayrollSetup();
    calculatePayroll(msRate, secondMsRate, nsRate);
    incRecordTable.classList.add("hidden");
    incRecordButton.innerHTML = "Inc Records";
 }
function calculatePayroll(msRate, secondMsRate, nsRate) {
    const incRecordButton = document.querySelector(".js-inc-record");

    let uploadedData = JSON.parse(localStorage.getItem("attendanceData")) || [];
    localStorage.removeItem("incRecordData");
    localStorage.removeItem("calculatedPayrollData");

    let incompleteRecords = localStorage.getItem("incRecordData");
    incompleteRecords = incompleteRecords ? JSON.parse(incompleteRecords) : [];

    if (incompleteRecords.length > 0) {
        incRecordButton.classList.remove("hidden");
    } else {
        incRecordButton.classList.add("hidden");
    }
    console.log('Holidays:', holidays, 'SuperVisors:', supervisors, 'OverTime:', overtime);//-----------------------------------

    let empShiftMap = {};
    uploadedData.forEach(entry => {
        const { person_id, shift } = entry;
        const personID = person_id.startsWith("'") ? person_id.substring(1) : person_id;

        // Count all shift types including "Absent"
        if (!empShiftMap[personID]) empShiftMap[personID] = {};
        if (!empShiftMap[personID][shift]) empShiftMap[personID][shift] = 0;
        empShiftMap[personID][shift]++;
    });

    // console.log("empShiftMap:", empShiftMap);

    let mostCommonShiftMap = {};
    for (let empId in empShiftMap) {
        let shifts = empShiftMap[empId];
        let maxCount = 0;
        let mostCommonShift = "";

        let hasNonAbsentShift = Object.keys(shifts).some(shift => shift !== "Absent");

        for (let shiftName in shifts) {
            // If non-absent shifts exist, skip counting "Absent"
            if (hasNonAbsentShift && shiftName === "Absent") continue;

            if (shifts[shiftName] > maxCount) {
                maxCount = shifts[shiftName];
                mostCommonShift = shiftName;
            }
        }

        // If no non-absent shift was found, assign "Absent"
        mostCommonShiftMap[empId] = mostCommonShift || "Absent";
    }

    // console.log("Most Common Shift Map (for rate purposes):", mostCommonShiftMap);


    let groupedData = {};
    uploadedData.forEach(row => {
        let personID = row.person_id.startsWith("'") ? row.person_id.substring(1) : row.person_id;
        let date = row.date;
        let checkIn = row.check_in;
        let checkOut = row.check_out;
        let workStart, workEnd;
        let workDurationSeconds = 0, lateSeconds = 0, earlyLeaveSeconds = 0;
        let isAbsent = false, isIncomplete = false, isNA = false;
        let shift = row.shift;
        let rate = 0;
        let workHours = 0;

        // HOLIDAY LOGIC
        let isHoliday = false;
        let holidayPercent = null;
        let holidayInfo = holidays.find(h => h && h.date && new Date(h.date).toLocaleDateString() === new Date(date).toLocaleDateString());
        if (holidayInfo) {
            isHoliday = true;
            holidayPercent = holidayInfo.percent;
            console.log("Holiday found:", holidayInfo);
        }

        // SUPERVISOR LOGIC
        let supervisor = supervisors.find(s => s.empId === personID);
        let isSupervisor = Boolean(supervisor);

        if (isSupervisor) {
            if (shift !== "Absent" && shift !== "Inc" && shift !== "N/A") {
                rate = parseFloat(supervisor.rate); // Override rate
                console.log("empId:", supervisor.empId, "rate:", supervisor.rate);
            }
        }    
    
        if (shift === "Absent") {
            isAbsent = true;
            if (isHoliday) {
                console.log("Holiday detected!");
                let commonShift = mostCommonShiftMap[personID];
                if (commonShift) {
                    // console.log(`Common Shift for ${personID}: ${commonShift}`);
                    if (isSupervisor) {
                        rate = parseFloat(supervisor.rate);
                        console.log("Holiday Supervisor Rate:", supervisor.rate);
                    } else {
                        switch (commonShift) {
                            case "Night | 20 - 08":
                                rate = nsRate;
                                break;
                            case "Morning | 9 - 18":
                                rate = msRate;
                                break;
                            case "Morning | 8 - 20":
                                rate = secondMsRate;
                                break;
                        }
                    }
                } else {
                    console.warn(`No common shift found for ${personID}, cannot assign rate for holiday.`);
                }
            }
        } else if (shift === "Inc") {
            isIncomplete = true;
            incompleteRecords.push({ personID, date, shift, checkIn, checkOut });
            localStorage.setItem("incRecordData", JSON.stringify(incompleteRecords));
        }else if (shift === "N/A") {
            isNA = true;
            incompleteRecords.push({ personID, date, shift, checkIn, checkOut });
            localStorage.setItem("incRecordData", JSON.stringify(incompleteRecords));
        } else {
            let checkInTime = new Date(`${date} ${checkIn}`);
            let checkOutTime = new Date(`${date} ${checkOut}`);
            switch (shift) {
                case "Night | 20 - 08":
                    workStart = new Date(`${date} 20:00:00`);
                    workEnd = new Date(`${date} 08:00:00`);
                    workEnd.setDate(workEnd.getDate() + 1); // Adjust for next day
                    if (!isSupervisor) rate = nsRate;
                    workHours = 12;
                    break;
    
                case "Morning | 9 - 18":
                    workStart = new Date(`${date} 09:00:00`);
                    workEnd = new Date(`${date} 18:00:00`);
                    if (!isSupervisor) rate = msRate;
                    workHours = 9;
                    break;

                case "Morning | 8 - 20":
                    workStart = new Date(`${date} 08:00:00`);
                    workEnd = new Date(`${date} 20:00:00`);
                    if (!isSupervisor) rate = secondMsRate;
                    workHours = 12;
                    break;

                    
                default:
                    isIncomplete = true;
                    incompleteRecords.push({ personID, date, shift, checkIn, checkOut });
                    localStorage.setItem("incRecordData", JSON.stringify(incompleteRecords));
                    return;
            }

            if (!isIncomplete) {
                if (checkInTime < workStart) {
                    checkInTime = workStart;
                } else {
                    let roundedCheckIn = new Date(workStart);
                    roundedCheckIn.setMinutes(workStart.getMinutes() + 1);
                    if (checkInTime < roundedCheckIn) {
                        checkInTime = workStart;
                    }
                }
                if (checkOutTime > workEnd) checkOutTime = workEnd;

                if (shift === "Night | 20 - 08") {
                    let checkInSeconds = checkInTime.getHours() * 3600 + checkInTime.getMinutes() * 60 + checkInTime.getSeconds();
                    let checkOutSeconds = checkOutTime.getHours() * 3600 + checkOutTime.getMinutes() * 60 + checkOutTime.getSeconds();
                    workDurationSeconds = Math.abs((86400 - checkInSeconds) + checkOutSeconds);
                } else {
                    workDurationSeconds = Math.abs(checkOutTime - checkInTime) / 1000;
                }
                
                let workStartSeconds = workStart.getHours() * 3600 + workStart.getMinutes() * 60 + workStart.getSeconds();
                let workEndSeconds = workEnd.getHours() * 3600 + workEnd.getMinutes() * 60 + workEnd.getSeconds();
                let checkInSeconds = checkInTime.getHours() * 3600 + checkInTime.getMinutes() * 60 + checkInTime.getSeconds();
                let checkOutSeconds = checkOutTime.getHours() * 3600 + checkOutTime.getMinutes() * 60 + checkOutTime.getSeconds();

                if (checkInSeconds > workStartSeconds) {
                    lateSeconds = (Math.floor((checkInSeconds - workStartSeconds)/60)) * 60;
                }
                if(checkOutSeconds < workEndSeconds) {
                    earlyLeaveSeconds = (Math.floor((workEndSeconds - checkOutSeconds)/60)) * 60;
                }
                // console.log(`---------Person ID: ${personID}`);
                // console.log(`early leave Seconds: ${earlyLeaveSeconds}`);
                // console.log(`shift: ${shift}`);
                // console.log(`Final Check-in: ${checkInTime}`);
                // console.log(`Final Check-out: ${checkOutTime}`);
                // console.log(`Calculated Work Duration: ${workDurationSeconds}`);
                // console.log(`WorkStartSeconds: ${workStartSeconds}`);
                // console.log(`CheckInSeconds: ${checkInSeconds}`);
                // console.log(`CheckOUtSeconds: ${checkOutSeconds}`);
                // console.log(`Late Seconds: ${lateSeconds}`);
            }
        }

        if (!groupedData[personID]) {
            groupedData[personID] = {
                firstDate: date,
                lastDate: date,
                totalHours: 0,
                lateTotal: 0,
                earlyLeave: 0,
                incRecords: 0,
                absentRecords: 0,
                totalDays: 0,
                totalEarnings: 0,
                totalDeduction: 0,
                rate: rate,
                workHours: workHours,
                otHours: 0
            };
        } else {
            if (new Date(date) < new Date(groupedData[personID].firstDate)) {
                groupedData[personID].firstDate = date;
            }
            if (new Date(date) > new Date(groupedData[personID].lastDate)) {
                groupedData[personID].lastDate = date;
            }
        }
        groupedData[personID].totalDays++;

        let record = groupedData[personID];
       
        if (!isIncomplete) {
            record.totalHours += workDurationSeconds;
            record.lateTotal += lateSeconds;
            record.earlyLeave += earlyLeaveSeconds;
            record.totalDeduction += (lateSeconds / 60) + (earlyLeaveSeconds / 60);
            if (isHoliday) {
                const holidayType = holidayPercent;
                console.log("Holiday found:", holidayInfo);
                if (holidayType === "thirtyPercent") {
                    if (!isAbsent) {
                        record.totalEarnings += rate * 1.3;
                    }
                } else if (holidayType === "doublePay") {
                    record.totalEarnings += isAbsent ? rate : rate * 2;
                }else {
                    record.totalEarnings += rate;
                }
            } else {
                record.totalEarnings += rate;
            }
            
        }
        if (isIncomplete) record.incRecords += 1;
        if (isAbsent) record.absentRecords += 1;
        if (isNA) record.incRecords += 1;

        record.totalHours = Math.abs(record.totalHours);
        record.lateTotal = Math.abs(record.lateTotal);

        record.formattedTotalHours = formatSecondsToHHMMSS(record.totalHours);
        record.formattedLateTotal = formatSecondsToHHMMSS(record.lateTotal);
        record.formattedEarlyLeave = formatSecondsToHHMMSS(record.earlyLeave);
    });

    // OT LOGIC
    Object.keys(groupedData).forEach(personID => {
        let record = groupedData[personID];
        let otInfo = overtime.find(ot => ot.empIds === personID); // Use personID instead of record.personID

        if (otInfo) {
            let otHours = parseFloat(otInfo.hours);
            let otPercent = parseFloat(otInfo.percent);
            let hourlyRate = record.rate / record.workHours;
            let perHourOTRate = hourlyRate * otPercent;
            let totalOTPay = Math.round(perHourOTRate * otHours * 100) / 100;
            record.otPay = totalOTPay;
            record.totalEarnings += totalOTPay;
            record.formattedOTHours = formatSecondsToHHMMSS(otHours * 3600);

            console.log("Parsed otHours:", otHours);
            console.log("Parsed otPercent:", otPercent);
            console.log("record.rate:", record.rate);
            console.log("record.workHours:", record.workHours);
            console.log("hourlyRate:", hourlyRate);
            console.log("perHourOTRate:", perHourOTRate);
            console.log("totalOTPay:", totalOTPay);




        }
    });



    let tableBody = document.getElementById("calculated-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    const button = document.querySelector(`.sidebar-button[data-page="payrollReport"]`);
    button.removeAttribute("disabled");
    if (button) {
        button.click();
    }

    calculatedData = [];

    Object.keys(groupedData).forEach(personID => {
        let record = groupedData[personID];
        let tr = document.createElement("tr");
        console.log("otHours:", record.formattedOTHours, "otPay:", record.otPay);
        tr.innerHTML = `
            <td>${personID}</td>
            <td>${record.firstDate} - ${record.lastDate}</td>
            <td>${record.totalDays}</td>
            <td>${record.formattedTotalHours === "00:00:00" ? "-" : record.formattedTotalHours}</td>
            <td>${!record.formattedOTHours || record.formattedOTHours === "00:00:00" ? "-" : record.formattedOTHours}</td>
            <td>${record.formattedLateTotal === "00:00:00" ? "-" : record.formattedLateTotal}</td>
            <td>${record.formattedEarlyLeave === "00:00:00" ? "-" : record.formattedEarlyLeave}</td>
            <td>${record.absentRecords > 0 ? record.absentRecords : "-"}</td>
            <td>${record.incRecords > 0 ? record.incRecords : "-"}</td>
            <td style="color: rgb(100, 210, 200);">${!record.otPay ? "-" : "₱" + record.otPay}</td>
            <td style="color:rgb(104, 201, 240);"> ${record.totalEarnings === 0 ? "-" : "₱" + record.totalEarnings}</td>
            <td style="color:rgb(252, 169, 169);">${record.totalDeduction === 0 ? "-" : "₱" + record.totalDeduction}</td>
            <td style="color:rgb(181, 245, 201);"> ${(record.totalEarnings - record.totalDeduction) === 0 ? "-" : "₱" + (record.totalEarnings - record.totalDeduction)}</td>
        `;
        tableBody.appendChild(tr);

        calculatedData = JSON.parse(localStorage.getItem("calculatedPayrollData")) || [];
        calculatedData.push({
        personID: personID,
        dateRange: `${record.firstDate} - ${record.lastDate}`,
        totalDays: record.totalDays,
        totalHours: record.formattedTotalHours === "00:00:00" ? "-" : record.formattedTotalHours,
        otHours: !record.formattedOTHours || record.formattedOTHours === "00:00:00" ? "-" : record.formattedOTHours,
        lateTotal: record.formattedLateTotal === "00:00:00" ? "-" : record.formattedLateTotal,
        undertime: record.formattedEarlyLeave === "00:00:00" ? "-" : record.formattedEarlyLeave,
        absentRecords: record.absentRecords > 0 ? record.absentRecords : "-",
        incompleteRecords: record.incRecords > 0 ? record.incRecords : "-",
        otPay: !record.otPay ? "-" : "₱" + record.otPay,
        grossPay: `₱${record.totalEarnings}`,
        totalDeduction: `₱${record.totalDeduction > 0 ? record.totalDeduction : "0"}`,
        netPay: `₱${record.totalEarnings - record.totalDeduction}`  
        });
        localStorage.setItem("calculatedPayrollData", JSON.stringify(calculatedData));
    });
    setupPagination("calculate-table"); // Ensure this is here

    if (incompleteRecords.length > 0) {
        incRecordButton.classList.remove("hidden");
    } else {
        incRecordButton.classList.add("hidden");
    }
}

function formatSecondsToHHMMSS(totalSeconds) {
    let hours = Math.floor(totalSeconds / 3600);
    let remainingSeconds = totalSeconds % 3600;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}