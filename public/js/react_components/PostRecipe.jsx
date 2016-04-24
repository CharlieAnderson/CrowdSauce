var Panel = ReactBootstrap.Panel,
PanelGroup = ReactBootstrap.PanelGroup,
Input = ReactBootstrap.Input,
ButtonInput = ReactBootstrap.ButtonInput,
Pagination = ReactBootstrap.Pagination,
Modal = ReactBootstrap.Modal,
Button = ReactBootstrap.Button,
FormGroup = ReactBootstrap.FormGroup,
Radio = ReactBootstrap.Radio

var fbDetails = getFacebookDetails();


var PostRecipe = React.createClass({
    getInitialState: function(){
        return {activeKey: 1, title:'', link: ' ',
         description: '', ings: [], directions: [],
         imgsrc:[], imgtext: '', imgitems: [], activePage: 1, 
         difficulty: 'Easy', prepTime: '30 Min',
         items: [], tags: [], text: '', showModal: false};
    },


	close() {
	this.setState({ showModal: false });
	},

	open() {
	this.setState({ showModal: true });
	},

	hide: function() {
	this.setState({ showModal: false });
	},

    handleTitleChange: function(e){
      this.setState({title: e.target.value});
  	},    
    handlePanelSelect(activeKey) {
    	this.setState({ activeKey });
  	},
  	handleDescChange: function(e) {
	  this.setState({description: e.target.value});
	},
	handlePrepChange: function(e) {
	  this.setState({prepTime: e.target.value});
	},
	handleDiffChange: function(e) {
	  this.setState({difficulty: e.target.value});
	},
	handleLinkChange: function(e) {
	  this.setState({link: e.target.value});
	},
	onIngredientsChange: function(e) {
      this.setState({ings: this.state.ings.concat(e)});
    },
    onDirectionsChange: function(e) {
      this.setState({directions: this.state.directions.concat(e)});
    },
    handleRatingSelect: function(e, sel) {
      this.setState({
        activePage: sel.eventKey
      });
    }, 
    createItem: function(item) {
      return <span><img className="postrecipe-images"src={item.text}> </img></span>;
    },
    onChange: function(e) {
      this.setState({text: e.target.value});
    },
    onImgChange: function(e) {
      this.setState({imgtext: e.target.value});
    },
    addTags: function(e) {
		e.preventDefault();
		var nextItems = this.state.items.concat([{text: this.state.text, id: Date.now()}]);
		var nextTags = this.state.tags.concat(this.state.text)
		this.setState({items: nextItems, text: '', tags: nextTags});
    },
    addImgs: function(e) {
		e.preventDefault();
		var nextItems = this.state.imgitems.concat([{text: this.state.imgtext, id: Date.now()}]);
		var nextTags = this.state.imgsrc.concat(this.state.imgtext)
		this.setState({imgitems: nextItems, imgtext: '', imgsrc: nextTags});
    },
    getFBInfo: function() {
      return getFacebookDetails().then(function(d){return d})
    },
    handleSubmit: function(){
		if(this.state.activeKey == 1){
			this.handleLinkSubmit();
			this.close();
		} else {
			this.handlePostSubmit();
		    this.close();
		}
    },
	handleLinkSubmit: function() {
		console.log("LINK SUBMIT")
		var link = this.state.link.trim();
		var data = {
		  recipeLink: this.state.link,
		  title: this.state.title,
		  images: this.state.imgsrc,
		  notes: this.state.description,
		  rating: this.state.activePage,
		  difficulty: this.state.difficulty,
		  prepTime: this.state.prepTime
		};
		
		var heads = {
            'userid': fbDetails['fbUserID'],
            'accesstoken': fbDetails['fbAccessToken']
		};
		
		var url = 'http://localhost:3000/api/posts/';
		jQuery.ajax({
		  url: url,
		  dataType: 'json',
		  type: 'POST',
		  data: data,
		  headers: heads,
		  success: function(responsedata) {
		    console.log(responsedata)
		    this.associatePostToTags(responsedata['postId'])
		  }.bind(this),
		  error: function(xhr, status, err) {
		    console.log(err.toString());
		  }.bind(this)
		});
	  },
	handlePostSubmit: function() {
		console.log("POST SUBMIT")
		var data = {
		  ingredients: this.state.ings,
		  title: this.state.title,
		  directions: this.state.directions,
		  images: this.state.imgsrc,
		  notes: this.state.description,
		  rating: this.state.activePage,
		  difficulty: this.state.difficulty,
		  prepTime: this.state.prepTime
		};		
		
		var heads = {
            'userid': fbDetails['fbUserID'],
            'accesstoken': fbDetails['fbAccessToken']
		};
		
		var url = 'http://localhost:3000/api/posts/';
		jQuery.ajax({
		  url: url,
		  dataType: 'json',
		  type: 'POST',
		  data: data,
		  headers: heads,
		  success: function(responsedata) {
		    console.log(responsedata)
		    this.associatePostToTags(responsedata.postId)
		  }.bind(this),
		  error: function(xhr, status, err) {
		    console.log(err.toString());
		  }.bind(this)
		});
	  },
	associatePostToTags: function(postId) {
		console.log("TODO" + postId)
		console.log(this.state.items)
		for (t in this.state.items){
			tagName = this.state.items[t].text
			if (tagName) {
				console.log(tagName)
				// make tag names lower case
				tagName = tagName.toLowerCase(tagName)
				
				var heads = {
		            'userid': fbDetails['fbUserID'],
		            'accesstoken': fbDetails['fbAccessToken']
				};
				
				var data = {
					postId: postId,
					tagName: tagName
				};
				
				jQuery.ajax({
				  url: 'http://localhost:3000/api/tags',
				  dataType: 'json',
				  type: 'POST',
				  data: data,
				  headers: heads,
				  success: function(responsedata) {
				    console.log("Full Success for tag " + tagName)
				  }.bind(this),
				  error: function(xhr, status, err) {
				    console.log(err.toString());
				  }.bind(this)
				});
			}
		}
	},
    render: function() {
        return (  
        <div>
  		<button className="post_fab" onClick={this.open}> 
  			+
        </button>

	    <Modal show={this.state.showModal} onHide={this.close}>
	      <Modal.Header closeButton>
	      	<Modal.Title>Add a Recipe</Modal.Title>
	      </Modal.Header>
	      <Modal.Body>

	        <Input
			  type="text"
			  label="Title"
			  placeholder="Mom's Spaghetti"
			  labelClassName="col-xs-2"
			  wrapperClassName="col-xs-15"
			  bsStyle={this.state.title.length > 0 ? 'success' : 'error'}
			  value={this.state.title}
			  onChange={this.handleTitleChange}
			>
			</Input>
			<h3>Images</h3>
		    <ul>{this.state.imgitems.map(this.createItem)}</ul>
		    <input onChange={this.onImgChange} value={this.state.imgtext} />
		    <button onClick={this.addImgs} >{'Add'}</button>
		    <ul> </ul>
		    
			<PanelGroup activeKey={this.state.activeKey} onSelect={this.handlePanelSelect} accordion>
			    <Panel eventKey="1" header="Link to Recipe">
			    	<RecipeLinkForm handleLinkChange={this.handleLinkChange} />
		    	</Panel>
			    <Panel eventKey="2" header="Post the Recipe Yourself">
			    	<RecipeCustomForm onDirectionsChange={this.onDirectionsChange}
			    	                  onIngredientsChange={this.onIngredientsChange}/>
		    	</Panel>
		    </PanelGroup>
		    <Input
			  type="textarea"
			  label="Add a Description"
			  labelClassName="col-xs-2"
			  wrapperClassName="col-xs-15"
			  value={this.state.description}
			  onChange={this.handleDescChange}
			/>
			
			<Input
		      type="text"
		      label="Preparation Time"
		      labelClassName="col-xs-2"
		      wrapperClassName="col-xs-15"
		      value={this.state.prepTime}
		      onChange={this.handlePrepChange}/>
		      
		    <Input
		      type="text"
		      label="Difficulty"
		      labelClassName="col-xs-2"
		      wrapperClassName="col-xs-15"
		      value={this.state.difficulty}
		      onChange={this.handleDiffChange}/>
			
			<h3>Rating:</h3>
			<Pagination
		      bsSize="large"
		      items={5}
		      activePage={this.state.activePage}
		      onSelect={this.handleRatingSelect} />
		    <h3>Tags</h3>
		    <ul>{this.state.items.map(this.createItem)}</ul>
		    <input onChange={this.onChange} value={this.state.text} />
		    <button onClick={this.addTags} >{'Add #' + (this.state.items.length + 1)}</button>
		
       		</Modal.Body>

       		<Modal.Footer>
       			<ButtonInput onClick={this.handleSubmit} type="submit" value="Post" bsStyle="success" bsSize="large" />
       		</Modal.Footer>
		    </Modal>
        </div>);
    }
});

