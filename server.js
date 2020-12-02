const app = require("express")();
const authenticate = require("./src/authenticate");
const params = require("./src/params");
const proxy = require("./src/proxy");
const { ServerResponse } = require("http");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

function exitHandler(sig, res) {
	console.log(`Received signal ${sig}... Exiting gracefully :D...`);

	if( !res && res instanceof ServerResponse ){
		res.sendStatus(200);
	}

	server.close();
	process.exit(0);
}

app.enable("trust proxy");
/**
 * @note - To the reader ->
    By enabling the "trust proxy" setting via app.enable('trust proxy'), Express will have knowledge that it's sitting behind a proxy and that the X-Forwarded-* header fields may be trusted, which otherwise may be easily spoofed.

    Enabling this setting has several subtle effects. The first of which is that X-Forwarded-Proto may be set by the reverse proxy to tell the app that it is https or simply http. This value is reflected by req.protocol.

    The second change this makes is the req.ip and req.ips values will be populated with X-Forwarded-For's list of addresses.
 */

app.use( authenticate );

app.get("/", params, proxy);
app.get("/end", (req, res) => {   // can't be directly accessed, only after request has been authenticated
	exitHandler("END_SERVER", res);
});

process.on("exit", exitHandler);

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
