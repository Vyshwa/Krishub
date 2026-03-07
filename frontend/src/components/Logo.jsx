import logoPngUrl from '@/assets/LogoMark.png';

const sizeClass = {
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-20',
};

export function Logo({ className = '', alt = 'KrishTech Computers — Trusted Efficiency', size = 'md' }) {
  const cls = `${sizeClass[size]} w-auto object-contain ${className}`.trim();
  return <img src={logoPngUrl} alt={alt} className={cls} />;
}
