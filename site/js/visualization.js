Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

var options = {
	'width': 1200,
	'height': 680,
	'heightClosedMin': 17,
	'heightClosedIncrease': 0,
	'heightBarMin': 25,
	'heightBarBreadcrump': 25,
	'margin': 2,
	'marginClosed': 2, 
	'marginLevel': 0,
	'paddingTextWidth': 20,
	'paddingTextHeight': 6,
	'marginTextTop': 14,
	'transitionDuration': 1000
}

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
	this.heightBreadcrump = options.heightBarBreadcrump;
	this.heightActive = null;
	
	this.data = null;
	this.keys = null;
	this.currentKey = null;
	this.parentPrefix = null;
	
	this.dataYear = null;
	this.detailName = null;
	
	this.subjectName = null;
	
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
	this.breadcrump = '';
	
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

	this.drawInit = function() {
		var self = this; 
		
		// console.log(self.itemName);
		
		var selection = this.container
			.selectAll('g.bar_'+self.itemName);
		
		var yPos = this.marginLevel;
		if (this.level > 0) {
			yPos += this.heightBreadcrump+this.margin;
		}
		
					
		var group_bar = selection
			.data(this.keys);
		
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
			.attr('id', function(key) { return self.idPrefix+key; });
		
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
		
		
		// dotted line
		enter
			.append('line')
			.attr('x1', this.width/2)
			.attr('x2', this.width/2)
			.attr('y1', 0)
			.attr('y1', function(key) {
				return self.getBarHeight(key);
			})
			.classed('line50', true)
			.attr('stroke-dasharray', '1, 5');
		// background
		enter
			.append('rect')
			.attr('y', 0)
			.attr('x', 0)
			.attr('height', function(key) {
				return self.getBarHeight(key);
			})
			.attr('width', function(key) { return self.width; })
			.classed('overlay', true)
			.classed('pice_'+self.itemName, true)
			.on('click', function(key) { self.barClick(key); })
			.on('mouseover', function(key) { self.barMouseOver(key); })
			.on('mouseout', function(key) { self.barMouseOut(key); });
		
			
		// info female
		var textFemale = enter
			.append('text')
			.classed('info_female', true)
			.attr('x', 20);
		textFemale
			.append('tspan')
			.classed('percent', true)
			.text(function(key) {
				return self.data[key].female_percent+'% ';
			});
		textFemale
			.append('tspan')
			.classed('total', true)
			.attr('dx', 5)
			.text(function(key) { return self.formatNumber(self.data[key].female)+' FRAUEN'; });
		textFemale
			.attr('y', function(key) {
				var bboxHeight = (d3.select(this).node().getBBox().height/2) - 4;
				// var bboxHeight = 20;
				return self.getBarHeight(key)/2 + bboxHeight;
			});
			
		// info male
		var textMale = enter
			.append('text')
			.classed('info_male', true);
		textMale
			.append('tspan')
			.classed('percent', true)
			.text(function(key) {
				return self.data[key].male_percent+'% ';
			});
		textMale
			.append('tspan')
			.classed('total', true)
			.attr('dx', 5)
			.text(function(key) {
				return self.formatNumber(self.data[key].male)+' MÄNNER';
			});
		textMale
			.attr('y', function(key) {
				var bboxHeight = (d3.select(this).node().getBBox().height/2) - 4;
				// var bboxHeight = 20;
				return self.getBarHeight(key)/2 + bboxHeight;
			})
			.attr('x', function(){
				var bboxWidth = (d3.select(this).node().getBBox().width) + 20;
				// var bboxWidth = 20;
				return self.width - bboxWidth;
			});
		
					
		// label
		var enterLabelG = enter
			.append('g')
			.classed('label', true)
			.attr('opacity', function() { return self.level == 0 ? 1 : 0; });

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
			.attr('y', options.marginTextTop)
			.text(function(key) { return self.data[key].name.toUpperCase(); })
			.on('click', function(key) { self.barClick(key); })
			.on('mouseover', function(key) { self.barMouseOver(key, yPos); })
			.on('mouseout', function(key) { self.barMouseOut(key); });
		
		enter.selectAll('g')
			.attr('transform', function(key) { return self.translateLabel(this, key); })
			.select('rect')
			.attr('width', function() {
				var bboxWidth = d3.select(this.parentNode).select('text').node().getBBox().width;
				// var bboxWidth = 20;
				return bboxWidth+options.paddingTextWidth;
			})
			.attr('height', function() {
				var bboxHeight = d3.select(this.parentNode).select('text').node().getBBox().height;
				// var bboxHeight = 20;
				return bboxHeight+options.paddingTextHeight;
			});
			
		
		// back top
		var backGroup = this.container
			.append('g')
			.attr('id', self.idPrefix+'back_top')
			.classed('back', true)
			.classed('back_top', true);
		backGroup
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('rx', 10)
			.attr('ry', 10)
			.on('click', function(key) { self.barClick(); })
			.on('mouseover', function(key) { self.barMouseOver(); })
			.on('mouseout', function(key) { self.barMouseOut(); });
		backGroup
			.append('text')
			.text(function(key) { return Translation[self.itemName]; })
			.attr('x', options.paddingTextWidth/2)
			.attr('y', options.marginTextTop)
			.on('click', function(key) { self.barClick(); })
			.on('mouseover', function(key) { self.barMouseOver(); })
			.on('mouseout', function(key) { self.barMouseOut(); });
		
		var backGroup = this.container
			.append('g')
			.attr('id', self.idPrefix+'back_bottom')
			.classed('back', true)
			.classed('back_bottom', true);
		backGroup
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('rx', 10)
			.attr('ry', 10)
			.on('click', function(key) { self.barClick(); })
			.on('mouseover', function(key) { self.barMouseOver(); })
			.on('mouseout', function(key) { self.barMouseOut(); });
		backGroup
			.append('text')
			.text(function(key) { return Translation[self.itemName]; })
			.attr('x', options.paddingTextWidth/2)
			.attr('y', options.marginTextTop)
			.on('click', function(key) { self.barClick(); })
			.on('mouseover', function(key) { self.barMouseOver(); })
			.on('mouseout', function(key) { self.barMouseOut(); });
		
		self.resizeLabel(d3.selectAll('#'+this.container.attr('id')+' > g.back'));
		
		$('#'+self.idPrefix+'back_top, #'+self.idPrefix+'back_bottom').css('display', 'none');
			
			
		if (self.breadcrump != '') {
			var breadcrumpGroup = this.container
				.append('g')
				.classed('breadcrump', true)
				.attr('transform', 'translate(0,0)')
				.attr('style', 'display:none');
			breadcrumpGroup
				.append('rect')
				.attr('width', this.width)
				.attr('height', this.heightBreadcrump);
			breadcrumpGroup
				.append('text')
				.attr('x', this.width/2)
				.attr('y', (this.heightBreadcrump/2)+4)
				.text(self.breadcrump.toUpperCase());	
		}
		
		Object.keys(this.child).forEach(function(key) {
			// console.log(key);
			var child = self.child[key];
			child.container = d3.select('#'+self.idPrefix+key);
			child.width = self.width;
			child.height = self.heightActive;
			child.heightClosed = self.heightClosed + options.heightClosedIncrease;
			child.update();
			
			
			if (child.detail) {
				child.drawDetail();
			} else {
				child.drawInit();
			}
			
		});
		
		$('g.bar_'+self.itemName).css('display', (self.visible ? 'block' : 'none'));
			
	}
	
	/**
	* currentKey == null 
	*/
	this.drawCurrent = function() {
		var self = this;
		
		self.currentKey = null;
		
		var selection = this.container
			.selectAll('g.bar_'+self.itemName);
		var yPos = this.marginLevel;
		if (this.heightBreadcrump > 0) {
			yPos += this.heightBreadcrump+this.margin;
		}
		var groupBar = selection
			.data(this.keys);
			
		// before transition
		groupBar
			.attr('style', 'display: block')
			.attr('transform', function(key, i) { 
				var result = 'translate(0, '+yPos+')';
				var barHeight = self.getBarHeight(key);
				yPos += barHeight+self.margin;
				
				return result;
			});
		
		groupBar
			.selectAll('rect.pice_'+self.itemName)
			.attr('style', 'display:block')
			.attr('opacity', 1)
			.attr('height', function(key) {
				return self.getBarHeight(key);
			});
		groupBar
			.select('line.line50')
			.attr('y1', 0)
			.attr('y2', function(key) {
				return self.getBarHeight(key);
			});
		groupBar
			.select('g.label')
			.attr('style', 'display: block')
			.attr('transform', function(key) {
				var result = self.translateLabel(this, key); 
				return result; 
			});
			
		groupBar
			.select('text.info_female')
			.attr('y', function(key) {
				var bboxHeight = (d3.select(this).node().getBBox().height/2) - 4;
				return self.getBarHeight(key)/2 + bboxHeight;
			})
			.attr('fill-opacity', 1);
		groupBar
			.select('text.info_male')
			.attr('y', function(key) {
				var bboxHeight = (d3.select(this).node().getBBox().height/2) - 4;
				return self.getBarHeight(key)/2 + bboxHeight;
			})
			.attr('fill-opacity', 1);

		
		// after transition
		var updateTransition = groupBar
			.attr('opacity', 1)
			.transition()
			// .delay(200)
			.duration(options.transitionDuration)
			.attr('opacity', 1)
			.each('start', function(key, i) {
				
				// neues level schreiben
					 
				d3.selectAll('#'+self.idPrefix+key+' > g.label')
					.attr('opacity', 0)
					.attr('style', 'display: block')
					.transition()
					.duration(500)
					.attr('opacity', 1);	
					
				// console.log('draw-current-end');			
				
			});

	}
	
	/**
	* back to normal
	* - hide current bars
	* - show hidden bar
	* - move to base
	*/
	this.drawBase = function() {
		var self = this;
		// console.log('drawBase');
		self.child[self.currentKey].close(function() {
			// console.log('child-closed');
			
			d3.selectAll('#'+self.idPrefix+self.currentKey+' g.breadcrump').attr('style', 'display:none');
			
			self.currentKey = null;
					
			var selection = self.container
				.selectAll('g.bar_'+self.itemName);
			
			var yPos = self.marginLevel;
			if (self.level > 0) {
				yPos += self.heightBreadcrump+self.margin;
			}
					
			var groupBar = selection
				.data(self.keys);
				
			groupBar
				.select('g.label')
				.attr('style', 'display: block');
				
			var updateTransition = groupBar
				.transition()
				.duration(options.transitionDuration)
				.attr('transform', function(key, i) { 
					var result = 'translate(0, '+yPos+')';
					var barHeight = self.getBarHeight(key);
					yPos += barHeight+self.margin;
					
					return result;
				})
				.each('end', function(key, i) {
					if (i == 0) {
						
						if (self.level > 0) {
							var parent = d3.select(d3.select('#'+self.idPrefix+key).node().parentNode);
							// console.log(parent);
							d3.select('#'+parent.attr('id')+' > g.breadcrump')
								.attr('style', 'display:block');
						}
						
					}
				});
			
			
			updateTransition
				.selectAll('rect.pice_'+self.itemName)
				.attr('style', 'display:block')
				.attr('height', function(key) {
					return self.getBarHeight(key);
				});
				
			updateTransition
				.select('line.line50')
				.attr('y1', 0)
				.attr('y2', function(key) {
					return self.getBarHeight(key);
				});
			
			updateTransition
				.select('g.label')
				.attr('opacity', 1)
				.attr('transform', function(key) { return self.translateLabel(this, key) });								
			updateTransition
				.select('text.info_female')
				.attr('y', function(key) {
					var bboxHeight = (d3.select(this).node().getBBox().height/2) -2;
					return self.getBarHeight(key)/2 + bboxHeight;
				})
				.attr('fill-opacity', 1);
			
			updateTransition
				.select('text.info_male')
				.attr('y', function(key) {
					var bboxHeight = (d3.select(this).node().getBBox().height/2) -2;
					return self.getBarHeight(key)/2 + bboxHeight;
				})
				.attr('fill-opacity', 1);
			
		});

		// console.log('closed');
					
		$('body').attr('class', 'level_'+(self.level));
		
		// hide back labels with transition (fadout)
		self.container
			.selectAll('#'+self.idPrefix+'back_top, #'+self.idPrefix+'back_bottom')
			.attr('style', 'display: block')
			.attr('opacity', 1)
			.transition(500)
			.attr('opacity', 0)
			.each('end', function() {
				d3.select(this)
					.attr('style', 'display:none')
					.attr('opacity', 1);
			});
		
		self.container
			.selectAll('#'+self.idPrefix+self.currentKey+' > rect')
			.attr('style', 'display: block')
			.transition()
			.duration(1)
			.attr('opacity', 1);
		
	}
	
	/**
	* currentKey != null 
	*/
	this.drawClosed = function(currentKey) {
		var self = this;
		
		// neues level schreiben
		$('body').attr('class', 'level_'+(self.level+1));	
		this.container.select('#'+self.idPrefix+currentKey).classed('active', true);	
		
		self.currentKey = currentKey;
		
		var selection = this.container
			.selectAll('g.bar_'+self.itemName);
			
		var yPos = this.marginLevel;

		var isTop = true;
		
		if (self.level > 0) {
			var parent = d3.select(d3.select('#'+self.idPrefix+self.currentKey).node().parentNode)
			d3.select('#'+parent.attr('id')+' > g.breadcrump')
				.attr('style', 'display:none');
		}
		
		var groupBar = selection
			.data(this.keys);
		
		// before transition
		groupBar
			.select('g.label')
			.attr('opacity', 1);
		groupBar
			.select('text.info_female')
			.attr('fill-opacity', 1);
		groupBar
			.select('text.info_male')
			.attr('fill-opacity', 1);
		groupBar
			.select('line.line50')
			.attr('y1', 0)
			.attr('y2', function(key) {
				var result = self.getBarHeight(key);
				return result;
			});
		
		self.barPositionTop = [];
		
		// after transition
		var updateTransition = groupBar
			.transition()
			// .ease('elastic')
			.duration(options.transitionDuration)
			.attr('transform', function(key, i) { 
				
				var result = 'translate(0, '+yPos+')';
				if (key == self.currentKey) {
					self.yPosStartChild = yPos;

					result = 'translate(0, '+(yPos)+')';
					yPos += self.heightActive+self.marginClosed;
						
					isTop = false;
				} else {
					yPos += self.heightClosed+self.marginClosed;
						
					if (isTop) {
						self.barPositionTop.push(key);
					}
				}					

				return result;
			})
			.attr('style', function() { return self.visible ? 'display: block' : 'display: none'; })
			.each('end', function(key, i) {
				// console.log('end1');
				
				if (key == self.keys[self.keys.length-1]) {
					if (Object.keys(self.child).length > 0) {
	
						self.container.select('#'+self.idPrefix+self.currentKey).classed('active', false);
	
						var child = self.child[self.currentKey];
						child.visible = true;
						child.front = true;
						child.absoluteYPos = self.absoluteYPos + self.yPosStartChild;
						child.update();
						if (child.detail) {
							child.showDetail();
														
							$('body').attr('class', 'level_'+(self.level+1));
						} else {

							d3.selectAll('#'+self.idPrefix+self.currentKey+' > rect, .bar_'+self.itemName+' > g.label')
								.attr('opacity', 0)
								.attr('style', 'display:none');
							
							d3.select('#'+self.idPrefix+self.currentKey+' > g.breadcrump').attr('style', 'display:block');
							// console.log('draw-current');
							child.drawCurrent();
							
						}	
						
						self.showBackLabel();				
					} 
								
					
				}
			});
			
		updateTransition
			.selectAll('rect.pice_'+self.itemName)
			.attr('height', function(key) {
				var result;
				if (key == self.currentKey) { 
					result = self.heightActive;
				} else {
					result = self.heightClosed;
				}
				return result;
			});
			
		updateTransition
			.select('line.line50')
			.attr('y1', 0)
			.attr('y2', function(key) {
				var result;
				if (key == self.currentKey) { 
					result = self.heightActive;
				} else {
					result = self.heightClosed;
				}
				return result;
			});
			
		updateTransition
			.select('g.label')
			.attr('transform', function(key) {
				var elementText = d3.select(this).select('text').node().getBBox();

				var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
				var yPos = (self.heightClosed/2)- (elementText.height/2) - (options.paddingTextHeight/2);
				
				if (key == self.currentKey) { 
					yPos = self.heightActive / 2;
				}
				
				return 'translate('+xPos+', '+yPos+')';
				
			})
			.attr('opacity', 0);
			
		updateTransition
			.select('text.info_female')
			.attr('y', function(key) {
				var bboxHeight = (d3.select(this).node().getBBox().height/2) -2;
				var yPos = self.getBarHeight(key)/2 + bboxHeight;
				if (key == self.currentKey) { 
					yPos = self.heightActive / 2;
				}
				return yPos;
			})
			.attr('fill-opacity', 0);
		updateTransition
			.select('text.info_male')
			.attr('y', function(key) {
				var bboxHeight = (d3.select(this).node().getBBox().height/2) -2;
				var yPos = self.getBarHeight(key)/2 + bboxHeight;
				if (key == self.currentKey) { 
					yPos = self.heightActive / 2;
				}
				return yPos;
			})
			.attr('fill-opacity', 0);
		
	}
	
	this.showBackLabel = function() {
		// show back link
		var self = this; 
		
		var labelText = Translation[self.itemName];
		if (self.itemName == 'subject' && self.parentPrefix.indexOf('fachhochschulen') > -1) {
			var labelText = Translation['fh_subject'];
		}
			
		if (self.yPosStartChild > 0) {

			if (self.itemName == 'year') {
				labelText = self.barPositionTop[0];
				// console.log(self.barPositionTop);
				if (self.barPositionTop.length > 1) {
					labelText = self.barPositionTop[self.barPositionTop.length-1]+' - '+labelText;
				}
			} 
			// console.log(labelText);
			var backTopGroup = self.container.select('#'+self.idPrefix+'back_top');
			backTopGroup.select('text')
				.text(labelText.toUpperCase());
			backTopGroup
				.attr('style', 'display: block')
				.attr('transform', function() {
					var elementText = d3.select(this).select('text').node().getBBox();
									
					var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
					var yPos = self.yPosStartChild/2 - (elementText.height/2) - (options.paddingTextHeight/2)-1;
					
					return 'translate('+xPos+', '+yPos+')';	
				})
				.attr('opacity', 0)
				.transition()
				.duration(500)
				.attr('opacity', 1);
			
			self.resizeLabel(self.container.select('#'+self.idPrefix+'back_top'));
		}

		if (self.yPosStartChild+self.heightActive < self.height) {
			
			if (self.itemName == 'year') {
				labelText = self.keys[self.keys.length-1];

				if (self.keys.length - self.barPositionTop.length > 2) {
					var firstYear = parseInt(self.barPositionTop[self.barPositionTop.length-1])-2;
					labelText = labelText+' - '+firstYear;
				}
			} 
			
			var backBottomGroup = self.container.select('#'+self.idPrefix+'back_bottom');
			backBottomGroup.select('text')
				.text(labelText.toUpperCase());
			backBottomGroup
				.attr('style', 'display: block')
				.attr('transform', function() {
					var elementText = d3.select(this).select('text').node().getBBox();
				
					var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
					var yPos = (self.yPosStartChild + self.heightActive) + (self.height - (self.yPosStartChild + self.heightActive))/2 - (elementText.height/2) - (options.paddingTextHeight/2) +1;
					
					return 'translate('+xPos+', '+yPos+')';	
				})
				.attr('opacity', 0)
				.transition()
				.duration(500)
				.attr('opacity', 1);
			
			self.resizeLabel(self.container.select('#'+self.idPrefix+'back_bottom'));
		}
		
		
		
		
	}
	
	this.close = function(callback) {
		var self = this;
		
		if (self.detail) {
			this.container.select('g.breadcrump').attr('style', 'display:none');
			this.container.select('g.detail')
				.attr('style', 'display:none')
			callback();
		} else {
			// console.log('close-child');
			
			this.container
				.selectAll('g.bar_'+self.itemName)
				.attr('opacity', 1)
				.transition()
				.duration(200)
				.attr('opacity', 0)
				.each('end', function(key, i) {
					d3.select(this).attr('style', 'display:none;');
					
					if (i == 0) {
						// console.log('make reset');
						self.reset();
						self.resetChild();
						 
						callback();
					}
					
				});
		}	
			
	}
	
	
	
	this.reset = function() {
		var self = this;
		self.visible = false;
		self.front = false;		
		
		self.container.select('g.detail').attr('style', 'display:none;');
		self.container.selectAll('g.bar_'+self.itemName).attr('style', 'display:none;');
		self.container.selectAll('g.bar_'+self.itemName).attr('style', 'display:none;');
		self.container.selectAll('#'+self.idPrefix+'back_top, #'+self.idPrefix+'back_bottom').attr('style', 'display: none');
	}
	
	this.resetChild = function() {
		var self = this;
				
		Object.keys(self.child).forEach(function(item) {

			if (self.child[item].visible) {
				
				self.child[item].reset();
				self.child[item].resetChild();
			}

			
		});

	}
	
	this.barClick = function(key) {
		var self = this;
		if (self.front) {
			d3.selectAll('.bar_'+self.itemName).classed('hover', false);
			
			self.front = false;
			self.drawClosed(key);
						
		} else {
			self.front = true;
			d3.selectAll('.bar_'+self.itemName).classed('hover', false);
			// console.log('base');
			self.drawBase();
		}


	}
	
	this.barMouseOver = function(key) {
		var self = this;
		// console.log(key);
		if (self.front) {
			d3.select('#'+self.idPrefix+key).classed('hover', true);
		} else {
			// console.log(d3.select(self.container.node()).attr('id'));
			d3.selectAll('#'+d3.select(self.container.node()).attr('id')+' > g.back')
				.classed('hover', true);
				
			d3.selectAll('.bar_'+self.itemName).classed('hover', true);
		}
		
	}
	this.barMouseOut = function(key) {
		var self = this;
		
		d3.selectAll('g.back').classed('hover', false);
		d3.selectAll('.bar_'+self.itemName).classed('hover', false);

	}
	
	this.getFemaleBarWidth = function(key) {
		var stuff = this.data[key];
		var female = parseInt(stuff.female);
		return female.map(0, stuff.total, 0, this.width);
	}
	
	this.getBarHeight = function(key) {
		var stuff = this.data[key];

		var total = parseInt(stuff.total);
		var max = this.height-((this.keys.length-1)*this.margin+(2*this.marginLevel));
		if (this.level > 0) {
			max -= this.heightBreadcrump+this.margin;
		}
		
		var min = options.heightBarMin;
		max = max-(min*(this.keys.length-1));
		// console.log(max);
		return total.map(0, this.totalStudents, min, max);
	}
	
	
	this.drawDetail = function() {
		var self = this;
		var data = self.data;
		var dataKeys = Object.keys(data);
		
		// paddings and margins
		var paddingTextContainer = 30;
		var graphMarginTop = 115;
		var graphMarginBottom = 40;
		var detailHeight = self.height - self.heightBreadcrump - self.margin;
		var yearLabelMarginBottom = 10;
		var yearWidth = self.width/dataKeys.length;
		var yearHeight = detailHeight-graphMarginTop;
		
		var group = this.container
			.append('g')
			.classed('detail', true)
			.attr('transform', function(key, i) { 
				var yPos = self.heightBreadcrump+self.margin;
				var result = 'translate(0, '+yPos+')';
				return result;
			});
		
		// background
		group
			.append('rect')
			.classed('background', true)
			.attr('width', self.width)
			.attr('height', detailHeight);
		
		// title
		// label
		var nameLabelG = group
			.append('g')
			.classed('detailName', true);

		var labelRect = nameLabelG
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('rx', 10)
			.attr('ry', 10);
			
		var labelText = nameLabelG
			.append('text')
			.attr('x', options.paddingTextWidth/2)
			.attr('y', options.marginTextTop)
			.text(self.detailName.toUpperCase());
		
		nameLabelG
			.attr('transform', function() {
				var elementText = d3.select(this).select('text').node().getBBox();
					
				var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
				return 'translate('+xPos+', '+paddingTextContainer+')';
			});
			
		self.resizeLabel(nameLabelG);
		
		
		
		// text
		{
			var textWidth = 110;
			var textSpace = 30;
			// frau
			var numbers = {
				'ANTEIL': data[self.dataYear].female_percent+'%',
				'FRAUEN': data[self.dataYear].female,
				'ZU/ABSTIEG': (data[self.dataYear].female_trend < 0 ? '' : '+')+data[self.dataYear].female_trend+'%'
			};
			if (data[self.dataYear].female_age != undefined) {
				numbers['Ø ALTER'] = data[self.dataYear].female_age;
			}
			var xPos = paddingTextContainer;
			var numbersGroup = group.selectAll('g.numberFemale');
			var numberGroup = numbersGroup
				.data(Object.keys(numbers))
				.enter()
				.append('g')
				.classed('numberFemale', true);
			numberGroup
				.append('text')
				.classed('label', true)
				.attr('y', 11)
				.text(function(key) { return key });
			numberGroup
				.append('text')
				.classed('value', true)
				.attr('y', 47)
				.text(function(key) { return numbers[key]; });
			numberGroup
				.attr('transform', function() {
					var valueWidth = d3.select(this).select('text.value').node().getBBox().width;
					var labelWidth = d3.select(this).select('text.label').node().getBBox().width;
					
					var result = 'translate('+xPos+', '+paddingTextContainer+')';
					var elementWidth = labelWidth
					if (valueWidth > labelWidth) {
						elementWidth = valueWidth;
					}
					xPos += elementWidth + textSpace;
					return result;
				});
			
			
			// mann
			var numbers = {};
			if (data[self.dataYear].male_age != undefined) {
				numbers['Ø ALTER'] = data[self.dataYear].male_age;
			}
			numbers['ZU/ABSTIEG'] = (data[self.dataYear].male_trend < 0 ? '' : '+')+data[self.dataYear].male_trend+'%';
			numbers['MÄNNER'] = data[self.dataYear].male;
			numbers['ANTEIL'] = data[self.dataYear].male_percent+'%';
			
			var xPos = self.width - paddingTextContainer;
			var numbersGroup = group.selectAll('g.numberMale');
			var numberGroup = numbersGroup
				.data(Object.keys(numbers))
				.enter()
				.append('g')
				.classed('numberMale', true);
			numberGroup
				.append('text')
				.classed('label', true)
				.attr('y', 11)
				.text(function(key) { return key });
			numberGroup
				.append('text')
				.classed('value', true)
				.attr('y', 47)
				.text(function(key) { return numbers[key]; });
			numberGroup
				.attr('transform', function() {
					var valueWidth = d3.select(this).select('text.value').node().getBBox().width;
					var labelWidth = d3.select(this).select('text.label').node().getBBox().width;					
					var elementWidth = labelWidth
					if (valueWidth > labelWidth) {
						elementWidth = valueWidth;
					}
					
					xPos -= elementWidth;
					var result = 'translate('+xPos+', '+paddingTextContainer+')';
					xPos -= textSpace;
					
					return result;
				});
				
		}

	
		
		// graf frau/mann
		{
			var xRange = d3.scale.linear()
				.range([yearWidth/2, self.width-yearWidth/2])
				.domain([
					d3.min(dataKeys, function (d) { return d; }),
					d3.max(dataKeys, function (d) { return d; })
				]);
		
		
	
			var yRange = d3.scale.linear()
			    .range([detailHeight - graphMarginBottom, graphMarginTop+20])
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
					
			group
				.append("path")
				.attr("class", "line female")
				.attr("d", lineFuncFemale(dataKeys));
			group
				.append("path")
				.attr("class", "line male")
				.attr("d", lineFuncMale(dataKeys));
			
			var pointsFemale = group.selectAll('circle.female');
			pointsFemale
				.data(dataKeys)
				.enter()
				.append('circle')
				.classed('female', true)
				.attr('r', 4)
				.attr('cx', function(key) { return xRange(key) })
				.attr('cy', function(key) { return yRange(data[key].female ) });
			
			var pointsMale = group.selectAll('circle.male');
			pointsMale
				.data(dataKeys)
				.enter()
				.append('circle')
				.classed('male', true)
				.attr('r', 4)
				.attr('cx', function(key) { return xRange(key) })
				.attr('cy', function(key) { return yRange(data[key].male ) });
		
		}

		// year labels
		{
			var yearGroups = group.selectAll('g.year');
			var xPos = 0;
			
			var enterYear = yearGroups
				.data(dataKeys)
				.enter()
				.append('g')
				.classed('year', true)
				.classed('current', function(key) { return key == self.dataYear; })
				.attr('id', function(key) { return 'detail_year_'+key; })
				.attr('transform', function(key, i) {
					var result = 'translate('+xPos+', '+graphMarginTop+')';
					xPos += yearWidth;
					return result;
				});
			enterYear
				.append('rect')
				.attr('x', function(key, i) { return i == 0 ? 0 : 2 })
				.attr('y', 0)
				.attr('width', function(key, i) { return i == 0 ? yearWidth : yearWidth-1 })
				.attr('height', yearHeight)
				.on('mouseover', function(key) {
					self.updateDetail(key)
				})
				.on('mouseout', function() {
					self.updateDetail(self.dataYear)
				});
			enterYear
				.append('text')
				.text(function(key) {return key;})
				.attr('x', yearWidth/2)
				.attr('y', yearHeight-yearLabelMarginBottom);
			enterYear
				.append('line')
				.attr('x1', yearWidth+1)
				.attr('x2', yearWidth+1)
				.attr('y1', yearHeight-yearLabelMarginBottom)
				.attr('y2', yearHeight);
		}
				
		if (self.breadcrump != '') {
			var breadcrumpGroup = this.container
				.append('g')
				.classed('breadcrump', true)
				.attr('transform', 'translate(0,0)')
				.attr('style', 'display:none');
			breadcrumpGroup
				.append('rect')
				.attr('width', this.width)
				.attr('height', this.heightBreadcrump);
			breadcrumpGroup
				.append('text')
				.attr('x', this.width/2)
				.attr('y', (this.heightBreadcrump/2)+4)
				.text(self.breadcrump.toUpperCase());	
		}
		
		
		this.container.select('g.detail')
			.attr('style', 'display:none');
  
	}
	this.showDetail = function() {
		var self = this;
		
		this.container.selectAll('rect.bar_male, rect.bar_female, rect.overlay').attr('style', 'display:none');
		this.container.select('g.breadcrump').attr('style', 'display:block');
		this.container.select('g.detail').attr('style', 'display:block');
		
		this.updateDetail(self.dataYear);
		
	}
	
	this.updateDetail = function(key) {
		var self = this; 
		
		var paddingTextContainer = 30;
		
		this.container.select('g.current')
			.classed('current', false);
		
		this.container.select('#detail_year_'+key)
			.classed('current', true);
		
		
		// background
		{
			var percent_1 = 0;
			if (self.data[key].female_percent > 50) {
				percent_1 = self.data[key].female_percent - 50;
				percent_2 = 100 + percent_1;
			} else {
				percent_1 = 0 - (50 - self.data[key].female_percent);
				percent_2 = 100 + percent_1;
			}
			d3.select('#gradientStop1')
				.attr('offset', percent_1+'%');
			d3.select('#gradientStop2')
				.attr('offset', percent_2+'%');
		}
		
		// text
		{
			var textWidth = 110;
			var textSpace = 30;
			// frau
			var trend = '';
			if (self.data[key].female_trend != undefined) {
				var trend = (self.data[key].female_trend < 0 ? '' : '+')+self.data[key].female_trend+'%';
			}
			var numbers = {
				'ANTEIL': self.data[key].female_percent+'%',
				'FRAUEN': self.data[key].female,
				'ZU/ABSTIEG': trend
			};
			if (self.data[key].female_age != undefined) {
				numbers['Ø ALTER'] = self.data[key].female_age;
			}
			var xPos = paddingTextContainer;
			var numbersGroup = this.container.selectAll('g.numberFemale');
			var numberGroup = numbersGroup
				.data(Object.keys(numbers));
			numberGroup
				.select('text.value')
				.text(function(key) { return numbers[key]; });
			numberGroup
				.transition()
				.duration(200)
				.attr('transform', function() {
					var elementTextValue = d3.select(this).select('text.value').node().getBBox();
					var elementTextLabel = d3.select(this).select('text.label').node().getBBox();
					var result = 'translate('+xPos+', '+paddingTextContainer+')';
					var elementWidth = elementTextLabel.width
					if (elementTextValue.width > elementTextLabel.width) {
						elementWidth = elementTextValue.width;
					}
					xPos += elementWidth + textSpace;
					return result;
				});
			
			
			// mann
			var trend = '';
			if (self.data[key].male_trend != undefined) {
				trend = (self.data[key].male_trend < 0 ? '' : '+')+self.data[key].male_trend+'%';
			}
			var numbers = {};
			if (self.data[key].male_age != undefined) {
				numbers['Ø ALTER'] = self.data[key].male_age;
			}
			numbers['ZU/ABSTIEG'] = trend;
			numbers['MÄNNER'] = self.data[key].male;
			numbers['ANTEIL'] = self.data[key].male_percent+'%';
			
			var xPos = self.width - paddingTextContainer;
			var numbersGroup = this.container.selectAll('g.numberMale');
			var numberGroup = numbersGroup
				.data(Object.keys(numbers));
			numberGroup
				.select('text.value')
				.text(function(key) { return numbers[key]; });
			numberGroup
				.transition()
				.duration(200)
				.attr('transform', function() {
					var elementTextValue = d3.select(this).select('text.value').node().getBBox();
					var elementTextLabel = d3.select(this).select('text.label').node().getBBox();
					var elementWidth = elementTextLabel.width
					if (elementTextValue.width > elementTextLabel.width) {
						elementWidth = elementTextValue.width;
					}
					
					xPos -= elementWidth;
					var result = 'translate('+xPos+', '+paddingTextContainer+')';
					xPos -= textSpace;
					return result;
				});
			
		}

	}
	
	this.resizeLabel = function(groupElement) {
		groupElement.select('rect')
			.attr('width', function() {
				var bboxWidth = d3.select(this.parentNode).select('text').node().getBBox().width;
				return bboxWidth+options.paddingTextWidth;
			})
			.attr('height', function() {
				var bboxHeight = d3.select(this.parentNode).select('text').node().getBBox().height;
				return bboxHeight+options.paddingTextHeight;
			});
	}
	
	this.translateLabel = function(element, key) { 
		var self = this;
		var elementText = d3.select(element).select('text').node().getBBox();

		var xPos = (self.width/2) - (elementText.width/2) - (options.paddingTextWidth/2);
		var yPos = (self.getBarHeight(key)/2)- (elementText.height/2) - (options.paddingTextHeight/2);
		
		return 'translate('+xPos+', '+yPos+')';	
	}
	
	this.formatNumber = function(nStr) {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + "'" + '$2');
		}
		return x1 + x2;
	}
	
}


