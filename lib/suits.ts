export type Integrity = {
  overall: number;
  helmet: number;
  chest: number;
  arm_left: number;
  arm_right: number;
  leg_left: number;
  leg_right: number;
  reactor: number;
};

export type Suit = {
  id: string;
  mark: number;
  name: string;
  codename: string;
  status: "online" | "offline" | "damaged" | "archived";
  year: number;
  image: string;
  power_output: string;
  top_speed: string;
  armor: string;
  height: string;
  weight: string;
  flight_ceiling: string;
  thruster_efficiency: number;
  hud_version: string;
  ai_core: string;
  first_deployed: string;
  battles: string[];
  weapons: { name: string; charge: number; notes?: string }[];
  integrity: Integrity;
  description: string;
  classification: string;
};

export const SUITS: Suit[] = [
  {
    id: "mk3",
    mark: 3,
    name: "Mark III",
    codename: "Classic",
    status: "archived",
    year: 2008,
    image: "https://static.wikia.nocookie.net/ironman/images/9/96/Mark_III.png",
    power_output: "3.2 GW",
    top_speed: "Mach 2.4",
    armor: "Gold-Titanium Alloy",
    height: "6'6\"",
    weight: "225 lbs",
    flight_ceiling: "85,000 ft",
    thruster_efficiency: 72,
    hud_version: "J.A.R.V.I.S. 1.0",
    ai_core: "JARVIS Core — 1st Gen",
    first_deployed: "Gulmira Incident",
    battles: ["Gulmira Rescue", "Stark Expo (Monaco)"],
    weapons: [
      { name: "Repulsor Ray", charge: 100, notes: "Palm-mounted plasma" },
      { name: "Unibeam", charge: 100, notes: "Chest RT pulse" },
      { name: "Flares", charge: 90 },
    ],
    integrity: { overall: 64, helmet: 80, chest: 55, arm_left: 70, arm_right: 60, leg_left: 65, leg_right: 55, reactor: 78 },
    description:
      "First fully functioning combat suit. Gold-titanium finish introduced after Mk II froze out at altitude.",
    classification: "Combat // Reconnaissance",
  },
  {
    id: "mk7",
    mark: 7,
    name: "Mark VII",
    codename: "Avengers",
    status: "archived",
    year: 2012,
    image: "https://static.wikia.nocookie.net/ironman/images/8/85/Mark_VII.png",
    power_output: "4.8 GW",
    top_speed: "Mach 2.8",
    armor: "Gold-Titanium Alloy",
    height: "6'6\"",
    weight: "220 lbs",
    flight_ceiling: "95,000 ft",
    thruster_efficiency: 78,
    hud_version: "J.A.R.V.I.S. 3.2",
    ai_core: "JARVIS Core — 3rd Gen",
    first_deployed: "Battle of New York",
    battles: ["Battle of New York", "Hulkbuster Rescue"],
    weapons: [
      { name: "Repulsor Ray", charge: 100 },
      { name: "Unibeam", charge: 92 },
      { name: "Missile Pods", charge: 88 },
      { name: "Shoulder Laser", charge: 76 },
    ],
    integrity: { overall: 71, helmet: 82, chest: 68, arm_left: 74, arm_right: 72, leg_left: 70, leg_right: 68, reactor: 85 },
    description: "First bracelet-deployable suit. Launched from Stark Tower during Chitauri invasion.",
    classification: "Combat // Rapid Deploy",
  },
  {
    id: "mk42",
    mark: 42,
    name: "Mark XLII",
    codename: "Prodigal Son",
    status: "damaged",
    year: 2013,
    image: "https://static.wikia.nocookie.net/ironman/images/4/45/Mark_XLII.png",
    power_output: "5.1 GW",
    top_speed: "Mach 3.1",
    armor: "Gold-Titanium + Prehensile Node Matrix",
    height: "6'7\"",
    weight: "215 lbs",
    flight_ceiling: "105,000 ft",
    thruster_efficiency: 81,
    hud_version: "J.A.R.V.I.S. 4.7",
    ai_core: "JARVIS Core — 4th Gen",
    first_deployed: "Mandarin Crisis",
    battles: ["Rose Hill", "Air Force One Rescue", "Malibu Assault"],
    weapons: [
      { name: "Repulsor Ray", charge: 64, notes: "Prehensile palms" },
      { name: "Unibeam", charge: 52 },
      { name: "Wrist Missiles", charge: 70 },
    ],
    integrity: { overall: 38, helmet: 55, chest: 32, arm_left: 48, arm_right: 28, leg_left: 40, leg_right: 35, reactor: 62 },
    description:
      "First prehensile suit. Components fly individually to the wearer using modular subdermal implants.",
    classification: "Prototype // Modular",
  },
  {
    id: "mk43",
    mark: 43,
    name: "Mark XLIII",
    codename: "Quattro Modo",
    status: "archived",
    year: 2015,
    image: "https://static.wikia.nocookie.net/ironman/images/3/34/Mark_XLIII.png",
    power_output: "5.9 GW",
    top_speed: "Mach 3.3",
    armor: "Gold-Titanium Alloy (Segreto)",
    height: "6'6\"",
    weight: "218 lbs",
    flight_ceiling: "110,000 ft",
    thruster_efficiency: 84,
    hud_version: "J.A.R.V.I.S. 5.0",
    ai_core: "JARVIS Core — 5th Gen",
    first_deployed: "Sokovia Offensive",
    battles: ["Hydra Base Raid", "Sokovia"],
    weapons: [
      { name: "Repulsor Ray", charge: 95 },
      { name: "Unibeam", charge: 90 },
      { name: "Shoulder Missiles", charge: 82 },
      { name: "Wrist Laser", charge: 74 },
    ],
    integrity: { overall: 76, helmet: 85, chest: 72, arm_left: 80, arm_right: 78, leg_left: 74, leg_right: 70, reactor: 90 },
    description:
      "Direct upgrade to Mark XLII. Quattro Modo flight stability system. Seen scanning Sokovia for the Mind Stone.",
    classification: "Combat // Flight",
  },
  {
    id: "mk46",
    mark: 46,
    name: "Mark XLVI",
    codename: "Civil",
    status: "online",
    year: 2016,
    image: "https://static.wikia.nocookie.net/ironman/images/0/09/Mark_XLVI.png",
    power_output: "6.4 GW",
    top_speed: "Mach 3.2",
    armor: "Gold-Titanium Alloy",
    height: "6'6\"",
    weight: "210 lbs",
    flight_ceiling: "108,000 ft",
    thruster_efficiency: 86,
    hud_version: "F.R.I.D.A.Y. 1.0",
    ai_core: "FRIDAY Core — 1st Gen",
    first_deployed: "Leipzig Airport",
    battles: ["Leipzig Airport", "Siberia Bunker"],
    weapons: [
      { name: "Repulsor Ray", charge: 88 },
      { name: "Unibeam", charge: 80 },
      { name: "RT Micro-Missiles", charge: 72 },
    ],
    integrity: { overall: 82, helmet: 88, chest: 80, arm_left: 82, arm_right: 78, leg_left: 84, leg_right: 80, reactor: 92 },
    description: "Civil War loadout. FRIDAY AI core replaces JARVIS. Enhanced tactical overlay.",
    classification: "Combat // Tactical",
  },
  {
    id: "mk50",
    mark: 50,
    name: "Mark L",
    codename: "Bleeding Edge",
    status: "online",
    year: 2018,
    image: "https://static.wikia.nocookie.net/ironman/images/1/1a/Mark_L.png",
    power_output: "9.2 GW",
    top_speed: "Mach 4.0",
    armor: "Nanotech (Self-Assembling)",
    height: "6'8\"",
    weight: "198 lbs",
    flight_ceiling: "Exoatmospheric",
    thruster_efficiency: 94,
    hud_version: "F.R.I.D.A.Y. 2.1",
    ai_core: "FRIDAY Core — 2nd Gen",
    first_deployed: "Titan",
    battles: ["New York (Q-Ship)", "Titan"],
    weapons: [
      { name: "Nano-Repulsors", charge: 96 },
      { name: "Unibeam", charge: 94 },
      { name: "Nano-Blades", charge: 90 },
      { name: "Proton Cannon", charge: 85 },
      { name: "Nano-Shield", charge: 100 },
    ],
    integrity: { overall: 90, helmet: 94, chest: 92, arm_left: 88, arm_right: 85, leg_left: 92, leg_right: 90, reactor: 96 },
    description: "First fully nanotech suit. Shape-shifts weapons on demand. Powered by refined arc reactor.",
    classification: "Nanotech // Deep Space",
  },
  {
    id: "mk85",
    mark: 85,
    name: "Mark LXXXV",
    codename: "Endgame",
    status: "offline",
    year: 2023,
    image: "https://static.wikia.nocookie.net/ironman/images/4/4d/Mark_LXXXV.png",
    power_output: "14.6 GW",
    top_speed: "Mach 4.5",
    armor: "Nanotech + Pym Particle Composite",
    height: "6'8\"",
    weight: "185 lbs",
    flight_ceiling: "Exoatmospheric",
    thruster_efficiency: 97,
    hud_version: "F.R.I.D.A.Y. 3.0",
    ai_core: "FRIDAY Core — 3rd Gen",
    first_deployed: "Time Heist",
    battles: ["Time Heist", "Battle of Earth"],
    weapons: [
      { name: "Nano-Repulsors", charge: 100 },
      { name: "Unibeam", charge: 100 },
      { name: "Nano-Gauntlet Adapter", charge: 100 },
      { name: "Plasma Cannons", charge: 94 },
      { name: "Nano-Shield", charge: 100 },
    ],
    integrity: { overall: 12, helmet: 20, chest: 8, arm_left: 0, arm_right: 18, leg_left: 22, leg_right: 14, reactor: 0 },
    description:
      "Final suit. Housed the six Infinity Stones during the Snap reversal. Reactor catastrophically discharged.",
    classification: "Nanotech // Infinity Hardened",
  },
];
