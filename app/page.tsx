"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Moon,
  Sun,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";
import { SmoothScroll } from "@/components/smooth-scroll";
import { MobileMenu } from "@/components/mobile-menu";
import { useState, useEffect } from "react";
import { FaTiktok } from "react-icons/fa";
export default function Portfolio() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const sections = ["hero", "about", "portfolio", "services", "contact"];
    const observerOptions = {
      root: null, // Use viewport as root
      rootMargin: "0px", // No margin
      threshold: [0.3, 0.5, 0.7], // Multiple thresholds for better detection
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = `#${entry.target.id}`;
          setActiveLink(sectionId);
          console.log(
            `Section in view: ${sectionId}, Intersection ratio: ${entry.intersectionRatio}`
          ); // Debug log
        }
      });
    }, observerOptions);

    // Observe each section
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
        console.log(`Observing section: ${section}`); // Debug log
      } else {
        console.warn(`Section with ID "${section}" not found`); // Debug log for missing sections
      }
    });

    // Cleanup observer on unmount
    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const portfolioItems = [
    {
      title: "Bespoke Wedding Dress",
      category: "Bridal",
      image: "/images/wedding.jpeg",
    },
    {
      title: "Birthday Dress",
      category: "Formal",
      image: "/images/good.PNG",
    },
    {
      title: "Evening Gown",
      category: "Evening Wear",
      image: "/images/better.PNG",
    },
    {
      title: "Casual Dress Alterations",
      category: "Alterations",
      image: "/images/alter.PNG",
    },
    {
      title: "Custom Blazer",
      category: "Formal",
      image: "/images/vint.PNG",
    },
    {
      title: "Vintage Restoration",
      category: "Restoration",
      image: "/images/custom.PNG",
    },
  ];

  const services = [
    {
      title: "Bespoke Tailoring",
      description:
        "Custom-made garments designed and crafted to your exact measurements and style preferences.",
      price: "From FCFA50000",
    },
    {
      title: "Alterations & Repairs",
      description:
        "Professional alterations to ensure the perfect fit for your existing garments.",
      price: "From FCFA5000",
    },
    {
      title: "Bridal  Services",
      description:
        "Specializing in wedding dress fittings, alterations, and custom bridal wear.",
      price: "      From FCFA100000",
    },
    {
      title: "Vintage Restoration",
      description:
        "Bringing new life to vintage and heirloom pieces with careful restoration techniques.",
      price: "From FCFA5000",
    },
  ];

  const testimonials = [
    {
      name: "Jennifer Mbekenyuy",
      text: "UK's GLAM created the most beautiful wedding dress for me. The attention to detail was incredible!",
      rating: 5,
    },
    {
      name: "Wandi Fabien",
      text: "Perfect suit alterations. Professional service and excellent craftsmanship.",
      rating: 5,
    },
    {
      name: "Nesla",
      text: "Transformed my vintage coat beautifully. Highly recommend UK's GLAM's restoration services.",
      rating: 5,
    },
  ];
  const [activeLink, setActiveLink] = useState("#hero");

  const handleNavClick = (href) => {
    setActiveLink(href);
  };

  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Format the message
    const formattedMessage = `My Name is ${name}\nService Needed: ${service}\nMessage: ${message}`;
    // URL-encode the message
    const encodedMessage = encodeURIComponent(formattedMessage);
    // Construct WhatsApp URL
    const whatsappUrl = `https://wa.me/237681751254?text=${encodedMessage}`;
    // Redirect to WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setName("");
    setService("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <SmoothScroll />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b dark:bg-gray-900 text-gray-900 dark:text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="logo-container">
            <img
              src="/images/glam-logo.png"
              alt="UK's GLAM Logo"
              className="logo-image h-16 w-16 rounded-full object-cover border-2 border-rose-200 hover:border-rose-400 transition-all duration-300"
            />
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="#hero"
              className={`nav-link ${
                activeLink === "#hero"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-700 hover:text-rose-600"
              } transition-colors duration-200 py-2 px-1`}
              onClick={() => handleNavClick("#hero")}
            >
              Home
            </a>
            <a
              href="#about"
              className={`nav-link ${
                activeLink === "#about"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-700 hover:text-rose-600"
              } transition-colors duration-200 py-2 px-1`}
              onClick={() => handleNavClick("#about")}
            >
              About
            </a>
            <a
              href="#portfolio"
              className={`nav-link ${
                activeLink === "#portfolio"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-700 hover:text-rose-600"
              } transition-colors duration-200 py-2 px-1`}
              onClick={() => handleNavClick("#portfolio")}
            >
              Portfolio
            </a>
            <a
              href="#services"
              className={`nav-link ${
                activeLink === "#services"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-700 hover:text-rose-600"
              } transition-colors duration-200 py-2 px-1`}
              onClick={() => handleNavClick("#services")}
            >
              Services
            </a>
            <a
              href="#contact"
              className={`nav-link ${
                activeLink === "#contact"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-700 hover:text-rose-600"
              } transition-colors duration-200 py-2 px-1`}
              onClick={() => handleNavClick("#contact")}
            >
              Contact
            </a>
          </nav>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/50 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-2000" />
            ) : (
              <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <div className="flex items-center space-x-4">
            <Button
              className="hidden md:block animated-button bg-rose-600 hover:bg-rose-700"
              onClick={() =>
                document
                  .getElementById("consultation-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Book Consultation
            </Button>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="py-20 dark:bg-gray-900 text-gray-900 dark:text-white"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            {/* Profile image at the top */}
            <ScrollAnimation animation="scaleIn" className="mb-12">
              <div className="relative">
                <div className="w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-br from-rose-100 to-pink-100">
                  <img
                    src="/images/glam-portrait.png"
                    alt="UK's GLAM - Professional Tailor"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Decorative elements with floating animation */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-rose-400 rounded-full float-animation"></div>
                <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-pink-400 rounded-full float-animation"></div>
                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-rose-300 rounded-full float-animation"></div>
              </div>
            </ScrollAnimation>

            {/* Text content below */}
            <ScrollAnimation animation="slideUp" delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold dark:text-white text-gray-900 mb-6">
                UK's GLAM
              </h1>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={400}>
              <p className="text-xl md:text-2xl text-gray-600 mb-4">
                Bespoke Tailoring & Alterations
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={600}>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
                Creating beautiful, perfectly fitted garments with traditional
                craftsmanship and modern style
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={800}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="animated-button bg-rose-600 hover:bg-rose-700"
                >
                  <a href="#portfolio">View Portfolio</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="animated-button border-rose-600 text-rose-600 hover:bg-rose-50 bg-transparent
             dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900 dark:hover:bg-opacity-20"
                >
                  <a href="#contact">Contact Me</a>
                </Button>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 dark:bg-gray-800 text-gray-900 dark:text-white bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimation animation="slideLeft">
              <div>
                <h2 className="text-4xl font-bold dark:text-white text-gray-900 mb-6">
                  About UK's GLAM
                </h2>
                <p className="text-lg text-gray-600 dark:text-white mb-6">
                  With over 5 years of experience in bespoke tailoring, I
                  specialize in creating beautiful, perfectly fitted garments
                  that celebrate individual style and craftsmanship.
                </p>
                <p className="text-lg text-gray-600 dark:text-white mb-6">
                  From wedding dresses to birthday dresses, alterations to
                  vintage restorations, every piece receives meticulous
                  attention to detail and is crafted with the finest materials.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary">Bespoke Tailoring</Badge>
                  <Badge variant="secondary">Bridal Specialist</Badge>
                  <Badge variant="secondary">Vintage Restoration</Badge>
                  <Badge variant="secondary">Pattern Making</Badge>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slideRight" delay={200}>
              <div className="relative">
                <img
                  src="/images/about.PNG"
                  alt="UK's GLAM at work"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 dark:bg-gray-900 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="slideUp">
            <h2 className="text-4xl font-bold text-center dark:text-white text-gray-900 mb-12">
              Portfolio
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <ScrollAnimation
                key={index}
                animation="slideUp"
                delay={index * 100}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-rose-600 border-rose-600"
                    >
                      {item.category}
                    </Badge>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 dark:bg-gray-800 text-gray-900 dark:text-white bg-white"
      >
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="slideUp">
            <h2 className="text-4xl font-bold text-center dark:text-white  text-gray-900 mb-12">
              Services
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ScrollAnimation
                key={index}
                animation={index % 2 === 0 ? "slideLeft" : "slideRight"}
                delay={index * 150}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold dark:text-white text-gray-900">
                        {service.title}
                      </h3>
                      <span className="text-rose-600 ml-4 font-semibold">
                        {service.price}
                      </span>
                    </div>
                    <p className="text-gray-600">{service.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 dark:bg-gray-900 text-gray-900 dark:text-white bg-rose-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="slideUp">
            <h2 className="text-4xl font-bold text-center dark:text-white text-gray-900 mb-12">
              What Clients Say
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollAnimation
                key={index}
                animation="scaleIn"
                delay={index * 200}
              >
                <Card className="p-6">
                  <CardContent className="p-0">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className=" text-gray-900 dark:text-white mb-4 italic">
                      "{testimonial.text}"
                    </p>
                    <p className="font-semibold  text-gray-900 dark:text-white">
                      - {testimonial.name}
                    </p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-20"
      >
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="slideUp">
            <h2 className="text-4xl font-bold text-center dark:text-white text-gray-900 dark:text-white mb-12">
              Get In Touch
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-12">
            <ScrollAnimation animation="slideLeft" delay={200}>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-600 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-rose-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      +237 6 81 75 12 54
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-rose-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      eukeria@gmail.com
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-rose-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Bamenda Nkwen
                    </span>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-600">
                    Follow UK's GLAM
                  </h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.tiktok.com/@eukeria/video/7436757318995578167"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-rose-600 text-rose-600 hover:bg-rose-50 bg-transparent dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900 dark:hover:bg-opacity-20"
                      >
                        {/* Replace Instagram with FaTiktok */}
                        <FaTiktok className="h-4 w-4" />
                      </Button>
                    </a>
                    <a
                      href="https://m.facebook.com/uks.glam/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-rose-600 text-rose-600 hover:bg-rose-50 bg-transparent dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900 dark:hover:bg-opacity-20"
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slideRight" delay={400}>
              <Card className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 dark:text-white">
                    Book a Consultation
                  </h3>
                  <form
                    className="space-y-4 dark:bg-gray-900 text-gray-900 dark:text-white"
                    onSubmit={handleSubmit}
                    id="consultation-form"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service Needed
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                      >
                        <option value="">Select a service</option>
                        <option>Bespoke Tailoring</option>
                        <option>Alterations & Repairs</option>
                        <option>Bridal Services</option>
                        <option>Vintage Restoration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Tell me about your project..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ScrollAnimation animation="fadeIn">
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/images/glam-logo.png"
                alt="UK's GLAM Logo"
                className="h-12 w-12 rounded-full object-cover border-2 border-rose-400"
              />
            </div>
            <p className="text-gray-400">
              © 2024 UK's GLAM Tailoring. All rights reserved.
            </p>
          </div>
        </footer>
      </ScrollAnimation>
    </div>
  );
}
