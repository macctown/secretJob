! function(a) {
    "use strict";

    function b() {
        return !!("ontouchstart" in window) || !!("onmsgesturechange" in window) && !!window.navigator.maxTouchPoints
    }

    function c() {
        var c = a(".noo-job-map"),
            d = c.find("#gmap"),
            e = d.attr("data-latitude") ? d.attr("data-latitude") : nooJobGmapL10n.latitude,
            f = d.attr("data-longitude") ? d.attr("data-longitude") : nooJobGmapL10n.longitude,
            g = new google.maps.LatLng(e, f),
            h = {
                flat: !1,
                noClear: !1,
                zoom: parseInt(nooJobGmapL10n.zoom, 10),
                scrollwheel: !1,
                streetViewControl: !1,
                disableDefaultUI: !1,
                scaleControl: !1,
                navigationControl: !1,
                mapTypeControl: !1,
                draggable: !b(),
                center: g,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: [{
                    featureType: "all",
                    elementType: "labels.text.fill",
                    stylers: [{
                        saturation: 36
                    }, {
                        color: "#000000"
                    }, {
                        lightness: 40
                    }]
                }, {
                    featureType: "all",
                    elementType: "labels.text.stroke",
                    stylers: [{
                        visibility: "on"
                    }, {
                        color: "#000000"
                    }, {
                        lightness: 16
                    }]
                }, {
                    featureType: "all",
                    elementType: "labels.icon",
                    stylers: [{
                        visibility: "off"
                    }]
                }, {
                    featureType: "administrative",
                    elementType: "all",
                    stylers: [{
                        lightness: "-1"
                    }]
                }, {
                    featureType: "administrative",
                    elementType: "geometry.fill",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 20
                    }]
                }, {
                    featureType: "administrative",
                    elementType: "geometry.stroke",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 17
                    }, {
                        weight: 1.2
                    }]
                }, {
                    featureType: "administrative.country",
                    elementType: "all",
                    stylers: [{
                        lightness: "20"
                    }]
                }, {
                    featureType: "administrative.country",
                    elementType: "geometry.stroke",
                    stylers: [{
                        visibility: "on"
                    }, {
                        color: nooJobGmapL10n.primary_color
                    }]
                }, {
                    featureType: "administrative.country",
                    elementType: "labels.text",
                    stylers: [{
                        color: nooJobGmapL10n.primary_color
                    }, {
                        visibility: "simplified"
                    }]
                }, {
                    featureType: "administrative.country",
                    elementType: "labels.icon",
                    stylers: [{
                        visibility: "off"
                    }]
                }, {
                    featureType: "administrative.province",
                    elementType: "all",
                    stylers: [{
                        lightness: "20"
                    }]
                }, {
                    featureType: "administrative.province",
                    elementType: "labels.text",
                    stylers: [{
                        color: nooJobGmapL10n.primary_color
                    }, {
                        visibility: "off"
                    }]
                }, {
                    featureType: "administrative.locality",
                    elementType: "all",
                    stylers: [{
                        lightness: "0"
                    }, {
                        color: nooJobGmapL10n.primary_color
                    }, {
                        saturation: "9"
                    }, {
                        visibility: "simplified"
                    }]
                }, {
                    featureType: "landscape",
                    elementType: "geometry",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 20
                    }]
                }, {
                    featureType: "poi",
                    elementType: "geometry",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 21
                    }]
                }, {
                    featureType: "poi",
                    elementType: "geometry.fill",
                    stylers: [{
                        color: "#3e3e3e"
                    }]
                }, {
                    featureType: "road.highway",
                    elementType: "geometry.fill",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 17
                    }]
                }, {
                    featureType: "road.highway",
                    elementType: "geometry.stroke",
                    stylers: [{
                        color: nooJobGmapL10n.primary_color
                    }, {
                        lightness: 29
                    }, {
                        weight: .2
                    }]
                }, {
                    featureType: "road.arterial",
                    elementType: "geometry",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 18
                    }]
                }, {
                    featureType: "road.local",
                    elementType: "geometry",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 16
                    }]
                }, {
                    featureType: "transit",
                    elementType: "geometry",
                    stylers: [{
                        color: "#000000"
                    }, {
                        lightness: 19
                    }]
                }, {
                    featureType: "water",
                    elementType: "all",
                    stylers: [{
                        visibility: "simplified"
                    }, {
                        lightness: "-62"
                    }]
                }, {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{
                        color: "#13232a"
                    }, {
                        lightness: 17
                    }]
                }]
            },
            i = [],
            j = new google.maps.Map(d.get(0), h);
        google.maps.visualRefresh = !0, google.maps.event.addListener(j, "tilesloaded", function() {
            c.find(".gmap-loading").hide()
        });
        var k = a.parseJSON(nooJobGmapL10n.marker_data);
        if (k.length)
            for (var l = new google.maps.LatLngBounds, m = 0; m < k.length; m++) {
                var n = k[m],
                    o = new google.maps.LatLng(n.latitude, n.longitude),
                    p = new google.maps.Marker({
                        position: o,
                        map: j,
                        title: n.title,
                        url: n.url,
                        term_url: n.term_url,
                        icon: nooJobGmapL10n.marker_icon
                    });
                i.push(p), l.extend(p.getPosition()), j.fitBounds(l), google.maps.event.addListener(p, "click", function() {
                    window.location.href = this.url
                })
            }
        var q = [{
                textColor: "#ffffff",
                opt_textColor: "#ffffff",
                url: nooJobGmapL10n.cloud_icon,
                height: 72,
                width: 72,
                textSize: 15
            }],
            r = new MarkerClusterer(j, i, {
                gridSize: 50,
                ignoreHidden: !0,
                styles: q
            });
        r.setIgnoreHidden(!0)
    }
    google.maps.event.addDomListener(window, "load", c)
}(jQuery);