// scheduleMeeting.js

export function scheduleMeeting() {
  // Get listing details from URL params
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title') || 'Product Meetup';
  const description = params.get('description') || '';
  const sellerEmail = params.get('sellerEmail') || '';
  
  const location = "Rutgers University";
  const start = new Date(Date.now() + 3600000); // 1 hour from now
  const end = new Date(start.getTime() + 3600000); // 2 hours from now

  function formatDate(d) {
    return d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  }

  const eventDetails = `Interested in buying: ${title}${description}`;

  const dates = `${formatDate(start)}/${formatDate(end)}`;
  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`Interested in buying ${title}`)}` +
    `&details=${encodeURIComponent(eventDetails)}` +
    `&location=${encodeURIComponent(location)}` +
    `&dates=${dates}` +
    (sellerEmail ? `&add=${encodeURIComponent(sellerEmail)}` : '');

  window.open(url, "_blank");
}
