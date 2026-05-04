import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDriver } from '../hooks/useDriver';
import { useOrder } from '../hooks/useOrder';

export default function DriverHomeScreen() {
  const { driver, status, acceptOrder, declineOrder, updateLocation } = useDriver();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const res = await fetch('http://localhost:3000/api/dispatch/available');
    const data = await res.json();
    setAvailableOrders(data.orders || []);
  };

  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderOrder = ({ item }: any) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <Text style={styles.orderDistance}>📍 {item.distance}km</Text>
      </View>
      <Text style={styles.partnerName}>{item.partnerName}</Text>
      <Text style={styles.pickupAddress}>📍 {item.pickupAddress}</Text>
      <Text style={styles.deliveryAddress}>🏠 {item.deliveryAddress}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.earnings}>R{item.earnings}</Text>
        <Text style={styles.estimatedTime}>⏱️ {item.estimatedTime}min</Text>
      </View>
      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.declineBtn} onPress={() => declineOrder(item.id)}>
          <Text style={styles.declineBtnText}>DECLINE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptOrder(item.id)}>
          <Text style={styles.acceptBtnText}>ACCEPT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deliveries</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <FlatList
        data={availableOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No deliveries available</Text>
            <Text style={styles.emptySubtext}>Check back in a moment</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#2ecc71' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  status: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, fontSize: 12 },
  list: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderNumber: { fontSize: 16, fontWeight: 'bold' },
  orderDistance: { color: '#666' },
  partnerName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pickupAddress: { fontSize: 14, color: '#666', marginBottom: 4 },
  deliveryAddress: { fontSize: 14, color: '#666', marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  earnings: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
  estimatedTime: { color: '#666' },
  orderActions: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#e63946' },
  declineBtnText: { color: '#e63946', fontWeight: 'bold', textAlign: 'center' },
  acceptBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#2ecc71' },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { color: '#666' },
});