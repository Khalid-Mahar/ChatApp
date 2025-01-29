// import storage from '@react-native-firebase/storage';
// export default uploadImage = async collectionName => {
//   try {
//     const name = userImg.substring(userImg.lastIndexOf('/') + 1);
//     const reference = storage().ref(`${collectionName}/${name}`);
//     const responce = await fetch(userImg);
//     const blobImage = await responce.blob();
//     setLoading(true);
//     const task = await reference.put(blobImage);
//     const downloadURL = await reference.getDownloadURL();
//     return downloadURL;
//   } catch (error) {
//     console.log('========ERROR IN UPLOAD THE FILES======', error);
//   }
// };

// import {createClient} from '@supabase/supabase-js';
// import {Buffer} from 'buffer';
// const supabaseUrl = 'https://mnpvuzqzvhnhgtabiyet.supabase.co';
// const supabaseKey =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucHZ1enF6dmhuaGd0YWJpeWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2Mzc3NTMsImV4cCI6MjA0ODIxMzc1M30.0QGeMOY2LiN3R92iOEs_1UAqZYZFI7Cx31KnHTleTXs';
// const supabase = createClient(supabaseUrl, supabaseKey);

// const uploadImage = async (bucketName, fileUri, imageType) => {
//   try {
//     // Get the original file name from the URI
//     const originalFileName = fileUri.substring(fileUri.lastIndexOf('/') + 1);

//     // Generate a timestamp to append to the file name
//     const timestamp = new Date().toISOString().replace(/[:.-]/g, '');

//     // Create a new file name by appending the timestamp
//     const fileName = `${timestamp}_${originalFileName}`;

//     // Fetch the file from the URI and get it as a Blob
//     const response = await fetch(fileUri);
//     const blob = await response.blob();

//     // Convert Blob to ArrayBuffer using FileReader
//     const arrayBuffer = await new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsArrayBuffer(blob);
//     });

//     // Upload the ArrayBuffer to Supabase
//     const {data, error} = await supabase.storage
//       .from(bucketName)
//       .upload(fileName, arrayBuffer, {
//         contentType: imageType,
//         upsert: true,
//       });

//     if (error) {
//       throw error;
//     }

//     // Get the public URL of the uploaded file
//     const {data: publicUrlData, error: publicUrlError} = supabase.storage
//       .from(bucketName)
//       .getPublicUrl(fileName);

//     if (publicUrlError) {
//       throw publicUrlError;
//     }

//     console.log('File uploaded successfully:', publicUrlData.publicUrl);
//     return publicUrlData.publicUrl;
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     throw error;
//   }
// };

// export default uploadImage;

import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://mnpvuzqzvhnhgtabiyet.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucHZ1enF6dmhuaGd0YWJpeWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2Mzc3NTMsImV4cCI6MjA0ODIxMzc1M30.0QGeMOY2LiN3R92iOEs_1UAqZYZFI7Cx31KnHTleTXs';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sanitize file names
const sanitizeFileName = fileName => {
  return fileName
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace invalid characters with underscores
    .toLowerCase(); // Optionally, convert to lowercase
};

// Helper function to limit file name length
const limitFileNameLength = (fileName, maxLength = 100) => {
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  const baseName = fileName
    .substring(0, fileName.lastIndexOf('.'))
    .slice(0, maxLength - extension.length);
  return `${baseName}${extension}`;
};

// Upload media function
const uploadImage = async (bucketName, fileUri, mimeType) => {
  try {
    // Extract the original file name
    const originalFileName = fileUri.substring(fileUri.lastIndexOf('/') + 1);

    // Sanitize and limit the file name
    const sanitizedFileName = sanitizeFileName(originalFileName);
    const safeFileName = limitFileNameLength(sanitizedFileName);

    // Add a timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    const fileName = `${timestamp}_${safeFileName}`;

    // Fetch the file as a Blob
    const response = await fetch(fileUri);
    if (!response.ok)
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    const blob = await response.blob();

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Upload the file to Supabase
    const {data, error} = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;

    // Generate the public URL for the uploaded file
    const {data: publicUrlData, error: publicUrlError} = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (publicUrlError) throw publicUrlError;

    console.log('File uploaded successfully:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export default uploadImage;
