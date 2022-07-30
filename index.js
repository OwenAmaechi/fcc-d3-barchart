const w = 800;
const h = 600;
const padding = 40;

let heightScale;
let xScale;
let xAxisScale;
let yAxisScale;
let gdps = [];

let canvas = d3.select('svg');

const fetchGDPdata = async () => {
	const gdpData = await fetch(
		'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
	)
		.then((res) => res.json())
		.catch((err) => console.log(err));
	gdps = gdpData.data.map((d) => {
		let date = d[0];
		let temp_date = date.split('-');
		let value = d[1];
		return [...temp_date, value];
	});
	console.log(gdps);

	drawCanvas();
};

const drawCanvas = () => {
	canvas.attr('width', w).attr('height', h);
	generateScale();
	generateAxes();
	drawBars();

	// Adding the y_axis labels
	canvas
		.append('g')
		.append('text')
		.attr('y', h / 2)
		.attr('x', -100)
		.attr('fill', 'black')
		.attr('font-size', '1.2em')
		.text('Gross Domestic Product')
		.attr('transform', `translate(-240,${h / 4}) rotate(-90)`);
};

const generateScale = () => {
	heightScale = d3
		.scaleLinear()
		.domain([0, d3.max(gdps, (d) => d[3])])
		.range([0, h - 2 * padding]);

	xScale = d3
		.scaleLinear()
		.domain([0, gdps.length - 1])
		.range([padding, w - padding]);

	xAxisScale = d3
		.scaleTime()
		.domain([
			d3.min(gdps, (d) => new Date(d[0] + '-' + d[1] + '-' + d[2])),
			d3.max(gdps, (d) => new Date(d[0] + '-' + d[1] + '-' + d[2])),
		])
		.range([padding, w - padding]);

	yAxisScale = d3
		.scaleLinear()
		.domain([0, d3.max(gdps, (d) => d[3])])
		.range([h - padding, padding]);
};
const generateAxes = () => {
	let xAxis = d3.axisBottom(xAxisScale);
	let yAxis = d3.axisLeft(yAxisScale);

	canvas
		.append('g')
		.call(xAxis)
		.attr('id', 'x-axis')
		.attr('transform', `translate(0, ${h - padding})`);

	canvas.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', `translate(${padding},0)`);
};
let drawBars = () => {
	canvas
		.selectAll('rect')
		.data(gdps)
		.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr('width', (w - 2 * padding) / gdps.length)
		.attr('data-date', (d) => d[0] + '-' + d[1] + '-' + d[2])
		.attr('data-gdp', (d) => d[3])
		.attr('height', (d) => heightScale(d[3]))
		.attr('x', (d, i) => xScale(i))
		.attr('y', (d) => h - padding - heightScale(d[3]))

		.on('mouseover', (event, d) => {
			const [x, y] = d3.pointer(event);
			console.log('x: ' + x);
			console.log('y: ' + y);

			const val = d3.format(',.1f')(d[3]);
			let quater;
			if (d[1] >= 1 && d[1] <= 3) quater = 'Q1';
			else if (d[1] >= 4 && d[1] <= 6) quater = 'Q2';
			else if (d[1] >= 7 && d[1] <= 9) quater = 'Q3';
			else quater = 'Q4';

			d3.select('#tooltip')
				.style('opcacity', 0.9)
				.style('width', 'auto')
				.style('height', 'auto')
				// .attr('x', x)
				// .attr('y', y)
				.style('left', x + '10px')
				.style('top', y + 'px')
				.attr('data-date', d[0] + '-' + d[1] + '-' + d[2])
				.html(d[0] + ' ' + quater + '<br>' + '$' + val + ' Billion')
				.attr('transform', `translate(${x},${y})`)
				.transition()
				.duration(100)
				.style('opacity', 0.9);
		})
		.on('mouseout', (event, d) => {
			const [x, y] = d3.pointer(event);
			d3.select('#tooltip').transition().duration(100).delay(100).style('opacity', 0);
		});
};

fetchGDPdata();
