const logoPngUrl = '/assets/LogoMark.png';

const sizeClass = {
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-20',
};

export function Logo({ className = '', alt = 'KrishTech Computers — Trusted Efficiency', size = 'md' }) {
  const hasCustomHeight = /\bh-/.test(className);
  const cls = `${hasCustomHeight ? '' : sizeClass[size]} w-auto object-contain dark:[background-image:linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.6)_30%,rgba(255,255,255,0.6)_70%,transparent_100%)] ${className}`.trim();
  return <img src={logoPngUrl} alt={alt} width={128} height={128} className={cls} />;
}
