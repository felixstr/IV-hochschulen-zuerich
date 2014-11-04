Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

var currentMousePos = { x: -1, y: -1 };
$(document).mousemove(function(event) {
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
});

var options = {
	'width': 600,
	'height': 680,
	'heightClosedMin': 15,
	'heightClosedIncrease': 0,
	'heightBarMin': 25,
	'margin': 2,
	'marginClosed': 2, 
	'marginLevel': 0,
	'mouseDistanzeInfo': 50,
	'paddingTextWidth': 26,
	'paddingTextHeight': 5
}

var currentLevel = 0;

function IV_Highscool_Node() {
	this.container = null;
	this.width = null;
	this.height = null;
	
	this.itemName = '';
	this.idPrefix = '';
	
	this.margin = options.margin;
	this.marginClosed = options.marginClosed;
	this.marginLevel = options.marginLevel;
	this.heightClosed = options.heightClosedMin;
	this.heightActive = null;
	
	this.data = null;
	this.keys = null;
	this.currentKey = null;
	this.parentPrefix = null;
	
	this.totalStudents = null;
	
	this.child = {};
	
	this.visible = false;
	this.front = false;
	this.detail = false;
	
	this.barYPosition = {};
	this.absoluteYPos = 0;
	this.yPosStartChild = 0;
	this.barPositionTop = [];
	
	this.level = 0;
	
	
	this.initialize = function() {
		var self = this;
		
		this.keys = Object.keys(this.data).sort(function(a,b) { return b - a; }); // sort keys
		
		this.totalStudents = this.keys.reduce(function(sum, current){
			return sum + parseInt(self.data[current].total);
		}, 0);
		
		this.idPrefix = this.itemName+'_';
		if (this.parentPrefix != null) {
			this.idPrefix = this.itemName+'_'+this.parentPrefix;
		}
		// console.log(this.idPrefix);
	}
	
	this.update = function() {
		var heightBars = (this.keys.length-1) * this.heightClosed;
		var heightMargin = (this.keys.length-1) * this.marginClosed;
		this.heightActive = this.height - heightBars - heightMargin - (2*this.marginLevel);
		
		this.barPositionTop = [];
	}

	
	this.addChild = function(key, object) {
		this.child[key] = object;
	}
	
	this.draw = function() {
		var self = this;
		// console.log(this.itemName+ ' draw()');
		
		var selection = this.container
			.selectAll('g.bar_'+self.itemName);
		
		var yPos = this.marginLevel;
		var isTop = true;
				
		var group_bar = selection
			.data(this.keys);
		
		// UPDATE
		var update = group_bar;
		update
			.selectAll('rect.pice_'+self.itemName)
			.on('mouseover', function(key) { self.barMouseOver(key); })
			.on('mouseout', function(key) { self.barMouseOut(key);	});
			
		var updateTransition = update
			.transition()
			.duration(1000)
			.attr('transform', function(key, i) { 
				
				var result = 'translate(0, '+yPos+')';
				if (self.currentKey == null) {
					var barHeight = self.getBarHeight(key);
					yPos += barHeight+self.margin;
				} else {
					if (key == self.currentKey) {
						self.yPosStartChild = yPos;
						result = 'translate(0, '+yPos+')';
						yPos += self.heightActive+self.marginClosed;
						
						isTop = false;
					} else {
						yPos += self.heightClosed+self.marginClosed;
						
						if (isTop) {
							self.barPositionTop.push(key);
						}
					}					
				}

				return result;
			})
			.attr('style', function() { return self.visible ? 'display: block' : 'display: none'; })
			.each('start', function(key, i) {
				
				if (self.front && self.currentKey == null && Object.keys(self.child).length > 0) {
					if (self.child[key].visible) {
						
						self.child[key].visible = false;
						self.child[key].front = false;
						self.child[key].update();
						if (self.child[key].detail) {
							self.child[key].hideDetail();
						} else {
							self.child[key].draw();
						}
						
						$('body').attr('class', 'level_'+(self.level));
					}
					
				}
				
				if (key == self.keys[self.keys.length-1]) {
										
					if (self.front && self.currentKey == null) {
						d3.selectAll('.bar_'+self.itemName+' > rect')
							.attr('style', 'display: block');
						d3.selectAll('.bar_'+self.itemName+' > g.label')
							.attr('style', 'display: block');							
						
					}
					
				}
				
			})
			.each('end', function(key, i) {
				// console.log('end1');
				d3.selectAll('#'+self.idPrefix+key).classed('active', self.front);
				
				if (key == self.keys[self.keys.length-1]) {
					if (Object.keys(self.child).length > 0 && self.currentKey != null) {
	
						var child = self.child[self.currentKey];
						child.visible = true;
						child.front = true;
						child.absoluteYPos = self.absoluteYPos + self.yPosStartChild;
						child.update();
						if (child.detail) {
							child.showDetail();
						} else {
							child.draw();
						}
													
						d3.selectAll('#'+self.idPrefix+self.currentKey+' > rect')
							.attr('style', 'display: none');
							
						d3.selectAll('.bar_'+self.itemName+' > g.label')
							.attr('style', 'display: none');
							
						$('body').attr('class', 'level_'+(self.level+1));
					} 
					
					
					/*else if (self.detailData && self.currentKey != null) {
						self.drawDetail();
						
						d3.selectAll('#'+self.idPrefix+self.currentKey+' > rect')
							.attr('style', 'display: none');
						d3.selectAll('.bar_'+self.itemName+' > text')
							.attr('style', 'display: none');
					}*/
					
					
				}
			});
			
		updateTransition
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
			});
			
		updateTransition
			.select('g.label')
			.attr('transform', function(key) {

				
				var elementText = d3.select(this).select('text').node().getBBox();

				var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
				var yPos = (self.getBarHeight(key)/2)- (elementText.height/2) - (options.paddingTextHeight/2);
				
				if (self.currentKey != null && key == self.currentKey) { 
					yPos = self.heightActive / 2;
				}
				
				console.log(xPos);
				
				return 'translate('+xPos+', '+yPos+')';
				
			});
		
			
		
		// ENTER
		var enter = group_bar
			.enter()
			.append('g')
			.attr('transform', function(key, i) { 
				var barHeight = self.getBarHeight(key);
				self.barYPosition[key] = yPos;
				var result = 'translate(0, '+yPos+')';
				yPos += barHeight+self.margin;
				return result;
			})
			.classed('bar_'+self.itemName, true)
			.classed('active', self.front)
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
			.on('click', function(key) { self.barClick(key) })
			.on('mouseover', function(key) { self.barMouseOver(key) })
			.on('mouseout', function(key) { self.barMouseOut(key) });
		
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
			.on('click', function(key) { self.barClick(key); })
			.on('mouseover', function(key) { self.barMouseOver(key); })
			.on('mouseout', function(key) { self.barMouseOut(key); });
			
		// info female
		enter
			.append('text')
			.classed('info', true)
			.text(function(key) {
				return self.data[key].female_percent+'%';
			})
			.attr('x', 10)
			.attr('y', function(key) {
				// console.log(d3.select(this).node().getBBox().height);
				return self.getBarHeight(key)/2 + (d3.select(this).node().getBBox().height/2) -2;
			});
		enter
			.append('text')
			.classed('info', true)
			.text(function(key) {
				return self.data[key].male_percent+'%';
			})
			.attr('x', function(){
				return self.width - (d3.select(this).node().getBBox().width) - 10;
			})
			.attr('y', function(key) {
				// console.log(d3.select(this).node().getBBox().height);
				return self.getBarHeight(key)/2 + (d3.select(this).node().getBBox().height/2) -2;
			});
		
		
		// info male
			
		// label
		var enterLabelG = enter
			.append('g')
			.classed('label', true);
		var labelRect = enterLabelG
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('rx', 10)
			.attr('ry', 10)
			.on('click', function(key) { self.barClick(key); })
			.on('mouseover', function(key) { self.barMouseOver(key, yPos); })
			.on('mouseout', function(key) { self.barMouseOut(key); });
			
		var labelText = enterLabelG
			.append('text')
			.attr('x', options.paddingTextWidth/2)
			.attr('y', 13)
			.text(function(key) { return self.data[key].name; })
			.on('click', function(key) { self.barClick(key); })
			.on('mouseover', function(key) { self.barMouseOver(key, yPos); })
			.on('mouseout', function(key) { self.barMouseOut(key); });
		
		enter.selectAll('g')
			.attr('transform', function(key) {
				var elementText = d3.select(this).select('text').node().getBBox();

				var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
				var yPos = (self.getBarHeight(key)/2)- (elementText.height/2) - (options.paddingTextHeight/2);
								
				return 'translate('+xPos+', '+yPos+')';
			})
			.select('rect')
			.attr('width', function() {
				var elementText = d3.select(this.parentNode).select('text').node().getBBox();
				return elementText.width+options.paddingTextWidth;
			})
			.attr('height', function() {
				var elementText = d3.select(this.parentNode).select('text').node().getBBox();
				return elementText.height+options.paddingTextHeight;
			});
			

		
		
		Object.keys(this.child).forEach(function(key) {
			// console.log(key);
			if (key == self.currentKey) {
				var child = self.child[key];
				child.container = d3.select('#'+self.idPrefix+key);
				child.width = self.width;
				child.height = self.heightActive;
				child.heightClosed = self.heightClosed + options.heightClosedIncrease;
				child.update();
				if (child.detail) {
					child.drawDetail();
				} else {
					child.draw();
				}
			}
		});
		
	}
	
	this.barClick = function(key) {
		var self = this;
		
		if (self.front) {
			self.front = false;
			self.currentKey = key;
			
						
		} else {
			self.closeChild();
			self.front = true;
			d3.selectAll('.bar_'+self.itemName).classed('hover', false);
		}


		self.draw();
	}
	
	this.closeChild = function() {
		var self = this;
		Object.keys(self.child).forEach(function(item) {
			self.child[item].closeChild();
		});
		self.currentKey = null;
	}
	
	this.barMouseOver = function(key) {
		var self = this;

		if (self.front) {
			d3.select('#'+self.idPrefix+key).classed('hover', true);
		} else {
			d3.selectAll('.bar_'+self.itemName).classed('hover', true);
		}
		
		this.updateInfo(key);
	}
	this.barMouseOut = function(key) {
		var self = this;
		
		d3.selectAll('.bar_'+self.itemName).classed('hover', false);

	}
	
	this.getFemaleBarWidth = function(key) {
		var stuff = this.data[key];
		var female = parseInt(stuff.female);
		return female.map(0, stuff.total, 0, this.width);
	}
	
	this.getBarHeight = function(key) {
		var stuff = this.data[key];
		
		// console.log(this.data);
		// console.log(stuff);
		
		var total = parseInt(stuff.total);
		var max = this.height-((this.keys.length-1)*this.margin+(2*this.marginLevel));
		
		var min = options.heightBarMin;
		max = max-(min*(this.keys.length-1));
		// console.log(max);
		return total.map(0, this.totalStudents, min, max);
	}
	
	this.updateInfo = function(key) {
		var self = this;
		
		
		
		
		// content
		if (self.front) {
			// content
			/*
$('div.infoContainer').removeClass('back');
			
			$('div.infoContainer').html("\
				<h1>"+self.data[key].name+"</h1>\
				Anzahl Studenten: "+self.data[key].total+"<br>\
				Frauen: "+self.data[key].female+"<br>\
				Männer: "+self.data[key].male+"<br>\
				Frauenanteil: "+self.data[key].female_percent+"\
			");
*/
		} else {
			/*
$('div.infoContainer').addClass('back');
			
			$('div.infoContainer').html("\
				<h1>Alle "+Translation[self.itemName]+"</h1>\
			");
*/
		}	
		
// 		var containerHeight = $('div.infoContainer').outerHeight();
		var top = 0;
		
		/*
// top position
		if (self.front) { 
			top = self.absoluteYPos + self.barYPosition[key] + (self.getBarHeight(key)/2) - (containerHeight/2);
		
		} else {
		
			var isTop = self.barPositionTop.reduce(function(a, b) {
				if (a) {
					return true;
				} else {
					return b == key;
				}
			}, false);
			// console.log(key);
			// console.log(isTop);
			
			top = this.absoluteYPos;
			if (isTop) {
				top += self.yPosStartChild - (self.yPosStartChild/2) - (containerHeight/2);
			} else {
				var topOffset = self.yPosStartChild+self.heightActive;
				top += topOffset + ((self.height - topOffset)/2) - (containerHeight/2);
			}		
			
		}
*/
		
		
		/*
// position off-canvas
		if (top < 0) {
			top = 0;
		} else if (top+containerHeight > options.height) {
			top = options.height - containerHeight;
		}
*/
		/*

		$('div.infoContainer').css({
			'top': top+'px'
		});
		
		$('div.infoContainer').show();
		
*/
	}
	
	this.drawDetail = function() {
		var self = this;
		
		
		
		var data = self.data;
		var dataKeys = Object.keys(data);
		
		// console.log(data);
		
		var xRange = d3.scale.linear()
			.range([0, self.width])
			.domain([
				d3.min(dataKeys, function (d) { return d; }),
				d3.max(dataKeys, function (d) { return d; })
			]);
	
	

		var yRange = d3.scale.linear()
		    .range([self.height, 0])
			.domain([
				d3.min(dataKeys, function (d) { 
					var male = parseInt(data[d].male);
					var female = parseInt(data[d].female);
					return male > female ? female : male; 
				}),
				d3.max(dataKeys, function (d) {
					var male = parseInt(data[d].male);
					var female = parseInt(data[d].female);
					return male > female ? male : female; 	
				})
			]);
		    
	
		var lineFuncFemale = d3.svg.line()
			.x(function (d) { return xRange(d); })
			.y(function (d) { return yRange(data[d].female); })
			.interpolate('linear');
		
		var lineFuncMale = d3.svg.line()
			.x(function (d) { return xRange(d); })
			.y(function (d) { return yRange(data[d].male); })
			.interpolate('linear');

		var group = this.container
			.append('g')
			.classed('detail', true)
			.attr('style', 'display:none');

		group
			.append('rect')
			.attr('width', self.width)
			.attr('height', self.height)
			.attr('fill', 'black');

		group
			.append("path")
			.attr("class", "line female")
			.attr("d", lineFuncFemale(dataKeys));
		
		group
			.append("path")
			.attr("class", "line male")
			.attr("d", lineFuncMale(dataKeys));

  
	}
	
	this.hideDetail = function() {
		this.container.select('g.detail').attr('style', 'display:none');
	}
	this.showDetail = function() {
		this.container.select('g.detail').attr('style', 'display:block');
	}
}


