import React from 'react';
import { PromoBanner } from '../components/PromoBanner';

export default function BannerExport() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <PromoBanner />
    </div>
  );
}
