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

$IncompleteData = $data["tableData"];

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Set headers
$headers = ["person id", "Date", "Shift", "Time-In", "Time-Out"];
$column = "A";

foreach ($headers as $header) {
    $sheet->setCellValue($column . '1', $header);
    $column++;
}

// Populate the spreadsheet with attendance data
$row = 2;
foreach ($IncompleteData as $record) {
    $sheet->setCellValue("A$row", $record["personID"] ?? "N/A");
    $sheet->setCellValue("B$row", $record["date"] ?? "N/A");
    $sheet->setCellValue("C$row", $record["shift"] ?? "N/A");
    $sheet->setCellValue("D$row", $record["checkIn"] ?? "N/A");
    $sheet->setCellValue("E$row", $record["checkOut"] ?? "N/A");
    $row++;
}

// Set proper headers for Excel download
header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header("Content-Disposition: attachment; filename=IncRecord_Report.xlsx");
header("Cache-Control: max-age=0");

$writer = new Xlsx($spreadsheet);
$writer->save("php://output");
exit;
?>