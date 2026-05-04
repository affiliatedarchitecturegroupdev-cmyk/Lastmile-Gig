import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../hooks/useCart';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { cartItems, cartTotal, deliveryFee, serviceFee, total, removeItem, updateQuantity, clearCart } = useCart();

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
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
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from a restaurant to get started</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('HomeTab')}>
          <Text style={styles.browseBtnText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>R{cartTotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Delivery Fee</Text>
          <Text>R{deliveryFee}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Service Fee</Text>
          <Text>R{serviceFee}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>R{total}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { fontSize: 14, color: '#666' },
  itemControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { fontSize: 20, paddingHorizontal: 12, color: '#e63946' },
  qty: { fontSize: 16, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  removeBtn: { marginLeft: 16 },
  removeText: { fontSize: 18 },
  summary: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#f9f9f9' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#e63946', padding: 16, borderRadius: 8, marginTop: 16 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  browseBtn: { backgroundColor: '#e63946', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  browseBtnText: { color: '#fff', fontWeight: 'bold' },
});