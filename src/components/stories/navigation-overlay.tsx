"use client";

interface NavigationOverlayProps {
  onPrev: () => void;
  onNext: () => void;
  onPauseStart: () => void;
  onPauseEnd: () => void;
}

export function NavigationOverlay({
  onPrev,
  onNext,
  onPauseStart,
  onPauseEnd,
}: NavigationOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex">
      {/* Left tap zone - go back */}
      <button
        className="w-1/3 h-full cursor-pointer focus:outline-none"
        onClick={onPrev}
        onMouseDown={onPauseStart}
        onMouseUp={onPauseEnd}
        onMouseLeave={onPauseEnd}
        onTouchStart={onPauseStart}
        onTouchEnd={onPauseEnd}
        aria-label="Previous slide"
      />

      {/* Center tap zone - pause */}
      <button
        className="w-1/3 h-full cursor-pointer focus:outline-none"
        onMouseDown={onPauseStart}
        onMouseUp={onPauseEnd}
        onMouseLeave={onPauseEnd}
        onTouchStart={onPauseStart}
        onTouchEnd={onPauseEnd}
        aria-label="Pause"
      />

      {/* Right tap zone - go forward */}
      <button
        className="w-1/3 h-full cursor-pointer focus:outline-none"
        onClick={onNext}
        onMouseDown={onPauseStart}
        onMouseUp={onPauseEnd}
        onMouseLeave={onPauseEnd}
        onTouchStart={onPauseStart}
        onTouchEnd={onPauseEnd}
        aria-label="Next slide"
      />
    </div>
  );
}
