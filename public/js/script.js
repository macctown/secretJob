! function(a) {
    "use strict";
    var b = function() {
            var a = window,
                b = "inner";
            return "innerWidth" in window || (b = "client", a = document.documentElement || document.body), {
                width: a[b + "Width"],
                height: a[b + "Height"]
            }
        },
        d = function() {
            if (a(".navbar").length) {
                var c = a(window),
                    d = a("body"),
                    e = a(".navbar").offset().top,
                    g = 0,
                    h = a(".navbar"),
                    i = a(".navbar").outerHeight(),
                    j = 0;
                d.hasClass("admin-bar") && (j = a("#wpadminbar").outerHeight());
                var k = function() {
                    if (b().width > 992 && h.hasClass("fixed-top")) {
                        var f = "navbar-fixed-top";
                        h.hasClass("shrinkable") && !d.hasClass("one-page-layout") && (f += " navbar-shrink");
                        var k = e + i;
                        if (c.scrollTop() + j > k) {
                            if (h.hasClass("navbar-fixed-top")) return;
                            if (!h.hasClass("navbar-fixed-top")) return g = i, a(".navbar-wrapper").css({
                                "min-height": g + "px"
                            }), h.closest(".noo-header").css({
                                position: "relative"
                            }), void h.addClass(f).css("top", 0 - g).animate({
                                top: j
                            }, 300)
                        } else {
                            if (!h.hasClass("navbar-fixed-top")) return;
                            h.removeClass(f), h.css({
                                top: ""
                            }), a(".navbar-wrapper").css({
                                "min-height": "none"
                            }), h.closest(".noo-header").css({
                                position: ""
                            })
                        }
                    }
                };
                c.on("scroll", k).resize(k), d.hasClass("one-page-layout") && (a('.navbar-scrollspy > .nav > li > a[href^="#"]').on( "click", function(b) {
                    b.preventDefault();
                    var c = a(this).attr("href").replace(/.*(?=#[^\s]+$)/, "");
                    if (c && a(c).length) {
                        var d = Math.max(0, a(c).offset().top);
                        d = Math.max(0, d - (j + a(".navbar").outerHeight()) + 5), a("html, body").animate({
                            scrollTop: d
                        }, {
                            duration: 800,
                            easing: "easeInOutCubic",
                            complete: window.reflow
                        })
                    }
                }), d.scrollspy({
                    target: ".navbar-scrollspy",
                    offset: j + a(".navbar").outerHeight()
                }), a(window).resize(function() {
                    d.scrollspy("refresh")
                }))
            }
            a(".noo-slider-revolution-container .noo-slider-scroll-bottom").on( "click", function(b) {
                b.preventDefault();
                var c = a(".noo-slider-revolution-container").outerHeight();
                a("html, body").animate({
                    scrollTop: c
                }, 900, "easeInOutExpo")
            }), a("body").on("mouseenter", ".masonry-style-elevated .masonry-portfolio.no-gap .masonry-item", function() {
                a(this).closest(".masonry-container").find(".masonry-overlay").show(), a(this).addClass("masonry-item-hover")
            }), a("body").on("mouseleave ", ".masonry-style-elevated .masonry-portfolio.no-gap .masonry-item", function() {
                a(this).closest(".masonry-container").find(".masonry-overlay").hide(), a(this).removeClass("masonry-item-hover")
            }), a(".masonry").each(function() {
                var b = a(this),
                    c = a(this).find(".masonry-container"),
                    d = a(this).find(".masonry-filters a");
                c.isotope({
                    itemSelector: ".masonry-item",
                    transitionDuration: "0.8s",
                    masonry: {
                        gutter: 0
                    }
                }), imagesLoaded(b, function() {
                    c.isotope("layout")
                }), d.on( "click", function(a) {
                    a.stopPropagation(), a.preventDefault();
                    var d = jQuery(this);
                    if (d.hasClass("selected")) return !1;
                    b.find(".masonry-result h3").text(d.text());
                    var e = d.closest("ul");
                    e.find(".selected").removeClass("selected"), d.addClass("selected");
                    var f = {
                            layoutMode: "masonry",
                            transitionDuration: "0.8s",
                            masonry: {
                                gutter: 0
                            }
                        },
                        g = e.attr("data-option-key"),
                        h = d.attr("data-option-value");
                    h = "false" === h ? !1 : h, f[g] = h, c.isotope(f)
                })
            }), a(window).scroll(function() {
                a(this).scrollTop() > 500 ? a(".go-to-top").addClass("on") : a(".go-to-top").removeClass("on")
            }), a("body").on("click", ".go-to-top", function() {
                return a("html, body").animate({
                    scrollTop: 0
                }, 800), !1
            }), a("body").on("click", ".search-button", function() {
                return a(".searchbar").hasClass("hide") && (a(".searchbar").removeClass("hide").addClass("show"), a(".searchbar #s").focus()), !1
            }), a("body").on("mousedown", a.proxy(function(b) {
                var c = a(b.target);
                c.is(".searchbar") || 0 !== c.parents(".searchbar").length || a(".searchbar").removeClass("show").addClass("hide")
            }, this))
        };
    a(document).ready(function() {
        a('[data-toggle="tooltip"]').tooltip(), a(".form-control-chosen").chosen({
            placeholder_text_multiple: "Select Some Options",
            placeholder_text_single: "Select an Option",
            no_result_text: "No results match"
        }), a(".noo-user-navbar-collapse").on("show.bs.collapse", function() {
            a(".noo-navbar-collapse").hasClass("in") && a(".noo-navbar-collapse").collapse("hide")
        }), a(".noo-navbar-collapse").on("show.bs.collapse", function() {
            a(".noo-user-navbar-collapse").hasClass("in") && a(".noo-user-navbar-collapse").collapse("hide")
        }), d()
    }), a(document).on("noo-layout-changed", function() {
        d()
    })
}(jQuery);