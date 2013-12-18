//generate some dummy data for 5 days
(function () {
  for(var i=1; i<3*24*5; i++) {
    
      $.ajax({
        url: 'http://localhost:3000/feed',
        type: 'PUT',
        contentType: 'application/json',
        beforeSend: function (request)
            {
                request.setRequestHeader("X-APIKEY", "hello");
            },
        data: JSON.stringify({
            "updates": getRandomInt(0,100)
          , "light": getRandomInt(20,1200) 
          , "temperature": getRandomInt(10,25) 
          , "humidity": getRandomInt(0,100) 
          , "voltage": getRandomInt(4800,5002) 
          , "date" : (new Date(2013,3,8)).valueOf()+i*60000*20
          , "i":i
          }),
        dataType: 'json'
      });
    
  }
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();

