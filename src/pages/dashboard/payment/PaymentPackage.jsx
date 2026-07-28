import React, { useState } from 'react';
import { CreditCard, Zap, Crown, CheckCircle2, BookOpen, Check, X } from 'lucide-react';
import Button from '../../../components/Button/Button';
import paymentService from '../../../services/payment.service';
import './Payment.css';

const PACKAGES = [
  {
    id: 'basic',
    name: 'Gói Cơ bản',
    price: 0,
    priceStr: 'Miễn phí',
    icon: <BookOpen size={24} className="package-icon" />,
    color: 'var(--primary-500)',
    description: 'Dành cho sinh viên mới bắt đầu, muốn trải nghiệm hệ thống quản lý tài liệu AI.',
    features: [
      { text: '100 câu hỏi AI / ngày', included: true },
      { text: 'Lưu trữ tối đa 50 tài liệu', included: true },
      { text: 'Tải lên & xem trước tài liệu', included: true },
      { text: 'Chat AI cơ bản', included: true },
      { text: 'Phân tích tài liệu PDF nâng cao', included: false },
      { text: 'Quản lý thư mục', included: false },
      { text: 'Lưu lịch sử hội thoại AI', included: false }
    ],
    isPopular: false,
    buttonText: 'Đang sử dụng',
    subText: 'Không cần thẻ tín dụng'
  },
  {
    id: 'pro',
    name: 'Gói Nâng cao',
    price: 39000,
    priceStr: '39.000đ',
    icon: <Zap size={24} className="package-icon text-warning" />,
    color: '#eab308',
    description: 'Dành cho sinh viên học tập chủ động, cần AI hỗ trợ sâu và quản lý tài liệu hiệu quả.',
    features: [
      { text: 'Không giới hạn câu hỏi AI', included: true },
      { text: 'Lưu trữ tối đa 500 tài liệu', included: true },
      { text: 'Phân tích & trích xuất nội dung PDF', included: true },
      { text: 'Quản lý thư mục & nhãn', included: true },
      { text: 'Lưu toàn bộ lịch sử hội thoại AI', included: true },
      { text: 'Hỏi đáp AI theo từng tài liệu', included: true },
      { text: 'Ưu tiên kết quả tìm kiếm', included: false }
    ],
    isPopular: true,
    buttonText: 'Chọn gói này',
    subText: 'Thanh toán qua VietQR - PayOS'
  },
  {
    id: 'premium',
    name: 'Gói Chuyên gia',
    price: 79000,
    priceStr: '79.000đ',
    icon: <Crown size={24} className="package-icon text-danger" />,
    color: 'var(--danger-500)',
    description: 'Dành cho sinh viên nghiên cứu chuyên sâu, cần toàn bộ sức mạnh AI không giới hạn.',
    features: [
      { text: 'Tất cả tính năng gói Nâng cao', included: true },
      { text: 'Lưu trữ không giới hạn', included: true },
      { text: 'Ưu tiên kết quả tìm kiếm', included: true },
      { text: 'Lưu lịch sử hội thoại vĩnh viễn', included: true },
      { text: 'Hỗ trợ ưu tiên 24/7', included: true },
      { text: 'Xuất báo cáo tài liệu', included: true },
      { text: 'Truy cập sớm tính năng mới', included: true }
    ],
    isPopular: false,
    buttonText: 'Chọn gói này',
    subText: 'Thanh toán qua VietQR - PayOS'
  }
];

const PaymentPackage = () => {
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const returnUrl = `${window.location.origin}/dashboard/payment/success`;
      const cancelUrl = `${window.location.origin}/dashboard/payment/cancel`;
      const description = `Mua ${selectedPkg.name}`;

      const response = await paymentService.createPayment(
        selectedPkg.price,
        description,
        returnUrl,
        cancelUrl
      );

      if (response && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        setError('Không thể tạo link thanh toán, vui lòng thử lại sau.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kết nối tới cổng thanh toán.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="premium-page-wrapper payment-page">
      <div className="page-header text-center" style={{ alignItems: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title">Nâng cấp Tài khoản</h1>
        <p className="page-description" style={{ maxWidth: '600px', margin: '0.5rem auto' }}>
          Mở khóa toàn bộ sức mạnh của AI Student Hub với các gói cước siêu tiết kiệm. Thanh toán an toàn, nhanh chóng qua VietQR.
        </p>
      </div>

      {error && <div className="alert alert-danger" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>{error}</div>}

      <div className="packages-grid">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`package-card glass-card ${selectedPkg.id === pkg.id ? 'selected' : ''} ${pkg.isPopular ? 'popular' : ''}`}
            onClick={() => setSelectedPkg(pkg)}
            style={{ '--pkg-color': pkg.color }}
          >
            {pkg.isPopular && <div className="popular-badge">Phổ biến nhất</div>}

            <div className="package-header">
              <div className="icon-wrapper" style={{ color: pkg.color, backgroundColor: `${pkg.color}15` }}>
                {pkg.icon}
              </div>
              <h3 className="package-name">{pkg.name}</h3>
              <div className="package-price">
                <span className="amount">{pkg.priceStr}</span>
                <span className="period">/tháng</span>
              </div>
              <p className="package-desc">{pkg.description}</p>
            </div>

            <ul className="package-features">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className={!feature.included ? 'disabled' : ''}>
                  {feature.included ? (
                    <Check size={18} color="var(--success-500)" />
                  ) : (
                    <X size={18} color="var(--neutral-400)" />
                  )}
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <div className="package-footer">
              <Button
                variant={pkg.id === 'basic' ? 'outline' : (selectedPkg.id === pkg.id ? 'primary' : 'outline')}
                className="w-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPkg(pkg);
                }}
                disabled={pkg.id === 'basic'}
              >
                {pkg.id === 'basic' ? 'Đang sử dụng' : (selectedPkg.id === pkg.id ? 'Đang chọn' : 'Chọn gói này')}
              </Button>
              <div className="package-subtext">{pkg.subText}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-action-container glass-card text-center" style={{ marginTop: '3rem' }}>
        <h3 className="mb-2">Bạn đang chọn: <strong>{selectedPkg.name}</strong></h3>
        <p className="text-neutral-500 mb-4">Tổng thanh toán: <strong style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }}>{selectedPkg.priceStr}</strong></p>

        <Button
          variant="primary"
          size="lg"
          onClick={handlePayment}
          disabled={isProcessing || selectedPkg.price === 0}
          style={{ minWidth: '250px', fontSize: '1.1rem' }}
        >
          {selectedPkg.price === 0 ? 'Gói mặc định của bạn' : (isProcessing ? 'Đang chuyển hướng...' : 'Thanh toán qua VietQR')}
        </Button>
        {selectedPkg.price > 0 && (
          <div className="payment-methods mt-3 text-neutral-400" style={{ fontSize: '0.85rem' }}>
            Hỗ trợ quét mã QR qua mọi ứng dụng ngân hàng và ví điện tử tại Việt Nam.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPackage;
