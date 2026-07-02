import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "public", "assets", "game");

mkdirSync(outDir, { recursive: true });

function writeAsset(name, svg) {
  writeFileSync(join(outDir, name), `${svg.trim()}\n`, "utf8");
}

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const chickenRows = [
  ["walk_down", 0, "walk"],
  ["walk_left", 90, "walk"],
  ["walk_right", -90, "walk"],
  ["walk_up", 180, "walk"],
  ["fly_down", 0, "fly"],
  ["fly_left", 90, "fly"],
  ["fly_right", -90, "fly"],
  ["fly_up", 180, "fly"]
];

function chickenFrame({ palette, frame, angle, mode }) {
  const walkBob = [0, -1, 0, 1][frame];
  const wingOpen = mode === "fly" ? [8, 13, 8, 4][frame] : [1, 3, 1, 2][frame];
  const legSpread = [2, -2, 2, -2][frame];
  const headBob = mode === "fly" ? [0, -1, 0, 1][frame] : [1, 0, 1, 0][frame];
  const tailLift = mode === "fly" ? -3 : 0;
  const comb = palette.type === "rooster"
    ? `<path d="M20 29c-2-4 0-7 3-6 0-4 4-5 6-2 1-3 5-3 6 1 1 3-2 6-6 7z" fill="${palette.comb}" stroke="${palette.outline}" stroke-width="1.4"/>`
    : `<path d="M20 29c0-3 2-5 4-4 1-3 4-2 5 1 1 3-1 5-5 5z" fill="${palette.comb}" stroke="${palette.outline}" stroke-width="1.2"/>`;

  const tail = palette.type === "rooster"
    ? `<path d="M18 11c-6-7-4-12 4-8 4-7 10-6 9 3 7-4 12 1 7 8" fill="${palette.tail}" stroke="${palette.outline}" stroke-width="1.6"/>
       <path d="M16 13c-8-3-8-9-1-10 1 5 4 8 8 11z" fill="${palette.tailDark}" opacity=".9"/>
       <path d="M31 12c4-9 10-8 11-1-4 0-7 2-10 5z" fill="${palette.tailDark}" opacity=".85"/>`
    : `<path d="M19 12c-5-5-4-9 2-8 2-5 8-4 8 2 5-2 8 2 5 7" fill="${palette.tail}" stroke="${palette.outline}" stroke-width="1.4"/>`;

  return `
    <g transform="rotate(${angle} 24 24) translate(0 ${walkBob})">
      <ellipse cx="24" cy="28" rx="12" ry="7" fill="#1b271b" opacity=".18"/>
      ${mode === "fly" ? `<path d="M10 ${24 - wingOpen / 3}C3 ${18 - wingOpen} 3 ${34 + wingOpen / 3} 15 32" fill="${palette.wing}" stroke="${palette.outline}" stroke-width="1.5" opacity=".96"/>
      <path d="M38 ${24 - wingOpen / 3}C45 ${18 - wingOpen} 45 ${34 + wingOpen / 3} 33 32" fill="${palette.wing}" stroke="${palette.outline}" stroke-width="1.5" opacity=".96"/>` : ""}
      <g transform="translate(0 ${tailLift})">${tail}</g>
      <ellipse cx="24" cy="22" rx="11" ry="15" fill="${palette.body}" stroke="${palette.outline}" stroke-width="1.8"/>
      <path d="M16 22c3 5 9 8 16 2 0 7-4 12-9 13-5-2-8-8-7-15z" fill="${palette.belly}" opacity=".78"/>
      <path d="M15 23c-5 4-5 10 2 13 3-4 4-9 2-14z" fill="${palette.wing}" stroke="${palette.outline}" stroke-width="1.2" opacity=".9"/>
      <path d="M33 23c5 4 5 10-2 13-3-4-4-9-2-14z" fill="${palette.wing}" stroke="${palette.outline}" stroke-width="1.2" opacity=".9"/>
      <ellipse cx="24" cy="${31 + headBob}" rx="8" ry="7" fill="${palette.head}" stroke="${palette.outline}" stroke-width="1.6"/>
      ${comb}
      <path d="M21 ${35 + headBob}l3 6 3-6" fill="${palette.beak}" stroke="${palette.outline}" stroke-width="1"/>
      <circle cx="20.5" cy="${31 + headBob}" r="1.3" fill="#182018"/>
      <circle cx="27.5" cy="${31 + headBob}" r="1.3" fill="#182018"/>
      <path d="M20 ${40 + Math.max(0, walkBob)}l${-4 - legSpread} 4" stroke="${palette.leg}" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 ${40 + Math.max(0, -walkBob)}l${4 + legSpread} 4" stroke="${palette.leg}" stroke-width="2" stroke-linecap="round"/>
    </g>`;
}

