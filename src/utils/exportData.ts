import { Evidence } from "@/types/evidence";

export const exportToCSV = (data: Evidence[], filename: string = "evidence-export.csv") => {
  // Define CSV headers
  const headers = [
    "Title",
    "Company",
    "Customer Name",
    "Email",
    "Job Title",
    "Type",
    "Product",
    "Status",
    "Content",
    "Results",
    "Use Cases",
    "Created At",
    "Updated At",
    "File URL"
  ];

  // Convert data to CSV rows
  const rows = data.map(item => [
    item.title,
    item.company,
    item.customerName,
    item.email,
    item.jobTitle || "",
    item.evidenceType,
    item.product,
    item.status,
    item.content.replace(/"/g, '""'), // Escape quotes
    item.results?.replace(/"/g, '""') || "",
    item.useCases?.replace(/"/g, '""') || "",
    item.createdAt,
    item.updatedAt,
    item.fileUrl || ""
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: Evidence[], filename: string = "evidence-export.json") => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
