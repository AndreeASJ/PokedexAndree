'use client';

export default function PokeballSpinner({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      <div
        className="pokeball-spinner"
        style={{ width: size, height: size }}
      >
        <div className="pokeball-top" />
        <div className="pokeball-center">
          <div className="pokeball-button" />
        </div>
        <div className="pokeball-bottom" />
      </div>
    </div>
  );
}