function chickenSheet(palette) {
  const cells = chickenRows.flatMap(([name, angle, mode], row) => {
    return [0, 1, 2, 3].map((frame) => `
      <g id="${esc(`${palette.type}_${name}_${frame}`)}" transform="translate(${frame * 48} ${row * 48})">
        ${chickenFrame({ palette, frame, angle, mode })}
      </g>`);
  }).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="192" height="384" viewBox="0 0 192 384">
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.6" flood-color="#102018" flood-opacity=".2"/>
        </filter>
      </defs>
      <g filter="url(#soft)">${cells}</g>
    </svg>`;
}

writeAsset("hen-sheet.svg", chickenSheet({
  type: "hen",
  outline: "#25311e",
  body: "#f2d184",
  belly: "#fff3c9",
  head: "#dfb654",
  wing: "#c8953f",
  tail: "#a8782e",
  tailDark: "#785927",
  comb: "#d74431",
  beak: "#f1a832",
  leg: "#b36a21"
}));

writeAsset("rooster-sheet.svg", chickenSheet({
  type: "rooster",
  outline: "#241b18",
  body: "#c75824",
  belly: "#f3a638",
  head: "#a62e22",
  wing: "#0f695e",
  tail: "#13493e",
  tailDark: "#102b29",
  comb: "#e22f25",
  beak: "#f0a42d",
  leg: "#b36a21"
}));

const PLAYER_ANIMATIONS = [
  "idle",
  "walk_down",
  "walk_left",
  "walk_right",
  "walk_up",
  "run_down",
  "run_left",
  "run_right",
  "run_up"
];

const PLAYER_PALETTE = {
  outline: "#202122",
  skin: "#f4b37e",
  cheek: "#e86d5c",
  hair: "#151819",
  hairLight: "#34383a",
  shirt: "#e55135",
  shirtDark: "#a93428",
  shorts: "#2b77a8",
  shortsDark: "#1f557f",
  sock: "#f5f3df",
  shoe: "#26323b",
  sole: "#f0eee5"
};

function playerFrame({ direction, frame, action }) {
  const palette = PLAYER_PALETTE;
  const bob = action === "run" ? [0, -2, 0, -1][frame] : action === "walk" ? [0, -1, 0, 0][frame] : 0;
  const phase = action === "idle" ? 0 : frame % 2 === 0 ? 1 : -1;
  const stride = action === "run" ? 5 * phase : action === "walk" ? 2.8 * phase : 0;
  const armSwing = action === "run" ? 4.5 * -phase : action === "walk" ? 2.5 * -phase : 0;

  const face = `
    <circle cx="21" cy="19" r="1.15" fill="#101214"/>
    <circle cx="27" cy="19" r="1.15" fill="#101214"/>
    <path d="M21.3 24c1.8 1.6 4.2 1.6 5.9 0" stroke="#79352b" stroke-width="1.15" stroke-linecap="round"/>
    <circle cx="18.7" cy="22.2" r="1.45" fill="${palette.cheek}" opacity=".52"/>
    <circle cx="29.3" cy="22.2" r="1.45" fill="${palette.cheek}" opacity=".52"/>`;

  if (direction === "up") {
    return `
      <g transform="translate(0 ${bob})">
        <ellipse cx="24" cy="42" rx="11" ry="4" fill="#172016" opacity=".18"/>
        <path d="M17 21c-4 5-5 12-3 17 5 4 15 4 20 0 2-5 1-12-3-17z" fill="${palette.shirt}" stroke="${palette.outline}" stroke-width="1.5"/>
        <path d="M18 33c4 2 8 3 12 0v7c-4 2-8 2-12 0z" fill="${palette.shirtDark}" opacity=".62"/>
        <path d="M18 ${30 + armSwing * 0.1}c-4 3-6 6-6 10" stroke="${palette.skin}" stroke-width="4" stroke-linecap="round"/>
        <path d="M30 ${30 - armSwing * 0.1}c4 3 6 6 6 10" stroke="${palette.skin}" stroke-width="4" stroke-linecap="round"/>
        <path d="M19 38l${-3 - stride * 0.22} 7" stroke="${palette.shortsDark}" stroke-width="5" stroke-linecap="round"/>
        <path d="M29 38l${3 + stride * 0.22} 7" stroke="${palette.shortsDark}" stroke-width="5" stroke-linecap="round"/>
        <path d="M15 45l-4 1.5" stroke="${palette.shoe}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M33 45l4 1.5" stroke="${palette.shoe}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M18 36c4 2 8 2 12 0v6c-4 2-8 2-12 0z" fill="${palette.shorts}" stroke="${palette.outline}" stroke-width="1"/>
        <circle cx="24" cy="18" r="8.7" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.6"/>
        <path d="M15 19c0-7 5-12 12-11 6 1 9 5 8 12-3-4-7-6-11-6-4 0-7 2-9 5z" fill="${palette.hairLight}" opacity=".28"/>
        <path d="M17 22c4 4 10 5 15 0 0 5-3 9-8 10-5-1-7-5-7-10z" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.1"/>
      </g>`;
  }

  if (direction === "left" || direction === "right") {
    const origin = direction === "left" ? "translate(48 0) scale(-1 1)" : "";

    return `
      <g transform="${origin} translate(0 ${bob})">
        <ellipse cx="24" cy="42" rx="10.5" ry="4" fill="#172016" opacity=".18"/>
        <path d="M20 22c-4 4-6 11-4 16 4 4 13 4 17 0 2-5 1-12-3-16z" fill="${palette.shirt}" stroke="${palette.outline}" stroke-width="1.5"/>
        <path d="M19 32c4 3 8 3 13 0v7c-4 2-9 2-13 0z" fill="${palette.shirtDark}" opacity=".6"/>
        <path d="M19 ${31 - armSwing * 0.1}c-5 2-8 5-9 9" stroke="${palette.skin}" stroke-width="4" stroke-linecap="round"/>
        <path d="M30 ${31 + armSwing * 0.1}c4 3 6 6 7 10" stroke="${palette.skin}" stroke-width="4" stroke-linecap="round"/>
        <path d="M20 38l${-3 - stride * 0.28} 7" stroke="${palette.shortsDark}" stroke-width="5" stroke-linecap="round"/>
        <path d="M29 38l${4 + stride * 0.28} 7" stroke="${palette.shortsDark}" stroke-width="5" stroke-linecap="round"/>
        <path d="M16 45l-4 1.5" stroke="${palette.shoe}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M33 45l4 1.5" stroke="${palette.shoe}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M19 36c4 2 8 2 12 0v6c-4 2-8 2-12 0z" fill="${palette.shorts}" stroke="${palette.outline}" stroke-width="1"/>
        <circle cx="25" cy="18" r="8.3" fill="${palette.skin}" stroke="${palette.outline}" stroke-width="1.6"/>
        <path d="M17 17c1-8 8-12 15-8 6 4 6 11 1 17-2-6-5-9-11-9-2 0-3 0-5 0z" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.4"/>
        <path d="M17 17c-3 5-2 10 1 14-5-2-7-5-7-10 0-3 2-5 6-4z" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.1"/>
        <path d="M18 16c4-4 9-5 14-2" stroke="${palette.hairLight}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
        <circle cx="27" cy="19" r="1.15" fill="#101214"/>
        <path d="M25 24c1.4 1.2 3.1 1.2 4.5 0" stroke="#79352b" stroke-width="1.1" stroke-linecap="round"/>
        <circle cx="30.5" cy="22.2" r="1.35" fill="${palette.cheek}" opacity=".5"/>
      </g>`;
  }

  return `
    <g transform="translate(0 ${bob})">
      <ellipse cx="24" cy="42" rx="11" ry="4" fill="#172016" opacity=".18"/>
      <path d="M17 21c-4 5-5 12-3 17 5 4 15 4 20 0 2-5 1-12-3-17z" fill="${palette.shirt}" stroke="${palette.outline}" stroke-width="1.5"/>
      <path d="M18 32c4 3 8 3 12 0v7c-4 2-8 2-12 0z" fill="${palette.shirtDark}" opacity=".62"/>
      <path d="M18 ${31 + armSwing * 0.1}c-4 3-6 6-6 10" stroke="${palette.skin}" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 ${31 - armSwing * 0.1}c4 3 6 6 6 10" stroke="${palette.skin}" stroke-width="4" stroke-linecap="round"/>
      <path d="M19 38l${-3 - stride * 0.22} 7" stroke="${palette.shortsDark}" stroke-width="5" stroke-linecap="round"/>
      <path d="M29 38l${3 + stride * 0.22} 7" stroke="${palette.shortsDark}" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 45l-4 1.5" stroke="${palette.shoe}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M33 45l4 1.5" stroke="${palette.shoe}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M18 36c4 2 8 2 12 0v6c-4 2-8 2-12 0z" fill="${palette.shorts}" stroke="${palette.outline}" stroke-width="1"/>
      <circle cx="24" cy="18" r="8.6" fill="${palette.skin}" stroke="${palette.outline}" stroke-width="1.6"/>
      <path d="M15 17c0-8 7-12 16-8 7 4 7 12 2 17-2-6-5-9-11-9-3 0-5 0-7 0z" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.4"/>
      <path d="M16 17c5-5 10-6 16-2" stroke="${palette.hairLight}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
      <path d="M16 17c-3 6-2 11 2 14-5-2-8-6-8-11 0-3 2-5 6-3z" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.1"/>
      <path d="M32 17c3 6 2 11-2 14 5-2 8-6 8-11 0-3-2-5-6-3z" fill="${palette.hair}" stroke="${palette.outline}" stroke-width="1.1"/>
      ${face}
    </g>`;
}

function playerStrip(name) {
  const [action, directionSuffix] = name.split("_");
  const idleDirections = ["down", "up", "left", "right"];
  const frames = [0, 1, 2, 3].map((frame) => {
    const direction = name === "idle" ? idleDirections[frame] : directionSuffix;
    return `
      <g id="lan_anh_${esc(name)}_${frame}" transform="translate(${frame * 48} 0)">
        ${playerFrame({ direction, frame, action })}
      </g>`;
  }).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="192" height="48" viewBox="0 0 192 48">
      <defs>
        <filter id="soft-player" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.45" flood-color="#102018" flood-opacity=".22"/>
        </filter>
      </defs>
      <g filter="url(#soft-player)">${frames}</g>
    </svg>`;
}

