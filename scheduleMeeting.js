// scheduleMeeting.js

// Google Calendar Constants
const CLIENT_ID = "922908217557-2osq9upebgcpke4jl560hqbl77eodu5i.apps.googleusercontent.com"; // Replace with your new OAuth 2.0 Client ID
const API_KEY = "YOUR_NEW_API_KEY";     // Replace with your new API Key
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize Google API
export async function initGoogleCalendar() {
  console.log("Initializing Google Calendar...");
  
  return new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        console.log("GAPI initialized successfully");
        
        // Initialize the tokenClient
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // Will be set later
        });
        gisInited = true;
        console.log("Token client initialized");
        
        resolve();
      } catch (err) {
        console.error("Error initializing Google Calendar:", err);
        reject(err);
      }
    });
  });
}

// Schedule a meeting using Google Calendar API
export async function scheduleMeetingWithAPI(title, description) {
  console.log("Attempting to schedule meeting...");
  
  if (!gapiInited || !gisInited) {
    console.error("APIs not initialized:", { gapiInited, gisInited });
    alert("Please wait a moment while we initialize Google Calendar");
    return;
  }

  // Request user consent and create event
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      console.error("Auth error:", resp.error);
      alert("Error in authentication: " + resp.error);
      return;
    }
    
    console.log("Authentication successful, creating event...");
    try {
      await createCalendarEvent(title, description);
    } catch (err) {
      console.error("Calendar creation error:", err);
      alert("Error creating event: " + err.message);
    }
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

// Create the calendar event
async function createCalendarEvent(title, description) {
  const event = {
    summary: `Meeting about ${title}`,
    description: `Interested in buying: ${description}`,
    location: "Rutgers University",
    start: {
      dateTime: new Date(Date.now() + 3600000).toISOString(),
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: new Date(Date.now() + 7200000).toISOString(),
      timeZone: 'America/New_York'
    }
  };

  try {
    const request = {
      calendarId: 'primary',
      resource: event
    };
    console.log("Sending calendar event request...");
    const response = await gapi.client.calendar.events.insert(request);
    console.log("Event created successfully:", response);
    alert(`Event created! View it here: ${response.result.htmlLink}`);
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error(error.result?.error?.message || error.message || "Failed to create calendar event");
  }
}

// Function to create calendar link (fallback method)
export function createCalendarLink(title, description) {
  const location = "Rutgers University";
  const start = new Date(Date.now() + 3600000);
  const end = new Date(start.getTime() + 3600000);

  function formatDate(d) {
    return d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  }

  const dates = `${formatDate(start)}/${formatDate(end)}`;
  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&details=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(location)}` +
    `&dates=${dates}`;

  window.open(url, "_blank");
}
