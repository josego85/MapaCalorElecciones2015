// Variables y Objetos globales.
var v_mapa = null
var v_array_puntos = new Array();
var v_max_zoom = 14;				// Zoom maximo.
var v_min_zoom = 5;					// Zoom minimo.

function cargarMapa() {
	// Asuncion - Paraguay.
	var v_longitud = -57.6309129;
	var v_latitud = -25.2961407;
	var v_zoom = v_min_zoom;

	// Mapbox.
	L.mapbox.accessToken =
		'pk.eyJ1IjoidGNxbCIsImEiOiJaSlZ6X3JZIn0.mPwXgf3BvAR4dPuBB3ypfA';
	v_mapa = L.mapbox.map('mapa', 'mapbox.streets', {
    	maxZoom: v_max_zoom,
    	minZoom: v_min_zoom
	}).setView([v_latitud, v_longitud], v_zoom);

	// Lamada ajax elavizor usando su api.
	$.ajax({
		url: 'http://www.elavizor.org.py/api?task=incidents',
		data: {
			format: 'json',
			resp: 'jsonp'
		},
		dataType: 'jsonp',
		type: 'GET',
		error: function() {
			console.log("Error.");
		},
		success: function(p_data) {
			function verificar_exitencia_punto_exacto(p_latitude, p_longitude){
				for(var v_indice in v_array_puntos){
					var v_latitude = v_array_puntos[v_indice][0];
					var v_longitude = v_array_puntos[v_indice][1];
					if(v_latitude == p_latitude && v_longitude == p_longitude){
						return v_indice;
					}
				}
				return -1;
			}

			function cargar_puntos(p_latitude, p_longitude){
				var v_array_punto = new Array();
				var v_indice_punto = verificar_exitencia_punto_exacto(p_latitude, p_longitude);
				if(v_indice_punto == -1){
					v_array_punto.push(p_latitude);
					v_array_punto.push(p_longitude);
					v_array_punto.push(1);
					v_array_puntos.push(v_array_punto);
				}else{
				     v_array_puntos[v_indice_punto][2] = v_array_puntos[v_indice_punto][2] + 1;
				}
			}
			// Guardar en un array todos los puntos.
			var v_reportes = p_data.payload.incidents;
			for (var v_indice in v_reportes) {
				var v_reporte = v_reportes[v_indice];
				cargar_puntos(v_reporte.incident.locationlatitude, v_reporte.incident.locationlongitude);
			}
			// Mapa de calor.
			var heat = L.heatLayer(v_array_puntos, {
				maxZoom: v_max_zoom
			}).addTo(v_mapa);
		}
	});
}
