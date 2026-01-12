import React from 'react';

export const PromoBanner = () => {
  return (
    <div className="w-[1200px] h-[600px] relative overflow-hidden bg-[#f5f5f7] font-sans flex items-center justify-center">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[80px]"></div>
      
      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-12 gap-8 items-center">
        
        {/* Left: Typography (Clean, Modern, Asymmetric) */}
        <div className="col-span-5 flex flex-col space-y-8">
          <div className="space-y-2">
            <span className="text-sm font-semibold tracking-widest text-blue-600 uppercase">Vlajková loď 2026</span>
            <h1 className="text-7xl font-bold tracking-tighter text-[#1d1d1f] leading-[0.95]">
              iPhone 17 <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Titanium</span>
            </h1>
          </div>
          
          <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-sm">
            Najtenší profil v histórii. <br/>
            Výkon, ktorý mení pravidlá hry.
          </p>

          <div className="flex items-center space-x-6 pt-4">
            <button className="px-8 py-3 bg-[#1d1d1f] text-white rounded-full font-medium text-lg hover:scale-105 transition-transform shadow-lg shadow-black/20">
              Kúpiť od 1 299 €
            </button>
            <a href="#" className="text-blue-600 font-medium hover:underline flex items-center group">
              Zistiť viac 
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </div>

        {/* Right: Dynamic Product Composition */}
        <div className="col-span-7 relative h-[500px] w-full perspective-[1000px]">
          
          {/* 1. Back View (Background Layer) - Showing Cameras */}
          <div className="absolute top-0 right-0 w-[280px] transform rotate-12 hover:rotate-[15deg] transition-transform duration-700 z-10">
            <img 
              src="/images/iphone17_back.png" 
              alt="iPhone 17 Back" 
              className="w-full h-auto drop-shadow-2xl opacity-90"
            />
          </div>

          {/* 2. Side Profile (Middle Layer) - Showing Thinness */}
          <div className="absolute top-[150px] right-[220px] w-[60px] h-[350px] transform -rotate-6 z-20">
             <img 
              src="/images/iphone17_side.png" 
              alt="iPhone 17 Side" 
              className="h-full w-auto object-contain drop-shadow-xl"
            />
          </div>

          {/* 3. Front View (Foreground Layer) - Hero */}
          <div className="absolute top-[50px] right-[120px] w-[300px] transform -rotate-6 hover:rotate-0 transition-transform duration-700 z-30">
            <img 
              src="/images/iphone17_retail.png" 
              alt="iPhone 17 Front" 
              className="w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-[100px] right-[50px] w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-[40px] opacity-40 animate-pulse z-0"></div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
