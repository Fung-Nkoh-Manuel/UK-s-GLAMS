"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden hover:bg-rose-50 transition-colors duration-200"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <Menu
            className={`h-6 w-6 absolute transition-all duration-300 ${
              isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
          <X
            className={`h-6 w-6 absolute transition-all duration-300 ${
              isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          />
        </div>
      </Button>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-300"
          onClick={toggleMenu}
        />
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="hover:bg-rose-50"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="p-4">
            <div className="space-y-2">
              {[
                { href: "#hero", label: "Home" },
                { href: "#about", label: "About" },
                { href: "#portfolio", label: "Portfolio" },
                { href: "#services", label: "Services" },
                { href: "#contact", label: "Contact" },
              ].map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block text-gray-900  dark:bg-white hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 py-3 px-4 rounded-lg transform hover:translate-x-2`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onClick={handleLinkClick}
                >
                  {item.label}
                </a>
              ))}
              {/* MODIFICATION HERE: Wrap Button in an <a> tag */}
              <a href="#consultation-form" onClick={handleLinkClick}>
                <Button className="w-full bg-rose-600 hover:bg-rose-700 mt-6 transform hover:scale-105 transition-all duration-200">
                  Book Consultation
                </Button>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
