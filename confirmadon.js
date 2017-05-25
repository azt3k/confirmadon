;(function (root, factory) {

    // AMD. Register as an anonymous module depending on jQuery.
    if (typeof define === 'function' && define.amd)
        define(
            ['jquery'],
            factory
        );

    // Node, CommonJS-like
    else if (typeof exports === 'object')
        module.exports = factory(
            require('jquery')
        );

    // Browser globals (root is window)
    else {
        root.confirmadon = factory(root.jQuery);
    }

}(this, function($, undefined) {

    "use strict";

    var pluginName = "confirmadon",
        pluginVersion = "1.0.1",
        defaults = {
            bindTo: null,
            replacements: {
                title: 'Confirm',
                message: 'Are you sure you want to perform this action?',
                yes: 'Yes',
                no: 'No'
            },
            template:   '<div class="confirmadon-wrap" style="background:rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 20000;">'+
                            '<div class="confirmadon-modal" style="padding:20px; background:#fff; position: fixed; top: 50%; left: 50%; width: 240px; height: 140px; margin-top: -70px; margin left: -120px; z-index: 20001;">' +
                                '<h4>{{title}}</h4><p>{{message}}</p><a class="confirmadon-yes" href="">{{yes}}</a><a class="confirmadon-no" href="">{{no}}</a>' +
                            '</div>' +
                        '</div>',
            noSelector: '.confirmadon-no',
            yesSelector: '.confirmadon-yes',
            visibleClass: 'confirmadon-visible',
            onBeforeShow: null,     // (confirmadon)          this = triggering elem
            onAfterShow: null,      // (confirmadon, $dialog) this = triggering elem
            onBeforeHide: null,     // (confirmadon, $dialog) this = triggering elem
            onAfterHide: null,      // (confirmadon)          this = triggering elem
            onAfterConfirm: null,   // (confirmadon)          this = triggering elem
            onAfterDeny: null,      // (confirmadon)          this = triggering elem
            fade: true,
            applyDefaultOnConfirm: true
        };

    function Plugin(element, idx, selector, options) {
        this.$element = $(element);
        this.idx = idx;
        this.selector = selector;
        this.settings = $.extend(true, {}, defaults, options);
        if (!this.$element.is('.confirmadon')) this.init();
    }

    Plugin.prototype = {

        init: function() {

            var $elem = this.$element,
                conf = this.settings,
                self = this,
                bind = this.bindingStr();

            // attach the binding
            $elem.off(bind).on(bind, function(e) {

                if ($elem.is('.confirmed')) {

                    $elem.removeClass('confirmed');

                } else {

                    e.preventDefault();

                    // on before Show callback
                    if (typeof onBeforeShow == 'function') onBeforeShow.call($elem[0], self);

                    // generate HTML
                    var title = $elem.attr('data-title') || conf.replacements.title,
                        msg = $elem.attr('data-message') || conf.replacements.message,
                        yes = $elem.attr('data-yes') || conf.replacements.yes,
                        no = $elem.attr('data-no') || conf.replacements.no,
                        template = $elem.attr('data-template') || conf.template,
                        $template = $(template).clone();

                    // parse template
                    $template.html(
                        $template.html()
                                 .replace(/\{\{title\}\}/, title)
                                 .replace(/\{\{message\}\}/, msg)
                                 .replace(/\{\{yes\}\}/, yes)
                                 .replace(/\{\{no\}\}/, no)
                    );

                    // attach the binding to the yes button
                    $template.find(conf.yesSelector).on('click', function(chosenEvent) {

                        chosenEvent.preventDefault();

                        // hide the dialog
                        self.close($template);

                        if (conf.applyDefaultOnConfirm) {
                            $elem.addClass('confirmed');
                            setTimeout(function(){
                                self.triggerEvent($elem[0], e.type); // trigger the event that triggered the binding
                            },0);
                        }

                        // run the callback
                        if (typeof conf.onAfterConfirm == 'function') conf.onAfterConfirm.call($elem[0], self);

                    });

                    // attach the binding to the no button
                    $template.find(conf.noSelector).on('click', function(chosenEvent) {

                        chosenEvent.preventDefault();

                        // hide the dialog
                        self.close($template);

                        // run the callback
                        if (typeof conf.onAfterDeny == 'function') conf.onAfterDeny.call($elem[0], self);

                    });

                    // Show the dialog
                    self.open($template);
                }

            });

        },

        triggerEvent: function (target, type, doc, event) {
            doc = document;
            if (doc.createEvent) {
                if (['mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'mouseover', 'mouseout'].indexOf(type) != -1) event = new MouseEvent(type);
                else event = new Event(type);
                target.dispatchEvent(event);
            } else {
                event = doc.createEventObject();
                target.fireEvent('on' + type, event);
            }
        },

        bindingStr: function(namespace) {

            var $elem = this.$element,
                conf = this.settings,
                ns = namespace || 'confirmadon',
                bind = conf.bindTo;

            // set some defaults for binding
            if (!bind) {
                if ($elem.is('form')) bind = "submit";
                else bind = "click";
            }

            // generate binding string
            bind = bind.split(' ')
                       .map(function(val) { return val + ( ns ? '.' + ns : '' )})
                       .join(' ');

            return bind;
        },

        open: function($template) {

            var conf = this.settings,
                $elem = this.$element,
                self = this;

            if (conf.fade) {
                $('body').append($template.hide());
                $template.fadeIn(400, function(){
                    $template.addClass(conf.visibleClass);
                    if (typeof conf.onAfterShow == 'function') conf.onAfterShow.call($elem[0], self, $template);
                });
            } else {

                $('body').append($template);

                if ($template.css('transition') && parseFloat($template.css('transition-duration')))
                    $template.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                        if (typeof conf.onAfterShow == 'function') conf.onAfterShow.call($elem[0], self, $template);
                    });
                else if (typeof conf.onAfterShow == 'function')
                    conf.onAfterShow.call($elem[0], self, $template);

                $template.addClass(conf.visibleClass);
            }
        },

        close: function($template, action) {

            var conf = this.settings,
                $elem = this.$element,
                self = this;

            if (typeof conf.onBeforeHide == 'function') conf.onBeforeHide.call($elem[0], self, $template);

            // hide the dialog
            if (conf.fade) {
                $template.fadeOut(400, function(){
                    $template.remove();
                    if (typeof conf.onAfterHide == 'function') conf.onAfterHide.call($elem[0], self);
                });
            } else {
                $template.removeClass(conf.visibleClass);
                if ($template.css('transition') && parseFloat($template.css('transition-duration')))
                    $template.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                        $template.remove();
                        if (typeof conf.onAfterHide == 'function') conf.onAfterHide.call($elem[0], self);
                    });
                else {
                    $template.remove();
                    if (typeof conf.onAfterHide == 'function') conf.onAfterHide.call($elem[0], self);
                }
            }
        },

        destroy: function() {

        }
    };

    $.fn[pluginName] = function(options) {
        var selector = this.selector;
        return this.each(function(idx) {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, idx, selector, options));
            }
        });
    };

}));
