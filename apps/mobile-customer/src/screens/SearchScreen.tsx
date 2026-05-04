import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePartners } from '../hooks/usePartners';
import { Partner } from '../services/partners';

const cuisines = ['All', 'Pizza', 'Burgers', 'Sushi', 'Asian', 'Italian', 'Healthy', 'Desserts'];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { partners, searchPartners } = usePartners();
  const [query, setQuery] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');

  const handleSearch = (text: string) => {
    setQuery(text);
    searchPartners(text);
  };

  const handleCuisineFilter = (cuisine: string) => {
    setActiveCuisine(cuisine);
    searchPartners(cuisine === 'All' ? '' : cuisine);
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <TouchableOpacity style={styles.result} onPress={() => navigation.navigate('Restaurant', { partnerId: item.id })}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultMeta}>{item.type} · ⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisines..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          data={cuisines}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeCuisine === item && styles.filterChipActive]}
              onPress={() => handleCuisineFilter(item)}
            >
              <Text style={[styles.filterText, activeCuisine === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={partners}
        keyExtractor={(item) => item.id}
        renderItem={renderPartner}
        contentContainerStyle={styles.results}
        ListEmptyComponent={<Text style={styles.empty}>No restaurants found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 48, backgroundColor: '#e63946' },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16 },
  filters: { paddingVertical: 12, backgroundColor: '#fff' },
  filtersList: { paddingHorizontal: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#e63946' },
  filterText: { fontSize: 14, color: '#333' },
  filterTextActive: { color: '#fff' },
  results: { padding: 16 },
  result: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resultInfo: {},
  resultName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  resultMeta: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 48 },
});