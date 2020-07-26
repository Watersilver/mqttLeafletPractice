window.addEventListener('DOMContentLoaded', (event) => {
  
  // PAHO
  // Create a client instance
  const client = new Paho.MQTT.Client('test.mosquitto.org', 8080, "dude");
  
  // LEAFLET
  // Set up map
  const mymap = L.map('map').setView([37.936104, 23.723431], 13);
  
  // Create base layers
  const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
  const wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png');
  
  const baseLayers = {
    'Standard': standard,
    '<i>Wikimedia</i>': wikimedia
  }

  // Add default layer to map
  standard.addTo(mymap);
  
  // Add layer control to map
  L.control.layers(baseLayers).addTo(mymap);

  // Add marker to map
  const marker = L.marker([37.936104, 23.723431]).addTo(mymap);

  marker.bindPopup("<em>Cor blimey.</em>");

  // Add a popup to map
  const clickPopup = L.popup()
  .setLatLng([37.936104, 23.723431])
  .setContent("I will follow the mouse when it clicks.")
  .openOn(mymap);

  mymap.on('click', e => {
    clickPopup.setLatLng(e.latlng)
    .setContent(`<strong>${e.latlng.toString()}</strong>`)
    .openOn(mymap);
  });

  // PAHO again
  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe("World");
    const message = new Paho.MQTT.Message("Hello");
    message.destinationName = "World";
    client.send(message);
    
    mymap.on('click', e => {
      const latlngMsg = new Paho.MQTT.Message(e.latlng.toString());
      latlngMsg.destinationName = "World";
      client.send(latlngMsg);
    });
  }

  // set callback handlers
  // called when the client loses its connection
  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:"+responseObject.errorMessage);
    }
  }
  // called when a message arrives
  client.onMessageArrived = (message) => {
    console.log("onMessageArrived:"+message.payloadString);
    const splitMsg = message.payloadString.split(/[\(\)]|,\s*/i);
    if (splitMsg[0] === "LatLng") {
      // Add marker to map
      const marker = L.marker([parseFloat(splitMsg[1]), parseFloat(splitMsg[2])]).addTo(mymap);
      console.log(splitMsg);
    }
  }

  // connect the client
  client.connect({onSuccess:onConnect});
});