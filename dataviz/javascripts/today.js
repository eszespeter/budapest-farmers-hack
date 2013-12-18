
//today
var Today = function (o) {
    var feed = o.feed,
        data = o.data,
        div = o.div,
        width = o.width,
        dheight = o.dheight,
        minRange = o.minRange,
        pathheight = o.pathheight,
        dateoffset = o.dateoffset,
        pathheight = o.pathheight,
        lightoffset = o.lightoffset,
        tempoffset = o.tempoffset,
        humidoffset = o.humidoffset;


    var svg = d3.select("#"+div).append("svg")
        .attr("class", "today")
        .attr("width", width)
        // .attr("height", dheight);
    
    //SVG DEFINITONS
    var defs = svg.append("svg:defs")

    function radialgrad (o) {
        o.el.append('svg:radialGradient')
        .attr('gradientUnits', o.gradunit || 'objectBoundingBox')
        .attr('cx', o.cx || 0.5).attr('cy', o.cy || 0).attr('r', o.r || 1).attr('fy', o.fy || 0.3).attr('fx', o.fx || 0.3)
        .attr('id', o.id).call(
            function(gradient) {
                gradient.append('svg:stop').attr('offset', o.start || '0' + '%').attr('style', 'stop-color:' + o.startcolor + '; stop-opacity:' + o.startopacity);
                gradient.append('svg:stop').attr('offset', o.stop || '100' + '%').attr('style', 'stop-color:' + o.stopcolor + ';stop-opacity:' + o.stopopacity);
            });
    }
    function img (pt,x,y,w,h,href, op) {
        pt.append("svg:image")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("fill-opacity", op || 1)
            .attr("xlink:href", href);
    }

    radialgrad({
        el: defs,
        gradunit: "objectBoundingBox",
        id: "sungradient",
        start: 0,
        stop: 60,
        startcolor: '#fd683f',
        stopcolor: '#eb4138',
        startopacity: 1,
        stopopacity: 1
    })

    radialgrad({
        el: defs,
        gradunit: "userSpaceOnUse",
        id: "blue",
        cx: 0,
        cy: 100,
        fy: 100,
        r: width,
        startcolor: '#22282c',
        stopcolor: '#1c2325',
        startopacity: 0.8,
        stopopacity: 0.9
    })

    radialgrad({
        el: defs,
        gradunit: "objectBoundingBox",
        id: "red",
        cx: 3,
        cy: 2,
        fy: 1,
        r: 3,
        startcolor: '#c93432',
        stopcolor: '#6b2d27',
        startopacity: 1,
        stopopacity: 1
    })

    radialgrad({
        el: defs,
        gradunit: "objectBoundingBox",
        id: "green",
        cx: -1,
        cy: 1,
        fy: 2,
        fx: 0,
        r: 10,
        stopcolor: '#243829',
        startcolor: '#243829',
        stopopacity: 0.5,
        startopacity: 1
    })

    var pattern1 = defs.append("svg:pattern")
        .attr("id", "bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 1000)
        .attr("height", 1000)
        .attr("patternUnits", "userSpaceOnUse")
        //.attr("patternContentUnits", "objectBoundingBox")
    
    pattern1.call(img, 0, -100, width, width, "/dataviz/images/bg.png");

    pattern1.append("svg:rect")
        .attr("class", "gradientrect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", dheight)
        .attr("fill", "url(#blue)")

    var pattern2 = defs.append("svg:pattern")
        .attr("id", "underground")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 1000)
        .attr("height", 1000)
        .attr("patternUnits", "userSpaceOnUse")
        //.attr("patternContentUnits", "objectBoundingBox")

    pattern2.call(img, 0, 0, 1000, 1000, "/dataviz/images/bg.png");


    //DATE
    var datetext = svg.selectAll(".datetext").data([feed[0].parsedDate]),
        format = d3.time.format("%b %d");
    var hourtext = svg.selectAll(".hourtext").data([feed[0].parsedDate]),
        hourformat = d3.time.format("%I %p");

    datetext.enter().append("svg:text")
        .attr("class", "datetext")
        .text(function (d) { return format(d); })
        .attr("width",  width/2 - 60)
        .attr("x", 20)
        .attr("y", dateoffset)

    hourtext.enter().append("svg:text")
        .attr("class", "hourtext")
        .text(function (d) { return hourformat(d); })
        .attr("width",  width/2 - 45)
        .attr("x", 20)
        .attr("y", dateoffset+40)


    //foreground
    var fg = svg
        .append("svg:g")
        .attr("class", "graph")
        .attr("transform", "translate(0," + dateoffset + ")");

    //SUN
    //place for sun
    var sung = fg.append("g")
        .attr("class", "sung")
        .attr("transform", "translate(0," + lightoffset + ")");

    var suny = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.light; }))
        .range([minRange,pathheight/2]);

    var sunline = sung.selectAll(".sunline")
        .data([feed[0].light]);

    var sunbtline = sung.selectAll(".sunbtline")
        .data([feed[0].light]);

    var suncircle = sung.selectAll(".suncircle")
        .data([feed[0].light]);

    sunline.enter().append("svg:line")
        .attr("class", "sunline")
        .attr("x1", width/2)
        .attr("x2", width)
        .attr("y1", function (d) { return -suny(d); })
        .attr("y2", function (d) { return -suny(d); });

    sunbtline.enter().append("svg:line")
        .attr("class", "sunbtline")
        .attr("x1", width/2)
        .attr("x2", width)
        .attr("y1", function (d) { return suny(d); })
        .attr("y2", function (d) { return suny(d); });

    suncircle.enter().append("svg:circle")
        .attr("class", "suncircle")
        //.attr("fill", "url(#bg)")
        .attr("cx", function(d) { return width/2 })
        .attr("cy", function(d) { return 0; })
        .attr("r", function(d) { return suny(d); });

    var suntext = sung.selectAll(".suntext").data([feed[0].light])
    var suntextlabel = sung.selectAll(".suntextlabel").data([feed[0].light])

    suntext.enter().append("svg:text")
        .attr("class", "suntext")
        .text(function (d) { return Math.floor(d); })
        .attr("x", 20)
        .attr("y", -10)

    suntextlabel.enter().append("svg:text")
        .attr("class", "suntextlabel")
        .text(function (d) { return "Lumen"; })
        .attr("x", 20)
        .attr("y", 0)

    // svg.append("svg:rect")
    //     .attr("class", "sky")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", width)
    //     .attr("height", dheight*0.6)
    //     .attr("opacity", 0.8)
    //     .attr("fill", "url(#underground)")

    // svg.append("svg:rect")
    //     .attr("class", "sky2")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", width)
    //     .attr("height", dheight*0.6)
    //     .attr("opacity", 0.9)
    //     .attr("fill", "#d1e5e4")

    //GROUND
    fg.append("svg:rect")
        .attr("class", "ground")
        .attr("x", 0)
        .attr("y", dheight/2)
        .attr("width", width)
        .attr("height", dheight/2)



    var gdata = [];
    for (var i=0; i<32; i++) { gdata.push(
        {
            x:i,
            delta: 20
        }
    )};

    var groundarea = fg.selectAll(".underground")
        .data([gdata]);
    var gx = d3.scale.linear().domain([0, 30]).range([0,width]);

    var ground = d3.svg.area()
        //.interpolate("bundle")
        .x(function(d) { return gx(d.x); })
        .y0(function(d) { return dheight/1.8 + Math.cos(d.x*d.delta*30); })
        .y1(function(d) { return dheight; });

    groundarea.enter().append("svg:path")
        .attr("class", "underground")
        .attr("d", ground);


    //TEMPERATURE
    //place for temp
    var tempg = fg.append("g")
        .attr("class", "tempg")
        .attr("transform", "translate(0," + tempoffset + ")");

    //drawing bg
    tempg.append("svg:rect")
        .attr("class", "tempbg")
        .attr("x", width/2 -12)
        .attr("y", -12)
        .attr("width", 24)
        .attr("height", pathheight+minRange)
        .attr("rx", 12)
        .attr("ry", 12)

    tempg.append("svg:circle")
        .attr("class", "tempbg")
        .attr("cx", width/2)
        .attr("cy", pathheight)
        .attr("r", 18);

    tempg.append("svg:circle")
        .attr("class", "tempcircle")
        .attr("cx", width/2)
        .attr("cy", pathheight)
        .attr("r", 14);

    //dynamic stuff
    var temp = tempg.selectAll(".temp")
        .data([feed[0].temperature]);

    var templine = tempg.selectAll(".templine")
        .data([feed[0].temperature]);

    var tempy = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.temperature; }))
        .range([0,pathheight]);

    var templiney = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.temperature; }))
        .range([pathheight,0]);

    templine.enter().append("svg:line")
        .attr("class", "templine")
        .attr("x1", width/2)
        .attr("x2", width)
        .attr("y1", function (d) { return tempy(d); })
        .attr("y2", function (d) { return tempy(d); });

    temp.enter().append("svg:rect")
        .attr("class", "temp")
        .attr("x", width/2 -9)
        .attr("y",  function (d) { return pathheight-tempy(d); })
        .attr("width", 18)
        .attr("height", function (d) { return tempy(d); })
        .attr("rx", 9)
        .attr("ry", 9)

    var temptext = tempg.selectAll(".temptext").data([feed[0].temperature])
    var temptextlabel = tempg.selectAll(".temptextlabel").data([feed[0].temperature])

    temptext.enter().append("svg:text")
        .attr("class", "temptext")
        .text(function (d) { return Math.floor(d); })
        .attr("x", 20)
        .attr("y", 0)

    temptextlabel.enter().append("svg:text")
        .attr("class", "temptextlabel")
        .text(function (d) { return "Celsius"; })
        .attr("x", 20)
        .attr("y", 20)

    //WATER
    //place for water
    var waterg = fg.append("g")
        .attr("class", "waterg")
        .attr("transform", "translate(0," + humidoffset + ")");

    var watery = d3.scale.linear()
        .domain(d3.extent(feed, function(d) { return d.humidity; }))
        .range([pathheight,0]);

    var wdata = [];
    var x = d3.scale.linear().domain([0, 30]).range([0,width]);

    var waterarea = waterg.selectAll(".waterarea")
        .data([wdata]);

    var deltaScale = d3.scale.pow().domain([0,100]).range([20,0]);
    
    var wdata = [];
    for (var i=0; i<35; i++) { wdata.push(
        {
            x:i,
            delta: 50,
            humidity: feed[0].humidity
        }
    )};

    var warea = d3.svg.area()
        //.interpolate("bundle")
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return watery(d.humidity) + Math.cos(d.x*d.delta*30)*Math.sin(d.delta*200)*5; })
        .y1(function(d) { return pathheight+minRange; });

    waterarea.enter().append("svg:path")
        .attr("class", "waterarea")
        .attr("d", warea);

    var watertext = waterg.selectAll(".watertext").data([feed[0].humidity])
    var watertextlabel = waterg.selectAll(".watertextlabel").data([feed[0].humidity])

    watertext.enter().append("svg:text")
        .attr("class", "watertext")
        .text(function (d) { return Math.floor(d); })
        .attr("x", 20)
        .attr("y", pathheight)

    watertextlabel.enter().append("svg:text")
        .attr("class", "watertextlabel")
        .text(function (d) { return "Percent"; })
        .attr("x", 20)
        .attr("y", pathheight)

    //label transitions
    function text(transition, x, y, hide, show, fn) {
            transition.ease("elastic", 2, 10)
                .duration(100)
                .attr("opacity", show)
                .text(fn)
                .attr("x", x)
                .attr("y", y-10)
            // .transition()
            //     .ease("quad")
            //     .duration(100)
            //     .attr("y", y)
            //     .attr("opacity", show)
    }

    //selectors
    var datetextel = svg.select(".datetext"),
        hourtextel = svg.select(".hourtext"),
        sunlineel = sung.select(".sunline"),
        sunbtlineel = sung.select(".sunbtline"),
        suncircleel = sung.select(".suncircle"),
        suntextel = sung.select(".suntext"),
        suntextlabelel = sung.select(".suntextlabel"),
        tempel = tempg.select(".temp"),
        templineel = tempg.select(".templine"),
        temptextel = tempg.select(".temptext"),
        watertextel = waterg.select(".watertext"),
        waterareael = waterg.select(".waterarea");


    //DRAW
    function draw (less, mid, more, delta) {
        //data
        var l = less || data,
            middle = mid || data.parsedDate,
            m = more || data;

        var scale =  d3.time.scale()
            .domain([l.parsedDate, m.parsedDate]);

        //reverse mapping
        var lightrange = scale.range([l.light,m.light]),
            light = lightrange(middle);

        var temprange = scale.range([l.temperature,m.temperature]),
            temperature = temprange(middle);

        var waterrange = scale.range([l.humidity,m.humidity]),
            water = waterrange(middle);


        //DATE
        datetextel.data([middle])
        hourtextel.data([middle])

        datetext.attr("class", "datetext").transition()
            .call(text, 20, dateoffset, 0, 0.5, function (d) { return format(d); })

        hourtext.attr("class", "hourtext").transition()
            .call(text, 20, dateoffset+30, 0, 0.3, function (d) { return hourformat(d); })



        //SUN
        //update datas
        sunlineel.data([light]);
        sunbtlineel.data([light]);
        suncircleel.data([light]);
        suntextel.data([light]);
       // suntextlabelel.data([light]);

        //transitions
        //top line
        sunline.attr("class", "sunline")
            .transition().ease("elastic", 2,10)
            .attr("y1", function (d) { return -suny(d); })
            .attr("y2", function (d) { return -suny(d); });
        //bottomline
        sunbtline.attr("class", "sunbtline")
            .transition().ease("elastic", 2,10)
            .attr("y1", function (d) { return suny(d); })
            .attr("y2", function (d) { return suny(d); });
        //circle
        suncircle.attr("class", "suncircle")
            .transition().ease("elastic", 2,10)
            .attr("r", function(d) { return suny(d); });

        suntext.attr("class", "suntext").transition()
            .call(text, 20, 15, 0, 0.5, function (d) { return Math.floor(d); })

        suntextlabel.attr("class", "suntextlabel").transition()
            .call(text, 20, 45, 0, 0.3, function (d) { return "Lumen"; })



        //TEMP
        tempel.data([temperature]);
        templineel.data([temperature]);
        temptextel.data([temperature]);

        templine.attr("class", "templine")
            .attr("y1", function (d) { return templiney(d); })
            .attr("y2", function (d) { return templiney(d); });
        
        temp.attr("class", "temp")
            .attr("y",  function (d) { return pathheight-tempy(d); })
            .attr("height", function (d) { return tempy(d); })
        
        temptext.attr("class", "temptext").transition()
            .call(text, 20, 30, 0, 0.5, function (d) { return Math.floor(d); })

        temptextlabel.attr("class", "temptextlabel").transition()
            .call(text, 20, 60, 0, 0.3, function (d) { return "Celsius"; })



        //WATER
        var wdata = [];
        for (var i=0; i<32; i++) { wdata.push(
            {
                x:i,
                delta: delta || 10,
                humidity: water
            }
        )};
        waterareael.data([wdata]);
        watertextel.data([water]);

        waterarea.attr("class", "waterarea")
            .attr("d", warea)
            // .transition().ease("linear").duration(100)//.ease("elastic", 2,10)
            // .attr("d", warea)

        watertext.attr("class", "watertext").transition()
            .call(text, 20, pathheight - dateoffset, 0, 1, function (d) { return Math.floor(d); })

        watertextlabel.attr("class", "watertextlabel").transition()
            .call(text, 20, pathheight  - dateoffset + 30, 0, 1, function (d) { return "Percent"; })



    };

    function resize () {

    };

    return {
        draw: draw,
        resize: resize
    };
}