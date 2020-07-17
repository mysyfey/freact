import React from './../freact'
import Expandable from './../components/Expandable'

var Title = function(props) {
  return <h3>{props.children}</h3>
}

class Auth extends React.Component {
    constructor(props){
        super(props)
        this.state = {loggedIn : false}
        this.dRef = React.createRef();
    }

    login(){
        this.setState({loggedIn:true})
    }

    logout(){
        this.setState({loggedIn:false})
    }

    mouseOver(){
      this.dRef.current.style="background:blue"
    }

    mouseOut(){
      this.dRef.current.style="background:red"
    }

    render(){
        var {loggedIn} = this.state;
        var { to,children } = this.props

        return <div  ref={this.dRef} onMouseOver={(e)=>this.mouseOver(e)} onMouseOut={(e)=>this.mouseOut(e)}>
        {
          loggedIn ? (
            <div>
                <Title>Now You're LoggedIn. </Title>
                <p>Click button to</p>
                <button onClick={(e)=>this.logout(e)}>Signout</button>                
            </div>) : (
            <div>
                <Title>You Have to SignIn. </Title>
                <p>Click button to</p>
                <button onClick={(e)=>this.login(e)}>SignIn</button>
            </div>
          )
        }
        </div>
    }

};

class App extends React.Component{
    render(){
        return (
            <div>
                <h3>expandable</h3>
                <Expandable>
                    <Auth/>
                </Expandable>
            </div>
        )
    }
}


//window.onload = function(){
    var root = document.getElementById('root');
    React.renderDOM(<App/>,root);

//}
