/**
 * ANVAYA Primary Brand Logo Component
 * Official Indian Heritage Tourism & Crowd Management Identity
 * 
 * Renders the authentic ANVAYA emblem or full brand mark uploaded in public/images.
 */
export default function Logo({
  size = 'md',
  variant = 'emblem', // 'emblem' | 'full' | 'wordmark'
  className = '',
  ...props
}) {
  // Emblem sizing (architectural square badge format)
  const emblemSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  // Full banner sizing
  const fullSizes = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20',
  };

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center shrink-0 ${className}`}
        aria-label="ANVAYA - Where Heritage Connects Generations"
      >
        <img
          src="/images/anvaya-logo.png"
          alt="ANVAYA - Where Heritage Connects Generations"
          className={`${fullSizes[size] || fullSizes.md} w-auto object-contain rounded-xl shadow-xs border border-heritage-sandstone/30`}
          {...props}
        />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div
        className={`inline-flex items-center shrink-0 ${className}`}
        aria-label="ANVAYA"
      >
        <img
          src="/images/anvaya-wordmark.png"
          alt="ANVAYA Brandmark"
          className={`${fullSizes[size] || fullSizes.md} w-auto object-contain`}
          {...props}
        />
      </div>
    );
  }

  // Default: Royal Architectural Emblem (Taj Mahal Arch, Minarets & Sun Rays)
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${
        emblemSizes[size] || emblemSizes.md
      } rounded-xl overflow-hidden border border-heritage-gold/40 bg-[#FAF5EC] shadow-xs p-0.5 select-none ${className}`}
      aria-label="ANVAYA"
    >
      <img
        src="/images/anvaya-emblem-square.png"
        alt="ANVAYA Heritage Emblem"
        className="w-full h-full object-cover rounded-[10px]"
        {...props}
      />
    </div>
  );
}
