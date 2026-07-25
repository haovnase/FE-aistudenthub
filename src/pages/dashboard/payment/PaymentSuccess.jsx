import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import Button from '../../../components/Button/Button';
import paymentService from '../../../services/payment.service';
import './Payment.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState(null);
  const [error, setError] = useState('');

  const verifyPayment = async () => {
    setLoading(true);
    setError('');

    const orderCode = searchParams.get('orderCode') || searchParams.get('code') || searchParams.get('id');
    const isCancelled = searchParams.get('cancel') === 'true' || searchParams.get('status') === 'CANCELLED';

    if (isCancelled) {
      setError('Giao dịch đã bị hủy bởi người dùng.');
      setLoading(false);
      return;
    }
    
    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng.');
      setLoading(false);
      return;
    }

    try {
      const data = await paymentService.getPaymentDetail(orderCode);
      if (data && data.status === 'PAID') {
        setOrderDetail(data);
      } else if (data && data.status === 'PENDING') {
        setError('Hệ thống đang xử lý giao dịch. Vui lòng chờ ít phút hoặc nhấn thử lại.');
      } else {
        setError('Thanh toán chưa hoàn tất hoặc giao dịch bị lỗi.');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kiểm tra giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [searchParams]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-card glass-card">
        {loading ? (
          <div className="text-center py-5">
            <Loader2 size={48} className="animate-spin text-primary-500 mx-auto mb-4" />
            <h3 className="text-neutral-700">Đang xác thực giao dịch...</h3>
            <p className="text-neutral-500">Vui lòng không đóng trình duyệt.</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="result-icon-wrapper cancel mb-3" style={{ color: 'var(--error-600)', backgroundColor: 'var(--error-50)', display: 'inline-flex', padding: '16px', borderRadius: '50%' }}>
              <XCircle size={48} />
            </div>
            <h2 className="mb-3" style={{ color: 'var(--error-600)' }}>Xác thực chưa hoàn tất</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <div className="d-flex gap-3 justify-content-center">
              <Button onClick={verifyPayment} variant="outline">
                <RefreshCw size={18} className="mr-2" style={{ marginRight: '6px' }} />
                Thử kiểm tra lại
              </Button>
              <Button onClick={() => navigate('/dashboard/payment')} variant="primary">
                Trang Nạp tiền
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="result-icon-wrapper success">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="mb-2" style={{ color: 'var(--success-600)' }}>Thanh toán thành công!</h2>
            <p className="text-neutral-500 mb-4">Cảm ơn bạn đã sử dụng dịch vụ của AI Student Hub.</p>
            
            <div className="bg-neutral-50 rounded-md p-4 text-left mb-4" style={{ border: '1px solid var(--neutral-200)' }}>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-neutral-500">Mã đơn hàng:</span>
                <span className="font-medium text-neutral-800">{orderDetail?.orderCode}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-neutral-500">Nội dung:</span>
                <span className="font-medium text-neutral-800">{orderDetail?.description}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-2">
                <span className="text-neutral-500 font-medium">Số tiền:</span>
                <span className="font-bold" style={{ color: 'var(--primary-600)' }}>
                  {orderDetail?.amount?.toLocaleString()} VNĐ
                </span>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <Button onClick={() => navigate('/dashboard/payment/history')} variant="outline">
                <FileText size={18} className="mr-2" style={{ marginRight: '6px' }} />
                Lịch sử nạp
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="primary">
                Trở về Trang chủ
                <ArrowRight size={18} className="ml-2" style={{ marginLeft: '6px' }} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

