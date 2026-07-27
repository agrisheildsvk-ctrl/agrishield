import React from 'react';

const TrustBadges = () => {
  const badges = [
    {
      title: "100% Genuine",
      icon: (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-700">
          {/* Outer Shield */}
          <path
            d="M60 14L24 28C24 62 38 88 60 106C82 88 96 62 96 28L60 14Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#F0FDF4"
          />
          {/* Inner Shield border outline */}
          <path
            d="M60 22L32 33C32 61 43 82 60 96C77 82 88 61 88 33L60 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          {/* Checkmark inside Circle */}
          <circle cx="60" cy="46" r="14" fill="#DCFCE7" stroke="currentColor" strokeWidth="3" />
          <path d="M53 46L58 51L68 41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Left & Right Leaves at Bottom of Shield */}
          <path
            d="M44 76C44 68 52 64 60 74C48 76 44 76 44 76Z"
            fill="#BBF7D0"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M76 76C76 68 68 64 60 74C72 76 76 76 76 76Z"
            fill="#BBF7D0"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M48 72L56 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M72 72L64 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Top right Sparkles */}
          <path d="M96 12L98 18L104 20L98 22L96 28L94 22L88 20L94 18L96 12Z" fill="#16A34A" />
          <path d="M106 28L107 31L110 32L107 33L106 36L105 33L102 32L105 31L106 28Z" fill="#22C55E" />
          <path d="M86 8L87 11L90 12L87 13L86 16L85 13L82 12L85 11L86 8Z" fill="#22C55E" />
        </svg>
      )
    },
    {
      title: "Farmer Trusted",
      icon: (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-700">
          {/* Left Wheat Wreath */}
          <path d="M22 72C16 56 20 38 32 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 62C22 62 18 64 16 68C20 70 24 68 26 62Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          <path d="M22 50C18 50 14 52 13 56C17 58 21 56 22 50Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          <path d="M24 38C20 38 16 40 15 44C19 46 23 44 24 38Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          {/* Right Wheat Wreath */}
          <path d="M98 72C104 56 100 38 88 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M94 62C98 62 102 64 104 68C100 70 96 68 94 62Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          <path d="M98 50C102 50 106 52 107 56C103 58 99 56 98 50Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          <path d="M96 38C100 38 104 40 105 44C101 46 97 44 96 38Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          {/* Farmer Hat & Head */}
          <ellipse cx="60" cy="30" rx="22" ry="6" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" />
          <path d="M48 30C48 22 52 18 60 18C68 18 72 22 72 30" fill="#DCFCE7" stroke="currentColor" strokeWidth="3" />
          <circle cx="60" cy="42" r="10" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" />
          {/* Face details (smile & beard) */}
          <circle cx="56" cy="40" r="1.5" fill="currentColor" />
          <circle cx="64" cy="40" r="1.5" fill="currentColor" />
          <path d="M56 45C58 47 62 47 64 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Shoulders / Farmer Dungarees */}
          <path d="M40 74C40 58 48 54 60 54C72 54 80 58 80 74" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" />
          <path d="M48 54V74M72 54V74" stroke="currentColor" strokeWidth="2.5" />
          <rect x="50" y="60" width="20" height="14" rx="2" fill="#DCFCE7" stroke="currentColor" strokeWidth="2.5" />
          {/* Pitchfork in farmer's hand */}
          <path d="M38 34V76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M34 34V42M42 34V42M34 42H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Ribbon Banner at Bottom with text 'Trusted' */}
          <path d="M16 80L24 74H96L104 80L98 96L88 90H32L22 96L16 80Z" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M26 78H94V90H26V78Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2.5" />
          <text x="60" y="87" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="900" letterSpacing="0.5">
            Trusted
          </text>
          {/* Sparkles */}
          <path d="M84 16L86 20L90 22L86 24L84 28L82 24L78 22L82 20L84 16Z" fill="#16A34A" />
          <path d="M36 18L37 21L40 22L37 23L36 26L35 23L32 22L35 21L36 18Z" fill="#22C55E" />
        </svg>
      )
    },
    {
      title: "Expert Support",
      icon: (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-700">
          {/* Woman Farmer Sun Hat */}
          <ellipse cx="58" cy="28" rx="20" ry="5" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" />
          <path d="M48 28C48 20 52 16 58 16C64 16 68 20 68 28" fill="#DCFCE7" stroke="currentColor" strokeWidth="3" />
          {/* Woman Head & Hair */}
          <circle cx="58" cy="40" r="9" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" />
          <path d="M49 42C47 48 48 54 52 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M67 42C69 48 68 54 64 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Face details */}
          <circle cx="55" cy="39" r="1.5" fill="currentColor" />
          <circle cx="61" cy="39" r="1.5" fill="currentColor" />
          <path d="M55 44C56 46 60 46 61 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Shoulders & Apron/Uniform */}
          <path d="M38 76C38 58 46 54 58 54C70 54 78 58 78 76" fill="#F0FDF4" stroke="currentColor" strokeWidth="3" />
          <path d="M46 54V76M70 54V76" stroke="currentColor" strokeWidth="2.5" />
          <rect x="48" y="62" width="20" height="14" rx="3" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          {/* Left Hand Holding Wheat Stalks */}
          <path d="M36 58C32 64 30 70 34 76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 68L34 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 54C28 54 30 52 30 48C26 48 24 50 24 54Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          <path d="M28 60C32 60 34 58 34 54C30 54 28 56 28 60Z" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
          {/* Right Hand Holding Checklist Clipboard */}
          <rect x="76" y="52" width="20" height="26" rx="3" fill="#F0FDF4" stroke="currentColor" strokeWidth="2.5" transform="rotate(-6 76 52)" />
          <path d="M82 60H90M82 66H90M82 72H88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Top Right Phone Calling Icon */}
          <path
            d="M86 22C89 22 92 24 94 28L92 34C90 35 87 34 85 32L83 26C83 24 84 22 86 22Z"
            fill="#DCFCE7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M94 20C98 24 98 32 94 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M98 16C104 22 104 34 98 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
          {/* Sparkles */}
          <path d="M26 24L28 28L32 30L28 32L26 36L24 32L20 30L24 28L26 24Z" fill="#16A34A" />
          <path d="M38 36L39 39L42 40L39 41L38 44L37 41L34 40L37 39L38 36Z" fill="#22C55E" />
        </svg>
      )
    },
    {
      title: "PAN India Delivery",
      icon: (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-700">
          {/* India Map Stylized Silhouette Outline */}
          <path
            d="M54 18L64 22L76 28L78 38L92 42L98 48L92 56L84 56L82 68L70 88L62 98L56 94L54 78L40 68L28 62L24 50L36 44L44 32L54 18Z"
            fill="#F0FDF4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner Map Details (subtle state boundaries) */}
          <path
            d="M44 46L66 48M52 64L76 60M60 28V48"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
          {/* Top GPS Location Pin */}
          <path
            d="M60 26C52 26 46 32 46 40C46 50 60 64 60 64C60 64 74 50 74 40C74 32 68 26 60 26Z"
            fill="#DCFCE7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="39" r="4" fill="currentColor" />
          {/* Delivery Truck Moving Across */}
          <path
            d="M34 72H72V88H34V72Z"
            fill="#DCFCE7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M72 76H86L92 82V88H72V76Z"
            fill="#F0FDF4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Truck Wheels */}
          <circle cx="46" cy="88" r="6" fill="#16A34A" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="46" cy="88" r="2" fill="white" />
          <circle cx="82" cy="88" r="6" fill="#16A34A" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="82" cy="88" r="2" fill="white" />
          {/* Speed Lines Behind Truck */}
          <path d="M18 76H28M14 82H26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sparkles */}
          <path d="M88 20L90 24L94 26L90 28L88 32L86 28L82 26L86 24L88 20Z" fill="#16A34A" />
          <path d="M30 26L31 29L34 30L31 31L30 34L29 31L26 30L29 29L30 26Z" fill="#22C55E" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-8 md:py-10 bg-white w-full border-t border-b border-gray-100 shadow-sm relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 items-center justify-items-center">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-3 p-1 rounded-2xl transition-all duration-300 group-hover:drop-shadow-md">
                {badge.icon}
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight">
                {badge.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
