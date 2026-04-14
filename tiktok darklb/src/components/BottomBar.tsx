import { Store, MessageCircle } from 'lucide-react';

interface BottomBarProps {
  onBuyNow: () => void;
}

export default function BottomBar({ onBuyNow }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white flex items-center z-50 h-[64px] px-3 gap-3">
      <div className="flex items-center gap-5 px-1">
        <button className="flex flex-col items-center justify-center">
          <Store className="w-[22px] h-[22px] text-[#222222]" strokeWidth={2} />
          <span className="text-[11px] font-medium text-[#222222] mt-0.5">Loja</span>
        </button>
        <button className="flex flex-col items-center justify-center">
          <MessageCircle className="w-[22px] h-[22px] text-[#222222]" strokeWidth={2} />
          <span className="text-[11px] font-medium text-[#222222] mt-0.5">Chat</span>
        </button>
      </div>

      <div className="flex-1 flex gap-2 h-[44px]">
        <button className="flex-1 bg-[#F5F5F5] rounded-full flex flex-col items-center justify-center leading-none">
          <span className="text-[13px] font-bold text-[#222222]">Adicionar</span>
          <span className="text-[13px] font-bold text-[#222222]">ao carrinho</span>
        </button>
        <button 
          onClick={onBuyNow}
          className="flex-1 bg-[#FF2D55] rounded-full flex flex-col items-center justify-center text-white leading-none"
        >
          <span className="text-[14px] font-bold">Comprar agora</span>
          <span className="text-[11px] font-medium mt-0.5">Frete grátis</span>
        </button>
      </div>
    </div>
  );
}
