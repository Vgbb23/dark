import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface FlashSaleBannerProps {
  currentPrice: number;
  originalPrice: number;
  timeLeft: string;
}

export default function FlashSaleBanner({ currentPrice, originalPrice, timeLeft }: FlashSaleBannerProps) {
  const discountPercentage = 63;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gradient-to-r from-[#EE4D2D] to-[#FF7337] text-white flex items-center justify-between px-3 h-[56px]">
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5">
          <div className="bg-white text-[#EE4D2D] text-[10px] font-black px-1 rounded-[1px] leading-tight h-3.5 flex items-center">
            -{discountPercentage}%
          </div>
          <span className="text-[16px] leading-none">A partir de <strong>R$28,90</strong></span>
        </div>
        <span className="text-[10px] line-through opacity-60 ml-8 mt-1">R$ {formatPrice(originalPrice)}</span>
      </div>

      <div className="flex flex-col items-end justify-center">
        <div className="flex items-center gap-0.5 font-black italic text-[#FFF]">
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span className="text-[12px] uppercase tracking-tighter">Oferta Relâmpago</span>
        </div>
        <div className="text-[10px] mt-1.5 font-medium flex items-center gap-1">
          Termina em 
          <span className="bg-black/20 px-1 rounded-[1px] font-mono font-bold w-[60px] text-center">
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
