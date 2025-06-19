import { Palette, Zap, Smartphone, DollarSign, Upload } from 'lucide-react';
import VietnamFlag from './VietnamFlag';

const FeatureHighlights = () => {
  const features = [
    {
      icon: <Palette className="w-6 h-6 text-white" />,
      title: 'Tùy chỉnh đẹp mắt (Coming Soon)',
      description: 'Thay đổi màu sắc, logo, kiểu dáng theo thương hiệu của bạn',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Upload className="w-6 h-6 text-white" />,
      title: 'Tạo hàng loạt',
      description: 'Upload CSV và tạo hàng trăm QR code cùng lúc, tiết kiệm thời gian',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: 'Nhanh chóng',
      description: 'Tạo QR code chỉ trong vài giây với hiệu suất cao',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: <VietnamFlag width={24} height={16} />,
      title: 'Made in Vietnam',
      description: 'Được phát triển bởi người Việt, dành cho cộng đồng Việt Nam',
      gradient: 'from-red-500 to-yellow-500'
    },
    {
      icon: <DollarSign className="w-6 h-6 text-white" />,
      title: 'Hoàn toàn miễn phí',
      description: 'Tất cả tính năng đều miễn phí, không giới hạn số lượng',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Smartphone className="w-6 h-6 text-white" />,
      title: 'Responsive Design',
      description: 'Hoạt động mượt mà trên mọi thiết bị từ điện thoại đến máy tính',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            VietQR mang đến những tính năng mạnh mẽ và hiện đại nhất để tạo QR code
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
            >
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover effect gradient line */}
              <div className={`w-0 h-1 bg-gradient-to-r ${feature.gradient} mt-4 group-hover:w-full transition-all duration-500 rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Bắt đầu tạo QR Code ngay bây giờ!
            </h3>
            <p className="text-gray-600 mb-6">
              Miễn phí, không cần đăng ký, chỉ cần vài giây để có QR code đẹp mắt
            </p>
            <a
              href="/start"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Tạo QR Code miễn phí
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights; 