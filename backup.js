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
const fs = require("fs");
const app = express();
const port = process.env.PORT || 4050;

// Enable CORS for all routes
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Serve static files from the "build" directory
app.use(express.static(path.resolve(__dirname, "./frontend/build")));

app.get("/get_wait_time", (req, res) => {
  try {
    let ft_minutes = parseFloat(req.query.ft_minutes) || 1;
    let hour = parseInt(req.query.hour) || 0;
    let minute = parseInt(req.query.minute) || 0;

    console.log(ft_minutes, hour, minute);

    // Define peak traffic hours (3 PM, 4 PM, 5 PM ± 5 minutes)
    const peak_hours = [15, 16, 17];
    const is_peak = peak_hours.includes(hour) && (minute >= 50 || minute <= 5);

    // Adjust travel time
    let wait_time = is_peak ? ft_minutes : 15 * 1.2;

    res.json({ wait_time });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ wait_time: 999 }); // Send 999 if there's an error
  }
});

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

// Route to receive JSON and save to file
// app.post("/save", (req, res) => {
//   const jsonData = req.body;

//   fs.writeFile("output.json", JSON.stringify(jsonData, null, 2), (err) => {
//     if (err) {
//       console.error("❌ Error writing file:", err);
//       return res.status(500).json({ message: "Failed to save JSON" });
//     }
//     console.log("✅ JSON successfully saved to output.json");
//     res.json({ message: "JSON saved successfully!" });
//   });
// });

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to fetch all items
async function fetchItems() {
  try {
    const response = await axios.get("https://amhep.pythonanywhere.com/grades");
    console.log("✅ Fetched items:", JSON.stringify(response.data, null, 2));
    return Object.keys(response.data); // Extract item names
  } catch (error) {
    console.error(
      "❌ Failed to fetch items:",
      error.response ? error.response.status : error.message
    );
    return [];
  }
}

// Function to delete an item using multiple methods
async function deleteItem(item) {
  console.log(`🔹 Attempting to delete: "${item}"`);

  const encodedItem = encodeURIComponent(item);

  try {
    await axios.delete(
      `https://amhep.pythonanywhere.com/grades/${encodedItem}`
    );
    console.log(`✅ Successfully deleted "${item}" via URL encoding.`);
    return true;
  } catch (error) {
    console.error(
      `❌ DELETE failed via URL encoding: ${
        error.response ? error.response.status : error.message
      }`
    );
  }

  try {
    await axios.delete("https://amhep.pythonanywhere.com/grades", {
      data: { name: item },
    });
    console.log(`✅ Successfully deleted "${item}" via JSON body.`);
    return true;
  } catch (error) {
    console.error(
      `❌ DELETE failed via JSON body: ${
        error.response ? error.response.status : error.message
      }`
    );
  }

  if (
    item.includes("\u0000") ||
    item.includes("\uFEFF") ||
    item.includes("\u200B")
  ) {
    const doubleEncodedItem = encodeURIComponent(encodeURIComponent(item));

    try {
      await axios.delete(
        `https://amhep.pythonanywhere.com/grades/${doubleEncodedItem}`
      );
      console.log(`✅ Successfully deleted "${item}" via double encoding.`);
      return true;
    } catch (error) {
      console.error(
        `❌ DELETE failed via double encoding: ${
          error.response ? error.response.status : error.message
        }`
      );
    }
  }

  console.log(`❌ Unable to delete "${item}" using any method.`);
  return false;
}

// Function to delete all items before saving JSON
async function clearDatabase() {
  const items = await fetchItems();
  if (items.length === 0) {
    console.log("✅ No items found to delete. Database is already empty.");
    return { success: true, message: "Database already empty." };
  }

  for (const item of items) {
    await deleteItem(item);
    await delay(1000);
  }

  console.log("✅ Finished clearing the database.");
  return { success: true, message: "Database cleared successfully." };
}

// Function to process JSON and post it to the database
async function processAndPostJson(jsonFilePath) {
  console.log("🔹 Processing JSON and posting to database...");

  const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

  const beforeString = [
    "​    ​  ┣︎",
    "​    ​  ┣︎",
    "​      ┣︎",
    "​      ┣︎",
    "​ ​     ┣",
  ];

  const customLine = ["​    ​  ┏︎", "​ ​     ┗︎"];

  async function postData(entryName, key, index) {
    try {
      const response = await axios.post(
        "https://amhep.pythonanywhere.com/grades",
        { name: entryName, grade: 0 },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("✅ Successfully posted:", response.data);
    } catch (error) {
      console.error(
        "❌ POST failed:",
        error.response ? error.response.data : error
      );
    }
  }

  for (const entry of data) {
    for (const [key, lines] of Object.entries(entry)) {
      let startIndex = 14;
      console.log("new partition");

      for (let index = 0; index < lines.length; index++) {
        let stackedBeforeString = "";
        let newBeforeString = beforeString[key - 1];

        for (let i = startIndex; i >= 0; i--) {
          stackedBeforeString += "​";
        }

        let newLine = "";
        if (key == 1 && index == 0) {
          newLine = customLine[0] + stackedBeforeString + lines[index];
        } else if (key == 5 && index == 6) {
          newLine = customLine[1] + stackedBeforeString + lines[index];
        } else {
          newLine = newBeforeString + stackedBeforeString + lines[index];
        }

        console.log(newLine, key, index, newLine.length);
        await postData(newLine, key, index);
        startIndex -= 1;
      }
    }
  }

  console.log("✅ Finished processing JSON and posting to database.");
}

// Route to receive JSON, clear database, save JSON, and then process & post to database
app.post("/save", async (req, res) => {
  console.log("🔹 Received request to save JSON, clearing database first...");

  // Step 1: Clear database
  const clearResult = await clearDatabase();
  if (!clearResult.success) {
    return res
      .status(500)
      .json({ message: "❌ Failed to clear database before saving JSON." });
  }

  // Step 2: Save the JSON file
  const jsonFilePath = "output.json";
  fs.writeFile(jsonFilePath, JSON.stringify(req.body, null, 2), async (err) => {
    if (err) {
      console.error("❌ Error writing file:", err);
      return res
        .status(500)
        .json({ message: "Failed to save JSON after clearing database." });
    }
    console.log("✅ JSON successfully saved to output.json");

    // Step 3: Process and post JSON data to database
    await processAndPostJson(jsonFilePath);

    // Step 4: Respond after everything is completed
    res.json({
      message:
        "✅ Database cleared, JSON saved, and data posted to database successfully!",
      databaseStatus: clearResult.message,
      savedFile: jsonFilePath,
    });
  });
});
// Route to receive JSON and save to file AFTER database is cleared
// app.post("/save", async (req, res) => {
//   console.log("🔹 Received request to save JSON, clearing database first...");

//   // Step 1: Clear database
//   const clearResult = await clearDatabase();
//   if (!clearResult.success) {
//     return res
//       .status(500)
//       .json({ message: "❌ Failed to clear database before saving JSON." });
//   }

//   // Step 2: Save the JSON file
//   const jsonData = req.body;
//   fs.writeFile("output.json", JSON.stringify(jsonData, null, 2), (err) => {
//     if (err) {
//       console.error("❌ Error writing file:", err);
//       return res
//         .status(500)
//         .json({ message: "Failed to save JSON after clearing database." });
//     }
//     console.log("✅ JSON successfully saved to output.json");

//     // Step 3: Respond after everything is completed
//     res.json({
//       message: "✅ Database cleared and JSON saved successfully!",
//       databaseStatus: clearResult.message,
//       savedFile: "output.json",
//     });
//   });
// });
// Start the server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
