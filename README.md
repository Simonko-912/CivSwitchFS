# CivSwitchFS

> [!NOTE]
> Fork of [ItsNerisma/CivSwitchFS](https://github.com/ItsNerisma/CivSwitchFS) adapted for LDN delivery. Changes vs upstream (delivery only, payload code in `src/` untouched):
> - `npm run build` writes the single-file payload to `payload.js` at the repository root (instead of `dist/core.js`); a prebuilt copy is committed.
> - README documents the LDN flow: put `payload.js` in `switch/payload.js` on the SD card of a Switch 1 running [civswitch-ldn-nx](https://github.com/Simonko-912/civswitch-ldn-nx), join the lobby, press ZL — the payload goes over local wireless, no PC or Wi-Fi needed.
> - `npm run send` / `npm run persist:install` kept as direct-IP fallback.

> [!CAUTION]
> Beware that this FS exploit is not 100% safe, it could corrupt your save, cache or worse. We had reported bricks on forks using that FS implementation as a base (BEFORE [4049cd7](https://github.com/ItsNerisma/CivSwitchFS/commit/4049cd716147bff5dd17ecb545da857f9a453a7f)). No bricks reported yet for this repo alone, but very well could be. Read [BRICK_RISKS.md](BRICK_RISKS.md) for a full explanation.

> [!IMPORTANT]
> Thanks to [**Slapah**](https://github.com/byizmysh/IZCIVSwitch/blob/main/NOTICE.md#upstream) for the ns2jb filesystem port to CivSwitch and [**Kurumuz**](https://gitlab.com/kurumuz/ns2jb) for the improved fork of ns2jb from [**pepsipu**](https://gitlab.com/pepsipu/ns2jb), which laid the groundwork for this research. All kudos goes to them for the Civ FS port :heart:
>
> If you are looking for a reliable semi-untethered KaiHEN access, this fork [CivSwitchFS-kaiHEN](https://github.com/s8n/CivSwitchFS-kaiHEN) from [@Ave](https://github.com/aveao) is the way to go.

This is payload provides **access to FS privileges** through an elevated fsp-srv handle. It runs inside the **CivSwitch Remote JS Loader**. That elevated session is exposed as `globalThis.fspSrv` for the next payloads.

---

### About

Smol demo (updated) https://streamable.com/wtcdnk

CivSwitchFS is **semi-untethered**, RPC was fully removed :tada: ! 

**It's intended for devs**, as all I give is a god `fsp-srv` handle (full FS) for you to play with. The rest is for you to figure out. 

---

#### Tested configuration

- Nintendo Switch 2, firmware **23.0.1**
- **Civilization VII 1.0.0**, physical cartridge
- CivSwitch Remote JS Loader already running

#### Requirements

- Node.js **20 or later** and npm (only needed to rebuild the payload)
- A Switch 2 with the CivSwitch Remote JS Loader already running
- [CivSwitch-LDN-NX](https://github.com/Simonko-912/civswitch-ldn-nx) on a
  Switch 1: it delivers `payload.js` over local wireless (LDN), so neither a
  computer nor a Wi-Fi network is needed. Otherwise the loader must be
  reachable on the local network during persistence installation.

---

### Usage

Install dependencies once from this repository:

```bash
npm install
```

#### Install the persistent payload

With the CivSwitch Remote JS Loader running, install the persistent image:

```bash
npm run persist -- <console-ip>
```

Wait for `Installed. Restart the game, then Load a game.` before continuing. The installer does not back up the old save.

`<console-ip>` may be the Wi-Fi address or the local-wireless address of the
Switch 2. With an LDN-only setup (no computer on the network), use the
CivSwitch-LDN-NX app's ZR save install path instead. 

Future launches from that save start the exploit, loader, and
payload automatically, without a computer or network connection. 

#### Launch from the save

Restart Civilization VII, then load the save prepared for CivSwitchFS. The persistent image starts the exploit and payload from that save. No computer or network connection is needed for later launches.

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

#### Controls

- **B** or **Cancel**: finish the current wave, clean up, then stop without starting more waves or attempts
- **Y**: toggle between normal and verbose summaries

These controls work while the exploit is running. 

#### Race timing schedule

The canary campaign uses this fixed schedule, in nanoseconds:

- W0-W6, in role order: `0`, `300000`, `350000`, `450000`, `550000`, `650000`, `1000000`
- W9 release: `1700000`
- W10-W11 guards, after release: `150000`, `300000`
- W7 and W8 filler workers are disabled. W12 is gate-driven and does not use this delay list.

The payload reads these values from [src/core/config.mjs](src/core/config.mjs). It does not load or save timing schedules in save data. Change the source values to retune the schedule.

---

### Troubleshooting

- **`You just Civ Sevened your machine, congrats`**: the exploit succeeded and the elevated session is available as `globalThis.fspSrv` for follow-up payloads.
- **`CANARY FLIPPED`**: the race qualification passed. The payload is still checking memory and promoting the filesystem session. Wait for the success message.
- **`Canary did not flip.`**: this attempt did not qualify the race, so later stages were skipped. The campaign retries with the configured schedule. If the final status says `STATE IS SAFE TO RESTART`, restart the game to launch another run.
- **`STATE IS SAFE TO RESTART`**: no dirty retained cache endpoint remains. Restart Civilization VII normally.
- **`STATE IS UNSAFE`**: do not close the game or reboot normally. Hard reboot by holding the power button for 15 seconds. See [the hard reboot explanation](BRICK_RISKS.md#why-a-hard-reboot-is-the-safe-option-here).
- **`STATE IS UNKNOWN`**: cleanup could not be verified. Treat it as unsafe and hard reboot as described above.

If failures continue across several runs with the same symptoms (no canary flip, memory adress not found), I recommend starting from a fresh Civ VII save and software data:

- Delete Civ VII save data in **System Settings > Data Management > Delete Save Data**. This also removes CivSwitchFS persistence stored in the game save.
- For a physical cartridge, eject it, select Civilization VII on the HOME menu, press **+**, then choose **Data Management > Delete Software**. Reinsert the cartridge afterward.
- Set up CivSwitch again, run `npm run persist -- <console-ip>` while its loader is reachable, then restart Civilization VII and load the prepared save.

### Follow-up payloads

After the main payload reports success, you can send follow-up payloads and use the `globalThis.fspSrv` handle to perform filesystem operations.

An example can be found in [examples/user-storage](examples/user-storage).

---

### How it works

Read [HOW_IT_WORKS.md](HOW_IT_WORKS.md) for the exploit walkthrough. The worker configuration and bench mode are in the source.

---

### Project structure

```text
src/core.js          # payload entry point and flow
src/core/            # steps, memory access, and FS communication
src/core/config.mjs  # the whole exploit conf, tweak it if you want
examples/            # small payload usage examples
persist/             # persistence builder inputs, save codec, writer, and installer
tools/               # well, tools
```

---

### Credits

- **[Gezine/CivSwitch](https://github.com/Gezine/CivSwitch)**: userland exploit and persistent installer
- **[pepsipu/ns2jb](https://gitlab.com/pepsipu/ns2jb)**: og FS exploit
- **Slapah/CivSwitch**: first true working ns2jb port for Civ. Sadly after his code beeing stole, he chose to nuke it.
- **[Kurumuz/ns2jb](https://gitlab.com/kurumuz/ns2jb)**: improved version of ns2jb
- **Alula**: improved FS acquisition advices
- **Ave**: listened to all of my shit for days


---

### License

The original code in this repository is distributed under the MIT license. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for detailed notices and credits.

---

### Documentation

| Document | What it covers |
|---|---|
| [README.md](README.md) | Installation, usage, controls, and troubleshooting |
| [HOW_IT_WORKS.md](HOW_IT_WORKS.md) | Exploit internals and timing behavior |
| [BRICK_RISKS.md](BRICK_RISKS.md) | Failure states and recovery guidance |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | Third-party code notices and licenses |
| [AGENTS.md](AGENTS.md) | Repository instructions for contributors and agents |
