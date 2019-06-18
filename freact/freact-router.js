import React, { Component } from "react";
import { createBrowserHistory } from "history";


const RouterContext = React.createContext({})

export class Router extends Component {

	constructor(props){
		super(props)
		var history = createBrowserHistory();
		// Get the current location.
		var location = history.location;
		var match = {};
		this.state = {history,location,match}

		history.listen((location, action) => {
			console.log("history changed",location, action)
			var self = this;
			setTimeout(function(){
  			self.setState({location:location});
			},0);
		});
	}

	render(){
		var {children} = this.props
		return (
			<RouterContext.Provider value={this.state}>
				{children}
			</RouterContext.Provider>
			)
	}
}

export class Route extends Component{
	render(){
		return (
			<RouterContext.Consumer>
    		{context => {
    			var {location} = context;
    			var {path,component:Component,exact,render} = this.props;
    			//console.log("route",path,location.pathname);
    			return (exact ? location.pathname == path : location.pathname.indexOf(path) == 0) 
    							? (render ? render(context) : (<Component {...context}/>)) : null;
    		}}
    	</RouterContext.Consumer>
    )
	}
}

export function withRouter(Component) {
  
    return props => {
    	return (
    	<RouterContext.Consumer>
    		{context =>(
    			<Component {...{...context,...props}}/>
    		)}
    	</RouterContext.Consumer>
      
      )
    }
}

export class Link extends Component {
  render(){
    var { to,children } = this.props
    return (
    	<RouterContext.Consumer>
    		{context =>(
    			<a href="/" onClick={e =>{e.preventDefault();context.history.push(to)}}>{children}</a>
    		)}
    	</RouterContext.Consumer>
      
      )
  }
}


export class Redirect extends Component {
	 render(){
    var { to } = this.props

    return (
    	<RouterContext.Consumer>
    		{context => {
    			
    			if(typeof(to) == 'string')
						context.history.replace(to);
					else {
						var {state,pathname } = to;
						context.history.replace(pathname,state);		
					}
					return null;
    		}}
    	</RouterContext.Consumer>
      
      )
  }
}
