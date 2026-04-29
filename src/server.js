const app = require("./app");
const { connectDb } = require("./database/db");
const { port } = require("./config");

async function start() {
	await connectDb();

	app.listen(port, () => {
		console.log(`Server listening on http://localhost:${port}`);
	});
}

start().catch((err) => {
	console.error("Failed to start server", err);
	process.exit(1);
});
