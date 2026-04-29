const path = require("path");
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./api/routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRoutes);

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("/", (req, res) => {
	res.sendFile(path.join(publicDir, "modbus-config.html"));
});

module.exports = app;
