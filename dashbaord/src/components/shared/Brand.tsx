export function BrandMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const leaves = [
    [8, 21, -48],
    [11, 15, -50],
    [15, 10, -34],
    [18, 14, -39],
    [21, 8, -26],
    [25, 5, -7],
    [29, 9, 20],
    [33, 7, 34],
    [36, 13, 39],
    [40, 14, 54],
    [43, 20, 65],
    [35, 19, 42],
    [29, 15, 22],
    [22, 17, -23],
    [15, 21, -48],
    [32, 23, 51],
    [10, 25, -62],
    [39, 25, 69],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M26 41C25 31 27 21 25 9m1 25C22 27 15 24 8 22m17 7C23 24 17 18 12 15m13 10c-1-5-5-9-8-13m9 23c5-7 12-9 17-13M26 28c2-7 9-10 14-13m-14 9c3-5 5-10 6-15M25 20l-4-10" />
        <path d="M16 43c7-1 8-3 10-7 1 5 5 6 11 7m-25 2c7 0 10-2 14-2s9 2 14 1" />
      </g>
      <g fill="currentColor">
        {leaves.map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="1.65"
            ry="3.1"
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
      </g>
    </svg>
  );
}
export function Brand() {
  return (
    <div className="ny-brand">
      <BrandMark size={44} />
      <div>
        <span>Nalyanya</span>
        <small>FAMILY WORKSPACE</small>
      </div>
    </div>
  );
}
