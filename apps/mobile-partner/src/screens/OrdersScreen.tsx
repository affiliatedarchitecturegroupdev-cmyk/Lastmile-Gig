import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  createdAt: string;
}

export default function PartnerOrdersScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('http://localhost:3000/api/orders?partnerId=self');
    const data = await res.json();
    setOrders(data.orders || []);
  };

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#3498db';
      case 'preparing': return '#f39c12';
      case 'ready': return '#9b59b6';
      case 'dispatched': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.itemsCount}>{item.items.length} items · R{item.total}</Text>
      <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
      <View style={styles.orderActions}>
        {item.status === 'confirmed' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item.id, 'preparing')}>
            <Text style={styles.actionBtnText}>START PREPARING</Text>
          </TouchableOpacity>
        )}
        {item.status === 'preparing' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item.id, 'ready')}>
            <Text style={styles.actionBtnText}>MARK READY</Text>
          </TouchableOpacity>
        )}
        {item.status === 'ready' && (
          <TouchableOpacity style={[styles.actionBtn, styles.readyBtn]} onPress={() => updateStatus(item.id, 'dispatched')}>
            <Text style={styles.actionBtnText}>HANDOVER TO DRIVER</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{orders.length} active</Text>
      </View>

      <View style={styles.filters}>
        {['all', 'confirmed', 'preparing', 'ready'].map(f => (
          <TouchableOpacity key={f} style={[styles.filter, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filter === 'all' ? orders : orders.filter(o => o.status === filter)}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#e63946' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#fff' },
  filters: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', gap: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  filterActive: { backgroundColor: '#e63946' },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderNumber: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  customerName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemsCount: { fontSize: 14, color: '#666', marginBottom: 4 },
  orderTime: { fontSize: 12, color: '#999' },
  orderActions: { marginTop: 12, gap: 8 },
  actionBtn: { backgroundColor: '#e63946', padding: 12, borderRadius: 8 },
  readyBtn: { backgroundColor: '#2ecc71' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyText: { fontSize: 18, color: '#666' },
});