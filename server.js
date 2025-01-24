// const express = require("express");
// const http = require("http");
// const path = require("path");
// const app = express();

// const port = process.env.PORT || 4050;
// app.use(express.json());

// // Serve static files from the "build" directory
// app.use(express.static(path.resolve(__dirname, "./frontend/build")));

// // Handle requests for the root URL
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "./frontend/build", "index.html"));
// });

// const server = http.createServer(app);

// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors"); // Import the CORS middleware
const axios = require("axios");

const app = express();
const port = process.env.PORT || 4050;

// Enable CORS for all routes
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Serve static files from the "build" directory
app.use(express.static(path.resolve(__dirname, "./frontend/build")));

// API endpoint to fetch faculty meeting times
app.get("/api/facultyMeetingTimes", async (req, res) => {
  const { term, crn } = req.query;

  if (!term || !crn) {
    return res.status(400).send("Missing 'term' or 'crn' query parameter.");
  }

  const url = `https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/searchResults/getFacultyMeetingTimes?term=${term}&courseReferenceNumber=${crn}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const result = {
      buildingDescription: data.fmt[0]?.meetingTime?.buildingDescription || "",
      room: data.fmt[0]?.meetingTime?.room || "",
      meetingTime: [
        data.fmt[0]?.meetingTime?.monday && "Monday",
        data.fmt[0]?.meetingTime?.tuesday && "Tuesday",
        data.fmt[0]?.meetingTime?.wednesday && "Wednesday",
        data.fmt[0]?.meetingTime?.thursday && "Thursday",
        data.fmt[0]?.meetingTime?.friday && "Friday",
      ].filter(Boolean),
      meetingType: data.fmt[0]?.meetingTime?.meetingType || "",
      beginTime: data.fmt[0]?.meetingTime?.beginTime || "",
      endTime: data.fmt[0]?.meetingTime?.endTime || "",
      displayName: data.fmt[0]?.faculty[0]?.displayName || "",
      emailAddress: data.fmt[0]?.faculty[0]?.emailAddress || "",
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching faculty meeting times:", error.message);
    res.status(500).send("Error fetching faculty meeting times.");
  }
});

// API endpoint to fetch class details
app.post("/api/classDetails", async (req, res) => {
  const { term, crn } = req.body;

  if (!term || !crn) {
    return res.status(400).send("Missing 'term' or 'crn' in request body.");
  }

  const url =
    "https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/searchResults/getClassDetails";
  const formData = new URLSearchParams();
  formData.append("term", term);
  formData.append("courseReferenceNumber", crn);

  try {
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const html = response.data;

    // Helper function to remove HTML tags
    const stripHTML = (htmlString) => htmlString.replace(/<[^>]*>/g, "").trim();

    const sections = html.split('<span class="status-bold">');

    const result = {};
    sections.forEach((section, index) => {
      if (index === 0) return; // Skip the first part
      const keyMatch = section.match(/([^<]*)<\/span>/);
      if (!keyMatch) return;
      const key = keyMatch[1].replace(":", "").trim();
      const remainingText = section.slice(keyMatch[0].length);
      const value = stripHTML(remainingText);
      result[key] = value;
    });

    const returnData = {
      subject: result["Subject"] || "",
      courseNumber: result["Course Number"] || "",
    };

    res.json(returnData);
  } catch (error) {
    console.error("Error fetching class details:", error.message);
    res.status(500).send("Error fetching class details.");
  }
});

// Start the server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
