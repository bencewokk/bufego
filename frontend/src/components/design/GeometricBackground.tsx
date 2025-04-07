export const GeometricBackground = () => (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-[var(--primary-light)] opacity-20 animate-float1"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-[var(--primary)] opacity-15 animate-float2"></div>
      <div className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-[var(--primary-dark)] opacity-10 animate-float3"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
    </div>
  );