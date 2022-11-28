function simulate(data,svg)
{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const halfwidth = width/2
    const halfheight =height/2
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")
    console.log("halfw", halfwidth)
    console.log("halfh", halfheight)

   //calculate degree of the nodes:
let node_degree={}; //initiate an object
   d3.map(data.links, (d)=>{
       if(d.source in node_degree)
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(d.target in node_degree)
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

let scale_radius=d3.scaleLinear()
   .domain(d3.extent(Object.values(node_degree)))
   .range([3,12])

let color=d3.scaleSequential()
   .domain([2000,2022])
   .interpolator(d3.interpolateRgbBasis(["RoyalBlue","DarkOrchid","SpringGreen"]))
    //.interpolator(d3.interpolateViridis);

let link_elements = main_group.append("g")
   //.attr('transform','translate(0,10)')
   .selectAll(".line")
   .data(data.links)
   .enter()
   .append("line")

const managePublisher=(Publisher)=>{
    let temp=Publisher.toString().split(' ').join('');
    temp= temp.split(".").join('');
    temp= temp.split(",").join('');
    temp= temp.split("/").join('');
    return "gr"+temp
}

let node_elements = main_group.append("g")
    .attr('transform', 'translate(${halfwidth}, ${halfheight})')
    .selectAll(".circle")
    .data(data.nodes)
    .enter()
    .append('g')
    .attr("class", function (d){
        return managePublisher(d.Year)
    })
    .on("mouseover", function(d, data){
        d3.selectAll('#Paper_Title').text(data.Title)

        node_elements.classed("inactive", true)

        const selected_class = d3.select(this).attr("class").split(" ")[0];
        console.log(selected_class)
        d3.selectAll("."+selected_class)
            .classed("inactive", false)
    })
    .on("mouseout", function(d, data){
        d3.select("#Paper_Title").text("")
        d3.selectAll(".inactive").classed("inactive", false)
    })

node_elements.append("circle")
    .attr("r", function(d, i){
        if(node_degree[d.id]!==undefined){
            return scale_radius(node_degree[d.id])
        }
        else{
            return scale_radius(0)
        }
    }).attr("fill",d=>color(d.Year))

let ForceSimulation=d3.forceSimulation(data.nodes)
    .force("collide",
        d3.forceCollide().radius(function (d,i){
            return scale_radius(node_degree[d.id])*2
        })
    )
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(data.links)
        .id(function (d){
            return d.id
        })
    )
    .on("tick", ticked);

function ticked()
{
    node_elements
        .attr('transform', function(d){return `translate(${d.x}, ${d.y})`})
        link_elements
            .attr("x1", function(d){return d.source.x})
            .attr("x2", function(d){return d.target.x})
            .attr("y1", function(d){return d.source.y})
            .attr("y2", function(d){return d.target.y})
}

svg.call(d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([1,5])
    .on("zoom", zoomed)

);

function zoomed({transform}){
    main_group.attr("transform", transform);
}
}