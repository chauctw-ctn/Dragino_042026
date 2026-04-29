const express = require("express");
const { getConfig, saveConfig } = require("../services/dataService");
const { readDeviceValues } = require("../modbus/modbusClient");
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

router.get("/devices/:id/values", async (req, res) => {
	try {
		const config = await getConfig();
		const device = config.devices.find((item) => item.id === req.params.id);
		if (!device) {
			res.status(404).json({ error: "Device not found" });
			return;
		}
		const values = await readDeviceValues(device);
		res.json({ deviceId: device.id, values });
	} catch (err) {
		res.status(500).json({ error: "Failed to read device values" });
	}
});

module.exports = router;
