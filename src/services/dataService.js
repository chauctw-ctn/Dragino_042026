const fs = require("fs/promises");
const path = require("path");

const DEFAULT_CONFIG = {
	devices: []
};

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "modbus-config.json");

async function ensureDataFile() {
	await fs.mkdir(DATA_DIR, { recursive: true });
	try {
		await fs.access(DATA_FILE);
	} catch (err) {
		await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
	}
}

async function getConfig() {
	await ensureDataFile();
	const raw = await fs.readFile(DATA_FILE, "utf-8");
	return JSON.parse(raw);
}

async function saveConfig(config) {
	await ensureDataFile();
	await fs.writeFile(DATA_FILE, JSON.stringify(config, null, 2), "utf-8");
	return config;
}

module.exports = {
	getConfig,
	saveConfig
};
