const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-8 md:flex md:items-center md:justify-between">
        <div className="mb-6 md:mb-0">
          <span className="text-2xl font-bold">SixFigHires</span>
          <p className="text-sm text-gray-400 mt-1">Find high-paying jobs that fit your lifestyle.</p>
        </div>

        <ul className="flex flex-wrap gap-6 text-sm text-gray-400">
          <li>
            <a href="/about" className="hover:text-white transition">About</a>
          </li>
          <li>
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          </li>
          <li>
            <a href="/terms" className="hover:text-white transition">Terms of Use</a>
          </li>
          <li>
            <a href="mailto:support@sixfighires.com" className="hover:text-white transition">Contact</a>
          </li>
        </ul>
      </div>

      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SixFigHires. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