var RecipeCustomForm = React.createClass({
  getInitialState: function() {
    return {ings: [], dirs: [], ingstext: '', dirstext: ''};
  },
  createItem: function(item) {
      return <li key={item.id}>{item.text}</li>;
  },
  onIngsChange: function(e) {
      this.setState({ingstext: e.target.value});
  },
  onDirsChange: function(e) {
      this.setState({dirstext: e.target.value});
  },
  addIngs: function(e) {
		e.preventDefault();
		var nextItems = this.state.ings.concat([{text: this.state.ingstext, id: Date.now()}]);
		this.props.onIngredientsChange(this.state.ingstext);
		this.setState({ings: nextItems, ingstext: ''});		
  },
  addDirs: function(e) {
		e.preventDefault();
		var nextItems = this.state.dirs.concat([{text: this.state.dirstext, id: Date.now()}]);
		this.props.onDirectionsChange(this.state.dirstext);
		this.setState({dirs: nextItems, dirstext: ''});
  },
  render: function () {
    return (
      <div>
      <h3>Ingredients</h3>
		    <ul>{this.state.ings.map(this.createItem)}</ul>
		    <input onChange={this.onIngsChange} value={this.state.ingstext} />
		    <button onClick={this.addIngs} >{'Add #' + (this.state.ings.length + 1)}</button>
      <h3>Directions</h3>
		    <ul>{this.state.dirs.map(this.createItem)}</ul>
		    <input onChange={this.onDirsChange} value={this.state.dirstext} />
		    <button onClick={this.addDirs} >{'Add #' + (this.state.dirs.length + 1)}</button>
      </div>
    );
  }
});

var RecipeLinkForm = React.createClass({
  getInitialState: function() {
    return {link: ''};
  },
  handleLinkChange: function(e) {
    this.setState({link: e.target.value});
    this.props.handleLinkChange(e);
  },
  render: function () {
    return (
        <Input
          type="text"
          label="Link"
          placeholder="http://allrecipes.com/..."
          labelClassName="col-xs-2"
          wrapperClassName="col-xs-15"
          bsStyle={this.state.link.length > 0 ? 'success' : 'error'}
          value={this.state.link}
          onChange={this.handleLinkChange}/>
    );
  }
});

// render postrecipe in FeedController
// ReactDOM.render(<PostRecipe/>, content);