var Translation = {
	'year': 'Jahre',
	'school': 'Hochschulen',
	'subject': 'Fakultäten'
}

d3.json("data.json", function(data) {
	
	
	var canvas = d3.select('body')
		.append('svg')
		.attr('id', 'graph')
		.attr('width', options.width)
		.attr('height', options.height);
	
	// defs
	{
	
		var defs = canvas.append("svg:defs");
		var gradientFemale = defs
			.append("svg:linearGradient")
			.attr("id", "gradientFemale")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradientFemale.append("svg:stop")
	    	.attr("offset", "0%")
			.attr("stop-color", "#a80062")
			.attr("stop-opacity", 1);
		gradientFemale.append("svg:stop")
	    	.attr("offset", "100%")
			.attr("stop-color", "#7c023e")
			.attr("stop-opacity", 1);
		
		var gradientMale = defs
			.append("svg:linearGradient")
			.attr("id", "gradientMale")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradientMale.append("svg:stop")
	    	.attr("offset", "0%")
			.attr("stop-color", "#15365a")
			.attr("stop-opacity", 1);
		gradientMale.append("svg:stop")
	    	.attr("offset", "100%")
			.attr("stop-color", "#127185")
			.attr("stop-opacity", 1);
			
		var gradientFemaleOver = defs
			.append("svg:linearGradient")
			.attr("id", "gradientFemaleOver")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradientFemaleOver.append("svg:stop")
	    	.attr("offset", "0%")
			.attr("stop-color", "#3e012c")
			.attr("stop-opacity", 1);
		gradientFemaleOver.append("svg:stop")
	    	.attr("offset", "100%")
			.attr("stop-color", "#33041e")
			.attr("stop-opacity", 1);
		
		var gradientMaleOver = defs
			.append("svg:linearGradient")
			.attr("id", "gradientMaleOver")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradientMaleOver.append("svg:stop")
	    	.attr("offset", "0%")
			.attr("stop-color", "#0b1628")
			.attr("stop-opacity", 1);
		gradientMaleOver.append("svg:stop")
	    	.attr("offset", "100%")
			.attr("stop-color", "#0a2938")
			.attr("stop-opacity", 1);
	}
	
	

	var yearObj = new IV_Highscool_Node();
	yearObj.visible = true;
	yearObj.container = canvas;
	yearObj.width = options.width;
	yearObj.height = options.height;
	yearObj.itemName = 'year';
	yearObj.marginLevel = 0;
	yearObj.front = true;
	yearObj.data = data.chronologic;
	yearObj.initialize();
	yearObj.update();
	
	
	Object.keys(data.chronologic).forEach(function(year) {
		var schoolObj = new IV_Highscool_Node();
		schoolObj.itemName = 'school';
		schoolObj.parentPrefix = year+'_';
		schoolObj.data = data.chronologic[year].schools;
		schoolObj.level = 1;
		schoolObj.initialize();
		
		Object.keys(data.chronologic[year].schools).forEach(function(school) {			
			var subjectObj = new IV_Highscool_Node();
			subjectObj.itemName = 'subject';
			subjectObj.parentPrefix = schoolObj.parentPrefix+school+'_';
			subjectObj.data = data.chronologic[year].schools[school].subject;
			subjectObj.detailData = data.detail[school];
			subjectObj.level = 2;
			subjectObj.initialize();
			
			Object.keys(data.chronologic[year].schools[school].subject).forEach(function(subject) {
				var detailObj = new IV_Highscool_Node();
				detailObj.itemName = 'detail';
				detailObj.parentPrefix = subjectObj.parentPrefix+subject+'_';
				detailObj.data = data.detail[school][subject];
				detailObj.detail = true;
				detailObj.level = 3;
				detailObj.initialize();
				
				subjectObj.addChild(subject, detailObj);
				
			});
			
			
			schoolObj.addChild(school, subjectObj);
		});
		
		yearObj.addChild(year, schoolObj);
	});
	
	
	yearObj.draw();
	
	// line50%
	canvas
		.append('line')
		.classed('line50', true)
		.attr('stroke-dasharray', '1, 5')
		.attr('y1', 2)
		.attr('y2', options.height)
		.attr('x1', options.width/2)
		.attr('x2', options.width/2);
	
	// hover rect
	
/*
	var canvas = d3.select('body')
		.append('div')
		.classed('infoContainer', true)
		.attr('style', 'display:none');
*/
		
	/*
	
	$('body').on('mousemove', function() {

		var left = currentMousePos.x + options.mouseDistanzeInfo;
		
		if (currentMousePos.x > $('body').width()/2) {
			left = currentMousePos.x - $('div.infoContainer').width() - options.mouseDistanzeInfo;
		}
		
		$('div.infoContainer').css({
			'left': left+'px'
		});
	});
*/

});