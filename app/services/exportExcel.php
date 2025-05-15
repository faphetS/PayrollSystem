<?php
require __DIR__ . '/../../vendor/autoload.php'; 

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate input data
if (!isset($data["tableData"]) || empty($data["tableData"])) {
    header("Content-Type: application/json");
    echo json_encode(["error" => "No data available"]);
    exit;
}

$attendanceData = $data["tableData"];

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Set headers
$headers = ["person id", "Name", "Date", "shift", "Check-in", "Check-out"];
$column = "A";

foreach ($headers as $header) {
    $sheet->setCellValue($column . '1', $header);
    $column++;
}

// Populate the spreadsheet with attendance data
$row = 2;
foreach ($attendanceData as $record) {
    $sheet->setCellValue("A$row", $record["person_id"] ?? "-");
    $sheet->setCellValue("B$row", $record["person_id"] ?? "-");

    // Format date properly if valid
    // if (!empty($record["date"]) && strtotime($record["date"])) {
    //     $excelDate = ExcelDate::PHPToExcel(new DateTime($record["date"]));
    //     $sheet->setCellValue("C$row", $excelDate);
    //     $sheet->getStyle("C$row")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_YYYYMMDD);
    // } else {
        $sheet->setCellValue("C$row", $record["date"] ?? "-");
    // }

    $sheet->setCellValue("D$row", $record["shift"] ?? "-");

    // Format Check-in time
    if (!empty($record["check_in"]) && strtotime($record["check_in"])) {
        $checkIn = ExcelDate::PHPToExcel(new DateTime($record["check_in"]));
        $sheet->setCellValue("E$row", $checkIn);
        $sheet->getStyle("E$row")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_TIME4); // h:mm:ss AM/PM
    } else {
        $sheet->setCellValue("E$row", "-");
    }

    // Format Check-out time
    if (!empty($record["check_out"]) && strtotime($record["check_out"])) {
        $checkOut = ExcelDate::PHPToExcel(new DateTime($record["check_out"]));
        $sheet->setCellValue("F$row", $checkOut);
        $sheet->getStyle("F$row")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_TIME4);
    } else {
        $sheet->setCellValue("F$row", "-");
    }

    $row++;
}

// Set headers for Excel download
header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header("Content-Disposition: attachment; filename=Attendance_Report.xlsx");
header("Cache-Control: max-age=0");

$writer = new Xlsx($spreadsheet);
$writer->save("php://output");
exit;
?>
