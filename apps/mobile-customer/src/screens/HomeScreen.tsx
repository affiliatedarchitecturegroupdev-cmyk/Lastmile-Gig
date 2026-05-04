import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePartners } from '../hooks/usePartners';
import { Partner } from '../services/partners';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { partners, loading, searchPartners } = usePartners();
  const [query, setQuery] = useState('');

  useEffect(() => {
    searchPartners('');
  }, []);

  const handlePartnerPress = (partner: Partner) => {
    navigation.navigate('Restaurant', { partnerId: partner.id });
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <TouchableOpacity style={styles.partnerCard} onPress={() => handlePartnerPress(item)}>
      <Image source={{ uri: item.coverImageUrl }} style={styles.partnerImage} />
      <View style={styles.partnerInfo}>
        <Text style={styles.partnerName}>{item.name}</Text>
        <Text style={styles.partnerCuisine}>{item.type}</Text>
        <View style={styles.partnerMeta}>
          <Text>⭐ {item.rating}</Text>
          <Text>·</Text>
          <Text>📍 {item.deliveryFee}</Text>
          <Text>·</Text>
          <Text>⏱️ {item.sla_minutes}min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lastmile Gig</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SearchTab')}>
          <Text style={styles.location}>📍 Johannesburg</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => searchPartners(query)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e63946" />
      ) : (
        <FlatList
          data={partners}
          keyExtractor={(item) => item.id}
          renderItem={renderPartner}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 48, backgroundColor: '#e63946' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  location: { fontSize: 14, color: '#fff', marginTop: 4 },
  searchContainer: { padding: 16, backgroundColor: '#e63946', paddingTop: 0 },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16 },
  list: { padding: 16 },
  partnerCard: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', elevation: 2, backgroundColor: '#fff' },
  partnerImage: { width: '100%', height: 150, backgroundColor: '#eee' },
  partnerInfo: { padding: 12 },
  partnerName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  partnerCuisine: { fontSize: 14, color: '#666', marginBottom: 8 },
  partnerMeta: { flexDirection: 'row', gap: 8, fontSize: 12, color: '#666' },
});