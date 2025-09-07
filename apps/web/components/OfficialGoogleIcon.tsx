export default function OfficialGoogleIcon(props: { className?: string; width?: number; height?: number }) {
  const { className, width = 18, height = 18 } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 533.5 544.3" aria-hidden="true" className={className}>
      <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.5-37.5-4.7-55.5H272.1v105.1h146.9c-6.2 33.7-25.3 62.2-54 81.3l87.3 67.8c51.1-47.2 81.2-116.7 81.2-198.7z"/>
      <path fill="#34A853" d="M272.1 544.3c73.4 0 135-24.1 180-65.4l-87.3-67.8c-24.2 16.3-55.1 26-92.8 26-71.3 0-131.8-48.1-153.5-112.6l-90.4 69.7C66.4 480.6 162.2 544.3 272.1 544.3z"/>
      <path fill="#FBBC05" d="M118.6 324.6c-4.3-12.9-6.7-26.6-6.7-40.6s2.4-27.7 6.7-40.6l-90.4-69.7C9.5 216.9 0 245.7 0 284s9.5 67.1 28.2 97.4l90.4-69.7z"/>
      <path fill="#EA4335" d="M272.1 107.7c39.9 0 76.1 13.7 104.4 40.6l78.3-78.3C410.9 24.7 355.8 0 272.1 0 162.2 0 66.4 63.7 28.2 186.6l90.4 69.7C140.3 155.8 200.7 107.7 272.1 107.7z"/>
    </svg>
  );
}
