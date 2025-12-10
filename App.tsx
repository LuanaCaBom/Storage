import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, Alert, Text, FlatList, SafeAreaView, ActivityIndicator, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage, db } from './src/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";

//atividade01
//Grupo: Aline e Luana

export default function App() {

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gallery, setGallery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [legenda, setLegenda] = useState("");

  // Efeito que carrega as imagens da galeria ao iniciar o app
 
  useEffect(() => {
    listarImagens();
  }, []);

  const listarImagens = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "atividade01"));
      const consulta = onSnapshot(q, (snapshot) => {
        const listaAux: any[] = [];
          snapshot.forEach((doc) => {
            //console.log(doc.id, doc.data)
            listaAux.push({id: doc.id, ...doc.data() })
          })
        //console.log(listaAux);
        setGallery(listaAux);
      })
      //console.log(gallery)
    } catch (error) {
      console.error("Erro ao listar imagens: ", error);
      Alert.alert("Erro", "Não foi possível carregar a galeria de imagens.");
    } finally {
      setIsLoading(false);
    }
  };

  const escolherImagemDaGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da sua permissão para acessar a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /* para tirar foto direto no app
  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da sua permissão para acessar a câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }
  */
  
  const uploadImagem = async () => {
    
    if (imageUri.trim() === "" && legenda.trim() === "") {
      Alert.alert("Nenhuma imagem selecionada", "Por favor, escolha uma imagem primeiro.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const nomeArquivo = `${Date.now()}.jpg`;
      const storageRef = ref(storage, 'atividade01/' + nomeArquivo);
      //console.log("Tentando upload para:", `images1/${nomeArquivo}`);
      //console.log("Blob size:", blob.size, "type:", blob.type);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      //console.log('Arquivo disponível em', downloadURL);
      Alert.alert("Upload concluído!", "Sua imagem foi enviada com sucesso!");
      // Após o upload, atualiza a galeria para incluir a nova imagem
      listarImagens();
      await addDoc(collection(db, "atividade01"), {
        url: downloadURL,
        legenda: legenda,
      });    
      
    } catch (error) {
      console.error("Erro no upload: ", error);
      Alert.alert("Erro no Upload", "Ocorreu um erro ao enviar sua imagem.");

    } finally {
      setIsUploading(false);
      setImageUri(null);
      setLegenda("");
    }
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === "ios" ? "padding" : 'height'}
      >
        <Text style={styles.title}>Galeria do Firebase</Text>    
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={gallery}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.meio}>
                <Image source={{ uri: item.url }} style={styles.galleryImage} />
                <Text style={styles.texto} >{item.legenda}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>Nenhuma imagem na galeria.</Text>}
          />
        )}

      <View style={styles.uploadSection}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
        <TextInput placeholder='📝 Insira uma legenda...' onChangeText={setLegenda} value={legenda} style={styles.input}/>
        <View style={styles.botoes}>
          <Pressable onPress={escolherImagemDaGaleria} style={styles.upload}>
            <Text style={styles.textoBotoes}>Escolher Imagem 📤</Text>
          </Pressable>
          <Pressable 
            onPress={uploadImagem} 
            disabled={!imageUri || isUploading || !legenda} 
            style={( {pressed }) => [
              styles.envio, 
              !imageUri || isUploading || !legenda ? styles.desabilitado : false
            ]}
          >
            <Text style={styles.textoBotoes}>{isUploading ? "Enviando..." : "Enviar Imagem 💾"}</Text>
          </Pressable>
        </View>

      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>

  );
}



const styles = StyleSheet.create({
container: {
   flex: 1,
   paddingTop: 40,
   paddingBottom: 80,
   backgroundColor: '#ffffff',
 },

 meio: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#e1f1da',
 },

 title: {
   fontSize: 24,
   fontWeight: 'bold',
   textAlign: 'center',
   marginBottom: 20,
 },

 texto: {
  fontSize: 20,
  marginBottom: 15
 },

 botoes: {
  width: 330,
  flexDirection: 'row',
  justifyContent: 'space-between',
 },

 textoBotoes: {
  margin: 5
 },

 upload: {
  margin: 10,
  borderWidth: 1,
  borderColor: "black",
  borderRadius: 5,
  backgroundColor: '#e1f1da'
 },
 
 envio: {
  margin: 10,
  borderWidth: 1,
  borderColor: "black",
  borderRadius: 5,
  backgroundColor: '#e1f1da'
 },

 desabilitado: {
  margin: 10,
  borderWidth: 1,
  borderColor: "black",
  borderRadius: 5,
  backgroundColor: '#cfcfcf',
 },

 input:{
    width: 330,
    borderBottomWidth: 1,
    margin: 5
 },

 galleryImage: {
   width: 300,
   height: 300,
   margin: 5,
   marginTop: 15,
 },

 uploadSection: {
   padding: 5,
   borderTopWidth: 1,
   borderTopColor: '#ccc',
   alignItems: 'center',
 },

 previewImage: {
   width: 100,
   height: 100,
   borderRadius: 10,
   marginBottom: 10,
 }

});