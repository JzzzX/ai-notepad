import ChatPanel from '@/components/ChatPanel';

interface FloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FloatingChat({ isOpen, onClose }: FloatingChatProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] transition-all" 
          onClick={onClose} 
        />
      )}
      <div
        className={`fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-[720px] origin-center -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#E3D9CE] bg-[#FCFAF8]/98 shadow-[0_24px_80px_-12px_rgba(74,60,49,0.2)] backdrop-blur-2xl transition-all duration-300 ${
          isOpen 
            ? 'scale-100 opacity-100 pointer-events-auto' 
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-[75vh] max-h-[800px] relative flex flex-col">
          <ChatPanel onClose={onClose} />
        </div>
      </div>
    </>
  );
}
