// Stan Helsloot, 10762388
var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
var requests = [d3.json(womenInScience), d3.json(consConf)];
window.onload = function() {
  Promise.all(requests).then(function(response) {
      // response.forEach(function(data){
        let refined_data = transformResponse(response);
        // combine the data into one array
        console.log(refined_data)
        year = undefined
        let draw = main(refined_data, year)
  }).catch(function(e){
      throw(e);
  });
};

function setGraph() {
  d3.selectAll("svg").remove();
  var year = document.getElementById('1').value;
  Promise.all(requests).then(function(response) {
      // response.forEach(function(data){

        var data = transformResponse(response);
        let draw = main(data, year)
  })
}

function main(refined_data, year){
  if ((year == undefined) || (year == "")){
    data = refined_data
  } else {
    data = []
    for (let i = 0; i < refined_data.length; i++){
      if (refined_data[i][0] == year){
        // add data to data thingy
        data.push(refined_data[i])
      }
    }
  }
  // use d3 to make the plot
  // define heigth, width, padding
  var w = 800;
  var h = 300;
  var padding = 30;
  var margin = {top: 40, right: 120, bottom: 20, left: 30}
  // create a svg canvas
  var svg = d3.select("body")
              .append("svg")
              .attr("width", w + margin.left + margin.right)
              .attr("height", h + margin.top + margin.bottom)

  // create legend block
  var legend = svg.append("rect")
                 .attr("class", "legend")
                 .attr("width", margin.right)
                 .attr("height", margin.top * 3)
                 .attr("x", w + margin.left)
                 .attr("y", 0);
                 // .style("fill", "rgb(0, 255, 0)");


  // making lists of consConf [1] and womenInScience [2]
  var consConf = []
  for (let i = 0; i < data.length; i++){
    consConf.push(data[i][1])
  }
  var womenInScience = []
  for (let i = 0; i < data.length; i++){
    womenInScience.push(data[i][2])
  }
  var yScale = d3.scaleLinear()
                 .domain([Math.min(...consConf) - 5, Math.max(...consConf) + 1])
                 .range([h, padding]);

  var xScale = d3.scaleLinear()
                 .domain([Math.min(...womenInScience) -10, Math.max(...womenInScience)])
                 .range([padding, w]);

  // making the circles one at a time (for later use when different colours have to be used)
  // colours for the circles
  color = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']
  let counter = - 1
  let countryList = []
  for (let i = 0; i < data.length; i++){
    if (!countryList.includes(data[i][3])) {
      counter += 1
      countryList.push(data[i][3])

      // create text for legend
      svg.append("text")
            .attr("x", w + margin.left)
            .attr("y", (counter * 20) + 15)
            .text(data[i][3])
            .attr("fill", color[counter])
    }
    svg.append("circle")
    .attr("cx", function() {
       // convert womenInScience to scale
       return xScale(data[i][2]);
     })
     .attr("cy", function() {
       // use data.datapoint for x values
       return yScale(data[i][1]);
     })
     .attr("r", 3)
     .attr("fill", color[counter]);
  };

   // making the axyi
   var yAxis = d3.axisLeft()
                 .scale(yScale)
                 .ticks(5)

   svg.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(" + margin.left * 2 + ", 0)")
            .call(yAxis);
   var xAxis = d3.axisBottom()
                 .scale(xScale)
                 .ticks(5);
   svg.append("g")
           .attr("class", "xaxis")
           .attr("transform", "translate(" + margin.left + "," + h + ")")
           .call(xAxis);
   // append text to the axii
   svg.append("text")
      .attr("transform",
          "translate(" + (w/2) + " ," +
                         (h + margin.top) + ")")
      .style("text-anchor", "middle")
      .text("Percentage of women in science");

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", - h/2)
       .attr("y", margin.left)
       .style("text-anchor", "middle")
       .text("Consumer Confidence");

}


function transformResponse(response){
    // console.log(response)
    // set array to add response to
    var dataCollection = []
    response.forEach(function(data){
      // access data property of the response
      let dataHere = data.dataSets[0].series;
      // access variables in the response and save length for later
      let series = data.structure.dimensions.series;
      let seriesLength = series.length;
      // console.log(series)


      // set up array of variables and array of lengths
      let varArray = [];
      let lenArray = [];

      series.forEach(function(serie){
          varArray.push(serie);
          lenArray.push(serie.values.length);
      });

      // get the time periods in the dataset
      let observation = data.structure.dimensions.observation[0];
      // add time periods to the variables, but since it's not included in the
      // 0:0:0 format it's not included in the array of lengths
      varArray.push(observation);

      // create array with all possible combinations of the 0:0:0 format
      let strings = Object.keys(dataHere);

      // set up output array, an array of objects, each containing a single datapoint
      // and the descriptors for that datapoint
      let dataArray = [];

      // for each string that we created
      strings.forEach(function(string){
          // for each observation and its index
          observation.values.forEach(function(obs, index){
              let data = dataHere[string].observations[index];
              if (data != undefined){

                  // set up temporary object
                  let tempObj = {};

                  let tempString = string.split(":").slice(0, -1);
                  tempString.forEach(function(s, indexi){
                      tempObj[varArray[indexi].name] = varArray[indexi].values[s].name;
                  });

                  // every datapoint has a time and ofcourse a datapoint
                  tempObj["time"] = obs.name;
                  tempObj["datapoint"] = data[0];
                  dataArray.push(tempObj);
              }
          });
      });
      dataCollection.push(dataArray)
    })
    // combine data based on their years
    // create new array to which to add combined data
    var combinedData = []
    var y = 0
    for (let i = 0; i < dataCollection[0].length; i++){
      if (dataCollection[0][i].time != dataCollection[1][i + y].time){
        y += 1
      }
      let tempObj = [dataCollection[1][i + y].time, dataCollection[1][i + y].datapoint, dataCollection[0][i].datapoint, dataCollection[1][i + y].Country]
      combinedData.push(tempObj)
    };
    return combinedData;

}
