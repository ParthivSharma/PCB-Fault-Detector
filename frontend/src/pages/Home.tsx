import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-br from-slate-900 to-gray-800 flex justify-end gap-6 px-10 shadow-md z-50">
        {["features", "working", "aim", "about"].map((item) => (
          <button
            key={item}
            onClick={() => scrollToSection(item)}
            className="font-bold hover:text-yellow-400 transition-colors focus:outline-none"
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      {/* Header */}
      <header className="text-center py-28">
        <h1 className="text-5xl font-extrabold mb-4">PCB Fault Detector</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          AI-powered platform to detect faults in Printed Circuit Boards with precision and speed.
        </p>
      </header>

      {/* Login/Register */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto my-16 px-4">
        <Link to="/login" className="bg-blue-600 text-center text-white font-bold py-6 rounded-xl shadow-md hover:bg-blue-700 transition-all text-lg no-underline">
          User Login
        </Link>
        <Link to="/admin-login" className="bg-green-600 text-center text-white font-bold py-6 rounded-xl shadow-md hover:bg-green-700 transition-all text-lg no-underline">
          Admin Login
        </Link>
        <Link to="/register" className="bg-gray-600 text-center text-white font-bold py-6 rounded-xl shadow-md hover:bg-gray-700 transition-all text-lg no-underline">
          Register
        </Link>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-slate-800 text-center px-4">
        <h2 className="text-3xl font-bold mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-slate-700 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Accurate Detection</h3>
            <p>Advanced AI algorithms ensure high accuracy in fault detection.</p>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
            <p>Process PCB images and detect issues within seconds.</p>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Detailed Reports</h3>
            <p>Get comprehensive reports on faults and suggested fixes.</p>
          </div>
        </div>
      </section>

      {/* Working */}
      <section id="working" className="py-16 text-center px-4">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-slate-700 p-6 rounded-lg shadow hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">1. Upload PCB Image</h3>
            <p>Upload a clear and high-resolution image of the PCB for analysis.</p>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg shadow hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
            <p>Our advanced AI model scans the image and identifies potential faults with accuracy.</p>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg shadow hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">3. Review Report</h3>
            <p>Receive a detailed report highlighting detected faults and suggesting corrective actions.</p>
          </div>
        </div>
      </section>

      {/* Aim */}
      <section id="aim" className="py-16 bg-slate-800 text-center px-4">
        <h2 className="text-3xl font-bold mb-8">Our Aim</h2>
        <p className="max-w-3xl mx-auto text-gray-300">
          Our goal is to revolutionize PCB fault detection using AI technology, ensuring faster and more reliable inspection processes in the electronics industry.
        </p>
      </section>

      {/* About */}
      <section id="about" className="py-16 text-center px-4">
        <h2 className="text-3xl font-bold mb-8">About Us</h2>
        <p className="max-w-3xl mx-auto text-gray-300">
          PCB Fault Detector is crafted by a team of engineers and AI experts dedicated to enhancing quality control in manufacturing and electronic testing through innovative solutions.
        </p>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-4 border-t border-slate-700">
        &copy; {new Date().getFullYear()} PCB Fault Detector | All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
