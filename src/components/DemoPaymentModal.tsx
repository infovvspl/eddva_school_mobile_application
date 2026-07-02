import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import Icon from './Icon';
import CourseCoverImage from './CourseCoverImage';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import {
  PaymentMethod,
  PaymentProgress,
  simulateDemoPayment,
} from '../mocks/mockPaymentService';
import { formatInr } from '../utils/courseImages';
import { USE_MOCK } from '../config/appConfig';

export type PaymentBatch = {
  batchId: string;
  name: string;
  price: number;
  isPaid?: boolean;
  imageUrl?: string;
  orderId?: string;
};

type Props = {
  visible: boolean;
  batch: PaymentBatch | null;
  onClose: () => void;
  onSuccess: (txnId: string) => void | Promise<void>;
};

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'upi', label: 'UPI', icon: 'mobile-alt' },
  { id: 'card', label: 'Card', icon: 'credit-card' },
  { id: 'wallet', label: 'Wallet', icon: 'money-bill-wave' },
];

const DemoPaymentModal: React.FC<Props> = ({ visible, batch, onClose, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [paying, setPaying] = useState(false);
  const [progress, setProgress] = useState<PaymentProgress | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPaying(false);
      setProgress(null);
      setDone(false);
      setMethod('upi');
    }
  }, [visible]);

  if (!batch) return null;

  const amount = batch.price || 0;

  const handlePay = async () => {
    setPaying(true);
    setProgress({ status: 'initiating', message: 'Starting checkout...' });
    try {
      const { txnId } = await simulateDemoPayment({
        batchId: batch.batchId,
        amount,
        method,
        onProgress: setProgress,
      });
      setDone(true);
      await onSuccess(txnId);
    } catch {
      setProgress({ status: 'failed', message: 'Payment failed. Try again.' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={!paying ? onClose : undefined}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.demoBadge}>
            {USE_MOCK ? 'Demo payment · Razorpay-style (not real)' : 'Secure checkout'}
          </Text>

          <View style={styles.courseRow}>
            <CourseCoverImage course={batch} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.courseName} numberOfLines={2}>{batch.name}</Text>
              <Text style={styles.amount}>{formatInr(amount)}</Text>
              {USE_MOCK ? (
                <Text style={styles.live}>Price updates in real time (demo)</Text>
              ) : null}
            </View>
          </View>

          {!paying && !done ? (
            <>
              <Text style={styles.methodLabel}>Pay with</Text>
              <View style={styles.methods}>
                {METHODS.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodChip, method === m.id && styles.methodChipActive]}
                    onPress={() => setMethod(m.id)}
                  >
                    <Icon name={m.icon} size={14} color={method === m.id ? Colors.white : Colors.primary} solid />
                    <Text style={[styles.methodText, method === m.id && styles.methodTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.payBtn} onPress={handlePay} activeOpacity={0.9}>
                <Text style={styles.payBtnText}>Pay {formatInr(amount)} now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.statusBox}>
              {paying ? <ActivityIndicator color={Colors.primary} size="large" /> : null}
              <Icon
                name={done ? 'check-circle' : progress?.status === 'failed' ? 'times-circle' : 'spinner'}
                size={32}
                color={done ? Colors.success : progress?.status === 'failed' ? Colors.danger : Colors.primary}
                solid
              />
              <Text style={styles.statusMsg}>{progress?.message || 'Processing...'}</Text>
              {progress?.txnId ? (
                <Text style={styles.txn}>Txn: {progress.txnId}</Text>
              ) : null}
              {done ? (
                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneBtnText}>Continue to course</Text>
                </TouchableOpacity>
              ) : progress?.status === 'failed' ? (
                <TouchableOpacity style={styles.doneBtn} onPress={() => { setProgress(null); setDone(false); }}>
                  <Text style={styles.doneBtnText}>Retry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {!paying && !done ? (
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,27,75,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    ...Shadow.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  demoBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 14,
  },
  courseRow: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  thumb: { width: 88, height: 88, borderRadius: BorderRadius.lg },
  courseName: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  amount: { fontSize: 22, fontWeight: '800', color: Colors.text },
  live: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  methodLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, marginBottom: 8 },
  methods: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  methodChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#F8F5FF',
  },
  methodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  methodText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  methodTextActive: { color: Colors.white },
  payBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: { fontSize: 16, fontWeight: '800', color: Colors.white },
  statusBox: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  statusMsg: { fontSize: 14, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  txn: { fontSize: 11, color: Colors.textMuted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  doneBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  doneBtnText: { color: Colors.white, fontWeight: '700' },
  cancel: { alignItems: 'center', marginTop: 12 },
  cancelText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
});

export default DemoPaymentModal;