for (const animation of PLAYER_ANIMATIONS) {
  writeAsset(`lan_anh_${animation}.svg`, playerStrip(animation));
}

writeAsset("background-field.svg", `
  <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650">
    <rect width="1000" height="650" fill="#86a95b"/>
    <path d="M-20 525C150 480 242 610 415 548c150-54 255-26 385 50 100 58 170 38 240 14v74H-20z" fill="#7f9f53" opacity=".9"/>
    <path d="M80 70c120-25 252-8 352 26 134 45 314 12 506-36v88c-222 52-389 60-530 18C287 130 175 120 70 143z" fill="#93b765" opacity=".8"/>
    <path d="M0 360c145-70 318-80 515-36 178 40 316 15 485-55v75c-154 66-332 96-510 52-190-47-345-31-490 51z" fill="#769b55" opacity=".55"/>
    <g fill="#6f8f43" opacity=".5">
      <ellipse cx="130" cy="100" rx="42" ry="14"/><ellipse cx="388" cy="210" rx="55" ry="16"/>
      <ellipse cx="650" cy="88" rx="46" ry="13"/><ellipse cx="805" cy="535" rx="66" ry="18"/>
      <ellipse cx="280" cy="520" rx="72" ry="17"/><ellipse cx="555" cy="455" rx="55" ry="14"/>
    </g>
    <g stroke="#e6c38a" stroke-width="10" stroke-linecap="round" opacity=".25">
      <path d="M140 662C255 520 325 455 475 402"/>
      <path d="M475 402C620 350 733 282 867 210"/>
    </g>
    <g opacity=".45">
      ${Array.from({ length: 80 }, (_, i) => {
        const x = (i * 127) % 980 + 10;
        const y = (i * 83) % 620 + 15;
        const c = i % 5 === 0 ? "#f3e58f" : i % 3 === 0 ? "#d8e9a5" : "#6d9740";
        return `<circle cx="${x}" cy="${y}" r="${i % 5 === 0 ? 2.2 : 1.6}" fill="${c}"/>`;
      }).join("")}
    </g>
    <g stroke="rgba(255,255,255,.08)" stroke-width="1">
      ${Array.from({ length: 21 }, (_, i) => `<path d="M${i * 50} 0v650"/>`).join("")}
      ${Array.from({ length: 14 }, (_, i) => `<path d="M0 ${i * 50}h1000"/>`).join("")}
    </g>
  </svg>`);

