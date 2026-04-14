/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronRight, Truck, ShieldCheck, Bookmark, Play, ArrowUp, X } from 'lucide-react';
import Header from './components/Header';
import BottomBar from './components/BottomBar';
import FlashSaleBanner from './components/FlashSaleBanner';
import Checkout from './components/Checkout';
import VariationModal from './components/VariationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('Visão geral');
  const [isShippingFree, setIsShippingFree] = useState(false);
  const [isCouponRedeemed, setIsCouponRedeemed] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('23:59:58');
  const [selection, setSelection] = useState<any>(null);

  const productData = {
    name: "Creatina Monohidratada Pura 1kg, 600g, 500g, 300g, 150g e 120 Caps Dark Lab - Creatine, Creatina 100% Pura",
    currentPrice: 89.90,
    originalPrice: 699.90,
    images: [
      'https://i.ibb.co/KnKTsdr/image.png',
      'https://i.ibb.co/KcKnYxZW/image.png',
      'https://i.ibb.co/6R8c8Dgv/image.png',
      'https://i.ibb.co/8nDz67Bm/image.png',
      'https://i.ibb.co/rGmx2m8p/image.png'
    ]
  };

  const overviewRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (tab: string) => {
    setActiveTab(tab);
    let targetRef;
    switch (tab) {
      case 'Visão geral': targetRef = overviewRef; break;
      case 'Avaliações': targetRef = reviewsRef; break;
      case 'Descrição': targetRef = descriptionRef; break;
    }
    
    if (targetRef?.current) {
      const headerOffset = 88; // Header + Tabs height
      const elementPosition = targetRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleRedeem = () => {
    setIsCouponRedeemed(true);
    setIsShippingFree(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = 23 - now.getHours();
      const minutes = 59 - now.getMinutes();
      const seconds = 59 - now.getSeconds();
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const productImages = productData.images;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width) + 1;
    setCurrentImageIndex(index);
  };

  return (
    <div className={`min-h-screen bg-[#F5F5F5] pb-20 font-sans text-[#222222] ${showPopup ? 'overflow-hidden h-screen' : ''}`}>
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-10">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          
          <div className="relative w-full max-w-[280px] animate-in fade-in zoom-in duration-200">
            {/* Header with Yellow Text and Red X */}
            <div className="flex items-center justify-center relative mb-2.5">
              <h2 className="text-[#FFD700] font-black text-[13px] tracking-tight text-center drop-shadow-sm">
                OFERTA EXCLUSIVA PARA VOCÊ
              </h2>
              <button 
                onClick={() => setShowPopup(false)} 
                className="absolute -right-1 text-[#F4435D] hover:opacity-80 transition-opacity"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>

            {/* Main Card */}
            <div className="w-full bg-[#F4435D] rounded-[22px] overflow-hidden shadow-2xl">
              {/* White Top Section with Curved Bottom */}
              <div className="relative bg-white pt-7 pb-4 px-5 text-center border-x-[6px] border-[#F4435D]">
                <h3 className="text-[42px] font-black text-[#222222] leading-none tracking-tighter mb-2">
                  70% OFF
                </h3>
                <p className="text-[#F4435D] font-bold text-[18px] mb-4">
                  no seu pedido!
                </p>
                
                <div className="space-y-0.5 text-[12px] text-[#222222] font-semibold leading-tight mb-6">
                  <p>Garanta agora os melhores</p>
                  <p>produtos com desconto real.</p>
                  <p>Aproveite: estoque limitado com 70% OFF.</p>
                </div>

                {/* The Convex Curve at the bottom of white section */}
                <div 
                  className="absolute -bottom-4 left-[-6px] right-[-6px] h-8 bg-white border-x-[6px] border-[#F4435D] rounded-b-[50%]"
                />
              </div>

              {/* Red/Pink Bottom Section */}
              <div className="pt-7 pb-5 px-5 flex flex-col items-center gap-4">
                {/* Timer Box */}
                <div className="bg-[#D81B60] text-white text-[13px] font-bold px-7 py-2 rounded-[8px] shadow-md">
                  Termina em {timeLeft}
                </div>
                
                {/* Action Button */}
                <button 
                  onClick={() => setShowPopup(false)}
                  className="bg-white text-[#F4435D] w-full py-3 rounded-full font-black text-[16px] shadow-lg active:scale-[0.98] transition-transform"
                >
                  Resgatar agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header />
      
      <main className="pt-11" ref={overviewRef}>
        {/* Product Image Carousel */}
        <div className="relative aspect-square bg-white overflow-hidden">
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full"
            onScroll={handleScroll}
          >
            {productImages.map((src, i) => (
              <div key={i} className="min-w-full h-full snap-center">
                <img 
                  src={src} 
                  alt={`Product ${i + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/30 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            {currentImageIndex}/{productImages.length}
          </div>
        </div>

        <FlashSaleBanner 
          currentPrice={productData.currentPrice} 
          originalPrice={productData.originalPrice} 
          timeLeft={timeLeft}
        />

        {/* Product Info Section */}
        <section className="bg-white px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#FFEEEB] px-1.5 py-0.5 rounded-[1px]">
              <Truck className="w-3 h-3 text-[#EE4D2D]" />
              <span className="text-[11px] text-[#EE4D2D] font-bold">
                2x R$ {(productData.currentPrice / 2).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros
              </span>
              <ChevronRight className="w-3 h-3 text-[#EE4D2D]" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#FFEEEB] px-2 py-1 rounded-[1px]">
            <span className="text-[#EE4D2D] text-[11px] font-bold">Economize 3% com bônus</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#EE4D2D]" />
          </div>

          <div className="flex justify-between items-start gap-4">
            <h1 className="text-[14px] font-medium leading-[1.3] text-[#222222] line-clamp-2">
              Creatina Monohidratada Pura 1kg, 600g, 500g, 300g, 150g e 120 Caps Dark Lab - Creatine, Creatina 100% Pura
            </h1>
            <button className="pt-0.5">
              <Bookmark className="w-5 h-5 text-[#888888]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-[#EE4D2D] text-[#EE4D2D]" />
              <span className="text-[13px] font-bold text-[#EE4D2D] underline underline-offset-2">5.0</span>
              <span className="text-[11px] text-[#888888] ml-0.5">(3)</span>
            </div>
            <div className="w-[1px] h-3 bg-gray-200" />
            <span className="text-[12px] text-[#555555]">34 vendidos</span>
          </div>
        </section>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 flex overflow-x-auto no-scrollbar sticky top-11 z-40">
          {['Visão geral', 'Avaliações', 'Descrição'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => scrollToSection(tab)}
              className={`px-4 py-2.5 text-[13px] whitespace-nowrap relative ${activeTab === tab ? 'text-[#EE4D2D] font-bold' : 'text-[#555555]'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#EE4D2D]" />}
            </button>
          ))}
        </div>

        {/* Shipping Section */}
        <section className="bg-white mt-1.5 px-3 py-3 space-y-3">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#00BFA5] mt-0.5" strokeWidth={1.5} />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[13px] font-bold ${isShippingFree ? 'text-[#00BFA5]' : 'text-[#222222]'}`}>
                    {isShippingFree ? 'Frete grátis' : 'R$ 8,93'}
                  </span>
                  <span className="text-[11px] text-[#555555]">Receba até 26 de fev - 4 de mar</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888888]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#888888]">Taxa de envio: </span>
                <span className={`text-[11px] text-[#888888] ${isShippingFree ? 'line-through' : ''}`}>R$ 8,93</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setIsVariationModalOpen(true)}
            className="border-t border-gray-50 pt-3 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {[
                  'https://i.ibb.co/84jMS6rJ/image.png',
                  'https://i.ibb.co/KnKTsdr/image.png',
                  'https://i.ibb.co/KcKnYxZW/image.png',
                  'https://i.ibb.co/6R8c8Dgv/image.png'
                ].map((img, i) => (
                  <div key={i} className="w-9 h-9 border border-white rounded-[2px] overflow-hidden bg-gray-50">
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <span className="text-[12px] text-[#222222]">6 opções disponíveis</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#888888]" />
          </div>
        </section>

        {/* Protection Section */}
        <section className="bg-white mt-1.5 px-3 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF7A38]" strokeWidth={1.5} />
              <span className="text-[13px] font-bold">Proteção do cliente</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#888888]" />
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {[
              'Devolução gratuita',
              'Reembolso automático por danos',
              'Pagamento seguro',
              'Reembolso automático por atraso'
            ].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="text-[#EE4D2D] text-[10px] font-black">✓</span>
                <span className="text-[11px] text-[#555555] truncate">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Coupons Section */}
        <section className="bg-white mt-1.5 px-3 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">Ofertas</span>
            <ChevronRight className="w-4 h-4 text-[#888888]" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[1, 2].map(i => (
              <div key={i} className="min-w-[240px] border border-[#00BFA5]/20 rounded-[2px] p-2 flex items-center justify-between bg-[#F6FFFE]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-[#222222]">Cupom de envio</span>
                    <span className="bg-[#00BFA5] text-white text-[9px] px-1 rounded-[1px] font-black">x3</span>
                  </div>
                  <p className="text-[9px] text-[#555555] leading-tight">Desconto de R$ 10 no frete em pedidos acima de R$ 9</p>
                </div>
                <button 
                  onClick={handleRedeem}
                  disabled={isCouponRedeemed}
                  className={`${isCouponRedeemed ? 'bg-gray-400' : 'bg-[#00BFA5]'} text-white text-[10px] px-2 py-1 rounded-[2px] font-bold ml-2 transition-colors`}
                >
                  {isCouponRedeemed ? 'Resgatado' : 'Resgatar'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Videos Section */}
        <section className="bg-white mt-1.5 px-3 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">Vídeos de criadores (3)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                url: 'https://res.cloudinary.com/dpcxlsbwd/video/upload/v1776090860/ssstik.io__darklaboficial_1776090728952_ex0rrb.mp4',
                title: 'Unboxing do tênis mais leve do ano!'
              },
              {
                url: 'https://res.cloudinary.com/dpcxlsbwd/video/upload/v1776090859/ssstik.io__euguichaves_1776090813058_snsxq4.mp4',
                title: 'Teste de impacto: amortecimento 10'
              },
              {
                url: 'https://res.cloudinary.com/dpcxlsbwd/video/upload/v1776090859/ssstik.io__oficial_carlaopersonal_1776090755507_usdjqn.mp4',
                title: 'Minha escolha para maratonas'
              }
            ].map((video, i) => (
              <div key={i} className="relative aspect-[9/16] rounded-[4px] overflow-hidden bg-black">
                <video 
                  src={video.url} 
                  className="w-full h-full object-cover opacity-80"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                  <p className="text-[9px] text-white font-bold line-clamp-2 leading-tight drop-shadow-lg">
                    {video.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section ref={reviewsRef} className="bg-white mt-1.5 px-3 py-3 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">Avaliações dos clientes (25)</span>
            <button className="text-[12px] text-[#EE4D2D] font-medium flex items-center gap-0.5">
              Ver mais <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] font-bold">4.4</span>
            <span className="text-[11px] text-[#888888]">/5</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3, 4].map(i => <Star key={i} className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />)}
              <Star className="w-3 h-3 text-gray-200" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full border border-[#888888] flex items-center justify-center ml-1">
              <span className="text-[8px] text-[#888888] font-black">i</span>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { 
                user: 'C**la B.', 
                comment: 'Chegou certinho e lacrada. A creatina dissolve super bem e não deixa gosto forte. Já senti melhora no rendimento nos treinos.', 
                images: [
                  'https://i.ibb.co/zVsrLPwK/image.png',
                  'https://i.ibb.co/zTX9TdLK/image.png'
                ] 
              },
              { 
                user: 'A**a M.', 
                comment: 'Excelente custo-benefício. Comprei a de 500g e a qualidade é muito boa, pureza ótima e fácil de misturar na água.', 
                images: [
                  'https://i.ibb.co/tMr623gH/image.png',
                  'https://i.ibb.co/352cjq6D/image.png'
                ] 
              },
              { 
                user: 'M**a S.', 
                comment: 'Já usei outras marcas e essa da Dark Lab me surpreendeu. Boa solubilidade, sem grumos e entrega rápida.', 
                images: [
                  'https://i.ibb.co/gM944kXY/image.png',
                  'https://i.ibb.co/xS347gGJ/image.png'
                ] 
              },
              { 
                user: 'J**a P.', 
                comment: 'A versão em cápsulas é muito prática para o dia a dia. Produto original e bem embalado, recomendo demais.', 
                images: [
                  'https://i.ibb.co/67TGFZRM/image.png'
                ] 
              },
              { 
                user: 'R**a L.', 
                comment: 'Peguei a de 1kg e valeu muito a pena. Qualidade top, ótimo preço e já virou minha creatina fixa.', 
                images: [
                  'https://i.ibb.co/xqRGz98T/image.png'
                ] 
              }
            ].map((review, i) => {
              const profilePics = [
                'https://randomuser.me/api/portraits/women/65.jpg',
                'https://randomuser.me/api/portraits/women/44.jpg',
                'https://randomuser.me/api/portraits/women/68.jpg',
                'https://randomuser.me/api/portraits/women/50.jpg',
                'https://randomuser.me/api/portraits/women/75.jpg'
              ];
              return (
                <div key={i} className="space-y-2 pb-1 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                      <img src={profilePics[i]} referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[12px] font-medium text-[#222222]">{review.user}</span>
                  </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-2.5 h-2.5 fill-[#FFC107] text-[#FFC107]" />)}
                </div>
                <p className="text-[11px] text-[#888888]">Item: Creatina Dark Lab</p>
                <p className="text-[13px] text-[#222222] leading-relaxed">{review.comment}</p>
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {review.images.map((src, imgIdx) => (
                    <div key={imgIdx} className="relative w-[82px] h-[82px] flex-shrink-0 rounded-[2px] overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

          <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
            <span className="text-[13px] font-bold">Avaliações da loja (61 mil)</span>
            <ChevronRight className="w-4 h-4 text-[#888888]" />
          </div>
          <div className="flex gap-2.5">
            <div className="flex-1 bg-white rounded-[2px] py-2 px-3 flex items-center justify-center gap-2 border border-gray-200">
              <div className="w-4 h-4 rounded-full border border-[#888888] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#888888] rounded-full" />
              </div>
              <span className="text-[11px] text-[#555555] font-medium">Inclui imagens ou vídeos (7 mil)</span>
            </div>
            <div className="bg-white rounded-[2px] py-2 px-3 flex items-center justify-center gap-1 border border-gray-200">
              <span className="text-[11px] text-[#555555] font-bold">5</span>
              <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
              <span className="text-[11px] text-[#555555] font-medium">(43,2 mil)</span>
            </div>
          </div>
        </section>

        {/* Store Section */}
        <section className="bg-white mt-2 px-3 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[2px] border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50">
                <img src="https://i.ibb.co/jXQvG2P/image.png" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#222222]">Dark Lab Oficial</h3>
                <p className="text-[11px] text-[#888888]">329.2K vendido(s)</p>
              </div>
            </div>
            <button className="border border-[#EE4D2D] text-[#EE4D2D] px-4 py-1 rounded-[2px] text-[12px] font-bold">
              Visitar
            </button>
          </div>
          <div className="flex items-center gap-8 text-[11px] border-b border-gray-50 pb-4">
            <div className="flex gap-1.5">
              <span className="font-black text-[#EE4D2D]">70%</span>
              <span className="text-[#555555]">responde em 24 horas</span>
            </div>
            <div className="flex gap-1.5">
              <span className="font-black text-[#EE4D2D]">96%</span>
              <span className="text-[#555555]">envios pontuais</span>
            </div>
          </div>
        </section>

        {/* Product Description */}
        <section ref={descriptionRef} className="bg-white mt-2 px-3 py-5 space-y-5">
          <h2 className="text-[13px] font-black uppercase tracking-tight text-[#222222]">Sobre este produto</h2>
          <div className="space-y-6 text-[12px] leading-relaxed text-[#555555]">
          

            <div className="space-y-3">
              <p className="text-center font-medium text-[#222222]">Creatina Monohidratada - Dark Lab</p>
              <p>A Creatina Dark Lab e produzida com materia-prima de alta pureza, ideal para quem busca praticidade e qualidade na rotina de suplementacao. Com excelente solubilidade, e facilmente diluida e pode ser consumida junto a bebida de sua preferencia.</p>
              <p>Com 99,5% de pureza, a Creatina Dark Lab se destaca pela qualidade e confianca em cada dose.</p>
              <p>Com formula simples e direta, contem apenas Creatina Monohidratada, sem adicao de acucares, corantes ou gluten.</p>
              <p className="text-center font-semibold text-[#222222]">QUALIDADE DARK LAB</p>
              <p>Materia-prima de alta pureza  Excelente solubilidade  Produto Gluten Free</p>
              <p className="text-center font-semibold text-[#222222]">MODO DE PREPARO</p>
              <p>Dissolver 3g (1 dosador raso ou 1 colher de cha) do produto em 150ml de agua ou bebida de sua preferencia.</p>
              <p className="text-center font-semibold text-[#222222]">SUGESTAO DE USO</p>
              <p>Consumir uma porcao ao dia, ou conforme orientacao profissional.</p>
              <p className="text-center font-semibold text-[#222222]">INGREDIENTES</p>
              <p className="text-center">Creatina Monohidratada. NAO CONTEM GLUTEN.</p>
              <p className="text-center font-semibold text-[#222222]">ALERGICOS</p>
              <p className="text-center">PODE CONTER AMENDOIM, LEITE, SOJA E OVO.</p>
              <p className="text-center font-semibold text-[#222222]">CONSERVACAO E ADVERTENCIAS</p>
              <p>Este produto nao e um medicamento. Mantenha fora do alcance de criancas. Nao exceder a recomendacao diaria de consumo indicada na embalagem. Produto indicado para adultos. Este produto nao deve ser consumido por gestantes, lactantes e criancas. Conservar fechado, ao abrigo da luz, calor e umidade. Apos aberto, consumir preferencialmente em ate 90 dias.</p>
            </div>
          </div>
        </section>
      </main>

      <BottomBar onBuyNow={() => setIsVariationModalOpen(true)} />

      <VariationModal 
        isOpen={isVariationModalOpen}
        onClose={() => setIsVariationModalOpen(false)}
        product={productData}
        onConfirm={(data) => {
          setSelection(data);
          setIsVariationModalOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <Checkout 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={productData}
        timeLeft={timeLeft}
        selection={selection}
      />

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-16 right-3 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-40 opacity-80"
      >
        <ArrowUp className="w-5 h-5 text-[#555555]" strokeWidth={1.5} />
      </button>
    </div>
  );
}
