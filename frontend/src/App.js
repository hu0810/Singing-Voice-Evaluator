import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.scss';
import axios from 'axios';
import AudioPlayer from 'react-audio-element';
import styled from 'styled-components';




class App extends Component {

  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      previewAudioUrl: "default",
      audioPrediction: "",
      checkEmpty: true,
      fileName:"",

    }

    this.generatePreviewAudioUrl = this.generatePreviewAudioUrl.bind(this)
    this.handleUpload = this.handleUpload.bind(this)
    this.submitHandler = this.submitHandler.bind(this)
  }

    generateAlert = () => {
      alert("Hi");
    }
    generatePreviewAudioUrl(file, callback) {
      const reader = new FileReader()
      const url = reader.readAsDataURL(file)
      reader.onloadend = e => callback(reader.result)
    }
    // Event handler when audio is chosen
    handleUpload(event) {
      const file = event.target.files[0]
      
      // If the audio upload is cancelled
      if (!file) {
        return
      }


      this.setState({audioFile: file})
      this.generatePreviewAudioUrl(file, previewAudioUrl=> {
            this.setState({
              previewAudioUrl,
              imagePrediction:""
            })
          })
    }
    uploadfiles(){
      document.getElementById("uploadFile").click()
    }


    // Function for sending audio to the backend
    submitHandler(e) {

      var self = this;
      const formData = new FormData()


      if(this.state.audioFile !== undefined){
        console.log(this.state.audioFile)
        this.setState({checkEmpty: false})
        formData.append('file', this.state.audioFile, 'audio.wav')
        var t2 = performance.now();

        axios.post('http://127.0.0.1:5000/upload_wav', formData)
        .then(function(response, data) {
 
                data = response.data;
                self.setState({audioPrediction:data})
                var t3 = performance.now();
                console.log("The time it took to predict the audio " + (t3 - t2) + " milliseconds.")

            })
        this.setState({checkLoading:false})
      }
      else{
        if(this.state.checkEmpty === true){
          alert("Please upload a file first!");
        }
      }

    }
    submitfiles(){
      document.getElementById("submitFile").click()
    }


    transform(score){
      var result = (score + 1) * 5
      result = result.toFixed(2);
      return result
    }

  render() {
    var result;

    if (this.state.audioPrediction) {
      result = 
      <div className='result'>
        <div className="sign">
          <span className="fast-flicker">Your singing voi</span>ce sco<span className="flicker">re is &nbsp;</span>{this.transform(this.state.audioPrediction)}.
        </div>

      </div>;
    } else{
      result = 
      <div className='result'>
          <div className="sign">
          <span className="fast-flicker"> &nbsp;</span>
        </div>
      </div>;
    }


    return (
      <div className="App">
        <section>
          <div className="hero-container">
            <div className="environment"></div>
            <h2 className="hero glitch layers" data-text="Singing voice evaluator"><span>Singing voice evaluator</span></h2>
            <div className='Player'>
              { this.state.previewAudioUrl &&
              <AudioPlayer 

                style={{backgroundColor: "none"}}
                src={this.state.previewAudioUrl}
              />
              }
            </div>
            <div className='buttons'>
              <div onClick={this.uploadfiles.bind(this)} className="button3">
                  <span><div>U</div><div>P</div><div>L</div><div>O</div><div>A</div><div>D</div></span>
                  <input
                      type="file"
                      onChange={this.handleUpload}
                      style={{display:"none"}}
                      id="uploadFile"
              />
              </div>
              <div onClick={this.submitfiles.bind(this)} className="button4">
                <span><div>S</div><div>U</div><div>B</div><div>M</div><div>I</div><div>T</div></span>
                <input id="submitFile" type="submit" onClick={this.submitHandler} style={{display:"none"}}/>
              </div>
            </div>

            {/* Text for model prediction */}

            {result}

          </div>
 
        </section>
        <div className="App-upload">



          </div>
      </div>
    );
  }
}




export default App;