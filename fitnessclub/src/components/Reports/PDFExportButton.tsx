import React from "react";
import { API_BASE_URL } from "../../api";

const PDFExportButton: React.FC<{ visits: any[] }> = ({ visits }) => {
  const handleExport = async () => {
    const res = await fetch(`${API_BASE_URL}/auth/export-visit-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ visits }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visit-history.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button className="btn" onClick={handleExport}>
      Export Visit History (PDF)
    </button>
  );
};

export default PDFExportButton;