function coop(open) {
  const gate = open
    ? `<path d="M48 83C31 77 18 66 7 50" stroke="#59351e" stroke-width="8" stroke-linecap="round"/>
       <path d="M48 107C31 114 18 127 7 145" stroke="#59351e" stroke-width="8" stroke-linecap="round"/>
       <path d="M48 83C31 77 18 66 7 50" stroke="#d99b45" stroke-width="3" stroke-linecap="round"/>
       <path d="M48 107C31 114 18 127 7 145" stroke="#d99b45" stroke-width="3" stroke-linecap="round"/>
       <path d="M51 96C34 93 18 99 2 115" stroke="#f3d664" stroke-width="9" stroke-linecap="round" opacity=".95"/>
       <path d="M51 96C34 98 18 106 3 124" stroke="#8c5f2c" stroke-width="3" stroke-linecap="round" opacity=".7"/>`
    : `<rect x="23" y="76" width="29" height="42" rx="4" fill="#4a2b18" stroke="#24170f" stroke-width="3"/>
       <path d="M29 84h17M29 95h17M29 106h17" stroke="#d99b45" stroke-width="3" stroke-linecap="round"/>
       <circle cx="18" cy="97" r="5" fill="#efcf5c" stroke="#5e3a1e" stroke-width="2"/>`;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="170" viewBox="0 0 220 170">
      <ellipse cx="112" cy="143" rx="86" ry="16" fill="#26391f" opacity=".18"/>
      <path d="M2 98C25 87 43 82 62 82v36C39 120 21 129 3 145z" fill="#dfbd58" opacity=".86"/>
      <path d="M3 112C25 99 43 95 62 95" stroke="#80582a" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <rect x="42" y="55" width="142" height="82" rx="8" fill="#f0d66e" opacity=".34"/>
      <rect x="42" y="55" width="142" height="82" rx="8" fill="none" stroke="#3a2416" stroke-width="4"/>
      <path d="M42 76v40" stroke="#f6dc6b" stroke-width="13" stroke-linecap="round"/>
      <path d="M42 76v40" stroke="#3a2416" stroke-width="4" stroke-linecap="round"/>
      <g stroke="#8b5b2c" stroke-width="2" opacity=".5">
        <path d="M62 60v72M84 60v72M106 60v72M128 60v72M150 60v72M172 60v72"/>
        <path d="M48 74h130M48 91h130M48 108h130M48 125h130"/>
      </g>
      <g stroke="#5d381e" stroke-width="7" stroke-linecap="round">
        <path d="M45 55h136"/>
        <path d="M45 137h136"/>
        <path d="M184 58v76"/>
        <path d="M42 57v19"/>
        <path d="M42 117v17"/>
      </g>
      <g stroke="#c7893e" stroke-width="3" stroke-linecap="round">
        <path d="M51 63h120"/>
        <path d="M51 128h120"/>
        <path d="M175 66v60"/>
      </g>
      <path d="M65 41h105l20 22H45z" fill="#c9472d" stroke="#3a2119" stroke-width="4" stroke-linejoin="round"/>
      <path d="M68 47h94M55 58h124" stroke="#e36a3a" stroke-width="5" stroke-linecap="round"/>
      <rect x="133" y="78" width="28" height="21" rx="2" fill="#f0c65d" opacity=".72" stroke="#6f481f" stroke-width="2"/>
      <path d="M138 86h18" stroke="#8b5b2c" stroke-width="3" stroke-linecap="round"/>
      <path d="M84 120c15-13 38-13 52 0v17H84z" fill="#d9a23e" opacity=".88" stroke="#8b5b2c" stroke-width="2"/>
      <path d="M91 128c13-8 26-8 37 0" stroke="#f4df8c" stroke-width="4" stroke-linecap="round"/>
      ${gate}
      <rect x="39" y="126" width="151" height="12" fill="#5e3920" opacity=".75"/>
      <path d="M62 138v18M164 138v18" stroke="#543119" stroke-width="10" stroke-linecap="round"/>
    </svg>`;
}

writeAsset("coop-open.svg", coop(true));
writeAsset("coop-closed.svg", coop(false));

writeAsset("straw-pile.svg", `
  <svg xmlns="http://www.w3.org/2000/svg" width="112" height="82" viewBox="0 0 112 82">
    <ellipse cx="56" cy="66" rx="44" ry="10" fill="#1d2617" opacity=".18"/>
    <ellipse cx="56" cy="48" rx="42" ry="23" fill="#d9a93c" stroke="#68451d" stroke-width="3"/>
    <g stroke-linecap="round" stroke-width="3">
      ${Array.from({ length: 36 }, (_, i) => {
        const x = 18 + ((i * 17) % 76);
        const y = 27 + ((i * 11) % 34);
        const dx = ((i % 5) - 2) * 5;
        const dy = ((i % 7) - 3) * 2;
        const color = i % 4 === 0 ? "#fff0a6" : i % 3 === 0 ? "#a86f20" : "#efc858";
        return `<path d="M${x} ${y}l${dx} ${dy}" stroke="${color}"/>`;
      }).join("")}
    </g>
  </svg>`);

writeAsset("fence-segment.svg", `
  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="64" viewBox="0 0 160 64">
    <ellipse cx="80" cy="55" rx="70" ry="8" fill="#20351c" opacity=".16"/>
    <g stroke="#3a2414" stroke-width="4" stroke-linecap="round">
      <path d="M14 25h132M14 43h132"/>
    </g>
    <g fill="#8a5729" stroke="#3a2414" stroke-width="3">
      <path d="M16 12l8-8 8 8v42H16z"/>
      <path d="M64 12l8-8 8 8v42H64z"/>
      <path d="M112 12l8-8 8 8v42h-16z"/>
    </g>
    <path d="M16 24h132M16 42h132" stroke="#c28a45" stroke-width="3" stroke-linecap="round" opacity=".9"/>
  </svg>`);

writeAsset("banana-tree.svg", `
  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="190" viewBox="0 0 160 190">
    <ellipse cx="82" cy="170" rx="45" ry="12" fill="#20351c" opacity=".18"/>
    <path d="M74 91c17 19 18 50 6 83" stroke="#7d4b26" stroke-width="19" stroke-linecap="round"/>
    <path d="M80 95c7 29 4 54-5 80" stroke="#b07238" stroke-width="6" stroke-linecap="round" opacity=".9"/>
    <g stroke="#426c2f" stroke-width="3" stroke-linejoin="round">
      <path d="M80 96C54 53 27 41 3 47c21 25 47 42 77 49z" fill="#5ca646"/>
      <path d="M82 92C94 43 118 18 151 18c-8 34-32 58-69 74z" fill="#6db64a"/>
      <path d="M83 101c33-28 61-33 76-19-25 17-50 26-76 19z" fill="#77bd4e"/>
      <path d="M76 98C45 84 22 88 7 112c29 4 52-1 69-14z" fill="#75b94e"/>
      <path d="M78 88C69 43 49 14 19 4c-3 33 15 61 59 84z" fill="#4f9b42"/>
    </g>
    <g stroke="#d7e27b" stroke-width="3" stroke-linecap="round" opacity=".8">
      <path d="M80 96C53 67 29 53 8 49"/>
      <path d="M82 92c26-30 47-51 66-70"/>
      <path d="M83 101c28-10 52-16 73-18"/>
      <path d="M76 98c-25 6-46 11-66 14"/>
      <path d="M78 88C58 57 39 31 21 6"/>
    </g>
    <g fill="#83a93d" stroke="#49612b" stroke-width="2">
      <ellipse cx="93" cy="121" rx="8" ry="17" transform="rotate(-20 93 121)"/>
      <ellipse cx="106" cy="124" rx="7" ry="15" transform="rotate(-2 106 124)"/>
      <ellipse cx="116" cy="129" rx="6" ry="14" transform="rotate(18 116 129)"/>
      <ellipse cx="100" cy="143" rx="7" ry="15" transform="rotate(12 100 143)"/>
    </g>
    <path d="M84 138c9 10 12 22 3 34-15-9-13-23-3-34z" fill="#b84675" stroke="#64304c" stroke-width="3"/>
  </svg>`);

writeAsset("asset-manifest.json", JSON.stringify({
  chickenSheets: {
    frameWidth: 48,
    frameHeight: 48,
    framesPerRow: 4,
    rows: chickenRows.map(([name]) => name),
    hen: "/assets/game/hen-sheet.svg",
    rooster: "/assets/game/rooster-sheet.svg"
  },
  player: {
    frameWidth: 48,
    frameHeight: 48,
    framesPerRow: 4,
    idleDirections: ["down", "up", "left", "right"],
    animations: Object.fromEntries(
      PLAYER_ANIMATIONS.map((animation) => [animation, `/assets/game/lan_anh_${animation}.svg`])
    )
  },
  environment: {
    background: "/assets/game/background-field.svg",
    coopOpen: "/assets/game/coop-open.svg",
    coopClosed: "/assets/game/coop-closed.svg",
    strawPile: "/assets/game/straw-pile.svg",
    fenceSegment: "/assets/game/fence-segment.svg",
    bananaTree: "/assets/game/banana-tree.svg"
  }
}, null, 2));
