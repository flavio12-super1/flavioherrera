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
const fetch = require("node-fetch"); // Ensure you install this package: npm install node-fetch
const app = express();

const port = process.env.PORT || 4050;
app.use(express.json());

// Serve static files from the "build" directory
app.use(express.static(path.resolve(__dirname, "./frontend/build")));

// Proxy endpoint
app.use("/proxy", async (req, res) => {
  const { targetUrl } = req.query;

  if (!targetUrl) {
    return res.status(400).send("Missing 'targetUrl' query parameter.");
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host,
      },
      body: req.method === "POST" ? req.body : undefined,
    });

    const data = await response.text(); // Handle response as text (can be JSON or other types)
    res.status(response.status).send(data);
  } catch (error) {
    console.error("Error forwarding request:", error);
    res.status(500).send("Error forwarding request.");
  }
});

// Handle requests for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/build", "index.html"));
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
