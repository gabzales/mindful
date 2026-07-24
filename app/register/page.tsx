import Link from "next/link";
import Image from "next/image";
import { RegisterFlow } from "./RegisterFlow";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-[#4C0578]">
      {/* Left Column: Register Form */}
      <div className="relative flex w-full flex-col justify-center items-center px-6 py-12 lg:w-1/2 bg-white lg:rounded-r-[48px] z-20 shadow-2xl min-h-screen">
        
        {/* Top-Left Logo (mindful.png) - fixed to viewport so it never drifts on zoom/scroll */}
        <div className="fixed top-6 left-6 sm:top-8 sm:left-8 z-30">
          <Link href="/">
            <Image
              src="/mindful.png"
              alt="Mindfulness Indonesia"
              width={180}
              height={94}
              priority
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-md xl:max-w-lg px-4 sm:px-6 mt-20 lg:mt-0">
          <RegisterFlow />
        </div>
      </div>

      {/* Right Column: Branding Hero & Corporate Trust Banner (Desktop only) */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #4C0578 0%, #4C0578 55%, #FFFFFF 100%)"
        }}
      >
        {/* Underlay Logos & Text (Bottom) */}
        <div className="absolute inset-x-0 bottom-0 z-0 flex flex-col items-center pb-8">
          <p className="text-xs font-bold text-purple-900/60 mb-4 tracking-wider z-20">
            Trusted by corporate teams at:
          </p>
          <div className="relative w-full h-48 px-4">
            <Image
              src="/Clients-2.png"
              alt="Trusted corporate teams"
              fill
              className="object-cover object-bottom pointer-events-none"
              priority
            />
          </div>
        </div>

        {/* Purple Fading Gradient Overlay on Top */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, #4C0578 0%, #4C0578 55%, rgba(255, 255, 255, 0.15) 100%)"
          }}
        />

        {/* Content (z-20 so it remains sharp and readable) */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          {/* Top placeholder to balance the layout */}
          <div className="h-10" />

          {/* Hero titles & description */}
          <div className="space-y-6 max-w-md my-auto">
            <div className="space-y-1">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#FFC300] leading-tight">
                Welcome to
              </h2>
              <h2 className="font-display text-5xl font-black tracking-tight text-black leading-none">
                Mindfulness
              </h2>
              <h2 className="font-display text-5xl font-black tracking-tight text-black leading-none mt-1">
                Indonesia
              </h2>
            </div>
            
            <p className="text-sm text-black leading-relaxed font-bold">
              Mindfulness Indonesia is the first and only authorized Mindfulness institution in Indonesia. Established in 2016, we offer guided Mindfulness training practice by certified instructors.
            </p>
          </div>

          {/* Space reservation to protect peeking bottom logos */}
          <div className="h-48" />
        </div>
      </div>
    </div>
  );
}
