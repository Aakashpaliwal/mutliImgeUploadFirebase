
import './App.css';
import { useEffect, useState } from 'react';
import {

  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "./firebase";
import { Progress, Image, Col, Row } from 'antd';

function App() {
  const [files, setFiles] = useState([])
  const [imageUrl, setImageUrl] = useState([])
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const fileHandler = (e) => {
    console.log(e)
    console.log(typeof e.target.files)
    let data = []
    for (const key in e.target.files) {
      const file = e.target.files[key]
      data.push(file)
    }
    console.log(data)
    data.splice(data.length - 2, 2)
    console.log(data)
    setFiles(data)
  }

  const handleUploadFirebase = () => {
    let storage = getStorage(app)
    console.log(files)

    const promises = []
    files.map((file) => {
      console.log('loop');

      const sotrageRef = ref(storage, `files/${file.name}`);

      const uploadTask = uploadBytesResumable(sotrageRef, file);
      promises.push(uploadTask)
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setUploading(true)
          setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => console.log(64, error),
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((downloadURLs) => {
            setImageUrl(prevState => [...prevState, downloadURLs])
            console.log("File available at", downloadURLs);
          });
        }
      );


    })
    Promise.all(promises)
      .then(() => { alert('All images uploaded'); setUploading(false) })
      .then(err => console.log(77, err))

    // let storage = getStorage(app)
    // const storageRef = ref(storage, "my_new_image/" + `${files.name}`);
    // const uploadTask = uploadBytesResumable(storageRef, files);
    //   // Register three observers:
    // // 1. 'state_changed' observer, called any time the state changes
    // // 2. Error observer, called on failure
    // // 3. Completion observer, called on successful completion
    // uploadTask.on(
    //   "state_changed",
    //   (snapshot) => {
    //     // Observe state change events such as progress, pause, and resume
    //     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    //     const progress =
    //       (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //     console.log("Upload is " + progress + "% done");
    //     setProgress(progress);
    //     switch (snapshot.state) {
    //       case "paused":
    //         console.log("Upload is paused");
    //         break;
    //       case "running":
    //         console.log("Upload is running");
    //         break;
    //     }
    //   },
    //   (error) => {
    //     // Handle unsuccessful uploads
    //   },
    //   () => {
    //     // Handle successful uploads on complete
    //     // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
    //       console.log("File available at", downloadURL);
    //       setImageUrl(downloadURL);
    //     });
    //   }
    // );
  }

  useEffect(() => {
    console.log(files)
  }, [files])

  // useEffect(() => {
  //   console.log(progress)
  //   if (progress == '100') {
  //     setUploading(false)
  //   }
  // }, [progress])

  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <h4>Upload multiple images to firebase and preview them</h4>
      <hr />
      <input type='file' multiple onChange={(e) => { fileHandler(e) }} />
      <button onClick={handleUploadFirebase}>{uploading ? 'Uploading...' : 'Upload'}</button>
      <Progress percent={progress} />
      <br />
      <br />
      {/* <Divider orientation="bottom">sub-element align evenly</Divider> */}
      <Row justify="space-evenly">
        {
          imageUrl.map((item) => {
            return (
              <>
                <Col span={4}>
                  <Image
                    width={200}
                    src={item}
                  />
                </Col>
              </>
            )
          })
        }
      </Row>


    </div>
  );
}

export default App;
