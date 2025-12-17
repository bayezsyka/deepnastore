export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FEEAC9]">
      {/* Wave layer 1 */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#FFCDC9"
          d="M0,160L60,176C120,192,240,224,360,229.3C480,235,600,213,720,192C840,171,960,149,1080,144C1200,139,1320,149,1380,154.7L1440,160L1440,320L0,320Z"
        />
      </svg>

      {/* Wave layer 2 */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full opacity-70"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#FDACAC"
          d="M0,192L80,176C160,160,320,128,480,117.3C640,107,800,117,960,133.3C1120,149,1280,171,1360,181.3L1440,192L1440,320L0,320Z"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold text-[#FD7979]">
          Deepna Store
        </h1>
        <p className="mt-3 text-lg text-[#FD7979]/80">
          Jual Aplikasi Premium
        </p>
      </div>
    </main>
  );
}
