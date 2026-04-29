const express = require("express");
const { getConfig, saveConfig } = require("../services/dataService");
const { ENUMS } = require("../models/data.model");

const router = express.Router();

router.get("/health", (req, res) => {
	res.json({ ok: true });
});

router.get("/enums", (req, res) => {
	res.json({
		functionCode: [
			{ label: "Coil (01)", value: 1 },
			{ label: "Discrete Input (02)", value: 2 },
			{ label: "Holding Register (03)", value: 3 },
			{ label: "Input Register (04)", value: 4 }
		],
		dataType: ENUMS.dataType,
		byteOrder: ENUMS.byteOrder,
		wordOrder: ENUMS.wordOrder
	});
});

router.get("/config", async (req, res) => {
	try {
		const config = await getConfig();
		res.json(config);
	} catch (err) {
		res.status(500).json({ error: "Failed to load config" });
	}
});

router.put("/config", async (req, res) => {
	if (!req.body || !Array.isArray(req.body.devices)) {
		res.status(400).json({ error: "Invalid config payload" });
		return;
	}

	try {
		const saved = await saveConfig(req.body);
		res.json(saved);
	} catch (err) {
		res.status(500).json({ error: "Failed to save config" });
	}
});

module.exports = router;
