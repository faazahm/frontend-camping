import { Link } from 'react-router-dom';
import { Tent, Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Tent className="h-8 w-8 text-[#FF7F50]" />
              <span className="text-xl font-bold">Potrobayan</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Nikmati pengalaman camping terbaik dengan pemandangan sungai yang indah dan suasana alam yang menenangkan.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://www.instagram.com/potrobayan?igsh=MWZicWNqdGhzc2N2cA==" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#FF7F50] transition-colors duration-300 group">
                <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100083308034444" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#FF7F50] transition-colors duration-300 group">
                <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://wa.me/6283867128869" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#FF7F50] transition-colors duration-300 group">
                <MessageCircle className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Main Menu</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/book-camp" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                   <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  Book Camp
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                   <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/location" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                   <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about#fasilitas" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  Fasilitas
                </Link>
              </li>
              <li>
                <Link to="/about#informasi" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                   <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  Informasi
                </Link>
              </li>
              <li>
                <Link to="/#rules" className="text-gray-400 hover:text-[#FF7F50] transition-colors duration-300 flex items-center">
                   <span className="w-1.5 h-1.5 bg-[#FF7F50] rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                  Camp Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#FF7F50] mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">29V6+C95 Potrobayan River Camp ( Wisata camping jogja ), Potrobayan, Srihardono, Kec. Pundong, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55771, Indonesia</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-[#FF7F50] mr-3 flex-shrink-0" />
                <span className="text-gray-400">+62 838-6712-8869</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#FF7F50] mr-3 flex-shrink-0" />
                <span className="text-gray-400">thomead@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center md:flex md:justify-between md:items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Potrobayan Camping. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4 md:mt-0">
             {/* Additional bottom links if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
