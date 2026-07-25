import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Loader2, ArrowLeft } from 'lucide-react';
import Button from '../../../components/Button/Button';
import paymentService from '../../../services/payment.service';
import './Payment.css';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cancelOrder = async () => {
      const orderCode = searchParams.get('orderCode') || searchParams.get('code') || searchParams.get('id');
      
      if (!orderCode) {
        setLoading(false);
        return;
      }

      try {
        // Optionally call API to explicitly cancel if not already cancelled by webhook
        await paymentService.cancelPayment(orderCode);
      } catch (err) {
        console.warn('Lỗi khi gọi API cancel, có thể đơn đã bị hủy từ trước:', err);
      } finally {
        setLoading(false);
      }
    };

    cancelOrder();
  }, [searchParams]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-card glass-card">
        {loading ? (
          <div className="text-center py-5">
            <Loader2 size={48} className="animate-spin text-neutral-400 mx-auto mb-4" />
            <h3 className="text-neutral-700">Đang xử lý hủy giao dịch...</h3>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="result-icon-wrapper cancel">
              <XCircle size={48} />
            </div>
            <h2 className="mb-2" style={{ color: 'var(--danger-600)' }}>Giao dịch đã bị hủy</h2>
            <p className="text-neutral-500 mb-4">Bạn đã hủy thanh toán hoặc giao dịch không thành công.</p>
            
            <div className="d-flex gap-3 justify-content-center mt-4">
              <Button onClick={() => navigate('/dashboard/payment')} variant="primary">
                Thử lại lần nữa
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft size={18} className="mr-2" />
                Về Trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCancel;
