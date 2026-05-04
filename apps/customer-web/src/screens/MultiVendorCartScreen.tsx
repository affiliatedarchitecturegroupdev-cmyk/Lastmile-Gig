import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMultiVendorCart, useMultiVendorCheckout } from '../hooks/useMultiVendorCart';

export default function MultiVendorCartScreen() {
  const navigation = useNavigation<any>();
  const { vendorGroups, totals, updateQuantity, removeItem, clearCart } = useMultiVendorCart();
  const { isProcessing, orderGroupId, processCheckout } = useMultiVendorCheckout();
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [selectedPayment, setSelectedPayment] = React.useState('card');

  const handleCheckout = async () => {
    if (!deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }
    
    const result = await processCheckout(deliveryAddress, selectedPayment);
    
    if (result.success) {
      navigation.navigate('OrderConfirmation', { groupId: result.groupId });
    } else {
      alert('Checkout failed. Please try again.');
    }
  };

  const renderVendorGroup = ({ item: vendor }: any) => (
    <View style={styles.vendorSection}>
      <View style={styles.vendorHeader}>
        <Text style={styles.vendorName}>{vendor.partnerName}</Text>
        <Text style={styles.deliveryFee}>Delivery: R{vendor.deliveryFee}</Text>
      </View>
      
      {vendor.items.map((item: any) => (
        <View key={item.id} style={styles.cartItem}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>R{item.price}</Text>
          </View>
          <View style={styles.itemControls}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
              <Text style={styles.qtyBtn}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
              <Text style={styles.qtyBtn}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.removeText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  if (vendorGroups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.browseBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vendorGroups}
        keyExtractor={(item) => item.partnerId}
        renderItem={renderVendorGroup}
        contentContainerStyle={styles.list}
      />

      <View style={styles.checkoutSection}>
        <View style={styles.totalRow}>
          <Text>Items ({totals.itemsCount} from {totals.vendorsCount} vendors)</Text>
          <Text>R{totals.subtotal}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Delivery ({totals.vendorsCount} × R35)</Text>
          <Text>R{totals.deliveryFee}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Service Fee</Text>
          <Text>R{totals.serviceFee}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>R{totals.total}</Text>
        </View>

        <Text style={styles.sectionLabel}>Delivery Address</Text>
        <View style={styles.input}>
          <Text>{deliveryAddress || 'Enter your address'}</Text>
        </View>

        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPayment]}
            onPress={() => setSelectedPayment('card')}
          >
            <Text>💳 Card</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'apple' && styles.selectedPayment]}
            onPress={() => setSelectedPayment('apple')}
          >
            <Text>🍎 Apple Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedPayment]}
            onPress={() => setSelectedPayment('cash')}
          >
            <Text>💵 Cash</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.checkoutBtn, isProcessing && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          <Text style={styles.checkoutBtnText}>
            {isProcessing ? 'Processing...' : `R${totals.total} - Place Order`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingBottom: 300 },
  vendorSection: { borderBottomWidth: 1, borderBottomColor: '#eee', padding: 16 },
  vendorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  vendorName: { fontSize: 18, fontWeight: 'bold' },
  deliveryFee: { fontSize: 14, color: '#666' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 14, color: '#666' },
  itemControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { fontSize: 20, paddingHorizontal: 12 },
  qty: { fontSize: 16, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  removeText: { fontSize: 18, marginLeft: 12 },
  checkoutSection: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f9f9f9', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  grandTotal: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 8 },
  grandTotalLabel: { fontSize: 18, fontWeight: 'bold' },
  grandTotalValue: { fontSize: 18, fontWeight: 'bold' },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  paymentOptions: { flexDirection: 'row', gap: 8 },
  paymentOption: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  selectedPayment: { borderColor: '#e63946', backgroundColor: '#ffe5e5' },
  checkoutBtn: { backgroundColor: '#e63946', padding: 16, borderRadius: 8, marginTop: 16 },
  checkoutBtnDisabled: { backgroundColor: '#ccc' },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  browseBtn: { backgroundColor: '#e63946', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  browseBtnText: { color: '#fff', fontWeight: 'bold' },
});