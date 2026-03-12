import { X } from 'lucide-react';
import TranscriptPanel from '@/components/TranscriptPanel';

interface FloatingTranscriptProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FloatingTranscript({ isOpen, onClose }: FloatingTranscriptProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] transition-all" 
          onClick={onClose} 
        />
      )}
      <div
        className={`fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-[600px] origin-center -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#E3D9CE] bg-[#FCFAF8]/98 shadow-[0_24px_80px_-12px_rgba(74,60,49,0.2)] backdrop-blur-2xl transition-all duration-300 ${
          isOpen 
            ? 'scale-100 opacity-100 pointer-events-auto' 
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#D8CEC4]/50 px-5 py-4 bg-[#F7F3EE]/50">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-[#5C4D42]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
            </span>
            实时转写
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl p-2 text-[#8C7A6B] transition-colors hover:bg-[#EFE9E2] hover:text-[#4A3C31]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-[60vh] max-h-[600px] overflow-y-auto custom-scrollbar p-2">
          <TranscriptPanel />
        </div>
      </div>
    </>
  );
}
