import Image from 'next/image';
import NavLink from './NavLink';

const heroImages = ['/1.png', '/6.png', '/3.png', '/4.png', '/5.png', '/2.png'];

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50">
      <div className="custom-screen pt-28 text-gray-600">
        <div className="space-y-5 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl text-gray-800 font-extrabold mx-auto sm:text-6xl bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 bg-clip-text text-transparent">
            Tạo QR Code của bạn trong vài giây
          </h1>
          <p className="max-w-xl mx-auto">
            VietQR giúp bạn tạo ra những QR code đẹp mắt và có thể tùy chỉnh trong vài giây, 
            hoàn toàn miễn phí và dễ sử dụng.
          </p>
          <div className="flex items-center justify-center gap-x-3 font-medium text-sm">
            <NavLink
              href="/start"
              className="text-white bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
               Tạo QR Code ngay
            </NavLink>
            <NavLink
              target="_blank"
              href="https://github.com/Khoahuynh2511/QR"
              className="text-blue-700 border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
              scroll={false}
            >
               Tìm hiểu thêm
            </NavLink>
          </div>
          <div className="grid sm:grid-cols-3 grid-cols-2 gap-4 pt-10">
            {heroImages.map((image, idx) => (
              <Image
                key={idx}
                alt={`QR code mẫu ${idx + 1}`}
                src={image}
                width={500}
                height={500}
                className="rounded-lg"
                loading={idx < 2 ? "eager" : "lazy"}
                priority={idx < 2}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
