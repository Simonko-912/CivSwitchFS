// Build the single-file loader payload into payload.js at the repository
// root. That file is the one to copy to the SD card as
// switch/payload.js for the civswitch-ldn-nx app (LDN delivery).

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {buildPayload, ROOT} from "./bundle.mjs";

const outFile = path.join(ROOT, "payload.js");

const result = await buildPayload();
fs.writeFileSync(outFile, result.payload);

const digest = crypto.createHash("sha256")
    .update(result.payload, "utf8")
    .digest("hex");

console.log(`built ${path.relative(ROOT, outFile)} (${result.bytes} bytes)`);
console.log(`sha256 ${digest}`);
if (result.identifiersMinified)
    console.log("note: ESM local identifiers minified; core/API names preserved");
if (result.minified)
    console.log("note: ESM syntax minified further to fit the 500 KB loader limit");
