import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: any) => void;
  product: {
    name: string;
    currentPrice: number;
    originalPrice: number;
    images: string[];
  };
}

export default function VariationModal({ isOpen, onClose, onConfirm, product }: VariationModalProps) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const options = [
    { name: 'Creatina + Beta Alanina 300g | Dark lab', img: 'https://i.ibb.co/84jMS6rJ/image.png', price: 36.9 },
    { name: 'Creatina 300g Dark Lab', img: 'https://i.ibb.co/KnKTsdr/image.png', price: 28.9 },
    { name: 'Creatina 500g Dark Lab', img: 'https://i.ibb.co/KcKnYxZW/image.png', price: 35.9 },
    { name: 'Creatina 600g Dark Lab', img: 'https://i.ibb.co/6R8c8Dgv/image.png', price: 39.9 },
    { name: 'Creatina 1kg Dark Lab', img: 'https://i.ibb.co/8nDz67Bm/image.png', price: 49.9 },
    { name: 'Creatina em Cápsula Dark lab 120 unidades', img: 'https://i.ibb.co/rGmx2m8p/image.png', price: 29.9 },
  ];

  const selectedOption = options[selectedOptionIndex];
  const totalSelectedPrice = selectedOption.price * quantity;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const discountPercentage = Math.round(((product.originalPrice - selectedOption.price) / product.originalPrice) * 100);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white rounded-t-[20px] overflow-hidden z-[610] flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 z-20 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto flex-1 px-4 pt-5 pb-24">
            {/* Product Header */}
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 rounded-[8px] overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                <img 
                  src={selectedOption.img} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#FF2D55] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">
                    {discountPercentage.toFixed(2)}%
                  </span>
                  <span className="text-[20px] font-bold text-[#FF2D55]">R$ {formatPrice(totalSelectedPrice)}</span>
                </div>
                <h3 className="text-[14px] font-bold text-[#222222] line-clamp-2 mb-1">{selectedOption.name}</h3>
                <p className="text-[12px] text-gray-400 line-through">R$ {formatPrice(product.originalPrice)}</p>
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-[#222222] mb-4">Variações</h2>

            {/* Option Selection */}
            <div className="mb-6">
              <p className="text-[13px] text-gray-600 mb-3">Opção</p>
              <div className="grid grid-cols-2 gap-2">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOptionIndex(index)}
                    className={`flex items-center gap-2 p-2 rounded-[6px] border transition-all ${
                      selectedOptionIndex === index 
                        ? 'border-[#FF2D55] bg-[#FFF0F3]' 
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-[4px] overflow-hidden bg-gray-50 shrink-0">
                      <img src={option.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className={`text-[13px] text-left leading-tight ${selectedOptionIndex === index ? 'text-[#FF2D55] font-bold' : 'text-[#222222]'}`}>
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[14px] font-bold text-[#222222] uppercase tracking-tight">QUANTIDADE</span>
              <div className="flex items-center border border-gray-200 rounded-[4px] overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 active:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-[14px] font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 active:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-50 z-30">
            <button 
              onClick={() => onConfirm({ 
                color: selectedOption.name,
                quantity,
                image: selectedOption.img,
                price: selectedOption.price
              })}
              className="w-full bg-[#D44455] text-white py-4 rounded-[10px] text-[16px] font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(212,68,85,0.3)] active:scale-[0.98] transition-transform"
            >
              COMPRAR AGORA
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
