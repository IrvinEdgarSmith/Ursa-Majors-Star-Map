import { Coffee, Github, Heart, X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal = ({ onClose }: AboutModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="modal-gradient p-6 w-[500px] max-w-full rounded-lg border border-theme"
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-theme-primary">About Ursa Majors</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-theme-background-alt rounded text-theme-muted hover:text-theme-text"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
              Ursa Majors
            </div>
            <div className="text-lg text-theme-muted">
              Interactive Solar System Map Builder
            </div>
          </div>
          
          <div className="bg-theme-card p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="text-theme-primary" size={24} />
              <h4 className="text-lg font-medium text-theme-text">Creator</h4>
            </div>
            <p className="mb-2 text-theme-text">
              Made by <span className="font-semibold text-theme-primary">Irvin Edgar Smith</span>
            </p>
            
            <div className="flex flex-col gap-3 mt-4">
              <a 
                href="https://github.com/IrvinEdgarSmith" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-theme-text hover:text-theme-primary transition-colors px-3 py-2 rounded hover:bg-theme-background-alt"
              >
                <Github size={20} className="text-theme-primary" />
                <span>github.com/IrvinEdgarSmith</span>
              </a>
              
              <a 
                href="https://ko-fi.com/irvinedgar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-theme-text hover:text-theme-primary transition-colors px-3 py-2 rounded hover:bg-theme-background-alt"
              >
                <Coffee size={20} className="text-theme-primary" />
                <span>ko-fi.com/irvinedgar</span>
              </a>
            </div>
          </div>
          
          <div className="bg-theme-card p-4 rounded-lg">
            <div className="text-center">
              <p className="mb-3 text-theme-text">
                If you like this app, support me here, I'm broke!
              </p>
              <a 
                href="https://ko-fi.com/irvinedgar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 px-4 py-2"
              >
                <Coffee size={18} />
                <span>Buy me a coffee</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
