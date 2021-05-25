var addDeskOrRoom = 'desk'
var oldPosition = {}
var isDraggable = false
const floorImgUrl = './images/first-floor.png';
const reservedDeskIconUrl = './images/icons/red-laptop.png';
const vacantDeskIconUrl = './images/icons/green-laptop.png';
const reservedRoomIconUrl = './images/icons/r-room.png';
const vacantRoomIconUrl = './images/icons/v-room.png';


var reservedDeskIcon = L.icon({
    iconUrl: reservedDeskIconUrl,
    iconSize: [25, 25], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});


var vacantDeskIcon = L.icon({
    iconUrl: vacantDeskIconUrl,
    iconSize: [25, 25], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});

var reservedRoomIcon = L.icon({
    iconUrl: reservedRoomIconUrl,
    iconSize: [50, 50], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});


var vacantRoomIcon = L.icon({
    iconUrl: vacantRoomIconUrl,
    iconSize: [50, 50], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});

// criando mapa
var myMap = L.map('map', {
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


// caculando as lados da imagem com Coordenadas do spaco 
var southWest = myMap.unproject([0, h], myMap.getMaxZoom() - 1);
var northEast = myMap.unproject([w, 0], myMap.getMaxZoom() - 1);
var bounds = new L.LatLngBounds(southWest, northEast);


// aqui adicionado a imagem overlay para puder cobrir a mapa inteira mapa   
L.imageOverlay(floorImgUrl, bounds).addTo(myMap);

// manda para leaflet essa mapa para ficar como imagem grande
myMap.setMaxBounds(bounds);
//console.log(bounds)
// aqui a calcula width com height da imagem para puder pegar Coordenadas do click

console.log(reservationList);

//Hadnel on right click functions TODO: MOVE THIS LATER
myMap.on('contextmenu', onMapRightClick);

// myMap.on('click', onMapClick)

// how geoJSON work https://leafletjs.com/examples/geojson/
// this instance (variable) is only being used in the Edit button so we can remove 
// the layer from the map and generate/add it again 
var geoJson = generateMarkers(false);


// adding toobox on the right side of the map
var toolbox = L.control({ position: 'topright' });
toolbox.onAdd = function (map) {
    var container = document.createElement('div')
    container.className = 'toolbox row p-2 rounded'
    // container.setAttribute('style', 'width: 18rem;')

    var cardBody = document.createElement('div')
    cardBody.className = 'col my-2'
    container.appendChild(cardBody)

    var btn = document.createElement('div')
    btn.innerText = 'Edit'
    // btn.className = 'edit-btn'
    btn.className = 'btn btn-primary align-middle w-100 mb-3'
    btn.addEventListener('click', OnEditClick)

    var formGroup = document.createElement('div')
    formGroup.className = 'form-group'

    var radioRow = document.createElement('div')
    radioRow.className = 'col-sm-10'

    var formLabel = document.createElement('legend')
    formLabel.innerText = 'Add'
    formLabel.className = 'col-form-label col-sm-2 pt-0'


    var inpRadioDesk = document.createElement('input')
    inpRadioDesk.className = 'form-check-input'
    inpRadioDesk.setAttribute('type', 'radio')
    inpRadioDesk.setAttribute('name', 'type')
    inpRadioDesk.setAttribute('id', 'desk')
    inpRadioDesk.setAttribute('value', 'Desk')
    inpRadioDesk.setAttribute('checked', 'true')

    var deskLabel = document.createElement('label')
    deskLabel.className = 'form-check-label'
    deskLabel.htmlFor = 'desk';
    deskLabel.innerText = 'Desk'

    var formCheckDesk = document.createElement('div')
    formCheckDesk.className = 'form-check'

    formCheckDesk.appendChild(inpRadioDesk)
    formCheckDesk.appendChild(deskLabel)


    var inpRadioRoom = document.createElement('input')
    inpRadioRoom.className = 'form-check-input'
    inpRadioRoom.setAttribute('type', 'radio')
    inpRadioRoom.setAttribute('name', 'type')
    inpRadioRoom.setAttribute('id', 'room')
    inpRadioRoom.setAttribute('value', 'Metting Room')

    var roomLabel = document.createElement('label')
    roomLabel.className = 'form-check-label'
    roomLabel.htmlFor = 'room';
    roomLabel.innerText = 'Room'

    var formCheckRoom = document.createElement('div')
    formCheckRoom.className = 'form-check'

    formCheckRoom.appendChild(inpRadioRoom)
    formCheckRoom.appendChild(roomLabel)


    formCheckDesk.addEventListener('click', function (e) {
        addDeskOrRoom = 'desk'
    })
    formCheckRoom.addEventListener('click', function (e) {
        addDeskOrRoom = 'room'
    })

    radioRow.appendChild(formLabel)
    radioRow.appendChild(formCheckDesk)
    radioRow.appendChild(formCheckRoom)


    var form = document.createElement('form')
    form.appendChild(radioRow)

    cardBody.appendChild(btn)
    cardBody.appendChild(form)
    return container
}
toolbox.addTo(myMap)



// i dont know what this does?
Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};


function getAnimatedIcon(feature) {
    var url = getUrl(feature)
    var type = feature.properties.type
    var className = `location-pin-${type}`
    var animationClass = `pulse-${type}`
    console.log(animationClass);
    return L.divIcon({
        className: className,
        html: `
        <img src=${url}>
                <div class=${animationClass}></div>
        `,
        // iconSize: [25, 25],//size being set in css.
        iconAnchor: [10, 10],

        shadowSize: [20, 20],
        shadowAnchor: [13, 13],
        popupAnchor: [3, -12]
    });
}

// remember when ever you call this method, assign it to geoJson variable , to be able to remove this layer from the may later.
// example: geoJson = generateMarkers(isDraggable)
function generateMarkers(draggable, id = -1) {

    const geoLayer = L.geoJSON(reservationList, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            // set the icon based on the value of reserved.
            var icon = getIcon(feature)

            // if id is passed we need to animate the icon
            if (id != -1 && feature.properties.id === id) {

                icon = getAnimatedIcon(feature)
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

    // if layer exists remove it and render it again
    if (myMap.hasLayer(geoJson)) {
        myMap.removeLayer(geoJson)
    }

    geoLayer.addTo(myMap);
    updateList()
    return geoLayer;
}

function getUrl(feature) {
    if (feature.properties.type == 'desk') {
        return feature.properties.reserved ? reservedDeskIconUrl : vacantDeskIconUrl;
    }
    return feature.properties.reserved ? reservedRoomIconUrl : vacantRoomIconUrl

}

function getIcon(feature) {
    if (feature.properties.type == 'desk') {
        return feature.properties.reserved ? reservedDeskIcon : vacantDeskIcon;
    }
    return feature.properties.reserved ? reservedRoomIcon : vacantRoomIcon;
}

function OnEditClick(e) {
    e.preventDefault();
    var editBtn = e.target

    // to disable/enable draggable on each marker in the map layer,
    // need to remove them and create them with draggable false/true. this is what worked with me.
    if (editBtn.innerText == 'Edit') {

        editBtn.innerText = 'Save'
        isDraggable = !isDraggable
        geoJson = generateMarkers(isDraggable)

    } else {

        editBtn.innerText = 'Edit'
        isDraggable = !isDraggable
        geoJson = generateMarkers(isDraggable)

    }
}

function onDoubleClickMarker(e) {
    console.log('double clicked');
    console.log(e.latlng);

}
function onMapClick(e) {
    console.log('map clicked');
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
    var mapWidth = myMap._container.offsetWidth;
    var mapHeight = myMap._container.offsetHeight;
    var locationX = e.containerPoint.x * w / mapWidth;
    var locationY = e.containerPoint.y * h / mapHeight

    console.log("x : " + locationX + "    y : " + locationY);
    console.log(e.latlng.lng + ' : ' + e.latlng.lat)


    if (e.latlng.lng.between(bounds._southWest.lng, bounds._northEast.lng) && e.latlng.lat.between(bounds._southWest.lat, bounds._northEast.lat)) {

        var type = addDeskOrRoom
        obj = {

            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lng, e.latlng.lat]
            },
            "properties": {
                "id": reservationList.length + 1,
                "type": type,
                "name": "New " + type,
                "occupation": "",
                "phone": "",
                "reserved": false,
            }
        }
        // only need to add the coordinates and let generateMarkers do the work.
        reservationList.push(obj);
        geoJson = generateMarkers(true)

    } else
        console.log("not okay")

    console.log(reservationList);

}

function onEachFeature(feature, layer) {
    var popup = L.popup()
        .setContent(makePopupContent(feature));

    layer.bindPopup(popup, { closeButton: true, keepInView: true, minWidth: 150, autoPanPaddingTopLeft: L.Point(5, 5) });
}

function makePopupContent(feature) {
    var typeName = feature.properties.type == 'desk' ? "mesa" : "sala"
    var status = feature.properties.reserved ? 'reservada' : 'vazia'
    const div = document.createElement('div')
    div.innerHTML = `
            
                    <h3> ${typeName} ${feature.properties.id}</h3>
                    <h4>${feature.properties.name}</h4>
                    <p>${feature.properties.occupation}</p>
                    <div class="phone-number">
                        <a href="tel:${feature.properties.phone}">${feature.properties.phone}</a>
                    </div>
                    <p >${status}</p>            
        `;
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'btn btn-danger'
    deleteBtn.innerText = 'delete'
    deleteBtn.addEventListener('click', OnDeleteMarkerClick(feature))
    div.appendChild(deleteBtn)
    return div
}
// closure function that return a click event-function, this way we can pass feature to the function
// and we will be able to know which popup of which marker.
function OnDeleteMarkerClick(feature) {
    return function (e) {
        for (let i = 0; i < reservationList.length; i++) {

            if (reservationList[i].properties.id == feature.properties.id) {
                reservationList.splice(i, 1);
                geoJson = generateMarkers(isDraggable)
                return
            }
        }
    }
}


function updateList() {
    // clean up the list before populating it again.
    const accordion = document.getElementById('accordionList')
    while (accordion.firstChild) {
        accordion.removeChild(accordion.firstChild)
    }
    reservationList.forEach((desk) => {

        const card = document.createElement('div')
        card.className = 'card'

        const header = document.createElement('div')
        header.className = 'card-header'

        const divBtn = document.createElement('h5')
        divBtn.className = 'mb-0'

        const btn = document.createElement('button')
        btn.className = 'btn btn-link'
        btn.setAttribute('type', 'button')
        btn.innerText = desk.properties.name

        btn.addEventListener('click', () => {
            animateMarker(desk);
        });

        divBtn.appendChild(btn)


        header.appendChild(divBtn)


        const divBdy = document.createElement('div')
        const contentId = `${desk.properties.type}-${desk.properties.id}`
        divBdy.setAttribute('id', contentId)
        divBdy.style.display = 'none'
        divBdy.className = 'xxxx'

        const cardBdy = document.createElement('form')
        cardBdy.className = 'card-body'
        const btnText = desk.properties.reserved ? 'Cancelar' : 'Reservar'
        const editable = desk.properties.reserved ? 'form-control' : 'form-control';
        const read = desk.properties.reserved ? 'readonly' : ''
        cardBdy.innerHTML =

            `
                    <div class="form-group" >
                        <label for="itemId" class="col-sm-6 col-form-label">ID:</label>
                        <div class="col">
                            <input type="text" class='form-control' id="itemId" aria-describedby="name" placeholder="name"  ${read} value="${desk.properties.id}">
                            <input type="hidden" id="oldItemId" value="${desk.properties.id}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="itemName" class="col-sm-6 col-form-label">Name:</label>
                        <div class="col">
                            <input type="text" class='form-control' id="itemName" aria-describedby="name" placeholder="name" ${read} value="${desk.properties.name}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="occupation" class="col-sm-6 col-form-label">Occupation:</label>
                        <div class="col">
                            <input type="text" class='form-control' id="occupation" placeholder="occupation" ${read} value="${desk.properties.occupation}">
                        </div> 
                    </div>
                    <div class="form-group mb-3">
                        <label for="phoneNo" class="col-sm-6 col-form-label">Phone No:</label>
                        <div class="col">
                            <input type="text" class='form-control' id="phoneNo" placeholder="phone number" ${read} value="${desk.properties.phone}">
                        </div> 
                    </div>
            `

        // <button id="reserveOrCancel" type="submit" class="btn btn-primary">${btnText}</button>

        var reserveOrCancelBtn = document.createElement('button')
        reserveOrCancelBtn.className = 'btn btn-primary'
        reserveOrCancelBtn.type = 'submit'
        reserveOrCancelBtn.innerText = btnText

        cardBdy.appendChild(reserveOrCancelBtn)

        divBdy.appendChild(cardBdy)


        card.appendChild(header)
        card.appendChild(divBdy)

        accordion.appendChild(card)

        // trying to make accordion manualy because the bootstrap collapse didnt work (probably something i was doing wrong.
        header.addEventListener('click', (e) => {
            // to hide all the other opended itemContent
            const allContents = document.getElementsByClassName('xxxx')
            var i
            for (i = 0; i < allContents.length; i++) {
                allContents[i].style.display = 'none'
            }
            // you can use unique id and select it by its id. or you can you nextElementSibling to get the next DIV
            // const itemContent = document.getElementById(contentId)
            const itemContent = header.nextElementSibling
            if (itemContent.style.display === 'block') {
                itemContent.style.display = 'none'
            } else {
                itemContent.style.display = 'block'
            }
        })


        reserveOrCancelBtn.addEventListener('click', OnReserveOrCancelClick)


    });
}

function OnReserveOrCancelClick(e) {
    e.preventDefault()
    const id = e.target.form['itemId'].value

    if (e.target.innerText === 'Cancelar') {

        // to cancel item, just remove it from the list. in real example, u remove it from DB.
        for (var i = 0; i < reservationList.length; i++) {

            if (reservationList[i].properties.id == id) {


                // instead of remove it from the list, we just update it to empty
                // reservationList.splice(i, 1);
                reservationList[i].properties.name = 'new ' + reservationList[i].properties.type
                reservationList[i].properties.occupation = ''
                reservationList[i].properties.phone = ''
                reservationList[i].properties.reserved = false

                geoJson = generateMarkers(isDraggable)
                return
            }

        }
    } else {
        // to reserve it, depends on the real logic, but here we only update the list, probably you need to update the register or insert in another table.
        reservationList.map(item => {
            // to allow him change the ID, we hide the old id in the form and we use it here to retrieve the register from list/DB.
            const oldId = e.target.form['oldItemId'].value
            if (item.properties.id == oldId) {

                item.properties.id = e.target.form['itemId'].value
                item.properties.name = e.target.form['itemName'].value
                item.properties.occupation = e.target.form['occupation'].value
                item.properties.phone = e.target.form['phoneNo'].value
                item.properties.reserved = true
                geoJson = generateMarkers(isDraggable)
                return
            }
        })

    }

}

function animateMarker(desk) {
    const id = desk.properties.id
    myMap.removeLayer(geoJson)
    // always assign it to this variable, to be able to remove it later. (otherwise strange things start happening, overlapping layers)
    geoJson = generateMarkers(false, id)
}
