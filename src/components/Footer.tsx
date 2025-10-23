"use client";

import React from "react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

interface FooterProps {
  lang: "es" | "en";
}

export default function Footer({ lang }: FooterProps) {
  const t = {
    es: {
      officeInfo: "Información de la Oficina",
      address: "Dirección",
      phone: "Teléfono",
      email: "Email",
      hours: "Horarios de Atención",
      followUs: "Síguenos en Redes Sociales",
      monday: "Lunes - Viernes",
      saturday: "Sábados",
      sunday: "Domingos",
      closed: "Cerrado"
    },
    en: {
      officeInfo: "Office Information",
      address: "Address",
      phone: "Phone",
      email: "Email",
      hours: "Office Hours",
      followUs: "Follow Us on Social Media",
      monday: "Monday - Friday",
      saturday: "Saturdays",
      sunday: "Sundays",
      closed: "Closed"
    }
  };

  const officeInfo = {
    name: "Max Dental Smile",
    tagline: lang === "es" ? "La mejor práctica dental en North Miami Beach" : "Best dental practice in North Miami Beach",
    address: "18140 NE 19th Ave",
    city: "North Miami Beach, FL 33162",
    phone: "(305) 948-8882",
    email: "info@maxdentalsmile.com",
    website: "https://www.maxdentalsmile.com",
    hours: {
      weekdays: lang === "es" ? "Lunes - Viernes: 8:00 AM - 6:00 PM" : "Monday - Friday: 8:00 AM - 6:00 PM",
      saturday: lang === "es" ? "Sábados: 9:00 AM - 3:00 PM" : "Saturday: 9:00 AM - 3:00 PM",
      sunday: lang === "es" ? "Domingos: Cerrado" : "Sunday: Closed"
    },
    social: {
      facebook: "https://facebook.com/maxdentalsmile",
      instagram: "https://instagram.com/maxdentalsmile",
      twitter: "https://twitter.com/maxdentalsmile",
      youtube: "https://youtube.com/maxdentalsmile"
    }
  };

  const handleSocialClick = (platform: string, url: string) => {
    // Detectar si es móvil para abrir apps nativas
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Intentar abrir app nativa primero, luego web si falla
      const appUrls = {
        facebook: `fb://page/maxdentalsmile`,
        instagram: `instagram://user?username=maxdentalsmile`,
        twitter: `twitter://user?screen_name=maxdentalsmile`,
        youtube: `vnd.youtube://channel/maxdentalsmile`
      };
      
      const appUrl = appUrls[platform as keyof typeof appUrls];
      if (appUrl) {
        window.location.href = appUrl;
        // Fallback a web después de 2 segundos si no se abre la app
        setTimeout(() => {
          window.open(url, '_blank', 'noopener,noreferrer');
        }, 2000);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // En desktop, abrir en nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWebsiteClick = () => {
    window.open(officeInfo.website, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = () => {
    // Abrir app de teléfono
    window.open(`tel:${officeInfo.phone}`, '_self');
  };

  const handleEmailClick = () => {
    // Abrir app de email
    window.open(`mailto:${officeInfo.email}`, '_self');
  };

  const handleMapClick = () => {
    // Abrir Google Maps con la dirección
    const address = encodeURIComponent(`${officeInfo.address}, ${officeInfo.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Información de la Oficina */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🦷</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{officeInfo.name}</h3>
                <p className="text-emerald-200 text-sm">{officeInfo.tagline}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div 
                className="flex items-start gap-3 cursor-pointer hover:text-emerald-200 transition-colors"
                onClick={handleMapClick}
              >
                <MapPin className="h-5 w-5 mt-1 text-emerald-300" />
                <div>
                  <p className="font-semibold">{t[lang].address}</p>
                  <p className="text-emerald-200">{officeInfo.address}</p>
                  <p className="text-emerald-200">{officeInfo.city}</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-3 cursor-pointer hover:text-emerald-200 transition-colors"
                onClick={handlePhoneClick}
              >
                <Phone className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-semibold">{t[lang].phone}</p>
                  <p className="text-emerald-200">{officeInfo.phone}</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-3 cursor-pointer hover:text-emerald-200 transition-colors"
                onClick={handleEmailClick}
              >
                <Mail className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-semibold">{t[lang].email}</p>
                  <p className="text-emerald-200">{officeInfo.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-300" />
              {t[lang].hours}
            </h4>
            <div className="space-y-2 text-emerald-200">
              <p className="font-medium">{t[lang].monday}</p>
              <p className="text-sm">8:00 AM - 6:00 PM</p>
              
              <p className="font-medium mt-4">{t[lang].saturday}</p>
              <p className="text-sm">9:00 AM - 3:00 PM</p>
              
              <p className="font-medium mt-4">{t[lang].sunday}</p>
              <p className="text-sm">{t[lang].closed}</p>
            </div>
          </div>

          {/* Redes Sociales */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-emerald-300">📱</span>
              {t[lang].followUs}
            </h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSocialClick('facebook', officeInfo.social.facebook)}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-200 transform hover:scale-105"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6 text-white" />
              </button>
              
              <button
                onClick={() => handleSocialClick('instagram', officeInfo.social.instagram)}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition-colors duration-200 transform hover:scale-105"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6 text-white" />
              </button>
              
              <button
                onClick={() => handleSocialClick('twitter', officeInfo.social.twitter)}
                className="flex items-center justify-center w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-full transition-colors duration-200 transform hover:scale-105"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6 text-white" />
              </button>
              
              <button
                onClick={() => handleSocialClick('youtube', officeInfo.social.youtube)}
                className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full transition-colors duration-200 transform hover:scale-105"
                aria-label="YouTube"
              >
                <Youtube className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-200 text-center">
                {lang === "es" 
                  ? "✨ ¡Agenda tu cita hoy y sonríe con confianza! ✨" 
                  : "✨ Schedule your appointment today and smile with confidence! ✨"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-emerald-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-emerald-200 text-sm">
              © 2024 {officeInfo.name}. {lang === "es" ? "Todos los derechos reservados." : "All rights reserved."}
            </p>
            <p className="text-emerald-300 text-xs mt-2 md:mt-0">
              {lang === "es" 
                ? "Cuidando tu sonrisa en North Miami Beach desde 2024" 
                : "Caring for your smile in North Miami Beach since 2024"
              }
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
