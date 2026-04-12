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
  weapons: string[];
  description: string;
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
    weapons: ["Repulsors", "Unibeam", "Flares"],
    description: "First fully functioning combat suit. Red and gold finish introduced.",
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
    weapons: ["Repulsors", "Unibeam", "Missile Pods", "Laser"],
    description: "First bracelet-deployable suit. Worn during the Battle of New York.",
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
    armor: "Gold-Titanium + Nanotech Prototype",
    weapons: ["Repulsors", "Unibeam"],
    description: "First prehensile suit. Components fly individually to the wearer.",
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
    weapons: ["Repulsors", "Unibeam", "RT Micro-Missiles"],
    description: "Leipzig airport battle loadout. Enhanced HUD and tactical AI.",
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
    weapons: ["Nano-Repulsors", "Unibeam", "Nano-Blades", "Proton Cannon"],
    description: "First fully nanotech suit. Infinity War debut.",
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
    weapons: ["Nano-Repulsors", "Unibeam", "Nano-Gauntlet Compatible", "Plasma Cannons"],
    description: "Final suit. Housed the Infinity Stones during The Snap reversal.",
  },
];
