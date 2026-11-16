# CivSwitchFS

> [!NOTE]
> Fork of [ItsNerisma/CivSwitchFS](https://github.com/ItsNerisma/CivSwitchFS) adapted for LDN delivery. Changes vs upstream (delivery only, payload code in `src/` untouched):
> - `npm run build` writes the single-file payload to `payload.js` at the repository root (instead of `dist/core.js`); a prebuilt copy is committed.
> - README documents the LDN flow: put `payload.js` in `switch/payload.js` on the SD card of a Switch 1 running [civswitch-ldn-nx](https://github.com/Simonko-912/civswitch-ldn-nx), join the lobby, press ZL — the payload goes over local wireless, no PC or Wi-Fi needed.
> - `npm run send` / `npm run persist:install` kept as direct-IP fallback.

> [!IMPORTANT]
> Thanks to [**Slapah**](https://github.com/byizmysh/IZCIVSwitch/blob/main/NOTICE.md#upstream) for the ns2jb filesystem port to CivSwitch and [**Kurumuz**](https://gitlab.com/kurumuz/ns2jb) for the improved fork of ns2jb from [**pepsipu**](https://gitlab.com/pepsipu/ns2jb), which laid the groundwork for this research. All kudos goes to them for the Civ FS port :heart:

This is payload provides **access to FS privileges** through an elevated fsp-srv handle. It runs inside the **CivSwitch Remote JS Loader**. That elevated session is exposed as `globalThis.fspSrv` for the next payloads.

## A bit of a preface

CivSwitchFS is **semi-untethered**, RPC was fully removed :tada: ! It should also be more consistent for any hardware.

**It's intended for devs**, as all I give is a god `fsp-srv` handle (full FS) for you to play with. The rest is for you to figure out.

> [!NOTE] 
> If you are looking for a **reliable KaiHEN access**, this [fork](https://github.com/s8n/CivSwitchFS/tree/slop) from [@Ave](https://github.com/aveao) will get you there in no time.

### Tested configuration

- Nintendo Switch 2, firmware **23.0.1**
- **Civilization VII 1.0.0**, physical cartridge
- CivSwitch Remote JS Loader already running

### Requirements

- Node.js **20 or later** and npm (only needed to rebuild the payload)
- A Switch 2 with the CivSwitch Remote JS Loader already running
- [CivSwitch-LDN-NX](https://github.com/Simonko-912/civswitch-ldn-nx) on a
  Switch 1: it delivers `payload.js` over local wireless (LDN), so neither a
  computer nor a Wi-Fi network is needed

## Usage

Install dependencies once from this repository:

~~~sh
npm install
~~~

### Persist the payload (optionnal)

With the CivSwitch Remote JS Loader running, install the persistent image:

~~~sh
npm run persist:install -- <console-ip> [--minify-payload]
~~~

`<console-ip>` may be the Wi-Fi address or the local-wireless address of the
Switch 2. With an LDN-only setup (no computer on the network), use the
CivSwitch-LDN-NX app's ZR save install path instead. 

Future launches from that save start the exploit, loader, and
payload automatically, without a computer or network connection. 

The installer does not back up the old save. 

### Launch the exploit

If you are not going for persistence, just start the CivSwitch Remote JS Loader
using your usual CivSwitch setup. Then deliver the payload over local
wireless with CivSwitch-LDN-NX:

1. `npm run build` writes the single-file payload to `payload.js` in the
   repository root (a prebuilt copy is committed, so this step can be
   skipped). 
2. Copy that file to `switch/payload.js` on the SD card of the Switch 1
   running CivSwitch-LDN-NX. 
3. Launch CivSwitch-LDN-NX, join the lobby with the Switch 2, start the
   loader (R), and press **ZL** to send `payload.js` over local wireless. 

Wait for **`You just Civ Sevened your machine, congrats`** which obviously means success :tada: !
Then, the loader automatically shows `Awaiting payload at <ip>:9026` and you are free to send payloads.

A computer on the same network can still push payloads directly:

~~~sh
npm run send -- <console-ip>
~~~

### Booting faster next time (this will be automatised eventually)

After success, the payload prints the working `roleDelays` and `guardDelays`
values in nanoseconds. To use them as the starting schedule next time, replace
the arrays in [`src/core/config.mjs`](src/core/config.mjs#L44-L47):

~~~js
var roleDelays = [0, 300000, 350000, 450000, 550000, 650000, 1000000, 1200000, 1300000, 1700000];
var guardDelays = [150000, 300000];
~~~

The trigger's initial sleep is 1,600,000 ns. The [Kurumuz](https://gitlab.com/kurumuz/ns2jb)
reference schedule used these instead (might help if it worked for you on those)

~~~js
var roleDelays = [0, 300000, 350000, 450000, 550000, 650000, 1700000, 2000000, 2150000, 2800000];
var guardDelays = [0, 150000];
~~~

If you use the persisted payload, you ofc need to rerun the installer so its saved image includes the new timings.

> [!NOTE]
> You can play with the delays and MORE in `src/core/config.mjs`, try some shit (but don't brick pls) !

## Example FS usage

After the main payload reports success, you can send follow-up payloads and use
the `globalThis.fspSrv` handle to perform filesystem operations.

An example can be found in `examples/user-storage`.

## Notes

- The auto timing calibration is not perfect yet, some freezes can happen
- Timing configuration, retries and shit will go to a persisted config file soon enough
- THERE IS SO MUCH MORE to be done, I'm just releasing now so you guys can study the semi-untethered stuff
- You can learn about how the exploit works [there](https://github.com/ItsNerisma/CivSwitchFS/blob/main/HOW_IT_WORKS.md)

## Project structure

```text
src/core.js          # payload entry point and flow
src/core/            # steps, memory access, and FS communication
src/core/config.mjs  # the whole exploit conf, tweak it if you want
examples/            # small payload usage examples
persist/             # persistence builder inputs, save codec, writer, and installer
tools/               # well, tools
```

## Credits

- **[Gezine/CivSwitch](https://github.com/Gezine/CivSwitch)**: userland exploit and persistent installer
- **[pepsipu/ns2jb](https://gitlab.com/pepsipu/ns2jb)**: og FS exploit
- **Slapah/CivSwitch**: first true working ns2jb port for Civ. Sadly after his code beeing stole, he chose to nuke it.
- **[Kurumuz/ns2jb](https://gitlab.com/kurumuz/ns2jb)**: improved version of ns2jb


## License

The original code in this repository is distributed under the MIT license. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for detailed notices and credits.