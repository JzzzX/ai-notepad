interface PiedrasMarkProps {
  className?: string;
}

const CROSSES: Array<[number, number, number]> = [
  [6.6, 21.8, 1.15],
  [9.5, 20, 1.15],
  [12, 17.6, 1.15],
  [14.6, 14.8, 1.15],
  [17.1, 12, 1.15],
  [19.4, 9.7, 1.15],
  [21.9, 8, 1.15],
  [24.6, 6.8, 1.1],
  [27.2, 6.2, 1.1],
  [29.8, 6.2, 1.1],
  [19.8, 12.1, 1.05],
  [22.4, 12.8, 1.05],
  [25.1, 13.6, 1.05],
  [27.6, 14.2, 1.05],
  [30.2, 15, 1.05],
  [19.4, 9.4, 1],
  [21.9, 8.9, 1],
  [24.3, 8.5, 1],
  [26.8, 8.3, 1],
];

export default function PiedrasMark({ className = '' }: PiedrasMarkProps) {
  return (
    <svg
      viewBox="0 0 36 28"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {CROSSES.map(([cx, cy, half], index) => (
          <path
            key={`${cx}-${cy}-${index}`}
            d={`M${cx - half} ${cy - half}L${cx + half} ${cy + half}M${cx + half} ${cy - half}L${cx - half} ${cy + half}`}
            opacity={index > 13 ? 0.9 : 1}
          />
        ))}
      </g>
    </svg>
  );
}
