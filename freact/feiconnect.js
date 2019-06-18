import {createElement, Component } from 'react';
import PropTypes from 'prop-types';


export default (mapStateToProps, mapDispatchToProps) => 
	Compo => {

		const childCompo = compo;

		class ConnectHOC extends Component {

			static contextTypes = {
	    	store: PropTypes.shape({subscribe: PropTypes.func.isRequired,dispatch: PropTypes.func.isRequired,getState: PropTypes.func.isRequired})
	  	};

	  	constructor(props,context){
	  		super(props,context)

	  		this.shouldUpdate = false;
	  		this.currentProps = {};  		
	  		this.stateProps = {};
	  		//this.justProps = props;
	  		this.state = {dummy:0};

	  		this.mount = false;

	  		this.store = this.context.store;

	  		
	  		Object.assign(this.currentProps,this.props);

	  		
	  		if(mapDispatchToProps){
	  			var actions = mapDispatchToProps(store.dispatch)
	  			Object.assign(this.currentProps,actions);
	  		}

				if(mapStateToProps){

		  		this.stateProps = mapStateToProps(store.getState());

		  		Object.assign(this.currentProps,this.stateProps);

		  		this.stateChanged = function() {


		  			//if(this.mount){
		  			this.shouldUpdate = false;

		  			var newProps = mapStateToProps(store.getState());

		  			console.log("state",newProps);
		  			
		  			for (var i in newProps) {
		  				if(newProps[i] !== this.stateProps[i]){
		  					this.shouldUpdate = true;
		  					break;
		  				}
		  			}


		  			if(this.shouldUpdate){
		  				this.stateProps = newProps;
		  				Object.assign(this.currentProps,this.stateProps);
		  				console.log("update current",this.currentProps)
		  				this.setState({dummy:this.state.dummy + 1});
		  			}
		  			//}
		  				
		  		}

	  		}

	  	}

	  	componentRecievedProps(newProps){
	  		//
	  	}
			componentDidMount() {
				console.log("componentDidMount")
				this.unsubscribe = this.store.subscribe(this.stateChanged.bind(this));
		  }

		  componentWillUnmount() {
		  	console.log("componentWillUnmount")
		  	this.unsubscribe();
		  }

	  	shouldComponentUpdate(props){
	  		
	  		for (var i in props) {
		  				if(props[i] !== this.justProps[i]){
		  					this.shouldUpdate = true;
		  					this.justProps = props;
		  					break;
		  				}
		  	}

		  	if(this.shouldUpdate)
		  		Object.assign(this.currentProps,this.justProps);
		  			
				//console.log("connect s",props,this.shouldUpdate)
	  		return this.shouldUpdate;
	  	}

			render(){
				let result = this.currentProps;
				return (<Compo {...result}/>)
				//createElement(childCompo,this.currentProps); 				
			}
				
		} 

		return ConnectHOC;
	};
