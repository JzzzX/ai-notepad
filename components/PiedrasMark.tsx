interface PiedrasMarkProps {
  className?: string;
}

const DOTS: Array<[number, number]> = [
  [5, 19],
  [7, 18],
  [9, 16],
  [11, 14],
  [13, 12],
  [14.5, 10.5],
  [16, 9],
  [18, 8],
  [20, 7],
  [22, 6.2],
  [14, 13.5],
  [16, 14.2],
  [18, 15],
  [20, 15.8],
  [22, 16.5],
  [13.5, 11.4],
  [15, 11.1],
  [16.5, 10.9],
  [18, 10.8],
];

export default function PiedrasMark({ className = '' }: PiedrasMarkProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      {DOTS.map(([cx, cy], index) => (
        <circle
          key={`${cx}-${cy}-${index}`}
          cx={cx}
          cy={cy}
          r={index < 5 ? 1.1 : 1}
          fill="currentColor"
          opacity={index > 13 ? 0.9 : 1}
        />
      ))}
    </svg>
  );
}
