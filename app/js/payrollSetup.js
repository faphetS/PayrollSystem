// Holiday Section
document.getElementById('add-holiday-btn').addEventListener('click', function () {
    const wrapper = document.querySelector('.holiday-wrapper');
    const original = wrapper.querySelector('.holiday-inputs');

    const clone = original.cloneNode(true);
    clone.querySelectorAll('input, select').forEach(x => {
        if (x.tagName === 'INPUT') {
            x.value = '';
        } else if (x.tagName === 'SELECT') {
            x.selectedIndex = 0;
        }
    });

    wrapper.appendChild(clone);
});

// Supervisor Section
document.getElementById('add-supervisor-btn').addEventListener('click', function () {
    const wrapper = document.querySelector('.supervisor-wrapper');
    const original = wrapper.querySelector('.supervisor-inputs');

    const clone = original.cloneNode(true);
    clone.querySelectorAll('input, select').forEach(x => {
        if (x.tagName === 'INPUT') {
            x.value = '';
        } else if (x.tagName === 'SELECT') {
            x.selectedIndex = 0;
        }
    });

    wrapper.appendChild(clone);
});

// Overtime Section
document.getElementById('add-overtime-btn').addEventListener('click', function () {
    const wrapper = document.querySelector('.overtime-wrapper');
    const original = wrapper.querySelector('.overtime-inputs');

    const clone = original.cloneNode(true);
    clone.querySelectorAll('input, select').forEach(x => {
        if (x.tagName === 'INPUT') {
            x.value = '';
        } else if (x.tagName === 'SELECT') {
            x.selectedIndex = 0;
        }
    });

    wrapper.appendChild(clone);
});

let holidays = [];
let supervisors = [];
let overtime = [];
function savePayrollSetup(){
    holidays.length = 0;
    supervisors.length = 0;
    overtime.length = 0;

    const holidayDates = document.querySelectorAll('input[name="holiday-date[]"]');
    const holidayPercentages = document.querySelectorAll('select[name="holiday-percentage[]"]');
    // 
    const empIds = document.querySelectorAll('select[name="sup-emp-id[]"]');
    const rates = document.querySelectorAll('input[name="sup-rate[]"]');
    // 
    const empIdsOt = document.querySelectorAll('.overtime-wrapper select[name="sup-emp-id[]"]');
    const hours = document.querySelectorAll('input[name="ot-hours[]"]');
    const percentages = document.querySelectorAll('.overtime-wrapper select[name="holiday-percentage[]"]');

    holidayDates.forEach((input, index) => {
        holidays.push({
            date: input.value,
            percent: holidayPercentages[index].value
        });
    });
    empIds.forEach((select, index) => {
        if (rates[index]) {
            supervisors.push({
                empId: select.value,
                rate: rates[index].value
            });
        }
    });
    empIdsOt.forEach((select, index) => {
        overtime.push({
            empIds: select.value,
            hours: hours[index].value,
            percent: percentages[index].value
        });
    });
}