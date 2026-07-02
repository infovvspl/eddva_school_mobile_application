import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import { font, hs, ms, pagePadding, spacing, vs } from '../utils/responsive';
import { studentService } from '../services/student.service';
import type { RootStackParamList } from '../types/navigation';
import Icon from '../components/Icon';
import { navigateRoot } from '../navigation/navigationRef';

type CheckoutRoute = RouteProp<RootStackParamList, 'Checkout'>;

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  key: string;
};

type RazorpayMessage =
  | {
      status: 'success';
      data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      };
    }
  | { status: 'cancelled' }
  | { status: 'failed'; error?: string };

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CheckoutRoute>();
  const { batchId, name } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  const buildOrder = (raw: any): RazorpayOrder => {
    const id = raw?.id || raw?.orderId || raw?.order_id;
    const amount = raw?.amount;
    const currency = raw?.currency || 'INR';
    const key =
      raw?.key ||
      raw?.razorpayKey ||
      raw?.publishableKey ||
      raw?.publicKey;

    if (!id || !amount || !key) {
      throw new Error('Invalid checkout response from server');
    }

    return { id: String(id), amount: Number(amount), currency: String(currency), key: String(key) };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await studentService.createBatchCheckout(batchId);
        if (cancelled) return;
        const order = buildOrder(data);

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
              <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
                  background-color: #f8fafc;
                  color: #0f172a;
                }
                .loader {
                  border: 4px solid #e2e8f0;
                  border-top: 4px solid #2563eb;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </head>
            <body>
              <div class="loader"></div>
              <script>
                (function () {
                  var options = {
                    key: "${order.key}",
                    amount: "${order.amount}",
                    currency: "${order.currency}",
                    name: "Course Enrollment",
                    description: ${JSON.stringify(name || 'EDDVA course')},
                    order_id: "${order.id}",
                    handler: function (response) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        status: 'success',
                        data: {
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature
                        }
                      }));
                    },
                    theme: {
                      color: "#2563eb"
                    },
                    modal: {
                      ondismiss: function () {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          status: 'cancelled'
                        }));
                      }
                    }
                  };

                  var rzp = new Razorpay(options);
                  rzp.on('payment.failed', function (response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      status: 'failed',
                      error: response.error && response.error.description
                    }));
                  });

                  window.onload = function () {
                    rzp.open();
                  };
                })();
              </script>
            </body>
          </html>
        `;

        setCheckoutHtml(html);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Unable to start checkout. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batchId, name]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let payload: RazorpayMessage | null = null;
      try {
        payload = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (!payload) return;

      if (payload.status === 'success') {
        try {
          setLoading(true);
          await studentService.verifyBatchPayment(batchId, {
            razorpay_order_id: payload.data.razorpay_order_id,
            razorpay_payment_id: payload.data.razorpay_payment_id,
            razorpay_signature: payload.data.razorpay_signature,
          });
          // After success, go to Learn tab (MyCourses)
          navigateRoot('Main', { screen: 'Learn' });
        } catch (e: any) {
          setError(e?.message || 'Payment verification failed. Please contact support.');
          setLoading(false);
        }
      } else {
        // cancelled or failed: just go back
        navigation.goBack();
      }
    },
    [batchId, navigation],
  );

  const goBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} hitSlop={12}>
          <Icon name="arrow-left" size={ms(16)} color={Colors.text} solid />
        </TouchableOpacity>
        <Text style={styles.title}>Secure checkout</Text>
        <View style={{ width: hs(32) }} />
      </View>
      {loading && !checkoutHtml ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Connecting to payment gateway…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={goBack}>
            <Text style={styles.retryText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webWrap}>
          <WebView
            originWhitelist={['*']}
            source={{ html: checkoutHtml ?? '' }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: pagePadding,
    paddingVertical: vs(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: hs(32),
    height: hs(32),
    borderRadius: hs(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  title: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: Colors.text,
  },
  webWrap: { flex: 1, backgroundColor: '#f8fafc' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: pagePadding,
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: font.caption,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: font.caption,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: vs(12),
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(10),
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    ...Shadow.soft,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: font.caption,
  },
});

export default CheckoutScreen;

