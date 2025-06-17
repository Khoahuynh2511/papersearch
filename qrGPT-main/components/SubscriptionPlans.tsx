'use client';

import { useState } from 'react';
import { SubscriptionTier } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, Crown } from 'lucide-react';

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    features: [
      '5 QR code / tháng',
      'Prompt cơ bản',
      'Chất lượng standard',
      'Download PNG',
    ],
    qrLimit: 5,
    apiAccess: false,
    bulkGeneration: false,
    customBranding: false,
    analytics: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 199000,
    features: [
      '100 QR code / tháng',
      'Tùy chỉnh nâng cao',
      'Logo embedding',
      'Nhiều định dạng xuất',
      'Analytics cơ bản',
      'Ưu tiên hỗ trợ',
    ],
    qrLimit: 100,
    apiAccess: false,
    bulkGeneration: false,
    customBranding: true,
    analytics: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 499000,
    features: [
      '500 QR code / tháng',
      'Bulk generation',
      'API access',
      'White-label',
      'Analytics nâng cao',
      'Team collaboration',
      'Hỗ trợ 24/7',
    ],
    qrLimit: 500,
    apiAccess: true,
    bulkGeneration: true,
    customBranding: true,
    analytics: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999000,
    features: [
      'Không giới hạn QR code',
      'Custom AI models',
      'Dedicated server',
      'Advanced analytics',
      'Multi-team management',
      'Custom integrations',
      'Dedicated support',
    ],
    qrLimit: -1, // unlimited
    apiAccess: true,
    bulkGeneration: true,
    customBranding: true,
    analytics: true,
  },
];

interface SubscriptionPlansProps {
  currentTier?: string;
  onUpgrade: (tierId: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentTier = 'free',
  onUpgrade,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Star className="h-6 w-6 text-gray-400" />;
      case 'pro':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'business':
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      default:
        return <Star className="h-6 w-6 text-gray-400" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    const finalPrice = isAnnual ? Math.round(price * 10) : price; // 2 months free on annual
    return `${finalPrice.toLocaleString('vi-VN')}đ`;
  };

  const getDiscount = (price: number) => {
    if (price === 0 || !isAnnual) return null;
    return `Tiết kiệm ${(price * 2).toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Chọn gói phù hợp với bạn
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Nâng cấp để sử dụng đầy đủ tính năng AI QR Code
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'font-semibold' : 'text-gray-500'}`}>
              Hàng tháng
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'font-semibold' : 'text-gray-500'}`}>
              Hàng năm
              <span className="ml-1 text-green-600 text-xs">(-17%)</span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subscriptionTiers.map((tier) => {
            const isCurrentTier = currentTier === tier.id;
            const isPopular = tier.id === 'pro';

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border-2 p-8 ${
                  isPopular
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isCurrentTier ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {getIcon(tier.id)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {formatPrice(tier.price)}
                    {tier.price > 0 && (
                      <span className="text-lg font-normal text-gray-500">
                        /{isAnnual ? 'năm' : 'tháng'}
                      </span>
                    )}
                  </div>
                  {getDiscount(tier.price) && (
                    <p className="text-green-600 text-sm font-semibold">
                      {getDiscount(tier.price)}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => onUpgrade(tier.id)}
                  disabled={isCurrentTier}
                  className={`w-full ${
                    isCurrentTier
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isCurrentTier ? 'Gói hiện tại' : tier.price === 0 ? 'Bắt đầu miễn phí' : 'Nâng cấp ngay'}
                </Button>

                {isCurrentTier && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Gói của bạn
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Câu hỏi thường gặp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                Tôi có thể hủy subscription bất kỳ lúc nào?
              </h4>
              <p className="text-gray-600 text-sm">
                Có, bạn có thể hủy subscription bất kỳ lúc nào. Không có phí hủy.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                QR code có thời hạn sử dụng không?
              </h4>
              <p className="text-gray-600 text-sm">
                Không, tất cả QR code được tạo sẽ hoạt động vĩnh viễn.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                Tôi có thể xuất QR code ở định dạng nào?
              </h4>
              <p className="text-gray-600 text-sm">
                PNG cho gói Free, thêm SVG và PDF cho các gói Premium.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                API có rate limit như thế nào?
              </h4>
              <p className="text-gray-600 text-sm">
                Business: 1000 requests/hour, Enterprise: unlimited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 