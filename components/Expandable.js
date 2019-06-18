import React from './../freact/freact'
import CSSTransition from './MyCSSTransition'
//import {CSSTransition}  from 'react-transition-group'

/*const Expandable = ({children})=>{
	
	var [expand,setExpand] = useState(false)


	return (

			<div className="expandable">
			
				<CSSTransition 
					in={expand} 
					classNames="expand-content"
					timeout={1000}>
					<div className="expand-content">{children}</div>
				</CSSTransition>

				<div className="expand-button-section">
					<button onClick={()=>setExpand(!expand)} className="expand-section">{ expand ? "Hide" : "Expand"}</button>
				</div>
			</div>
		);
	
};*/

class Expandable extends React.Component{
	
	constructor(props){
		super(props)
		this.state = {expand:false}
	}

	render(){

		const {children} = this.props;
		const {expand}= this.state;

		return (

			<div class="expandable">
			
				<CSSTransition 
					in={expand} 
					classNames="expand-content"
					timeout={1000}>
					<div class="expand-content">{children}</div>
				</CSSTransition>

				<div class="expand-button-section">
					<button onClick={()=>this.setState({expand:!this.state.expand})} class="expand-section">
						{ expand ? "Hide" : "Expand"}
					</button>
				</div>
			</div>
		);
	}
};

export default Expandable