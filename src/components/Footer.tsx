import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-6 sm:mb-0">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300">
              SixFigHires
            </Link>
            <p className="mt-2 text-sm text-gray-400 max-w-sm">
              Discover six-figure remote and government jobs in Washington DC, Maryland, and Virginia. From data scientists to marketing leaders, we connect top talent with high-paying roles across the public and private sectors.
            </p>
          </div>
          <ul className="flex flex-wrap gap-4 text-sm text-gray-400">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-700" />
        <p className="text-sm text-center text-gray-500">
          © {new Date().getFullYear()} SixFigHires. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;