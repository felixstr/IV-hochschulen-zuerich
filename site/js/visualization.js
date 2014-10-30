var screenWidth = 1200;
var screenHeight = 600;

var buttonWidth = 80;

var currentYear = 2008;
var years = null;

var jsonData = null


d3.json("data.json", function(data) {
	// console.log(data);
	jsonData = data
	years = Object.keys(jsonData);
	
	// total pro jahr
		
	var selection_canvas = d3.select('#graph')
		.attr('width', screenWidth)
		.attr('height', screenHeight);
	
	// year navigation
	var selection_years = selection_canvas
		.append('g')
		.classed('year_group', true).selectAll('g');
	var group_button = selection_years
		.data(years)
		.enter()
		.append('g')
		.attr('transform', function(d, i) { return 'translate('+i*(buttonWidth+5)+',0)' });
	group_button
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', buttonWidth)
		.attr('height', 30)
		.on('click', function(d) { change_year(d); });
	group_button
		.append('text')
		.attr('x', buttonWidth/2)
		.attr('y', 20)
		.text(function(d) { return d })
		.on('click', function(d) { change_year(d); });
	
	
	// graph
	var selection_graph = selection_canvas
		.append('g')
		.classed('schools', true)
		.attr('transform', function(d, i) { return 'translate(500,150)'; });
	
	updateGraph();
	
	
	// verlauf total
	var totals = years.map(function(item) {
		return [jsonData[item].female/1000, jsonData[item].male/1000];
	});
	
	var process = selection_canvas
		.append('g')
		.classed('process', true)
		.attr('transform', function(d, i) { return 'translate(0,50)'; });
	process.selectAll('rect.female')
		.data(totals)
		.enter()
		.append('rect')
		.classed('female', true)
		.attr('width', buttonWidth/2)
		.attr('height', function(d) { return d[0]*2; })
		.attr('x', function(d, i) { return i*(buttonWidth+5); });
	process.selectAll('rect.male')
		.data(totals)
		.enter()
		.append('rect')
		.classed('male', true)
		.attr('width', buttonWidth/2)
		.attr('height', function(d) { return d[1]*2; })
		.attr('x', function(d, i) { return i*(buttonWidth+5)+(buttonWidth/2); });
});


function updateGraph() {
	// graph
	var selection_canvas = d3.select('g.schools');
	
	/*
	console.log(jsonData[currentYear].Universitaet.female_percent);
	console.log(jsonData[currentYear].ETH.female_percent);
	console.log(jsonData[currentYear].Fachhochschulen.female_percent);
*/
	
	var selection_graph = selection_canvas.selectAll('rect')
		.data([
			jsonData[currentYear].Universitaet.female_percent, 
			jsonData[currentYear].ETH.female_percent, 
			jsonData[currentYear].Fachhochschulen.female_percent
		]);
	selection_graph
		.transition()
		.attr('height', function(d) { return d; });
	selection_graph
		.enter()
		.append('rect')
		.attr('width', '50')
		.attr('height', function(d) { return d; })
		.attr('x', function(d,i){ return i*51; });
	
}

function change_year(year) {
	currentYear = year;
	updateGraph();

	
}