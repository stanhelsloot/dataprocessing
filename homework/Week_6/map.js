// var geoData = "http://bl.ocks.org/micahstubbs/raw/8e15870eb432a21f0bc4d3d527b2d14f/a45e8709648cafbbf01c78c76dfa53e31087e713/world_countries.json"
// var gunData = "https://api.worldbank.org/v2/en/country/all/indicator/VC.IHR.PSRC.MA.P5?format=json&per_page=20000&source=2"
var requests = [d3.json("geoData.json"), d3.json("data.json")]; // , d3.json(gunData)];


window.onload = function() {
  Promise.all(requests).then(function(response) {
    let draw = worldMaker(response)

  })

}

  function worldMaker(data) {

    var bmiData = transformData(data[1])

    // function(d){
    //   for (let i = 0; i < bmiData.length; i++){
    //     if (bmiData[i][1] == d.id){
    //       return bmiData[i][3];
    //     }
    //   }
    //   return NaN;
    // }

    // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([0, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>BMI: </strong><span class='details'>"+ 19 +"</span>";
              });

    // set width, height, padding and margins
    var w = 800;
    var h = 300;
    var padding = 30;
    var margin = {top: 40, right: 120, bottom: 20, left: 30}

    // create svg canvas
    var svg = d3.select("body")
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom);

   // creating an array with bmiValues for use in min/max of colorScale domain
   var bmiValues = []
   for (let i = 0; i < bmiData.length; i++){
     bmiValues.push(bmiData[i][3]);
   }

   // set colorScale
   var colorScale = d3.scaleLinear()
                      .domain([Math.max(...bmiValues), Math.min(...bmiValues)])
                      .range([0, 255])

    // create projection
    var projection = d3.geoMercator()
                   .scale(110)
                  .translate( [w / 2, h / 1.5]);

    // create path
    var path = d3.geoPath().projection(projection);

    // console.log(data[0].features[0].id)
    // draw countries
    svg.append("g")
       .attr("class", "countries")
       .selectAll("path")
       .data(data[0].features)
       .enter()
       .append("path")
       .attr("d", path)
       .style("stroke", "white")
       .style("stroke-width", 0.3)
       // .data(data[1].data)
       // .enter()
       .style("fill", function(d){
         for (let i = 0; i < bmiData.length; i++){
           if (bmiData[i][1] == d.id){
             return "rgb(0, 0, " +  colorScale(bmiData[i][3]) +")";
           }
         }
         return "rgb(0, 0, 0)"
       })
       .style("opacity", 0.8)
       .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width", 1);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3)
          })
          .on("click", function(d){
            setGraph(d.id)
          });

    // create legend based on color darkness and missing countries
    var legend = svg.append("rect")
                 .attr("class", "legend")
                 .attr("width", margin.right)
                 .attr("height", margin.top * 3)
                 .attr("x", w + margin.left - 2)
                 .attr("y", 2)
                 .style("fill", "white");
                 // .style("stroke", "black")
                 // .style("stroke-width", 2);

    svg.call(tip);

    rankingPlot()

  }

  function rankingPlot(country) {

    // load in data
    d3.json("data_years.json").then(function(data){
      data = data.data
      yearList = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]
      dataRefined = []
      for (let i = 0; i < data.length; i++){
        if (yearList.includes(data[i][2])){
          dataRefined.push(data[i])
        }
      }
      var bmiValues = []
      for (let i = 0; i < dataRefined.length; i++){
        bmiValues.push(dataRefined[i][4]);
      }

      d3.select("body").append("h3").text("Male and Female mean BMI per country between 2006 and 2016");

      // set width, height, padding and margins
      var w = 800;
      var h = 300;
      var padding = 30;
      var margin = {top: 40, right: 120, bottom: 20, left: 50}

      // create svg canvas
      var svg = d3.select("body")
                  .append("svg")
                  .attr("width", w + margin.left + margin.right)
                  .attr("height", h + margin.top + margin.bottom);

      // setting the y-scale
      var yScale = d3.scaleLinear()
                    .domain([20, 30])
                    .range([h, padding]);

      // setting x scale
      var xScale = d3.scaleLinear()
                     .range([0, w])
                     .domain([2006, 2016]);

      // scaling factor for the colours
      var colorScale = d3.scaleLinear()
                         .domain([Math.min(...bmiValues), Math.max(...bmiValues)])
                         .range([80, 255]);

      // select "data" from datafile
      const div = d3.select('body')
                    .append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);

      // setting y axis
      var yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(5);

      // setting x xAxis
      var xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(10)

      // appending axis
      svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);

      // appending axis
      svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + margin.left + "," + h + ")")
        .call((xAxis));

      svg.append("text")
          .attr("transform",
              "translate(" + (w/2) + " ," +
                             (h + margin.top) + ")")
          .style("text-anchor", "middle")
          .text("Year");

      svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", - h/2)
         .attr("y", margin.left / 2)
         .style("text-anchor", "middle")
         .text("Average BMI");

    // select either man or women
    countryData = []
    for (let i = 0; i < dataRefined.length; i++){
      if (dataRefined[i][0] == country && dataRefined[i][3] == "Men"){
        countryData.push({"Year": dataRefined[i][2], "Sex": dataRefined[i][3], "BMI": dataRefined[i][4]});
      }
    }
    // console.log(countryData)

    // define the line
    var valueline = d3.line()
        .x(function(countryData) {
          console.log(countryData.Year);
          return xScale(countryData.Year);
        })
        .y(function(countryData) {
          console.log(countryData["BMI"])
          return yScale(countryData["BMI"]);
        });
    // Add the valueline path.
    svg.append("path")
        .data([countryData])
        .attr("class", "line")
        .attr("d", valueline)
        .attr("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .attr("transform", "translate(" + margin.left + ", 0)");

    // Add the valueline path.
    // svg.append("path")
    //     .data()
    //     .attr("class", "line")
    //     .attr("d", valueline2);

    })

  }
  function setGraph(country) {
    d3.json("data_years.json").then(function(data){
      var data = data.data
      yearList = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]
      dataRefined = []
      for (let i = 0; i < data.length; i++){
        if (yearList.includes(data[i][2])){
          dataRefined.push(data[i])
        }
      }

      var countryData = []
      for (let i = 0; i < dataRefined.length; i++){
        if (dataRefined[i][1] == country && dataRefined[i][3] == "Men"){
          countryData.push({"Year": dataRefined[i][2], "Sex": dataRefined[i][3], "BMI": dataRefined[i][4]});
        }
      }

      // Select the section we want to apply our changes to
  var svg = d3.select("body").transition();

console.log(data)
  console.log(countryData)
  var valueline = d3.line()
      .x(function(countryData) {
        console.log(countryData)
        console.log(countryData.Year);
        return xScale(countryData.Year);
      })
      .y(function(countryData) {
        console.log(countryData["BMI"])
        return yScale(countryData["BMI"]);
      });


  // Make the changes
      svg.select("path")   // change the line
          .duration(750)
          .attr("d", valueline([data]));
      // svg.select(".x.axis") // change the x axis
          // .duration(750)
          // .call(xAxis);
      // svg.select(".y.axis") // change the y axis
          // .duration(750)
          // .call(yAxis);
      console.log("dfaoj")

  });

  }

  function transformData(data) {
    // function selects the BMI data of either men or women.
    var returnData = []
    for (let i = 0; i < data.data.length; i++){
      if (data.data[i][2] == "Men"){
        returnData.push(data.data[i]);
      }
    }
    return(returnData)
  }
