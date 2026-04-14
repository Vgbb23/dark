import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, MapPin, User, Plus, ChevronRight, ShieldCheck, CreditCard, Circle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddressForm from './AddressForm';
import CPFModal from './CPFModal';
import PixPayment from './PixPayment';
import { formatCepDisplay, formatCpfDisplay, maskPhonePretty } from '../lib/brFormat';

interface ProductData {
  name: string;
  currentPrice: number;
  originalPrice: number;
  images: string[];
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData;
  timeLeft: string;
  selection?: any;
}

export default function Checkout({ isOpen, onClose, product, timeLeft, selection }: CheckoutProps) {
  const discountPercentage = 63;
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isCPFModalOpen, setIsCPFModalOpen] = useState(false);
  const [isPixPageOpen, setIsPixPageOpen] = useState(false);
  /** Nova instância a cada abertura do PIX = um único fetch, sem loop por re-render do checkout. */
  const [pixScreenKey, setPixScreenKey] = useState(0);
  const [savedAddress, setSavedAddress] = useState<any | null>(null);
  const [savedCPF, setSavedCPF] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'credit_card'>('pix');
  const [quantity, setQuantity] = useState(1);

  const selectedPrice = selection?.price ?? product.currentPrice;

  useEffect(() => {
    setQuantity(selection?.quantity || 1);
  }, [selection]);

  const pixCustomer = useMemo(
    () => ({
      name: savedAddress?.name ?? '',
      email: savedAddress?.email ?? '',
      phone: savedAddress?.phone ?? '',
      cpf: savedCPF ?? '',
    }),
    [savedAddress?.name, savedAddress?.email, savedAddress?.phone, savedCPF],
  );

  const canFinalizeOrder = useMemo(() => {
    if (!savedAddress || !savedCPF) return false;
    const cpfDigits = savedCPF.replace(/\D/g, '');
    if (cpfDigits.length !== 11) return false;
    const email = (savedAddress.email ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    const phoneDigits = String(savedAddress.phone ?? '').replace(/\D/g, '');
    if (phoneDigits.length < 10) return false;
    const cepDigits = String(savedAddress.cep ?? '').replace(/\D/g, '');
    if (cepDigits.length !== 8) return false;
    return Boolean(
      savedAddress.name?.trim() &&
        savedAddress.state &&
        savedAddress.city &&
        savedAddress.address?.trim() &&
        savedAddress.number?.trim(),
    );
  }, [savedAddress, savedCPF]);

  if (!isOpen) return null;

  const totalPrice = selectedPrice * quantity;
  const originalUnitPrice = selectedPrice / (1 - discountPercentage / 100);
  const originalTotalPrice = originalUnitPrice * quantity;
  const savings = originalTotalPrice - totalPrice;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const openPixPayment = () => {
    if (!canFinalizeOrder) return;

    setPixScreenKey((k) => k + 1);
    setIsPixPageOpen(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#F8F8F8] flex flex-col font-sans w-full h-full"
      >
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="p-1">
            <ChevronLeft className="w-6 h-6 text-[#222222]" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[16px] font-bold text-[#222222]">Resumo do pedido</h1>
            <div className="flex items-center gap-1 text-[#00BFA5]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Finalização da compra segura garantida</span>
            </div>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto pb-48">
          {/* Shipping Address */}
          <section className="bg-white px-4 py-4 flex items-start justify-between mt-0.5">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <MapPin className="w-5 h-5 text-[#222222] mt-0.5" strokeWidth={1.5} />
              {savedAddress ? (
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#222222] truncate">
                    {savedAddress.name}, (+55) {maskPhonePretty(savedAddress.phone)}
                  </p>
                  <p className="text-[13px] text-[#222222] leading-tight mt-1">
                    {savedAddress.address}, {savedAddress.number}, {savedAddress.neighborhood},{' '}
                    {savedAddress.city}, {savedAddress.state}, {formatCepDisplay(String(savedAddress.cep ?? ''))}
                  </p>
                </div>
              ) : (
                <span className="text-[14px] font-medium text-[#222222]">Endereço de envio</span>
              )}
            </div>
            <button 
              onClick={() => setIsAddressFormOpen(true)}
              className="text-[#FF2D55] text-[14px] font-bold flex items-center gap-1 shrink-0 ml-2"
            >
              {savedAddress ? (
                <ChevronRight className="w-5 h-5 text-[#888888]" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar endereço
                </>
              )}
            </button>
          </section>

          {/* CPF Section */}
          <section className="bg-white px-4 py-4 flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />
              <span className="text-[14px] font-medium text-[#222222]">
                {savedCPF ? `CPF: ${formatCpfDisplay(savedCPF)}` : 'CPF'}
              </span>
            </div>
            <button 
              onClick={() => setIsCPFModalOpen(true)}
              className="text-[#FF2D55] text-[14px] font-bold flex items-center gap-1"
            >
              {savedCPF ? (
                <ChevronRight className="w-5 h-5 text-[#888888]" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar CPF
                </>
              )}
            </button>
          </section>

          {/* Decorative Line */}
          <div className="h-1 w-full flex shrink-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-[#FF2D55]' : 'bg-[#00BFA5]'}`} />
            ))}
          </div>

          {/* Product Section */}
          <section className="bg-white px-4 py-4 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold text-[#222222]">Pop Mix</h2>
              <button className="text-[#888888] text-[12px] flex items-center gap-0.5">
                Adicionar nota <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3">
              <div className="relative w-24 h-24 rounded-[4px] overflow-hidden bg-gray-50 flex-shrink-0">
                <img 
                  src={selection?.image || product.images[0]} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] py-0.5 text-center">
                  Apenas 7 resta...
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] text-[#222222] line-clamp-2 leading-tight mb-1">
                  {selection?.color || product.name}
                </h3>
                <p className="text-[11px] text-[#888888] mb-2">Opção selecionada</p>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="bg-[#FF2D55] text-white text-[10px] px-1.5 py-0.5 rounded-[2px] flex items-center gap-1 font-bold">
                    <span className="text-[12px]">⚡</span> Oferta Relâmpago
                  </div>
                  <span className="text-[#FF2D55] text-[10px] font-bold">{timeLeft}</span>
                </div>

                <div className="flex items-center gap-1 text-[#00BFA5] mb-2">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[10px] font-medium">Devolução gratuita</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[16px] font-bold text-[#FF2D55]">R$ {formatPrice(totalPrice)}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#888888] line-through">R$ {formatPrice(originalTotalPrice)}</span>
                      <span className="text-[#FF2D55] text-[11px] font-bold">-{discountPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-[2px]">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-2 py-1 text-[#888888] text-[14px] border-r border-gray-200"
                    >
                      －
                    </button>
                    <span className="px-3 py-1 text-[13px] font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="px-2 py-1 text-[#222222] text-[14px] border-l border-gray-200"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TikTok Shop Discount */}
          <section className="bg-white px-4 py-4 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#FF2D55] rounded-[2px] flex items-center justify-center">
                <span className="text-white text-[10px] font-black">✓</span>
              </div>
              <span className="text-[14px] font-medium text-[#222222]">Desconto do TikTok Shop</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#888888]" />
          </section>

          {/* Order Summary */}
          <section className="bg-white px-4 py-4 mt-2 space-y-4">
            <h2 className="text-[14px] font-bold text-[#222222]">Resumo do pedido</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1">
                  <span className="text-[#222222]">Subtotal do produto</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#222222] rotate-90" strokeWidth={3} />
                </div>
                <span className="font-bold text-[#222222]">R$ {formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex items-center justify-between text-[13px] pl-4">
                <span className="text-[#555555]">Preço original</span>
                <span className="text-[#222222]">R$ {formatPrice(originalTotalPrice)}</span>
              </div>
              
              <div className="flex items-center justify-between text-[13px] pl-4">
                <span className="text-[#555555]">Desconto no produto</span>
                <span className="text-[#FF2D55]">- R$ {formatPrice(savings)}</span>
              </div>

              <div className="flex items-center justify-between text-[13px] pt-1">
                <div className="flex items-center gap-1">
                  <span className="text-[#222222]">Subtotal do envio</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#222222] rotate-90" strokeWidth={3} />
                </div>
                <span className="font-bold text-[#222222]">R$ 0,00</span>
              </div>
              
              <div className="flex items-center justify-between text-[13px] pl-4">
                <span className="text-[#555555]">Taxa de envio</span>
                <span className="text-[#222222]">R$ 9,60</span>
              </div>
              
              <div className="flex items-center justify-between text-[13px] pl-4">
                <span className="text-[#555555]">Desconto de envio</span>
                <span className="text-[#FF2D55]">- R$ 9,60</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#222222]">Total</span>
                <div className="text-right">
                  <div className="text-[16px] font-bold text-[#222222]">R$ {formatPrice(totalPrice)}</div>
                  <div className="text-[11px] text-[#888888]">Impostos inclusos</div>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white px-4 py-4 mt-2 space-y-4">
            <h2 className="text-[14px] font-bold text-[#222222]">Forma de pagamento</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-[#888888]" />
                  <div className="space-y-1">
                    <span className="text-[14px] text-[#222222] font-medium">Cartão de crédito</span>
                    <div className="flex items-center gap-1">
                      <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-[2px] font-bold border border-gray-200 flex items-center gap-1">
                        Indisponível no momento
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2.5" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
                      <div className="bg-[#0070BA] text-white text-[7px] px-1 py-0.5 rounded-[1px] font-black italic">elo</div>
                      <div className="bg-[#0070BA] text-white text-[7px] px-1 py-0.5 rounded-[1px] font-black uppercase italic">Amex</div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888888]" />
              </div>

              <button 
                onClick={() => setSelectedPayment('pix')}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img src="https://i.ibb.co/Rpv6M6B6/pix.png" className="h-4" />
                  </div>
                  <span className="text-[14px] text-[#222222]">Pix</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPayment === 'pix' ? 'border-[#FF2D55] bg-[#FF2D55]' : 'border-gray-200'}`}>
                  {selectedPayment === 'pix' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>

              <button className="w-full flex items-center justify-between text-[14px] text-[#222222] pt-2">
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4 text-[#888888]" />
              </button>
            </div>
          </section>

          {/* Terms */}
          <section className="px-4 py-6 text-[11px] text-[#888888] leading-tight">
            Ao fazer um pedido, você concorda com <span className="text-[#222222] font-medium">Termos de uso e venda do TikTok Shop</span> e reconhece que leu e concordou com a <span className="text-[#222222] font-medium">Política de privacidade do TikTok</span>.
          </section>
        </main>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 space-y-3 z-[210] pb-8 shrink-0">
          <div className="bg-[#FFF0F3] text-[#FF2D55] text-[12px] py-2.5 px-4 rounded-[4px] flex items-center gap-2">
            <span className="text-[16px]">😊</span>
            <span className="font-medium">Você está economizando R$ {formatPrice(savings)} nesse pedido.</span>
          </div>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-[15px] font-bold text-[#222222]">Total ({quantity} item)</span>
            <span className="text-[18px] font-bold text-[#FF2D55]">R$ {formatPrice(totalPrice)}</span>
          </div>

          <button 
            type="button"
            disabled={!canFinalizeOrder}
            onClick={openPixPayment}
            className={`w-full py-3 rounded-[4px] flex flex-col items-center justify-center leading-none shadow-lg transition-transform ${
              canFinalizeOrder
                ? 'bg-[#FF2D55] text-white active:scale-[0.98]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-[16px] font-bold mb-1">Fazer pedido</span>
            <span className="text-[11px] font-medium opacity-90">A oferta acaba em {timeLeft} | Restam 7</span>
          </button>
        </div>
        
        <AddressForm 
          isOpen={isAddressFormOpen} 
          onClose={() => setIsAddressFormOpen(false)} 
          onSave={(data) => setSavedAddress(data)}
        />

        <CPFModal 
          isOpen={isCPFModalOpen} 
          onClose={() => setIsCPFModalOpen(false)} 
          onSave={(cpf) => setSavedCPF(cpf)}
        />

        {isPixPageOpen && (
          <PixPayment
            key={pixScreenKey}
            chargeSessionId={pixScreenKey}
            onClose={() => setIsPixPageOpen(false)}
            price={totalPrice}
            productName={selection?.color || product.name}
            quantity={quantity}
            customer={pixCustomer}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
