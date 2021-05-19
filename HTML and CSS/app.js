var editBttn = document.getElementById('edit-btn')
var oldPosition = {}
var isDraggable = false


var newIcon = L.divIcon({
    className: 'location-pin',
    html: `
        <img src='./green-laptop.png'>
        <div class="pulse"></div>
        `,
    // iconSize: [25, 25],//size being set in css.
    iconAnchor: [10, 10],

    shadowSize: [20, 20], // size of the shadow
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});


var customIcon = L.icon({
    // shadowUrl: 'leaf-shadow.png',
    iconUrl: 'green-laptop.png',
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
    center: [-456, -440],
    zoom: 3,
    crs: L.CRS.Simple,
    doubleClickZoom: false,// disable dbClick zoom
});

// dimensões na imagem com url dela
var w = 2000, // careful with these numbers, as they change the position of the desk on the picture. once they are set and 
    h = 1500  // the markers were added , these numbers shouldnt be modified.
// var w = 3350,
// h = 2550,
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
map.on('contextmenu', onMapRightClick);

map.on('click', onMapClick)

// how geoJSON work https://leafletjs.com/examples/geojson/
// this instance (variable) is only being used in the Edit button so we can remove 
// the layer from the map and generate/add it again 
var geoJson = generateMarkers(false);




// i dont know what this does?
Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

editBttn.addEventListener('click', OnEditClick)

function generateMarkers(draggable, id = -1, newIcon) {

    const geoLayer = L.geoJSON(reservationList, {
        onEachFeature: forEachItem,
        pointToLayer: function (feature, latlng) {
            var icon = customIcon
            if (id != -1) {
                if (feature.properties.id === id) {
                    console.log('found id checking feature, id:', id);
                    console.log(feature);
                    icon = newIcon
                }
            }
            var marker = L.marker(latlng, { icon: icon, draggable: draggable });
            marker.on('moveend', onMarkerDragged); // moveEnd is same as dragEnd (the later happens multiple times dont know why)
            // just testing dbClick, (problem double click also make zoom if it was not on the marker)
            marker.on('dblclick', onDoubleClickMarker)
            //this event is ony to record the oldPosition in case if the last position is out of the map
            // to reset the markert to the old position
            marker.on('dragstart', function (e) {
                oldPosition = e.target._latlng
            })

            return marker;
        }
    });
    geoLayer.addTo(map);
    updateList()
    return geoLayer;
}

function OnEditClick(e) {
    e.preventDefault();

    // to disable/enable draggable on each marker in the map layer, 
    // need to remove them and create them with draggable false/true. this is what worked with me.
    if (editBttn.innerText == 'Edit') {

        editBttn.innerText = 'Save'
        map.removeLayer(geoJson)
        isDraggable = !isDraggable
        geoJson = generateMarkers(isDraggable)

    } else {

        editBttn.innerText = 'Edit'
        map.removeLayer(geoJson)
        isDraggable = !isDraggable
        geoJson = generateMarkers(isDraggable)

    }
}

function onDoubleClickMarker(e) {
    console.log('double clicked');
    console.log(e.target.dragging);
    console.log(e);

}
function onMapClick(e) {
    console.log('map clicked');
    console.log('print target');
    console.log(e.target);
};

function onMarkerDragged(event) {

    var marker = event.target;
    var position = marker.getLatLng();

    if (event.target._latlng.lng.between(bounds._southWest.lng, bounds._northEast.lng) && event.target._latlng.lat.between(bounds._southWest.lat, bounds._northEast.lat)) {

        console.log('setting new position');
        marker.setLatLng(new L.LatLng(position.lat, position.lng));

        // saving the coordinates in memory, later When click on Save button can be persisted to DB.
        saveNewCoordinates(position, marker.feature)
    } else {
        //falling back to the old position of the market because the markert was dragged out of the layer bounds.
        marker.setLatLng(new L.LatLng(oldPosition.lat, oldPosition.lng));
        console.log('outside, falling back');

    }
}

// update with new coordinates 
function saveNewCoordinates(position, feature) {
    console.log('save coordinates for :', feature.properties.name, ', id:', feature.properties.id);
    var deskId = feature.properties.id
    console.log(feature);
    reservationList.map(item => {
        if (item.properties.id === deskId) {
            console.log('item changed : ', item.properties.id);
            item.geometry.coordinates[0] = position.lng
            item.geometry.coordinates[1] = position.lat
        }
    })
}

function onMapRightClick(e) {
    // deactivate right click if not in edit mode
    if (!isDraggable) {
        return
    }
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
                "coordinates": [e.latlng.lng, e.latlng.lat]
            },
            "properties": {
                "id": reservationList.length + 1,
                "name": "Destk " + reservationList + 1,
                "name": "empty",
                "phone": "emtpy"
            }
        }
        // only need to add the coordinates and let generateMarkers do the work.
        reservationList.push(obj);
        geoJson = generateMarkers(true)

    } else
        console.log("not okay")

    console.log(reservationList);

}

function forEachItem(feature, layer) {
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

function updateList() {
    const ul = document.querySelector('.list');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild)
    }
    reservationList.forEach((desk) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const a = document.createElement('a');
        const p = document.createElement('p');
        a.addEventListener('click', () => {
            animateMarker(desk);
        });
        div.classList.add('desk-item');
        a.innerText = desk.properties.name;
        a.href = '#';
        p.innerText = desk.properties.occupation;

        div.appendChild(a);
        div.appendChild(p);
        li.appendChild(div);
        ul.appendChild(li);
    });
}


function animateMarker(desk) {
    const id = desk.properties.id
    map.removeLayer(geoJson)
    // always assign it to this variable, to be able to remove it later. (otherwise strange things start happening, overlapping layers)
    geoJson = generateMarkers(false, id, newIcon)
}
