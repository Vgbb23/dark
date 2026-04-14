import { ChevronLeft, Search, Share2, ShoppingCart, MoreHorizontal } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white px-1 py-1 flex items-center h-11">
      <button className="p-2">
        <ChevronLeft className="w-6 h-6 text-[#222222]" strokeWidth={1.5} />
      </button>
      
      <div className="flex-1 bg-[#F5F5F5] rounded-[2px] flex items-center px-2 py-1.5 gap-2 h-8">
        <Search className="w-4 h-4 text-[#888888]" />
        <input 
          type="text" 
          placeholder="Pesquise no TikTok Shop" 
          className="bg-transparent text-[13px] outline-none w-full text-[#222222] placeholder-[#888888]"
          readOnly
        />
      </div>

      <div className="flex items-center gap-1 px-1">
        <button className="p-2">
          <Share2 className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />
        </button>
        <button className="p-2 relative">
          <ShoppingCart className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />
          <span className="absolute top-1 right-1 bg-[#EE4D2D] text-white text-[8px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-white font-bold">
            0
          </span>
        </button>
        <button className="p-2">
          <MoreHorizontal className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
