export function messageSeller() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title") || "your listing";
    const sellerEmail = params.get("sellerEmail") || "";
  
    if (!sellerEmail) {
      alert("Seller email not provided.");
      return;
    }
  
    const confirmMessage = `Are you sure you want to send an email to:\n\nSeller: ${sellerEmail}\nAbout: ${title}\n\nThis will open Gmail in a new tab.`;
   
    if (confirm(confirmMessage)) {
      const subject = encodeURIComponent(`Question about "${title}"`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(sellerEmail)}&su=${subject}`;
      window.open(gmailUrl, '_blank');
    }
    
}