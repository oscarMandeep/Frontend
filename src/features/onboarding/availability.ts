/**
 * The availability grid works in whole hours ("day:hour" cells); the API stores
 * slots as minutes. These two functions convert between them.
 */
export interface Slot {
  dayOfWeek: number;
  startMin: number;
  endMin: number;
}

export const cellKey = (day: number, hour: number) => `${day}:${hour}`;

/** Consecutive hours on a day merge into one slot. */
export function cellsToSlots(cells: readonly string[]): Slot[] {
  const byDay = new Map<number, number[]>();
  for (const cell of new Set(cells)) {
    const [day, hour] = cell.split(":").map(Number);
    if (Number.isInteger(day) && Number.isInteger(hour) && hour >= 0 && hour <= 23) {
      byDay.set(day, [...(byDay.get(day) ?? []), hour]);
    }
  }
  const slots: Slot[] = [];
  for (const [day, hours] of [...byDay].sort((a, b) => a[0] - b[0])) {
    hours.sort((a, b) => a - b);
    let start = hours[0];
    let prev = hours[0];
    for (const h of hours.slice(1)) {
      if (h !== prev + 1) {
        slots.push({ dayOfWeek: day, startMin: start * 60, endMin: (prev + 1) * 60 });
        start = h;
      }
      prev = h;
    }
    slots.push({ dayOfWeek: day, startMin: start * 60, endMin: (prev + 1) * 60 });
  }
  return slots;
}

/** Slots that do not line up with whole hours are rounded outwards. */
export function slotsToCells(slots: readonly Slot[]): string[] {
  const cells = new Set<string>();
  for (const s of slots) {
    for (let h = Math.floor(s.startMin / 60); h < Math.ceil(s.endMin / 60); h++) {
      cells.add(cellKey(s.dayOfWeek, h));
    }
  }
  return [...cells];
}
