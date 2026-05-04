import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { usePartnerDetails } from '../hooks/usePartners';
import { useCart } from '../hooks/useCart';

export default function RestaurantScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { partnerId } = route.params;
  const { partner, menu, loading } = usePartnerDetails(partnerId);
  const { addItem, cartItems, cartTotal } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleAddItem = (menuItem: any) => {
    const qty = quantities[menuItem.id] || 1;
    addItem({ ...menuItem, quantity: qty });
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      id: Math.max(0, (prev[id] || 1) + delta),
    }));
  };

  const renderCategory = ({ item: category }: { item: string }) => (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        data={menu.filter((i: any) => i.category === category)}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDesc}>{item.description}</Text>
              <Text style={styles.menuItemPrice}>R{item.price}</Text>
            </View>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.menuItemImage} />}
            <View style={styles.addToCart}>
              {cartItems.find((c: any) => c.id === item.id) ? (
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
                    <Text style={styles.qtyBtn}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantities[item.id] || 1}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
                    <Text style={styles.qtyBtn}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBtn} onPress={() => handleAddItem(item)}>
                  <Text style={styles.addBtnText}>ADD</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );

  const categories = [...new Set(menu.map((i: any) => i.category))];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{partner?.name}</Text>
        <View />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={renderCategory}
        contentContainerStyle={styles.menu}
        ListFooterComponent={
          cartItems.length > 0 ? (
            <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate('CartTab')}>
              <Text style={styles.cartText}>{cartItems.length} items · R{cartTotal}</Text>
              <Text style={styles.cartBtn}>VIEW CART</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 48, backgroundColor: '#e63946' },
  backBtn: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  menu: { paddingBottom: 100 },
  category: { marginBottom: 24 },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  menuItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  menuItemDesc: { fontSize: 12, color: '#666', marginBottom: 8 },
  menuItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#e63946' },
  menuItemImage: { width: 80, height: 80, borderRadius: 8, marginLeft: 12 },
  addToCart: { justifyContent: 'center' },
  addBtn: { backgroundColor: '#e63946', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 4 },
  qtyBtn: { fontSize: 20, paddingHorizontal: 12 },
  qtyText: { fontSize: 16, fontWeight: 'bold' },
  floatingCart: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#e63946', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cartBtn: { color: '#fff', fontWeight: 'bold' },
});