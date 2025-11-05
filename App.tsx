import React, { useState } from 'react';

import { StatusBar } from 'expo-status-bar';

import { Button, Image, View, StyleSheet, Alert } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { Camera } from 'expo-camera';

import { storage } from './src/firebaseConfig';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default function App() {

 const [imageUri, setImageUri] = useState<string | null>(null);
 const [isupload, setisUpload] = useState(false);


 const escolherImagemDaGaleria = async () => {

   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

   if (status !== 'granted') {

     Alert.alert('Permissão necessária', 'Precisamos da sua permissão para acessar a galeria.');

     return;

   }


   const result = await ImagePicker.launchImageLibraryAsync({

     mediaTypes: ImagePicker.MediaTypeOptions.Images,

     allowsEditing: true, //pode editar a imagem selecionada

     aspect: [4, 3], //formato da imagem

     quality: 1, //entre 0 e 1, onde 1 é o melhor

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
  if(!imageUri){
    Alert.alert("Nenhuma imagem selecionada!", "Selecione uma imagem");
    return
  }
  setisUpload(true);
  try{
    //conversão de imagem uri para blob
    const resposta = await fetch(imageUri);
    const blob = await resposta.blob();
    //definir referência para o arquivo
    const nomeArq = `${Date.now()}.jpg`
    const storageRef = ref(storage, 'images/'+nomeArq);

    console.log('Destino: ' + `images/${nomeArq}`)
    await uploadBytes(storageRef, blob);
    Alert.alert('upload ok')
    const download = await getDownloadURL(storageRef);

  }catch(error){
    console.log("ERRO: " + error);
    Alert.alert("Erro no upload")
  }finally{
    setisUpload(false);
    setImageUri(null);
  }
 }



 return (

   <View style={styles.container}>

     <Button title="Escolher Imagem da Galeria" onPress={escolherImagemDaGaleria} />

     <View style={{ height: 10 }} />

     <Button title="Tirar Foto com a Câmera" onPress={tirarFoto} />


     {/* Exibe a imagem apenas se uma URI estiver definida */}

     {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
     <Button
      title={isupload ?
        "Enviando..." : "Enviar para Storage"}
        onPress={uploadImagem}
        disabled={!imageUri || isupload}
        
     />
     <StatusBar style='auto'/>

   </View>

 );

}


const styles = StyleSheet.create({

 container: {

   flex: 1,

   alignItems: 'center',

   justifyContent: 'center',

   padding: 20,

   backgroundColor: '#fff',

 },

 image: {

   width: 300,

   height: 300,

   marginTop: 20,

   borderRadius: 10,

 },

});