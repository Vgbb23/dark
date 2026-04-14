import React, { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { digitsOnly, formatCepDisplay, formatPhoneDisplay } from '../lib/brFormat';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AddressForm({ isOpen, onClose, onSave }: AddressFormProps) {
  const [isDefault, setIsDefault] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cep: '',
    state: '',
    city: '',
    neighborhood: '',
    address: '',
    number: '',
    complement: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = digitsOnly(e.target.value, 8);
    setFormData(prev => ({ ...prev, cep }));

    if (cep.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            state: data.uf,
            city: data.localidade,
            neighborhood: data.bairro,
            address: data.logradouro
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = digitsOnly(e.target.value, 11);
    setFormData((prev) => ({ ...prev, phone }));
  };

  const handleSubmit = () => {
    if (isFormValid) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const phoneDigits = formData.phone.replace(/\D/g, '');
  const isFormValid =
    Boolean(formData.name.trim()) &&
    phoneDigits.length >= 10 &&
    formData.cep.length === 8 &&
    Boolean(formData.state && formData.city && formData.address.trim() && formData.number.trim()) &&
    emailOk;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[300] bg-[#F8F8F8] flex flex-col font-sans w-full h-full"
      >
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="p-1">
            <ChevronLeft className="w-6 h-6 text-[#222222]" />
          </button>
          <h1 className="text-[16px] font-bold text-[#222222]">Adicionar o novo endereço</h1>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Contact Info Section */}
          <div className="px-4 py-3 text-[12px] text-[#888888] font-medium">
            Informações de contato
          </div>
          <section className="bg-white px-4 divide-y divide-gray-50">
            <div className="py-4">
              <input 
                type="text" 
                name="name"
                placeholder="Nome completo" 
                value={formData.name}
                onChange={handleChange}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
            <div className="py-4 flex items-center gap-3">
              <div className="text-[14px] text-[#222222] flex items-center gap-1 border-r border-gray-100 pr-3">
                BR +55
              </div>
              <input 
                type="tel" 
                name="phone"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="(00) 00000-0000" 
                value={formatPhoneDisplay(formData.phone)}
                onChange={handlePhoneChange}
                className="flex-1 text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
            <div className="py-4">
              <input 
                type="email" 
                name="email"
                placeholder="E-mail" 
                value={formData.email}
                onChange={handleChange}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
          </section>

          {/* Address Info Section */}
          <div className="px-4 py-3 mt-2 text-[12px] text-[#888888] font-medium">
            Informações de endereço
          </div>
          <section className="bg-white px-4 divide-y divide-gray-50">
            <div className="py-4 relative">
              <input 
                type="text" 
                inputMode="numeric"
                placeholder="00000-000" 
                value={formatCepDisplay(formData.cep)}
                onChange={handleCepChange}
                maxLength={9}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
              {loading && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#FF2D55] border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="flex divide-x divide-gray-50">
              <div className="flex-1 py-4 pr-4 flex items-center justify-between">
                <input 
                  type="text" 
                  placeholder="Estado/UF" 
                  value={formData.state}
                  className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
                  readOnly
                />
                <ChevronDown className="w-4 h-4 text-[#CCCCCC]" />
              </div>
              <div className="flex-1 py-4 pl-4 flex items-center justify-between">
                <input 
                  type="text" 
                  placeholder="Cidade" 
                  value={formData.city}
                  className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
                  readOnly
                />
                <ChevronDown className="w-4 h-4 text-[#CCCCCC]" />
              </div>
            </div>
            <div className="py-4">
              <input 
                type="text" 
                name="neighborhood"
                placeholder="Bairro/Distrito" 
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
            <div className="py-4">
              <input 
                type="text" 
                name="address"
                placeholder="Endereço" 
                value={formData.address}
                onChange={handleChange}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
            <div className="py-4">
              <input 
                type="text" 
                name="number"
                placeholder="Nº da residência. Use 's/n' se nenhum" 
                value={formData.number}
                onChange={handleChange}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
            <div className="py-4">
              <input 
                type="text" 
                name="complement"
                placeholder="Apartamento, bloco, unidade etc. (opcional)" 
                value={formData.complement}
                onChange={handleChange}
                className="w-full text-[14px] text-[#222222] placeholder:text-[#CCCCCC] outline-none"
              />
            </div>
          </section>

          {/* Settings Section */}
          <div className="px-4 py-3 mt-2 text-[12px] text-[#888888] font-medium">
            Configurações
          </div>
          <section className="bg-white px-4 py-4 flex items-center justify-between">
            <span className="text-[14px] text-[#222222]">Definir como padrão</span>
            <button 
              onClick={() => setIsDefault(!isDefault)}
              className={`w-11 h-6 rounded-full transition-colors relative ${isDefault ? 'bg-[#00F2EA]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDefault ? 'right-1' : 'left-1'}`} />
            </button>
          </section>

          <div className="px-6 py-6 text-[11px] text-[#888888] text-center leading-tight">
            Leia a <span className="text-[#222222] font-bold">Política de privacidade do TikTok</span> para saber mais sobre como usamos suas informações pessoais.
          </div>
        </main>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 shrink-0 z-[310]">
          <button 
            disabled={!isFormValid}
            onClick={handleSubmit}
            className={`w-full bg-[#FF2D55] text-white py-3.5 rounded-[4px] text-[15px] font-bold transition-opacity ${!isFormValid ? 'opacity-50' : 'opacity-100'}`}
          >
            Salvar
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
