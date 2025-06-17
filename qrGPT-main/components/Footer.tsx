
import VietnamFlag from './VietnamFlag';

const Footer = () => (
  <footer className="bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50">
    <div className="custom-screen pt-16">
      <div className="mt-10 py-10 border-t border-gray-200 items-center justify-between flex">
        <p className="text-gray-600 flex items-center gap-2">
          <VietnamFlag width={20} height={14} />
          Được tạo bởi{' '}
          <a
            href="https://github.com/Khoahuynh2511/"
            className="hover:underline transition text-blue-600 font-semibold"
          >
            Kai H
          </a>{' '}
          cho cộng đồng Việt Nam
        </p>
        <div className="flex items-center gap-x-6 text-gray-400">
          <p className="text-sm text-gray-500">
            Made with love in Vietnam
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
