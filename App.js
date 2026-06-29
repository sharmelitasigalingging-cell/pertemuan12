import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notekeeper_notes';
const COUNTER_KEY = '@notekeeper_total_dibuat';

export default function App() {
  // State
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [totalDibuat, setTotalDibuat] = useState(0);

  // Simpan notes ke storage
  async function simpanKeStorage(notesArray) {
    try {
      const jsonString = JSON.stringify(notesArray);
      await AsyncStorage.setItem(STORAGE_KEY, jsonString);
    } catch (e) {
      console.log('Gagal menyimpan:', e);
    }
  }

  // Muat notes dari storage
  async function muatDariStorage() {
    try {
      const jsonString = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonString != null) {
        setNotes(JSON.parse(jsonString));
      }
    } catch (e) {
      console.log('Gagal memuat:', e);
    }
  }

  // Muat counter
  async function muatCounter() {
    const nilai = await AsyncStorage.getItem(COUNTER_KEY);
    if (nilai != null) {
      setTotalDibuat(Number(nilai));
    }
  }

  // Naikkan counter
  async function naikkanCounter() {
    const baru = totalDibuat + 1;
    setTotalDibuat(baru);
    await AsyncStorage.setItem(COUNTER_KEY, baru.toString());
  }

  // Load data saat aplikasi dibuka
  useEffect(() => {
    muatDariStorage();
    muatCounter();
  }, []);

  // Tambah catatan
  function tambahCatatan() {
    if (input.trim() === '') return;

    const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const catatanBaru = {
      id: Date.now().toString(),
      teks: input,
      selesai: false,
      kategori: 'Umum',
      waktu: tanggalSekarang,
    };

    const notesBaru = [catatanBaru, ...notes];

    setNotes(notesBaru);
    simpanKeStorage(notesBaru);
    naikkanCounter();
    setInput('');
  }

  // Hapus catatan
  function hapusCatatan(id) {
    const notesBaru = notes.filter((item) => item.id !== id);
    setNotes(notesBaru);
    simpanKeStorage(notesBaru);
  }

  // Toggle selesai
  function toggleSelesai(id) {
    const notesBaru = notes.map((item) =>
      item.id === id
        ? { ...item, selesai: !item.selesai }
        : item
    );

    setNotes(notesBaru);
    simpanKeStorage(notesBaru);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📝 NoteKeeper</Text>
      <Text style={styles.stat}>
        Total catatan dibuat: {totalDibuat}
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Tulis catatan baru..."
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={tambahCatatan}
        >
          <Text style={styles.addBtnText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Belum ada catatan. Tambahkan satu! ✍️
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => toggleSelesai(item.id)}
            >
              <View>
                <Text
                  style={[
                    styles.noteText,
                    item.selesai && styles.noteSelesai,
                  ]}
                >
                  {item.selesai ? '✅ ' : '⬜ '}
                  {item.teks}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.badgeKategori}>{item.kategori || 'Umum'}</Text>
                  <Text style={styles.waktuText}> • {item.waktu || 'Baru saja'}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => hapusCatatan(item.id)}
            >
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a2e0a',
    textAlign: 'center',
    marginBottom: 10,
  },

  stat: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
  },

  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },

  addBtn: {
    backgroundColor: '#00b894',
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },

  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00b894',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  noteText: {
    fontSize: 15,
    color: '#0a2e0a',
    flex: 1,
    marginRight: 8,
  },

  noteSelesai: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },

  deleteBtn: {
    fontSize: 20,
  },

  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 14,
  },

  metaRow: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  badgeKategori: {
    backgroundColor: '#e0f7fa',
    color: '#00838f',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  waktuText: {
    fontSize: 11,
    color: '#999',
  },
});