var customIcon = L.icon({
    iconUrl: 'https://png2.cleanpng.com/sh/231d7ed31f29fc6f8a8921d63dd49ec7/L0KzQYm3UsA0N5R1fZH0aYP2gLBuTf9nbppofZ9sbHnzPbL5lL14d6NwgdDwLYTydLLCTfNtcaFmiuZ8LUXkR4bqVvVkO5JrSdU8Lke1QIe9VsE5OWY2T6gBOEC6RoO7UcQveJ9s/kisspng-office-clip-art-working-today-cliparts-5a75c6ec3af1c3.7206661815176680762414.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize: [25, 25], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});
// criando mapa
var map = L.map('image-map', {
    minZoom: 1,
    maxZoom: 5,
    center: [0, 0],
    zoom: 3,
    crs: L.CRS.Simple,
});

// dimensões na imagem com url dela
var w = 2000,
    h = 1500,
    url = 'http://kempe.net/images/newspaper-big.jpg',
    f1Url = 'f1.png';



// caculando as lados da imagem com Coordenadas do spaco 
var southWest = map.unproject([0, h], map.getMaxZoom() - 1);
var northEast = map.unproject([w, 0], map.getMaxZoom() - 1);
var bounds = new L.LatLngBounds(southWest, northEast);

// aqui adicionado a imagem overlay para puder cobrir a mapa inteira mapa   
L.imageOverlay(document.getElementById('map'), bounds).addTo(map);

// manda para leaflet essa mapa para ficar como imagem grande
map.setMaxBounds(bounds);
//console.log(bounds)
// aqui a calcula width com height da imagem para puder pegar Coordenadas do click

console.log(reservationList);

//Hadnel on right click functions TODO: MOVE THIS LATER
map.on('contextmenu', onMapClick);


// reservationList.forEach(element => {

//     L.marker([element.lat, element.lng], { icon: customIcon }).addTo(map).bindPopup(
//         '<p>Quer reservar essa mesa?</p> <button type="button"class="btn btn-primary btn-sm">Sim</button> <button type="button"class="btn btn-danger btn-sm">Não</button>'
//     );
//     L.circle([element.lat, element.lng], 1).addTo(map);
// });

// how geoJSON work https://leafletjs.com/examples/geojson/
const geoLayer = L.geoJSON(reservationList, {
    onEachFeature: forEachItem,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: customIcon });
    }
});
geoLayer.addTo(map)

Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

function onMapClick(e) {
    var mapWidth = map._container.offsetWidth;
    var mapHeight = map._container.offsetHeight;
    var locationX = e.containerPoint.x * w / mapWidth;
    var locationY = e.containerPoint.y * h / mapHeight

    console.log("x : " + locationX + "    y : " + locationY);
    console.log(e.latlng.lng + ' : ' + e.latlng.lat)


    if (e.latlng.lng.between(bounds._southWest.lng, bounds._northEast.lng) && e.latlng.lat.between(bounds._southWest.lat, bounds._northEast.lat)) {

        obj = {

            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lat, e.latlng.lng]
            },
            "properties": {
                "mesa": reservationList.length + 1,
                "name": "Destk " + reservationList + 1,
                "name": "person name ",
                "phone": "23 2323 2323"
            }
        }
        reservationList.push(obj);

        L.Circle.include({
            contains: function (latLng) {
                return this.getLatLng().distanceTo(latLng) < this.getRadius();
            }
        });

        var greenIcon = L.icon({
            iconUrl: 'https://png2.cleanpng.com/sh/231d7ed31f29fc6f8a8921d63dd49ec7/L0KzQYm3UsA0N5R1fZH0aYP2gLBuTf9nbppofZ9sbHnzPbL5lL14d6NwgdDwLYTydLLCTfNtcaFmiuZ8LUXkR4bqVvVkO5JrSdU8Lke1QIe9VsE5OWY2T6gBOEC6RoO7UcQveJ9s/kisspng-office-clip-art-working-today-cliparts-5a75c6ec3af1c3.7206661815176680762414.png',
            // shadowUrl: '',

            iconSize: [25, 25], // size of the icon
            shadowSize: [20, 20], // size of the shadow
            iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
            shadowAnchor: [13, 13],  // the same for the shadow
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });

        L.marker([e.latlng.lat, e.latlng.lng], { icon: greenIcon }).addTo(map).bindPopup('<p>Quer reservar essa mesa?</p> <button type="button"class="btn btn-primary btn-sm">Sim</button> <button type="button"class="btn btn-danger btn-sm">Não</button>');
        // L.marker([e.latlng.lat, e.latlng.lng], {icon: redMarker}).addTo(map);
        var circle = L.circle([e.latlng.lat, e.latlng.lng], 1).addTo(map);
    } else
        console.log("not okay")

    //map.fitBounds(circle.getBounds());
    console.log(reservationList);

}

function forEachItem(feature, layer) {
    // .bindPopup(
    // '<p>Quer reservar essa mesa?</p> <button type="button"class="btn btn-primary btn-sm">Sim</button> <button type="button"class="btn btn-danger btn-sm">Não</button>'
    // );
    layer.bindPopup(makePopupContent(feature), { closeButton: false, offset: L.point(0, -8) });
}

function makePopupContent(desk) {
    return `
        <div>
            <h4>${desk.properties.name}</h4>
            <p>${desk.properties.occupation}</p>
            <div class="phone-number">
                <a href="tel:${desk.properties.phone}">${desk.properties.phone}</a>
            </div>
        </div>
        <p>Quer reservar essa mesa?</p> 
        <button type="button"class="btn btn-primary btn-sm">Sim</button> 
        <button type="button"class="btn btn-danger btn-sm">Não</button>
    `;
}
