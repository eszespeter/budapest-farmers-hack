//made for budapest farmers hack - Peter Kadlot

//(function(){

//init
d3.json("http://pestiborso.eu01.aws.af.cm/feed/hour", function(feed){
    feed = feed || []
    //parse date
    feed.forEach(function (d) {
        d.parsedDate = new Date(d.date);
    });
    function getDocHeight() {
        var D = document;
        return Math.max(
            Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
            Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
            Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        );
    }
    function getDocWidth() {
        var D = document;
        return Math.max(
            Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
            Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
            Math.max(D.body.clientWidth, D.documentElement.clientWidth)
        );
    }
    var pageload = true;

    var init = function () {
        d3.selectAll(".today").remove()
        d3.selectAll(".timeline").remove()


        var eheight = getDocHeight() * 1,//document.getElementById("container").offsetHeight,
            ewidth = getDocWidth()//document.getElementById("container").offsetWidth;

        //today module
        var today = new Today({
            feed: feed,
            data: feed[0],
            div: "today",

            width: getDocWidth() * 0.35,
            dheight: eheight,
            pathheight: eheight*0.2,
            minRange: eheight*0.04,
            dateoffset:  eheight*0.1,

            lightoffset: eheight*0.2,
            tempoffset: eheight*0.4,
            humidoffset: eheight*0.66
        });

        //timeline module
        var timeline = new Timeline({
            feed: feed,
            div: "time",
            daywidth: 100,
            endoffset: 100,
            scrolldiv: "timeline",


            dheight: Math.floor(eheight),
            pathheight: eheight*0.2,
            minRange: eheight*0.04,
            dateoffset: eheight*0.1,
            scrollcallback: today.draw,

            lightoffset: eheight*0.2,
            tempoffset: eheight*0.4,
            humidoffset: eheight*0.66
        });

        today.draw();
        timeline.draw();

        //scroll to the end on page load
        if(pageload){
            d3.select("#timeline").transition().duration(4000).ease("quad-in-out").tween("scrollLeft", function() {
                var i = d3.interpolate(0, this.scrollWidth-10);
                return function(t) {
                    this.scrollLeft = i(t);
                };
            });
            pageload = false;
        }
    }

    init();
    window.onresize = init;

});





// TODO:
// gradient
// bg
// light - humidity + gradient
// temp - graph + gradient
// today elements - sun, drop, temp
// add text
// add animation - sun, clouds, rain
//

//})();
