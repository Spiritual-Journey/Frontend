import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Ticket, Info } from 'lucide-react';
import trueBg from '../assets/image copy 2.png';
import maryImage from '../assets/image copy.png';
import worshipImage from '../assets/image.png';

const aboutImages = [maryImage, worshipImage];

const Home: React.FC = () => {
  const [currentAboutImg, setCurrentAboutImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAboutImg((prev) => (prev + 1) % aboutImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col bg-white overflow-hidden">
        {/* Background Image that fades to white at the bottom */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ 
            backgroundImage: `url('${trueBg}')`,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)"
          }}
        ></div>
        
        {/* Abstract waves at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 w-full overflow-hidden leading-none rotate-180">
           <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
             <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-accent"></path>
             <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-primary-800"></path>
             <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-primary-900"></path>
           </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex-grow flex items-center pt-10 pb-32">
          <div className="w-full">
            {/* Left Column: Text */}
            <div className="max-w-2xl text-center lg:text-left pt-10 lg:pt-0">
              
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-light/60 backdrop-blur-sm text-accent-hover rounded-full font-medium text-sm mb-8 border border-accent/20 shadow-sm">
                <span className="font-serif">†</span> 
                "ጥቀ ፍቁር አብያቲከ እግዚኦ" መዝ 83
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif font-black text-primary-900 leading-tight mb-8">
                መንፈሳዊ ጉዞ ወደ <br className="hidden md:block"/>
                <span className="text-accent drop-shadow-sm">ቤዛዊተ ማርያም ገዳም</span>
              </h1>
              
              <p className="text-lg text-primary-700 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-serif font-medium">
                የክርስቶስ ፀጋና ሰላም ከእናንተ ጋር ይሁን ዉድ የእግዚአብሄር ቤተሰቦች። ለመስከረም 10 ወደ ቤዛዊተ ማርያም ገዳም አጭር መንፈሳዊ ጉዞ ስላዘጋጀን ለእሑድ ጊዜዎን መድበው እንዲጠብቁን በእግዚአብሔር ስም እንጠይቃለን።
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <button className="w-full sm:w-auto bg-primary-800 hover:bg-primary-900 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-primary-800/30 flex items-center justify-center gap-3">
                  <Ticket className="w-5 h-5" />
                  ትኬት ይግዙ (Book Ticket)
                  <span className="ml-2">→</span>
                </button>
                <a href="#about" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm hover:bg-white text-primary-900 border border-primary-300 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-sm flex items-center justify-center gap-3">
                  <Info className="w-5 h-5" />
                  ተጨማሪ መረጃ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar Section */}
      <section className="bg-white py-12 relative z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-primary-200">
            
            <div className="flex items-center gap-4 pt-4 md:pt-0 pl-0 md:pl-4 flex-1 min-w-[200px]">
              <div className="text-accent border-2 border-accent/30 p-2 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-primary-900">ቀን</span>
                <span className="text-primary-500 text-sm">እሑድ፣ መስከረም 10</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 md:pt-0 pl-0 md:pl-8 flex-1 min-w-[200px]">
              <div className="text-accent border-2 border-accent/30 p-2 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-primary-900">መነሻ ቦታ</span>
                <span className="text-primary-500 text-sm">የካ ሚካኤል (መገናኛ)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 md:pt-0 pl-0 md:pl-8 flex-1 min-w-[200px]">
              <div className="text-accent border-2 border-accent/30 p-2 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-primary-900">መነሻ ሰዓት</span>
                <span className="text-primary-500 text-sm">ጠዋት 1፡00</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 md:pt-0 pl-0 md:pl-8 flex-1 min-w-[200px]">
              <div className="text-accent border-2 border-accent/30 p-2 rounded-xl">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-primary-900">ዋጋ</span>
                <span className="text-primary-500 text-sm">250 ብር</span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-primary-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
            <div className="flex-1 w-full order-2 lg:order-1 relative">
              <div className="relative p-3 bg-white rounded-3xl shadow-2xl border border-primary-100">
                <div className="relative w-full h-[480px] sm:h-[550px] lg:h-[620px] rounded-2xl overflow-hidden shadow-inner bg-primary-900/10">
                  {aboutImages.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt="Spiritual Program" 
                      className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-all duration-1000 ease-in-out ${
                        index === currentAboutImg ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                    />
                  ))}
                  
                  {/* Subtle navigation dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-10 border border-white/20">
                    {aboutImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentAboutImg(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentAboutImg ? 'w-6 bg-accent' : 'w-2 bg-white/60 hover:bg-white'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-primary-900 mb-6">
                የመርሐ-ግብር ዝርዝሮች
              </h2>
              <p className="text-lg text-primary-700 mb-8 leading-relaxed font-serif">
                ይህ መርሐ-ግብር ለተማሪዎች የመጨረሻችን ሊሆን ስለሚችል በተቻለ መጠን መልእክቱን ለሁሉም ሰው በማዳረስ ክርስቲያናዊ ግዴታችን እንወጣ።
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  'መዝሙር (በሕብረት & በግል)',
                  'ጥምቀት (ጠበል)',
                  'ምክረ አበው',
                  'ኣጋፔ (የፍቅር መዓድ) 🥰',
                  'መሐረነ አብ ጸሎት',
                  'ወጣትነትና ቁርባናዊ ሕይወት'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center p-4 rounded-xl bg-white border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      <span className="text-accent-hover font-serif font-bold text-sm">†</span>
                    </div>
                    <span className="text-primary-900 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-primary-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-bl-full opacity-20"></div>
                <h3 className="text-2xl font-bold mb-6 font-serif text-white flex items-center gap-2">
                  <Ticket className="text-accent" />
                  የትኬት ክፍያ (250 ብር)
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-primary-700">
                    <span className="text-primary-300 font-medium">Telebirr</span>
                    <span className="font-mono text-xl font-bold text-accent-light">0942027483</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-primary-700">
                    <span className="text-primary-300 font-medium">CBE (ንግድ ባንክ)</span>
                    <span className="font-mono text-xl font-bold text-accent-light">1000748442379</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-primary-300 font-medium">የአካውንት ስም</span>
                    <span className="font-bold text-xl text-white">Rahel Brhane</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
