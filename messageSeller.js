// messageSeller.js

export function messageSeller() {
    const params      = new URLSearchParams(window.location.search);
    const title       = params.get("title")       || "your listing";
    const sellerEmail = params.get("sellerEmail") || "";
  
    if (!sellerEmail) {
      alert("Seller email not provided.");
      return;
    }
  
    const subject = encodeURIComponent(`Question about "${title}"`);
    window.location.href = `mailto:${sellerEmail}?subject=${subject}`;
  }
  
  // If not using ES modules, uncomment to expose globally:
  // window.messageSeller = messageSeller;
  