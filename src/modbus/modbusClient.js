const ModbusRTU = require("modbus-serial");

function buildRegisterBuffer(registers, byteOrder, wordOrder) {
	const words = Array.isArray(registers) ? [...registers] : [];
	if (wordOrder === "LITTLE_ENDIAN" && words.length > 1) {
		words.reverse();
	}

	const buffer = Buffer.alloc(words.length * 2);
	words.forEach((word, index) => {
		buffer.writeUInt16BE(word, index * 2);
	});

	if (byteOrder === "LITTLE_ENDIAN") {
		for (let i = 0; i < buffer.length; i += 2) {
			const tmp = buffer[i];
			buffer[i] = buffer[i + 1];
			buffer[i + 1] = tmp;
		}
	}

	return buffer;
}

function parseRegisterValue(tag, registers, protocol) {
	if (!registers || registers.length === 0) return null;
	const buffer = buildRegisterBuffer(registers, protocol.byteOrder, protocol.wordOrder);

	switch (tag.type) {
		case "bool":
			return Boolean(buffer.readUInt16BE(0));
		case "int16":
			return buffer.readInt16BE(0);
		case "uint16":
			return buffer.readUInt16BE(0);
		case "int32":
			return buffer.readInt32BE(0);
		case "uint32":
			return buffer.readUInt32BE(0);
		case "float32":
			return buffer.readFloatBE(0);
		case "float64":
			return buffer.readDoubleBE(0);
		default:
			return buffer.readUInt16BE(0);
	}
}

function applyScaleOffset(value, tag) {
	if (typeof value !== "number") return value;
	const scale = Number(tag.scale ?? 1);
	const offset = Number(tag.offset ?? 0);
	return value * scale + offset;
}

async function readTagValue(client, device, tag) {
	const address = Number(tag.address || 0);
	const length = Math.max(1, Number(tag.length || 1));

	switch (Number(tag.functionCode)) {
		case 1: {
			const res = await client.readCoils(address, length);
			return Boolean(res.data && res.data[0]);
		}
		case 2: {
			const res = await client.readDiscreteInputs(address, length);
			return Boolean(res.data && res.data[0]);
		}
		case 3: {
			const res = await client.readHoldingRegisters(address, length);
			return parseRegisterValue(tag, res.data, device.protocol || {});
		}
		case 4: {
			const res = await client.readInputRegisters(address, length);
			return parseRegisterValue(tag, res.data, device.protocol || {});
		}
		default:
			return null;
	}
}

async function readDeviceValues(device) {
	if (!device || device.enabled === false) return [];
	const client = new ModbusRTU();
	const values = [];

	try {
		await client.connectTCP(device.connection.host, { port: device.connection.port });
		client.setID(device.connection.unitId);
		client.setTimeout(2000);

		for (const tag of device.tags || []) {
			try {
				const rawValue = await readTagValue(client, device, tag);
				const value = applyScaleOffset(rawValue, tag);
				values.push({ tagId: tag.id, value });
			} catch (err) {
				values.push({ tagId: tag.id, value: null, error: err.message });
			}
		}
	} finally {
		try {
			client.close();
		} catch (err) {
			// Ignore close errors.
		}
	}

	return values;
}

module.exports = {
	readDeviceValues
};
