import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ny-ambient grid min-h-dvh place-items-center px-6 py-16">
      <div className="ny-card max-w-lg p-10 text-center">
        <p className="ny-eyebrow">Lost branch</p>
        <h1 className="ny-title mt-3 text-4xl">This branch isn&apos;t on the map</h1>
        <p className="mt-3 text-text-secondary">
          The page you&apos;re looking for may have moved to another branch of the family. Let&apos;s get you back home.
        </p>
        <Link href="/dashboard" className="ny-btn ny-btn-primary mt-6">
          Back to the command center
        </Link>
      </div>
    </main>
  );
}