var Translation = {
	'year': 'Jahre',
	'school': 'Schulen',
	'subject': 'Fakultäten',
	'fh_subject': 'Studiengänge'
}

$(document).ready(function() {
	d3.json("data.json", function(data) {
		
		$('section#wrapper').css('width', options.width+'px');
		
		$('header').on('click', function() {
			if ($('#info').hasClass('show')) {
				$('#info').removeClass('show');
			} else {
				$('#info').show();
				$('#info').addClass('show');
			}
		});
		$('#info').on('click', function() {
			$('#info').removeClass('show');
		});
		
		var canvas = d3.select('#graph')
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
				.attr("stop-color", "#d52a35")
				.attr("stop-opacity", 1);
			gradientFemale.append("svg:stop")
		    	.attr("offset", "100%")
				.attr("stop-color", "#810012")
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
				.attr("stop-color", "#092550")
				.attr("stop-opacity", 1);
			gradientMale.append("svg:stop")
		    	.attr("offset", "100%")
				.attr("stop-color", "#127487")
				.attr("stop-opacity", 1);
			
			var gradientDetail = defs
				.append("svg:linearGradient")
				.attr("id", "gradientDetail")
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "100%")
				.attr("y2", "0%")
				.attr("spreadMethod", "pad");
			gradientDetail.append("svg:stop")
				.attr('id', 'gradientStop1')
		    	.attr("offset", "0%")
				.attr("stop-color", "#810012")
				.attr("stop-opacity", 1);
			gradientDetail.append("svg:stop")
				.attr('id', 'gradientStop2')
		    	.attr("offset", "100%")
				.attr("stop-color", "#092550")
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
			schoolObj.breadcrump = year;
			schoolObj.initialize();
			
			Object.keys(data.chronologic[year].schools).forEach(function(school) {			
				var subjectObj = new IV_Highscool_Node();
				subjectObj.itemName = 'subject';
				subjectObj.parentPrefix = schoolObj.parentPrefix+school+'_';
				subjectObj.data = data.chronologic[year].schools[school].subject;
				subjectObj.detailData = data.detail[school];
				subjectObj.level = 2;
				subjectObj.breadcrump = year+' > '+data.chronologic[year].schools[school].name;
				subjectObj.initialize();
				
				Object.keys(data.chronologic[year].schools[school].subject).forEach(function(subject) {
					var detailObj = new IV_Highscool_Node();
					detailObj.itemName = 'detail';
					detailObj.parentPrefix = subjectObj.parentPrefix+subject+'_';
					detailObj.data = data.detail[school][subject];
					detailObj.dataYear = year;
					detailObj.subjectName = subject;
					detailObj.detail = true;
					detailObj.detailName = data.chronologic[year].schools[school].subject[subject].name;
					detailObj.level = 3;
					detailObj.breadcrump = year+' > '+data.chronologic[year].schools[school].name+' > JAHRESVERLAUF 2000-2011';
					detailObj.initialize();
					
					subjectObj.addChild(subject, detailObj);
					
				});
				
				
				schoolObj.addChild(school, subjectObj);
			});
			
			yearObj.addChild(year, schoolObj);
		});
		
		
		yearObj.drawInit();
		
		// console.log('finish');
	
	});

});