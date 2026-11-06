// A boot reaching through a wall must never lift the whole body onto the other floor.
// Real stair differences (10–12 cm) remain valid support surfaces.
export function footSupportHeight(base,probe,obstructed=false){return obstructed||Math.abs(probe-base)>.145?base:probe;}
