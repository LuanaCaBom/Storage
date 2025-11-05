import React, { useState, useEffect } from 'react';

import { Button, Image, View, StyleSheet, Alert, Text, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { storage } from './src/firebaseConfig';

import { getDownloadURL, ref, uploadBytes, listAll } from "firebase/storage";



export default function App() {

 const [imageUri, setImageUri] = useState<string | null>(null);

 const [isUploading, setIsUploading] = useState(false);

 const [gallery, setGallery] = useState([]);

 const [isLoading, setIsLoading] = useState(true);


 // Efeito que carrega as imagens da galeria ao iniciar o app

 useEffect(() => {

   listarImagens();

 }, []);


 const listarImagens = async () => {

   setIsLoading(true);

   try {

     const listRef = ref(storage, 'images/');

     const res = await listAll(listRef);


     const urlPromises = res.items.map(itemRef => getDownloadURL(itemRef));


     const urls = await Promise.all(urlPromises);

     setGallery(urls);

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

 };


 const uploadImagem = async () => {

   if (!imageUri) {

     Alert.alert("Nenhuma imagem selecionada", "Por favor, escolha uma imagem primeiro.");

     return;

   }


   setIsUploading(true);


   try {

     const response = await fetch(imageUri);

     const blob = await response.blob();

     const nomeArquivo = `${Date.now()}.jpg`;

     const storageRef = ref(storage, 'images/' + nomeArquivo);

     console.log("Tentando upload para:", `images1/${nomeArquivo}`);

     console.log("Blob size:", blob.size, "type:", blob.type);

     const snapshot = await uploadBytes(storageRef, blob);

     const downloadURL = await getDownloadURL(snapshot.ref);

     console.log('Arquivo disponível em', downloadURL);


     Alert.alert("Upload concluído!", "Sua imagem foi enviada com sucesso!");

     // Após o upload, atualiza a galeria para incluir a nova imagem

     listarImagens();    

   } catch (error) {

     console.error("Erro no upload: ", error);

     Alert.alert("Erro no Upload", "Ocorreu um erro ao enviar sua imagem.");

   } finally {

     setIsUploading(false);

     setImageUri(null);

   }

 };


 return (

   <SafeAreaView style={styles.container}>

     <Text style={styles.title}>Galeria do Firebase</Text>    

     {isLoading ? (

       <ActivityIndicator size="large" color="#0000ff" />

     ) : (

       <FlatList

         data={gallery}

         keyExtractor={(item) => item}

         renderItem={({ item }) => (

           <Image source={{ uri: item }} style={styles.galleryImage} />

         )}

         numColumns={3}

         ListEmptyComponent={<Text>Nenhuma imagem na galeria.</Text>}

       />

     )}


     <View style={styles.uploadSection}>

       {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

       <Button title="Escolher Imagem" onPress={escolherImagemDaGaleria} />

       <Button

         title={isUploading ? "Enviando..." : "Enviar Imagem"}

         onPress={uploadImagem}

         disabled={!imageUri || isUploading}

       />

     </View>

   </SafeAreaView>

 );

}


const styles = StyleSheet.create({

container: {

   flex: 1,

   paddingTop: 40,

   paddingBottom: 80,

   backgroundColor: '#fff',

 },

 title: {

   fontSize: 24,

   fontWeight: 'bold',

   textAlign: 'center',

   marginBottom: 20,

 },

 galleryImage: {

   width: 120,

   height: 120,

   margin: 5,

 },

 uploadSection: {

   padding: 20,

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