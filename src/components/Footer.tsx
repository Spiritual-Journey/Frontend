import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-950 text-primary-50 pt-16 pb-8 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-2xl font-bold text-accent">መንፈሳዊ ጉዞ</span>
            </div>
            <p className="text-primary-100 mb-6 leading-relaxed">
              ከእኛ ጋር መንፈሳዊ ጉዞ በማድረግ የበረከቱ ተሳታፊ ይሁኑ።
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-serif text-accent">ፈጣን ማያያዣዎች</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-primary-100 hover:text-accent transition-colors flex items-center gap-2"><span className="text-accent text-xs">▶</span> ዋና ገጽ</Link></li>
              <li><Link to="/#about" className="text-primary-100 hover:text-accent transition-colors flex items-center gap-2"><span className="text-accent text-xs">▶</span> ስለ ጉዞው</Link></li>
              <li><Link to="/#schedule" className="text-primary-100 hover:text-accent transition-colors flex items-center gap-2"><span className="text-accent text-xs">▶</span> መርሐ-ግብር</Link></li>
              <li><Link to="/login" className="text-primary-100 hover:text-accent transition-colors flex items-center gap-2"><span className="text-accent text-xs">▶</span> ይግቡ</Link></li>
              <li><Link to="/register" className="text-primary-100 hover:text-accent transition-colors flex items-center gap-2"><span className="text-accent text-xs">▶</span> ትኬት ይግዙ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-serif text-accent">አድራሻችን</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-accent mt-1 flex-shrink-0" />
                <span className="text-primary-100">Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-accent flex-shrink-0" />
                <span className="text-primary-100 font-mono">0996947722</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-400">
          <p>&copy; {new Date().getFullYear()} Spiritual Journey. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
