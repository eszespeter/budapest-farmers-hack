// timeline
var Timeline = function (o) {
    var feed = o.feed || [],
        div = o.div,
        scrolldiv = o.scrolldiv,
        daywidth = o.daywidth,
        endoffset = o.endoffset,
        pathheight = o.pathheight,
        dwidth = o.dwidth,
        dheight = o.dheight,
        scrollcallback = o.scrollcallback,
        minRange = o.minRange,
        dateoffset = o.dateoffset,
        lightoffset = o.lightoffset,
        tempoffset = o.tempoffset,
        humidoffset = o.humidoffset;


    var minDate = feed[0].parsedDate,
        maxDate = feed[feed.length-1].parsedDate;

    var x = d3.time.scale()
        .domain([minDate, maxDate])
        .range([0, daywidth*feed.length]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSubdivide(false)
        .orient("top")
        .ticks(d3.time.hours,24)
        .tickSize(0,0,0);

    //light
    var lighty = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.light; }))
        .range([minRange,pathheight/2]);

    var area = d3.svg.area()
        //.interpolate("bundle")
        .x(function(d) { return x(d.parsedDate); })
        .y1(function(d) { return lighty(d.light); })
        .y0(function(d) { return -lighty(d.light); });

    //temp
    var tempy = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.temperature; }))
        .range([pathheight,0]);

    var templine = d3.svg.line()
        //.interpolate("monotone")
        .x(function(d) { return x(d.parsedDate); })
        .y(function(d) { return tempy(d.temperature); });

    //humidity
    var humidy = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.humidity; }))
        .range([pathheight,0]);

    var humidline = d3.svg.area()
        //.interpolate("basis")
        .x(function(d) { return x(d.parsedDate); })
        .y1(function(d) { return humidy(d.humidity); })
        .y0(function(d) { return pathheight+minRange; });//humidy(d.humidity)+minRange; });

    var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", function (d, i) {
            d3.select("#"+scrolldiv)[0][0].scrollLeft += this.scrollLeft - d3.event.dx;
        });


    //DRAW
    function draw () {

        var svg = d3.select("#"+div)
            .attr("style", "width:" + (daywidth*feed.length + document.getElementById('hello').offsetWidth) + "px;")
            .insert("svg", "#hello")
            .attr("class", "timeline")
            .attr("width", daywidth*feed.length)
            .attr("height", dheight);

        svg.call(drag);

        //x-axis
        var xrules = svg.selectAll(".rule")
            .data(x.ticks(12))
            .enter().append("svg:line")
                .attr("class", "rule")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", 0)
                .attr("y2", dheight);

        svg.append("svg:g")
            .attr("class", "x-axis")
            .attr("transform", "translate("+ -daywidth*2.5 + "," + dateoffset + ")")
            .call(xAxis);

        //place of graph elements
        var graph = svg
            .append("svg:g")
            .attr("class", "graph")
            .attr("transform", "translate("+ 0 + "," + dateoffset + ")");

        //light
        var lightg = graph
            .append("g")
            .attr("class", "lightg")
            .attr("transform", "translate(" + [0, lightoffset] + ")");

        lightg.selectAll(".light")
            .data([feed])
            .enter().append("path")
                .attr("class", "light")
                .attr("d", area);

        //temperature
        var tempg = graph
            .append("g")
            .attr("class", "tempg")
            .attr("transform", "translate(" + [0, tempoffset] + ")");

        tempg.selectAll(".temp")
            .data([feed])
            .enter().append("path")
                .attr("class", "temp")
                .attr("d", templine);

        tempg.selectAll("linedot")
            .data(feed)
            .enter().append("svg:circle")
                .attr("class", "linedot")
                .attr("cx", function(d) { return x(d.parsedDate); })
                .attr("cy", function(d) { return tempy(d.temperature); })
                .attr("r", 5);

        //humidity
        var humidg = graph
            .append("g")
            .attr("class", "humidg")
            .attr("transform", "translate(" + [0, humidoffset] + ")");

        humidg.selectAll(".humid")
            .data([feed])
            .enter().append("path")
                .attr("class", "humid")
                .attr("d", humidline);

    };

    // var drange = d3.time.scale()
    //     .domain([minDate, maxDate])
    //     .range([0, daywidth*feed.length]);

    var prevScrollLeft = 0,
        elem = document.getElementById(scrolldiv);

    var userScrolled = false;
    document.getElementById(scrolldiv).onscroll = function (e) {
        userScrolled = true;
    };

    setInterval(function () {
        if (userScrolled) {
            var scrollLeft = elem.scrollLeft,
            delta = prevScrollLeft - scrollLeft;

            var data = x.invert(elem.scrollLeft);

            var less = feed.filter( function (d) {
                return data >= d.parsedDate
            });
            var more = feed.filter( function (d) {
                return data <= d.parsedDate
            });
            
            scrollcallback(less[0], data, more[more.length-1], delta);
            prevScrollLeft = scrollLeft;
            userScrolled = false;
        }
    },90);


    return{
        draw:draw
    };
};
