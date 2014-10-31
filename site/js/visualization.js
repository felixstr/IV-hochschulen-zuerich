Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

var options = {
	'width': 1280,
	'height': 680,
	'heightClosedMin': 10,
	'heightClosedIncrease': 10,
	'margin': 1
}

function IV_Highscool_Node() {
	this.container = null;
	this.width = null;
	this.height = null;
	
	this.itemName = '';
	this.idPrefix = '';
	
	this.margin = options.margin;
	this.heightClosed = options.heightClosedMin;
	this.heightActive = null;
	
	this.data = null;
	this.keys = null;
	this.currentKey = null;
	this.parentPrefix = null;
	
	this.totalStudents = null;
	
	this.child = {};
	
	this.visible = false;
	
	this.initialize = function() {
		var self = this;
		
		this.keys = Object.keys(this.data);
		
		this.totalStudents = this.keys.reduce(function(sum, current){
			return sum + parseInt(self.data[current].total);
		}, 0);
		
		this.idPrefix = this.itemName+'_';
		if (this.parentPrefix != null) {
			this.idPrefix = this.itemName+'_'+this.parentPrefix;
		}
		console.log(this.idPrefix);
	}
	
	this.update = function() {
		var heightBars = (this.keys.length-1) * this.heightClosed;
		var heightMargin = (this.keys.length-1) * this.margin;
		this.heightActive = this.height - heightBars - heightMargin;
	}

	
	this.addChild = function(key, object) {
		this.child[key] = object;
	}
	
	this.draw = function() {
		var self = this;
		console.log(this.itemName+ ' draw()');
		
		var selection = this.container
			.selectAll('g.bar_'+self.itemName);
		
		var yPos = 0;
		var group_bar = selection
			.data(this.keys);
		
		// UPDATE
		var update = group_bar;
		update
			.transition()
			.duration(1000)
			//.ease('sin')
			.attr('transform', function(key, i) { 
				
				var result = 'translate(0, '+yPos+')';
				if (self.currentKey == null) {
					var barHeight = self.getBarHeight(key);
					yPos += barHeight+self.margin;
				} else {
					if (key == self.currentKey) {
						yPos += self.heightActive+self.margin;
					} else {
						yPos += self.heightClosed+self.margin;
					}					
				}

				return result;
			})
			.attr('style', function() { return self.visible ? 'display: block' : 'display: none'; })
			.selectAll('rect.pice_'+self.itemName)
			.attr('height', function(key) {
				var result = self.getBarHeight(key);
				if (self.currentKey != null) {
					if (key == self.currentKey) { 
						result = self.heightActive;
					} else {
						result = self.heightClosed;
					}
				}
				
				return result;
			})
			.each('end', function(key, i) {
				if (Object.keys(self.child).length > 0) {
					if (key == self.keys[self.keys.length-1] && self.currentKey != null) {
						
						if (i == 0) {
							console.log('show child');
							var child = self.child[self.currentKey];
							child.visible = true;
							child.update();
							child.draw();
														
							d3.selectAll('#'+self.idPrefix+self.currentKey+' > rect')
								.attr('style', 'display: none');
						
						}
						
					}
				}
				
				
				
				
			});
			
		
		// ENTER
		var enter = group_bar
			.enter()
			.append('g')
			.attr('transform', function(key, i) { 
				var barHeight = self.getBarHeight(key);
				var result = 'translate(0, '+yPos+')';
				yPos += barHeight+self.margin;
				return result;
			})
			.classed('bar_'+self.itemName, true)
			.attr('id', function(key) { return self.idPrefix+key; })
			.attr('style', function() { return self.visible ? 'display: block' : 'display: none'; });
	
		
		// female
		enter
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('height', function(key) {
				return self.getBarHeight(key);
			})
			.attr('width', function(key) {
				return self.getFemaleBarWidth(key);
			})
			.classed('bar_female', true)
			.classed('pice_'+self.itemName, true)
			.on('mouseover', function(key) {
				console.log('hover');
				console.log('#'+self.idPrefix+key);
				// console.log(d3.select('#'+self.itemName+'_'+key+'_'+self.parentKey));
				d3.select('#'+self.idPrefix+key).classed('hover', true);
			})
			.on('mouseout', function(key) {
				d3.select('#'+self.idPrefix+key).classed('hover', false);
			})
			.on('click', function(key) { 
				self.currentKey = key;
				self.draw();
			});
		
		// male
		enter
			.append('rect')
			.attr('y', 0)
			.attr('x', function(key) {
				return self.getFemaleBarWidth(key);
			})
			.attr('height', function(key) {
				return self.getBarHeight(key);
			})
			.attr('width', function(key) {
				var stuff = self.data[key];
				var male = parseInt(stuff.male);
				return male.map(0, stuff.total, 0, self.width);
			})
			.classed('bar_male', true)
			.classed('pice_'+self.itemName, true)
			.on('mouseover', function(key) {
				d3.select('#'+self.idPrefix+key).classed('hover', true);
			})
			.on('mouseout', function(key) {
				d3.select('#'+self.idPrefix+key).classed('hover', false);
			})
			.on('click', function(key) { 
				self.currentKey = key;
				self.draw();
			});
		
		
		
		
		Object.keys(this.child).forEach(function(key) {
			// console.log(key);
			var child = self.child[key];
			child.container = d3.select('#'+self.idPrefix+key);
			child.width = self.width;
			child.height = self.heightActive;
			child.heightClosed = self.heightClosed + options.heightClosedIncrease;
			child.update();
			child.draw();
		});
		
		
	}
	
	this.getFemaleBarWidth = function(key) {
		var stuff = this.data[key];
		var female = parseInt(stuff.female);
		return female.map(0, stuff.total, 0, this.width);
	}
	
	this.getBarHeight = function(key) {
		var stuff = this.data[key];
		
		var total = parseInt(stuff.total);
		var max = this.height-((this.keys.length-1)*this.margin);
		return total.map(0, this.totalStudents, 0, max);
	}
	
}

d3.json("data.json", function(data) {

	
	
	var canvas = d3.select('#graph')
		.attr('width', options.width)
		.attr('height', options.height);
		

	var yearObj = new IV_Highscool_Node();
	yearObj.visible = true;
	yearObj.container = canvas;
	yearObj.width = options.width;
	yearObj.height = options.height;
	yearObj.itemName = 'year';
	yearObj.data = data;
	yearObj.initialize();
	yearObj.update();
	
	
	Object.keys(data).forEach(function(year) {
		var schoolObj = new IV_Highscool_Node();
		schoolObj.itemName = 'school';
		schoolObj.parentPrefix = year+'_';
		schoolObj.data = data[year].schools;
		schoolObj.initialize();
		
		Object.keys(data[year].schools).forEach(function(school) {			
			var subjectObj = new IV_Highscool_Node();
			subjectObj.itemName = 'subject';
			subjectObj.parentPrefix = schoolObj.parentPrefix+school+'_';
			subjectObj.data = data[year].schools[school].subject;
			subjectObj.initialize();
			
			schoolObj.addChild(school, subjectObj);
		});
		
		yearObj.addChild(year, schoolObj);
	});
	
	
	
	
	yearObj.draw();
	
	
	

});