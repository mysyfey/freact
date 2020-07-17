
class Component {

    constructor(props){
        this.props = props;
    }

    // state

    setState(state){
        if(!this.state)
            this.state = {};
        //this.state = {...this.state, ...state};
        this.stateChanged(state);
    }

    setStateChanged(subscriber){
        this.stateChanged = subscriber;
    }

    // lifecycle


    componentWillMount(){
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    shouldComponentUpdate(props,state){
        //console.log("shouldComponentUpdate ",this.constructor.name)
        for(var i in state)
          if(state[i] != this.state[i])
            return true;
        for(var i in props)
          if(props[i] != this.props[i])
            return true;
        return false;
    }

    componentWillUpdate(){
        //console.log("Component componentWillUpdate")
    }

    componentDidUpdate(){
        //console.log("Component componentDidUpdate")
    }
}

class Element{

    constructor(el,props,...rest) {

      var children = rest && rest.length == 1 && Array.isArray(rest[0]) ? rest[0] : rest
      this.type = el;
      if(typeof(el) == 'string'){
          this.children = children;
          this.props = props;
          this.html = true;
      } else {
          function couldBeClass(obj) {
              if (typeof obj != "function") return false;

              var str = obj.toString();

              // async function or arrow function
              if (obj.prototype === undefined) return false;
              // generator function or malformed definition
              if (obj.prototype.constructor !== obj) return false;
               // ES6 class
              if (str.slice(0, 5) == "class") return true;
              // has own prototype properties
              if (Object.getOwnPropertyNames(obj.prototype).length >= 2) return true;
              // anonymous function
              if (/^function\s+\(|^function\s+anonymous\(/.test(str)) return false;

              return false;
          }

          this.name = el.name;
          this.props = {...props,"children":children.length == 1 ? children[0] : children};
          if(couldBeClass(el,true))
            this.component = true;
          else
            this.children = [this.type(this.props)]

      }
    }

    _checkEvent(i){
      /*return i == "onabort"
      || i == "onblur"
      || i == "onchange"
      || i == "onclick"
      || i == "ondblclick"
      || i == "onerror"
      || i == "onfocus"
      || i == "onkeyddown"
      || i == "onkeypress"
      || i == "onkeyup"
      || i == "onload"
      || i == "onmousedown"
      || i == "onmouseout"
      || i == "onmouseover"
      || i == "onmouseup"
      || i == "onreset"
      || i == "onresize"
      || i == "onselect"
      || i == "onsubmit"
      || i == "onunload";*/

      return i == "onAbort"
        || i == "onBlur"
        || i == "onChange"
        || i == "onClick"
        || i == "onDblClick"
        || i == "onError"
        || i == "onFocus"
        || i == "onKeyDdown"
        || i == "onKeyPress"
        || i == "onKeyUp"
        || i == "onLoad"
        || i == "onMouseDown"
        || i == "onMouseOut"
        || i == "onMouseOver"
        || i == "onMouseUp"
        || i == "onReset"
        || i == "onResize"
        || i == "onSelect"
        || i == "onSubmit"
        || i == "onUnload";

    }

    render(parentNode){
      var tomounts = [];
      var ret = this._render(parentNode,tomounts);
      for (var i = tomounts.length -1; i >-1 ; i--) {
        tomounts[i]()
      }
    }

    _render(parentNode,tomounts){

        var self = this;
        function renderChild(child){
          if(child instanceof Element){
            var cnode = child._render(self.node,tomounts)
            if(cnode)
              self.node = cnode
          } else if(typeof(child) == "string"){
            self.node.appendChild(document.createTextNode(child))
          } else
            throw "ERROR! Element's child can't be of type: "+ typeof(child)
        }



        if(!this.html){
          this.node = parentNode;
          if(this.component) {
            this.component = new this.type(this.props)
            this.children = [this.component.render()];
            this.component.setStateChanged(this.updateDom.bind(this));

            this.component.componentWillMount();
            tomounts.push(()=>{
              this.component.componentDidMount()
            })
          }

          renderChild(this.children[0])
        } else {

          this.node = document.createElement(this.type)


          for (var i in this.props) {
              //if(i == "onClick")
              //    this.node.onclick = this.props[i];
              if(this._checkEvent(i))
                this.node[i.toLowerCase()] = this.props[i];
              else if(i == "ref")
                this.props[i].current = this.node;
              else
                  this.node.setAttribute(i,this.props[i]);
          }

          for(var child of this.children)
              renderChild(child)

              if(parentNode)
                parentNode.appendChild(this.node)
        }

        if(!parentNode) return this.node;
    }

    updateDom(state){
        if(this.component.shouldComponentUpdate(this.component.props,state)){
            this.component.state = {...this.component.state,...state}
            var child = this.component.render();
            this.component.componentWillUpdate()
            this.children[0]._updateDom(child, this,0)
            this.component.componentDidUpdate()
        }
    }

    _updateDom(updated,parentEl,index){

        //three diff rules: type, attr, children

            // check type
            if(this.type != updated.type){

                //it's a completely different type of element, replace node now!
                parentEl.replaceNode(updated,index);

            }else{

                var newChildren = updated.children;

                if(this.component){

                    if(!this.component.shouldComponentUpdate(updated.props,this.component.state))
                        return;

                    this.component.props = updated.props;
                    newChildren = [this.component.render()];

                    this.component.componentWillUpdate();
                }

                //check attr

                if(!updated.component){
                    for (var i in updated.props) {
                        if(this._checkEvent(i))
                            this.node[i.toLowerCase()] = updated.props[i];
                        else if(i == "ref")
                            updated.props[i].current = this.node;
                        else if(this.props[i]){
                            if(this.props[i] != updated.props[i]){
                                this.node.setAttribute(i,updated.props[i]);
                            }
                        } else {
                            this.node.removeAttribute(this.props[i]);
                            this.node.setAttribute(i,updated.props[i]);
                        }
                    }
                }

                //check children

                for (var i = 0; i < newChildren.length; i++) {

                     var child = this.children[i], newChild=newChildren[i];

                     if(newChild instanceof Element){

                        if(!child){

                            // the updated has more children than the old, append new node
                            var tomounts = [];
                            this.node.appendChild(newChild._render(null,tomounts))
                            this.children[i] = newChild;

                            for (var i = tomounts.length -1; i >-1 ; i--)
                              tomounts[i]()

                        } else if(typeof(child) == "string"){

                            // old child is string while the updated isn't,  just replace
                            this.replaceNode(newChild,i)
                        } else{
                            child._updateDom(newChild, this, i);
                        }

                     } else if (typeof(newChild) == "string" && newChild != child){

                        // updated child is a string, this is easy, just create or replace a text node

                        this.children[i] = newChild;
                        if(!child){
                            this.node.appendChild(document.createTextNode(newChild));
                        } else if(newChild != child){
                            if(child.component)
                              child.component.componentWillUnmount();
                            this.node.replaceChild(document.createTextNode(newChild),this.node.childNodes[i]);
                        }
                     }
                }

                //remove excess children

                if(newChildren.length < this.children.length){
                  const len = this.children.length
                  for(var i = newChildren.length; i < len; i++){
                    if(this.children[i].component)
                        this.children[i].component.componentWillUnmount();

                    this.node.removeChild(this.node.childNodes[newChildren.length])
                  }
                  this.children = this.children.slice(0,newChildren.length)
                }

                if(this.component)
                    this.component.componentDidUpdate();
            }
    }

    replaceNode(newEl,index){
        var tomounts = [];
        var newNode = newEl._render(null,tomounts)
        //if the node that's going to be replaced is a Component, we should call componentWillUnmount first;
        if(this.children[index].component)
            this.children[index].component.componentWillUnmount();

        this.children[index] = newEl;
        this.node.replaceChild(newNode,this.node.childNodes[index])

        for (var i = tomounts.length -1; i >-1 ; i--)
          tomounts[i]()
    }
}

function createElement(el, props, ...rest){

    return new Element(el,props,...rest);
}

function cloneElement(element, props, children){
    return createElement(element.type, {...{...element.props, ...props}},children ? children : element.children)
    /*return (<element.type  {...{...element.props, ...props}} >
        {
            children ? children : element.children
        }
    </element.type>);*/
}

function renderDOM(element, root){

    element.render(root);
}

function createRef(){
    return {current:null};
}

export default {createElement,
                createRef,
                cloneElement,
                renderDOM,
                Component}
