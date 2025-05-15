<?php
namespace Services;

require __DIR__ . '/../../vendor/autoload.php'; 
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Exception;


class ExcelService {
    public function handleRequest() {
        header("Content-Type: application/json");
        
        if ($_SERVER["REQUEST_METHOD"] !== "POST" || empty($_FILES["excel_file"])) {
            echo json_encode(["error" => "Invalid request or file missing"]);
            exit;
        }

        $file = $_FILES["excel_file"]["tmp_name"];
        $fileName = $_FILES["excel_file"]["name"];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        // Allow only xlsx, xls, or csv files
        $allowedExtensions = ["xlsx", "xls", "csv"];
        if (!in_array($fileExtension, $allowedExtensions)) {
            echo json_encode(["error" => "Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file."]);
            exit;
        }

        // Check if the file is readable
        if (!file_exists($file) || !is_readable($file)) {
            echo json_encode(["error" => "File cannot be read."]);
            exit;
        }

        // Process file based on type
        $response = ($fileExtension === "csv") ? $this->processCsvFile($file) : $this->processExcelFile($file);
        echo json_encode($response);
    }

    public function processExcelFile($filePath) {
        try {
            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);
    
            $data = [];
            $headerMap = [];
            
            // Extract headers from the first row
            if (!empty($rows)) {
                $headerRow = array_shift($rows);
                foreach ($headerRow as $col => $header) {
                    $normalizedHeader = strtolower(trim($header));
                    $headerMap[$normalizedHeader] = $col; // Map column name to letter
                }
            }
    
            // Expected headers
            $expectedHeaders = ["person id", "name", "date", "check-in", "check-out"];
    
            // Ensure required headers exist
            foreach ($expectedHeaders as $expectedHeader) {
                if (!isset($headerMap[$expectedHeader])) {
                    return ["error" => "Missing required column: $expectedHeader"];
                }
            }
    
            foreach ($rows as $row) {
                $person_id_raw = isset($row[$headerMap["person id"]]) ? trim($row[$headerMap["person id"]], "'") : "";
                $name_raw = isset($row[$headerMap["name"]]) ? trim($row[$headerMap["name"]]) : "";
            
                // Use name as person_id if person_id is empty
                $person_id = $person_id_raw !== "" ? $person_id_raw : $name_raw;
                $name = $name_raw;
            
                // Skip if both person_id and name are empty
                if ($person_id === "" || preg_match('/^Check-In Time:/', $person_id)) continue;
            
                $data[] = [
                    "person_id" => $person_id,
                    "name" => $name !== "" ? $name : "N/A",
                    "date" => isset($row[$headerMap["date"]]) ? $this->normalizeDate($row[$headerMap["date"]]) : "N/A",
                    "check_in" => isset($row[$headerMap["check-in"]]) ? $this->formatTimeColumn($row[$headerMap["check-in"]]) : "-",
                    "check_out" => isset($row[$headerMap["check-out"]]) ? $this->formatTimeColumn($row[$headerMap["check-out"]]) : "-"
                ];
            }
    
            return ["success" => true, "data" => $data];
    
        } catch (Exception $e) {
            return ["error" => "Error processing Excel file", "details" => $e->getMessage()];
        }
    }
    

    public function processCsvFile($filePath) {
        try {
            $file = fopen($filePath, "r");
            if (!$file) {
                return ["error" => "Unable to open CSV file"];
            }
    
            $data = [];
            $header = fgetcsv($file); // Read the first row as headers
    
            if (!$header) {
                return ["error" => "CSV file has no headers"];
            }
    
            // Normalize header keys (lowercase and trimmed)
            $normalizedHeader = array_map(function ($h) {
                return strtolower(trim($h));
            }, $header);
    
            $expectedHeaders = ["person id", "name", "date", "check-in", "check-out"];
    
            foreach ($expectedHeaders as $expectedHeader) {
                if (!in_array($expectedHeader, $normalizedHeader)) {
                    return ["error" => "Missing required column: $expectedHeader"];
                }
            }
    
            while ($row = fgetcsv($file)) {
                if (count($normalizedHeader) !== count($row)) {
                    continue;
                }
    
                $rowData = array_combine($normalizedHeader, $row);
    
                $person_id_raw = isset($rowData["person id"]) ? trim($rowData["person id"], "'") : "";
                $name_raw = isset($rowData["name"]) ? trim($rowData["name"]) : "";
    
                $person_id = $person_id_raw !== "" ? $person_id_raw : $name_raw;
                $name = $name_raw;
    
                // Filter invalid rows just like in Excel
                if ($person_id === "" || preg_match('/^Check-In Time:/', $person_id)) {
                    continue;
                }
    
                $data[] = [
                    "person_id" => $person_id,
                    "name" => $name !== "" ? $name : "N/A",
                    "date" => isset($rowData["date"]) ? $this->normalizeDate($rowData["date"]) : "N/A",
                    "check_in" => isset($rowData["check-in"]) ? $this->formatTimeColumn($rowData["check-in"]) : "-",
                    "check_out" => isset($rowData["check-out"]) ? $this->formatTimeColumn($rowData["check-out"]) : "-"
                ];
            }
    
            fclose($file);
            return ["success" => true, "data" => $data];
    
        } catch (Exception $e) {
            return ["error" => "Error processing CSV file", "details" => $e->getMessage()];
        }
    }
    
    
    

    private function normalizeDate($value) {
        if (empty($value) || trim($value) === "-") {
            return "N/A";
        }
    
        if (is_numeric($value)) {
            return date("m/d/Y", Date::excelToTimestamp($value)); // Month first
        }
    
        if (preg_match('/(\d{4})?年?(\d{1,2})月(\d{1,2})日/', $value, $matches)) {
            $year = isset($matches[1]) ? $matches[1] : date("Y");
            $month = str_pad($matches[2], 2, "0", STR_PAD_LEFT);
            $day = str_pad($matches[3], 2, "0", STR_PAD_LEFT);
            return "$month/$day/$year"; // Month first
        }
    
        if (preg_match('/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/', $value, $matches)) {
            return "{$matches[1]}/{$matches[2]}/{$matches[3]}"; // Month first
        }
    
        if (preg_match('/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/', $value)) {
            return date("m/d/Y", strtotime($value)); // Month first
        }
        
    
        $timestamp = strtotime($value);
        return $timestamp ? date("m/d/Y", $timestamp) : "Invalid Date"; // Month first
    }
    

    private function formatTimeColumn($value) {
        if (empty($value) || trim($value) === "-") {
            return "-";
        }

        $value = trim($value);

        if (is_numeric($value)) {
            return date("H:i:s", Date::excelToTimestamp($value));
        }

        if (preg_match('/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/', $value, $matches)) {
            $hours = str_pad($matches[1], 2, "0", STR_PAD_LEFT);
            $minutes = str_pad($matches[2], 2, "0", STR_PAD_LEFT);
            $seconds = isset($matches[3]) ? str_pad($matches[3], 2, "0", STR_PAD_LEFT) : "00";
            return "$hours:$minutes:$seconds";
        }

        if (preg_match('/\d{1,2}\/\d{1,2}\/\d{4} (\d{1,2}):(\d{1,2}) ?([APap][Mm])?/', $value, $matches)) {
            $hours = (int) $matches[1];
            $minutes = str_pad($matches[2], 2, "0", STR_PAD_LEFT);

            if (isset($matches[3])) {
                $ampm = strtolower($matches[3]);
                if ($ampm === 'pm' && $hours < 12) {
                    $hours += 12;
                } elseif ($ampm === 'am' && $hours == 12) {
                    $hours = 0;
                }
            }

            return str_pad($hours, 2, "0", STR_PAD_LEFT) . ":$minutes:00";
        }

        $timestamp = strtotime($value);
        return $timestamp ? date("H:i:s", $timestamp) : $value;
    }
}

(new ExcelService())->handleRequest();
