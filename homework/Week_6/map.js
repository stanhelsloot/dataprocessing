var requests = [d3.json("geoData.json"), d3.json("data.json")];


window.onload = function() {
  Promise.all(requests).then(function(response) {
    let draw = worldMaker(response)

  })

}

  function worldMaker(data) {

  var bmiData = transformData(data[1])

  // Set tooltip of worldmap
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([0, 0])
              .html(function(d) {
                for (let i = 0; i < bmiData.length; i++){
                  if (d.properties.name == bmiData[i][0]){
                    bmi = bmiData[i][3]
                  }
                }
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>BMI: </strong><span class='details'>"+ bmi +"</span>";
              });
    
  // set width, height, padding and margins
  var w = 1300;
  var h = 600;
  var padding = 30;
  var margin = {top: 80, right: 120, bottom: 20, left: 50}

  // create svg canvas
  var svg = d3.select("body")
              .append("svg")
              .attr("id", 1)
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
                     .range([0, 255]);

  // create projection
  var projection = d3.geoMercator()
                     .scale(160)
                     .translate( [w / 2, h / 1.4]);

  // create path
  var path = d3.geoPath().projection(projection);

  // append title of worldmap
  svg.append("text")
    .attr("x", w / 2)
    .attr("class", "title")
    .attr("y", margin.top / 3)
    .style("text-anchor", "middle")
    .text("Average male BMI of 2016 of the world");

  // draw countries and fill them according to their average BMI
  svg.append("g")
     .attr("class", "countries")
     .selectAll("path")
     .data(data[0].features)
     .enter()
     .append("path")
     .attr("d", path)
     .style("stroke", "white")
     .style("stroke-width", 0.3)
     .attr("transform", "translate(0, " + margin.top + ")")
     .style("fill", function(d){
       for (let i = 0; i < bmiData.length; i++){
         // match country ISO codes
         if (bmiData[i][1] == d.id){
           // determine shade according to the value of the BMI data
           return "rgb(0," +  colorScale(bmiData[i][3]) +", 0)";
         }
       }
       // if country has no data, color it red
       return "rgb(255, 0, 0)"
     })
     .style("opacity", 0.8)
     .style("stroke","white")
     .style('stroke-width', 1)
     .on('mouseover',function(d){
       tip.show(d);
       // show the country is selected
       d3.select(this)
         .style("opacity", 1)
         .style("stroke","white")
         .style("stroke-width", 3);
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

  // activate tip
  svg.call(tip);

  // create color shading legend
  makeLegend(svg, bmiValues)

  // create graph
  linePlot()

  // function for creating the svg and axii of the linePlot
  function linePlot(country) {
    // load in data
    d3.json("data_years.json").then(function(data){

      dataRefined = data.data

      // collect BMI values over all time for use in the yScale
      var bmiValues = []
      for (let i = 0; i < dataRefined.length; i++){
        bmiValues.push(dataRefined[i][4]);
      }

      // create svg canvas
      var svg = d3.select("body")
                  .append("svg")
                  .attr("id", "lineplot")
                  .attr("width", w + margin.left + margin.right)
                  .attr("height", h + margin.top + margin.bottom);

      // appending title to svg object
      svg.append("text")
         .attr("x", w / 2)
         .attr("class", "title")
         .attr("y", margin.top / 2)
         .style("text-anchor", "middle")
         .text("Click on a country to see the average male BMI from 1975 to 2016!");

      // setting the y-scale
      var yScale = d3.scaleLinear()
                    .domain([Math.min(...bmiValues), Math.max(...bmiValues)])
                    .range([h, padding]);

      // creating a function to transform numeric values to date values
      var parseTime = d3.timeParse("%Y")

      // append the converted dates to a list for use in axii and scales
      var yearValues = []
      for (let i = 1975; i < 2018; i++){
        j = parseTime(i)
        yearValues.push(j);
      }

      // set data to yearValues for use in unnamed functions
      data = yearValues

      // setting the xScale (timescale)
      var xScale = d3.scaleTime()
                     .range([0, w])
                     .domain(d3.extent(yearValues, function(d) { return d }));

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
         .call(yAxis)
         .style("font-size", "15px");

      // appending axis
      svg.append("g")
         .attr("class", "xaxis")
         .attr("transform", "translate(" + margin.left + "," + h + ")")
         .call(xAxis)
         .style("font-size", "15px");

      // append xAxis text
      svg.append("text")
          .attr("transform", "translate(" + (w/2) + " ," +
                             (h + margin.top) + ")")
          .style("text-anchor", "middle")
          .text("Year")
          .style("font-size", "20px");

      // Append yAxis text
      svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", - h/2 + 30)
         .attr("y", margin.left / 2)
         .style("text-anchor", "middle")
         .text("Average BMI")
         .style("font-size", "20px");

      // append data from the specified country to an array, is specified so
      // the update function can be used...
      countryData = []
      for (let i = 0; i < dataRefined.length; i++){
        if (dataRefined[i][1] == country && dataRefined[i][3] == "Men"){
          countryData.push({"Year": dataRefined[i][2], "Sex":
          dataRefined[i][3], "BMI": dataRefined[i][4]});
        }
      }

      // define valueline, used for creating the points between which will be drawn
      var valueline = d3.line()
          .x(function(d) {
            return xScale(parseTime(d.Year));
          })
          .y(function(d) {
            return yScale(d["BMI"]);
          });

      // Add the valueline path. Will show up empty since no country is
      // specified, however, otherwise the update functions wont work:)
      svg.append("path")
          .data([countryData])
          .attr("class", "line")
          .attr("d", valueline)
          .attr("fill", "white")
          .style("stroke", "orange")
          .style("stroke-width", 4)
          .attr("transform", "translate(" + margin.left + ", 0)");

      })
    }

  function setGraph(country) {
    d3.json("data_years.json").then(function(data){

      // set data
      dataRefined = data.data

      // collect data for setting scales
      var bmiValues = []
      for (let i = 0; i < dataRefined.length; i++){
        bmiValues.push(dataRefined[i][4]);
      }

      // creating nmeric to date converter
      var parseTime = d3.timeParse("%Y")
      var yearValues = []

      // collect and convert the data
      for (let i = 1975; i < 2018; i++){
        j = parseTime(i)
        yearValues.push(j);
      }

      // setting data for further use
      data = yearValues

      // setting xScale using timefunctions
      var xScale = d3.scaleTime()
                     .range([0, w])
                     .domain(d3.extent(yearValues, function(d) { return d }));

      // setting yScale
      var yScale = d3.scaleLinear()
                     .domain([Math.min(...bmiValues), Math.max(...bmiValues)])
                     .range([h, padding]);

      // collecting data from the specified countryd
      var countryData = []
      for (let i = 0; i < dataRefined.length; i++){
        if (dataRefined[i][1] == country && dataRefined[i][3] == "Men"){
          countryData.push({"Year": dataRefined[i][2], "Sex": dataRefined[i][3], "BMI": dataRefined[i][4]});
        }
      }

      // set country name for use in title of the plot
      for (let i = 0; i < dataRefined.length; i++){
        if (dataRefined[i][1] == country){
          var countryName = dataRefined[i][0];
          break;
        }
      }

      // change the header of the graph
      d3.selectAll(".title").transition().text("Average male BMI from 1975 to 2016 of " + countryName  + "")

      // set data to countrydata because javascript..
      data = countryData

      //  set the value determiner for the datapoints of the graph
      var valuelineSec = d3.line()
                           .x(function(d) {
                             return xScale(parseTime(d.Year));
                           })
                           .y(function(d) {
                             return yScale(d["BMI"]);
                           });

      var svg = d3.selectAll("#lineplot");

      // Make the changes to the line
      svg.select(".line")
         .transition()
         .duration(750)
         .attr("d", valuelineSec(data));

      // setting data to an array of years
      data = yearValues

      // create bisector function which will be used to fit the data between
      // two existing points
      var bisectDate = d3.bisector(function(d) { return d; }).left;

      // create overlay rectange for movemove
      var rect = svg.append("rect")
                    .attr("width", w + margin.left + margin.right)
                    .attr("height", h + margin.top + margin.bottom)
                    .style("opacity", 0)
                    .on("mousemove", function (){
                      // convert pixel data to year data
                      var year = xScale.invert(d3.mouse(rect.node())[0]),
                      // try fitting the data between two existing points
                      i = bisectDate(data, year, 1);
                      // used to correct the use of margins
                      i = i - 2;
                      // draw tooltipline + display data of pointed to point
                      toolTipLine(countryData, yearValues[i], h, xScale)
                     })
                    .on("mouseout", function() {
                      // remove the tooltip + data
                      removeTooltip()
                     });

     // append line to the svg
     svg.append("line").attr("id", "tipline");

     // add text (withouth text) to the plot
     svg.append("text")
        .attr("id", "updatableText")
        .attr("y", margin.top)
        .attr("x", w/2)
        .style("text-anchor", "middle")
        .style("font-size", "17px");
      });
      // create tipline and give em a class
      function toolTipLine(countryData, year, h, xScale) {
        // select the tipline of the svg
        var  tipLine = d3.selectAll("#tipline")

        // draw the line
        tipLine.attr('stroke', 'black')
               .attr('x1', xScale(year) + margin.left)
               .attr('x2', xScale(year) + margin.left)
               .attr('y1', margin.top)
               .attr('y2', h)

        // update the data which is displayed
        d3.selectAll("#updatableText").text(function (data) {
          for (let i = 0; i < countryData.length; i ++){
            // convert year data to nuymer year witch getyear +1900
             // and compare with inputted year
            if (countryData[i].Year == year.getYear() + 1900) {
              bmi = countryData[i].BMI
            }
          }
          return ("Year: "+ (year.getYear() + 1900) + " BMI: " + bmi + "")
        });
      }

      function removeTooltip() {
        // request tipline
        var  tipLine = d3.selectAll("#line")
        // set tipline to zero
        if (tipLine) tipLine.attr('stroke', 'none');
        // request text
        var  text = d3.selectAll("#updatableText")
        // set text to 0
        if (text) text.text("");
    }
  }
}

  function transformData(data) {
    // function selects the BMI data of men
    var returnData = []
    for (let i = 0; i < data.data.length; i++){
      if (data.data[i][2] == "Men"){
        returnData.push(data.data[i]);
      }
    }
    return(returnData)
  }

  function makeLegend(svg, bmiValues){
    // set width and height for the legend
    var w = 60
    var h = 200

    // append legend
  	var legend = svg.append("defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient")
                    .attr("x1", "100%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

    // set gradient
  	legend.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "rgba(0, 0 , 0, 0.8)")
          .attr("stop-opacity", 1);

    // set second part of gradient
  	legend.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "rgba(0, 255, 0, 0.8)")
          .attr("stop-opacity", 1);

    // append rect
  	svg.append("rect")
       .attr("width", w)
       .attr("height", h)
       .style("fill", "url(#gradient)")
       .attr("transform", "translate(30,10)");

    // set yScale
    var yScale = d3.scaleLinear()
                   .domain([Math.min(...bmiValues), Math.max(...bmiValues)])
                   .range([h + 10, 10]);

    // set yAxis
    var yAxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(5);

    // append yAxis
    svg.append("g")
       .attr("class", "yaxis")
       .attr("transform", "translate(30,0)")
       .call(yAxis)
       .style("font-size", "15px");

  }
