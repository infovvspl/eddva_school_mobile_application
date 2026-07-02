import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { USE_MOCK } from '../config/appConfig';
import { useDemo } from '../context/DemoContext';
import { studentService } from '../services/student.service';
import type { PaymentBatch } from '../components/DemoPaymentModal';
import { navigateRoot } from '../navigation/navigationRef';

export function useDemoPurchase(onEnrolled?: () => void) {
  const { refreshEnrollment } = useDemo();
  const [paymentBatch, setPaymentBatch] = useState<PaymentBatch | null>(null);
  const [paymentVisible, setPaymentVisible] = useState(false);

  const completeEnroll = useCallback(
    async (batchId: string) => {
      await studentService.enrollBatch(batchId);
      await refreshEnrollment();
      onEnrolled?.();
    },
    [onEnrolled, refreshEnrollment],
  );

  const startPurchase = useCallback(
    (batch: {
      batchId?: string;
      id?: string;
      name?: string;
      batchName?: string;
      price?: number;
      isPaid?: boolean;
      imageUrl?: string;
    }) => {
      const batchId = batch.batchId || batch.id || '';
      const name = batch.batchName || batch.name || 'Course';
      const price = batch.price ?? 0;
      const isPaid = !!batch.isPaid && price > 0;

      if (!USE_MOCK && !isPaid) {
        Alert.alert('Enroll', `Join "${name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enroll', onPress: () => completeEnroll(batchId) },
        ]);
        return;
      }

      if (!USE_MOCK && isPaid) {
        navigateRoot('Checkout', { batchId, name });
        return;
      }

      if (!isPaid) {
        Alert.alert('Free enrollment', `Enroll in "${name}" for free?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enroll Free',
            onPress: async () => {
              await completeEnroll(batchId);
              Alert.alert('Success', 'You are enrolled!');
            },
          },
        ]);
        return;
      }

      setPaymentBatch({
        batchId,
        name,
        price,
        isPaid: true,
        imageUrl: batch.imageUrl,
      });
      setPaymentVisible(true);
    },
    [completeEnroll],
  );

  const closePayment = useCallback(() => {
    setPaymentVisible(false);
    setPaymentBatch(null);
  }, []);

  const onPaymentSuccess = useCallback(
    async (txnId: string) => {
      if (!paymentBatch) return;
      if (!USE_MOCK && paymentBatch.isPaid) {
        // With real Razorpay flow, verification happens in CheckoutScreen.
        await refreshEnrollment();
        onEnrolled?.();
        return;
      }
      await completeEnroll(paymentBatch.batchId);
    },
    [paymentBatch, completeEnroll, onEnrolled, refreshEnrollment],
  );

  return {
    paymentVisible,
    paymentBatch,
    startPurchase,
    closePayment,
    onPaymentSuccess,
  };
}
