<?php
require __DIR__ . '/../../vendor/autoload.php'; 

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate input data
if (!isset($data["tableData"]) || empty($data["tableData"])) {
    header("Content-Type: application/json");
    echo json_encode(["error" => "No data available"]);
    exit;
}

$payrollData = $data["tableData"];

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Set headers
$headers = ["person id", "Date Range", "Days", "Total Hours", "OT Hours", "Late", "Undertime", "Absent", "INC", "OT Pay", "Gross Pay", "Deduction", "Net Pay"];
$column = "A";

foreach ($headers as $header) {
    $sheet->setCellValue($column . '1', $header);
    $column++;
}

// Populate the spreadsheet with attendance data
$row = 2;
foreach ($payrollData as $record) {
    $sheet->setCellValue("A$row", $record["personID"] ?? "N/A");
    $sheet->setCellValue("B$row", $record["dateRange"] ?? "N/A");
    $sheet->setCellValue("C$row", $record["totalDays"] ?? "N/A");
    $sheet->setCellValue("D$row", $record["totalHours"] ?? "N/A");
    $sheet->setCellValue("E$row", $record["otHours"] ?? "N/A");
    $sheet->setCellValue("F$row", $record["lateTotal"] ?? "N/A");
    $sheet->setCellValue("G$row", $record["undertime"] ?? "N/A");
    $sheet->setCellValue("H$row", $record["absentRecords"] ?? "N/A");
    $sheet->setCellValue("I$row", $record["incompleteRecords"] ?? "N/A");
    $sheet->setCellValue("J$row", $record["otPay"] ?? "N/A");
    $sheet->setCellValue("K$row", $record["grossPay"] ?? "N/A");
    $sheet->setCellValue("L$row", $record["totalDeduction"] ?? "N/A");
    $sheet->setCellValue("M$row", $record["netPay"] ?? "N/A");
    $row++;
}

// Set proper headers for Excel download
header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header("Content-Disposition: attachment; filename=Payroll_Report.xlsx");
header("Cache-Control: max-age=0");

$writer = new Xlsx($spreadsheet);
$writer->save("php://output");
exit;
?>