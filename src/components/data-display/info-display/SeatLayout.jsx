// src/components/data-display/info-display/SeatLayout.jsx
import React, { useMemo } from "react";

/**
 * Props:
 * - totalSeats: number
 * - value: number[] (selected seat numbers)
 * - onChange: (next: number[]) => void
 * - lockedSeats: Array<{ seat_number:number, gender?:'M'|'F', status?:string }> | number[]
 * - maxSelectable?: number
 * - palette?: { available: string; male: string; female: string }
 * - view?: 'vertical' | 'horizontal' (kept for compat, not used)
 */
export default function SeatLayout({
  totalSeats = 0,
  value = [],
  onChange,
  lockedSeats = [],
  maxSelectable = 1,
  palette = {
    available: "#52c41a", // green
    male: "#1677ff",      // blue
    female: "#ff4d4f",    // red
  },
}) {
  // Normalize locked -> Map<number, {gender:'M'|'F'}>
  const lockedMap = useMemo(() => {
    const map = new Map();
    for (const x of lockedSeats || []) {
      if (typeof x === "number") {
        map.set(x, { gender: "M" }); // legacy fallback
      } else if (x && typeof x.seat_number !== "undefined") {
        map.set(Number(x.seat_number), { gender: x.gender === "F" ? "F" : "M" });
      }
    }
    return map;
  }, [lockedSeats]);

  const isLocked = (n) => lockedMap.has(n);
  const lockedGender = (n) => lockedMap.get(n)?.gender;
  const isSelected = (n) => value.includes(n);

  const seatBg = (n) => {
    if (isLocked(n)) {
      return lockedGender(n) === "F" ? palette.female : palette.male;
    }
    return palette.available;
  };

  const toggleSeat = (n) => {
    if (isLocked(n)) return;
    const selected = new Set(value);
    if (selected.has(n)) {
      selected.delete(n);
    } else {
      if (selected.size >= maxSelectable) return;
      selected.add(n);
    }
    onChange?.(Array.from(selected).sort((a, b) => a - b));
  };

  // Build rows: pre-back rows of 4 seats (2 + aisle + 2),
  // and a final back row of 5 continuous seats.
  const layoutRows = useMemo(() => {
    const rows = [];

    if (totalSeats <= 0) return rows;

    // If totalSeats <= 5 -> single back row
    if (totalSeats <= 5) {
      rows.push({ type: "back", seats: Array.from({ length: totalSeats }, (_, i) => i + 1) });
      return rows;
    }

    const seatsBeforeBack = totalSeats - 5;
    const preRows = Math.ceil(seatsBeforeBack / 4); // 0..N

    // Fill pre-back rows; per row positions [L1,L2, R1,R2] map to grid columns [0,1,3,4]
    for (let r = 0; r < preRows; r++) {
      const base = r * 4 + 1; // first seat number in this row
      const rowSeats = [];
      for (let j = 0; j < 4; j++) {
        const seatNo = base + j;
        if (seatNo <= seatsBeforeBack) rowSeats.push(seatNo);
      }
      rows.push({ type: "normal", seats: rowSeats }); // up to 4 seats
    }

    // Back row: last 5 seats continuous
    const backStart = seatsBeforeBack + 1;
    rows.push({
      type: "back",
      seats: Array.from({ length: 5 }, (_, i) => backStart + i),
    });

    return rows;
  }, [totalSeats]);

  const DriverIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v6M12 15v6M21 12h-6M9 12H3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

  const Seat = ({ n }) => {
    const locked = isLocked(n);
    const sel = isSelected(n);
    const bg = seatBg(n);

    return (
      <button
        type="button"
        onClick={() => toggleSeat(n)}
        disabled={locked}
        title={
          locked ? (lockedGender(n) === "F" ? "Booked (Female)" : "Booked (Male)") : "Available"
        }
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: sel ? "2px solid #111" : "1px solid rgba(0,0,0,0.25)",
          outline: "none",
          background: bg,
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.95 : 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        {n}
      </button>
    );
  };

  // Render a row with grid: 5 columns -> [L1, L2, AISLE, R1, R2]
  const renderNormalRow = (rowSeats, idx) => {
    // Map rowSeats [L1,L2,R1,R2] into grid columns [0,1,3,4]
    const cells = new Array(5).fill(null);
    if (rowSeats[0] != null) cells[0] = <Seat n={rowSeats[0]} key={`${idx}-l1`} />;
    if (rowSeats[1] != null) cells[1] = <Seat n={rowSeats[1]} key={`${idx}-l2`} />;
    if (rowSeats[2] != null) cells[3] = <Seat n={rowSeats[2]} key={`${idx}-r1`} />;
    if (rowSeats[3] != null) cells[4] = <Seat n={rowSeats[3]} key={`${idx}-r2`} />;

    return (
      <div
        key={`row-${idx}`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, auto)",
          gap: 10,
          alignItems: "center",
        }}
      >
        {cells.map((c, i) =>
          c ? c : i === 2 ? <div key={`aisle-${idx}`} style={{ width: 18 }} /> : <span key={`sp-${idx}-${i}`} style={{ width: 36 }} />
        )}
      </div>
    );
  };

  // Render the back row: 5 continuous seats (fills aisle column too)
  const renderBackRow = (rowSeats, idx) => {
    return (
      <div
        key={`back-${idx}`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, auto)",
          gap: 10,
          alignItems: "center",
        }}
      >
        {rowSeats.map((n) =>
          n ? <Seat n={n} key={`b-${n}`} /> : <span key={`b-sp-${n}`} style={{ width: 36 }} />
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      {/* Driver */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.2)",
            display: "grid",
            placeItems: "center",
            background: "#f5f5f5",
            color: "#666",
          }}
          aria-label="Driver seat"
        >
          <DriverIcon />
        </div>
      </div>

      {/* Seats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {layoutRows.map((row, idx) =>
          row.type === "back"
            ? renderBackRow(row.seats, `back-${idx}`)
            : renderNormalRow(row.seats, `norm-${idx}`)
        )}
      </div>
    </div>
  );
}
