import React, {Component} from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import ParticlesConfig from './Components/ParticlesConfig/ParticlesConfig';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Particles from 'react-particles-js';
import './App.css';

const initialState={
      input: '',
      imageUrl: '',
      box:{},
      route: 'signin',
      isSignedIn: false,
      user:{
        email: '',
        name: '',
        id: '',
        entries: 0,
        joined: ''
      }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState( {
        user: {
          email: data.email,
          name: data.name,
          id: data.id,
          entries: data.entries,
          joined: data.joined
      }
  })
  }

  calculateFaceLocation = (data) => {
    const box = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage')
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: box.left_col * width,
      topRow: box.top_row * height,
      rightCol: width - (box.right_col * width),
      bottomRow: height - (box.bottom_row * height)
    }
  }

  displayBox = (box) =>{
    this.setState({box: box})
  }


  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonDetect = () => {
      this.setState({imageUrl: this.state.input});
      fetch('http://localhost:3000/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            input: this.state.input 
        })
      })
      .then(response => response.json())
      .then(response => {    
        if (response)  {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id 
            })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count}))
        })
        .catch(err => console.log(err))
      }
        this.displayBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
    }

  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render(){
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles' 
          params={ParticlesConfig}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' ?
        <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onButtonDetect={this.onButtonDetect} />
          <FaceRecognition imageUrl={imageUrl} box={box} />
        </div>
          : ( route === 'signin' ?
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          :
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
