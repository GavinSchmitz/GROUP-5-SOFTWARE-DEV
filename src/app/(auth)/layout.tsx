export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left: Decorative visual panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gray-900 lg:flex lg:items-center lg:justify-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/90 to-amber-900/30" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/10 blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 max-w-md px-8 text-center">
          {/* Clock icon with decorative ring */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 ring-2 ring-amber-400/30 ring-offset-4 ring-offset-gray-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white">
            Exchange Skills,
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Not Money
            </span>
          </h2>
          <p className="mt-4 text-gray-400">
            Join a community where everyone&apos;s time is valued equally.
            One hour given earns one hour to spend.
          </p>

          {/* Floating skill tags */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {["Guitar", "Coding", "Gardening", "Cooking", "Yoga", "CV Writing"].map(
              (skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur-sm"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
