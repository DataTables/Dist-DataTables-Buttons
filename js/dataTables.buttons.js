/*! Buttons 4.0.0-beta.1 for DataTables
 * Copyright (c) SpryMedia Ltd - datatables.net/license
 */

(function(factory){
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['datatables.net'], function (dt) {
			return factory(window, document, dt);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		var cjsRequires = function (root) {
			if (! root.DataTable) {
				require('datatables.net')(root);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root) {
				if (! root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				cjsRequires(root);
				return factory(root, root.document, root.DataTable);
			};
		}
		else {
			cjsRequires(window);
			module.exports = factory(window, window.document, window.DataTable);
		}
	}
	else {
		// Browser
		factory(window, document, window.DataTable);
	}
}(function(window, document, DataTable) {
'use strict';

var Dom = DataTable.Dom;
var util = DataTable.util;


if (!DataTable.versionCheck('3')) {
    throw 'Warning: Buttons requires DataTables 3 or newer';
}
const _exportTextarea = document.createElement('textarea');
// Used for namespacing events added to the document by each instance, so they
// can be removed on destroy
var _instCounter = 0;
// Button namespacing counter for namespacing events on individual buttons
var _buttonCounter = 0;
// Custom entity decoder for data export
var _entityDecoder = null;
var useJszip;
var usePdfmake;
function _jsZip() {
    return useJszip || window.JSZip;
}
function _pdfMake() {
    return usePdfmake || window.pdfMake;
}
function fadeIn(el, duration = 400, fn) {
    el.css({
        opacity: '0'
    }).transition({ opacity: '1' }, duration, null, fn);
}
function fadeOut(el, duration = 400, fn) {
    el.css({
        opacity: '1'
    }).transition({ opacity: '0' }, duration, null, fn);
}
class Buttons {
    /**
     * Set the pdfMake library for use with the pdfHtml5 button type
     *
     * @param _
     * @returns pdfMake library that is set
     */
    static pdfMake(_) {
        if (_) {
            usePdfmake = _;
        }
        return _pdfMake();
    }
    /**
     * Set the JSZip library for use with the excelHtml5 button type
     *
     * @param _
     * @returns JSZip library that is set
     */
    static jszip(_) {
        if (_) {
            useJszip = _;
        }
        return _jsZip();
    }
    /**
     * Display (and replace if there is an existing one) a popover attached to a
     * button
     *
     * @param contentIn Content to show
     * @param hostButton DT API instance of the button
     * @param inOpts Options (see object below for all options)
     */
    popover(contentIn, hostButton, inOpts) {
        var dt = hostButton;
        var c = this.c;
        var closed = false;
        var options = util.object.assign({
            align: 'button-left', // button-right, dt-container, split-left, split-right
            autoClose: false,
            background: true,
            backgroundClassName: 'dt-button-background',
            closeButton: true,
            containerClassName: c.dom.collection.container.className,
            contentClassName: c.dom.collection.container.content.className,
            collectionLayout: '',
            collectionTitle: '',
            dropup: false,
            fade: 400,
            popoverTitle: '',
            rightAlignClassName: 'dt-button-right',
            tag: c.dom.collection.container.tag
        }, inOpts);
        var containerSelector = options.tag + '.' + options.containerClassName.replace(/ /g, '.');
        var hostButtonNode = hostButton.node();
        var hostNode = options.collectionLayout.includes('fixed')
            ? Dom.s('body')
            : hostButton.node();
        var close = function () {
            closed = true;
            fadeOut(Dom.s(containerSelector), options.fade, function () {
                this.detach();
            });
            dt.buttons('[aria-haspopup="dialog"][aria-expanded="true"]')
                .nodes()
                .attr('aria-expanded', 'false');
            Dom.s('div.dt-button-background').off('click.dtb-collection');
            Buttons.background(false, options.backgroundClassName, options.fade, hostNode.get(0));
            Dom.w.off('resize.resize.dtb-collection');
            Dom.s('body').off('.dtb-collection');
            dt.off('buttons-action.b-internal');
            dt.off('destroy.dtb-popover');
            Dom.s('body').trigger('buttons-popover-hide.dt');
        };
        if (contentIn === false) {
            close();
            return;
        }
        var existingExpanded = dt
            .buttons('[aria-haspopup="dialog"][aria-expanded="true"]')
            .nodes();
        if (existingExpanded.count()) {
            // Reuse the current position if the button that was triggered is
            // inside an existing collection
            if (hostNode.closest(containerSelector).count()) {
                hostNode = existingExpanded.eq(0);
            }
            close();
        }
        let content = typeof contentIn === 'string'
            ? Dom.c('div').html(contentIn).children()
            : Dom.s(contentIn);
        // Sort buttons if defined
        if (options.sort) {
            var elements = content.find('button').mapTo(function (el) {
                return {
                    text: Dom.s(el).text(),
                    el: el
                };
            });
            elements.sort(function (a, b) {
                return a.text.localeCompare(b.text);
            });
            content.append(elements.map(function (v) {
                return v.el;
            }));
        }
        // Try to be smart about the layout
        var cnt = content.find('.dt-button').count();
        var mod = '';
        if (cnt === 3) {
            mod = 'dtb-b3';
        }
        else if (cnt === 2) {
            mod = 'dtb-b2';
        }
        else if (cnt === 1) {
            mod = 'dtb-b1';
        }
        var display = Dom.c(options.tag)
            .classAdd(options.containerClassName)
            .classAdd(options.collectionLayout)
            .classAdd(options.splitAlignClass)
            .classAdd(mod)
            .css('opacity', '0')
            .attr({
            'aria-modal': true,
            role: 'dialog'
        });
        content
            .classAdd(options.contentClassName)
            .attr('role', 'menu')
            .appendTo(display);
        hostButtonNode.attr('aria-expanded', 'true');
        if (!hostNode.isAttached()) {
            let possibilities = Dom.s(document.body).children('div, section, p');
            hostNode = possibilities.eq(possibilities.count() - 1);
        }
        if (options.popoverTitle) {
            display.prepend('<div class="dt-button-collection-title">' +
                options.popoverTitle +
                '</div>');
        }
        else if (options.collectionTitle) {
            display.prepend('<div class="dt-button-collection-title">' +
                options.collectionTitle +
                '</div>');
        }
        if (options.closeButton) {
            display
                .prepend('<div class="dtb-popover-close">&times;</div>')
                .classAdd('dtb-collection-closeable');
        }
        if (hostNode.get(0) === document.body) {
            display.appendTo(document.body);
        }
        else {
            display.insertAfter(hostNode);
        }
        var tableContainer = Dom.s(hostButton.table().container());
        var position = display.css('position');
        if (options.span === 'container' || options.align === 'dt-container') {
            hostNode = hostNode.parent();
            display.css('width', tableContainer.width() + 'px');
        }
        // Align the popover relative to the DataTables container
        // Useful for wide popovers such as SearchPanes
        if (position === 'absolute') {
            // Align relative to the host button
            var offsetParent = Dom.s(hostNode.get(0).offsetParent);
            var buttonPosition = hostNode.position();
            var buttonOffset = hostNode.offset();
            var containerPosition = offsetParent.position();
            // Set the initial position so we can read height / width
            var top = buttonPosition.top + hostNode.height('outer');
            var left = buttonPosition.left;
            display.css({
                top: top + 'px',
                left: left + 'px'
            });
            // Get the popover position
            var computed = window.getComputedStyle(display.get(0));
            var displayOffset = display.offset();
            var displayWidth = display.width('outer');
            var displayHeight = display.height('outer');
            var popoverSizes = {
                height: displayHeight,
                width: displayWidth,
                right: displayOffset.left + displayWidth,
                bottom: displayOffset.top + displayHeight,
                marginTop: parseFloat(computed.marginTop),
                marginBottom: parseFloat(computed.marginBottom),
                top: displayOffset.top,
                left: displayOffset.left
            };
            // First position per the class requirements - pop up and right align
            if (options.dropup) {
                top =
                    buttonPosition.top -
                        popoverSizes.height -
                        popoverSizes.marginTop -
                        popoverSizes.marginBottom;
            }
            if (options.align === 'button-right' ||
                display.classHas(options.rightAlignClassName)) {
                left =
                    buttonPosition.left -
                        popoverSizes.width +
                        hostNode.width('outer');
            }
            // Container alignment - make sure it doesn't overflow the table container
            if (options.align === 'dt-container' ||
                options.align === 'container') {
                if (left < buttonPosition.left) {
                    left = -buttonPosition.left;
                }
            }
            // Window adjustment
            if (containerPosition.left + left + popoverSizes.width >
                Dom.w.width()) {
                // Overflowing the document to the right
                left =
                    Dom.w.width() - popoverSizes.width - containerPosition.left;
            }
            if (buttonOffset.left + left < 0) {
                // Off to the left of the document
                left = -buttonOffset.left;
            }
            if (containerPosition.top + top + popoverSizes.height >
                Dom.w.height() + Dom.w.scrollTop()) {
                // Pop up if otherwise we'd need the user to scroll down
                top =
                    buttonPosition.top -
                        popoverSizes.height -
                        popoverSizes.marginTop -
                        popoverSizes.marginBottom;
            }
            if (offsetParent.offset().top + top < Dom.w.scrollTop()) {
                // Correction for when the top is beyond the top of the page
                top = buttonPosition.top + hostNode.height('outer');
            }
            // Calculations all done - now set it
            display.css({
                top: top + 'px',
                left: left + 'px'
            });
        }
        else {
            // Fix position - centre on screen
            var place = function () {
                var half = Dom.w.height() / 2;
                var top = display.height() / 2;
                if (top > half) {
                    top = half;
                }
                display.css('marginTop', top + 'px');
            };
            place();
            Dom.w.on('resize.dtb-collection', function () {
                place();
            });
        }
        fadeIn(display, options.fade);
        if (options.background) {
            Buttons.background(true, options.backgroundClassName, options.fade, options.backgroundHost || hostNode.get(0));
        }
        // This is bonkers, but if we don't have a click listener on the
        // background element, iOS Safari will ignore the body click
        // listener below. An empty function here is all that is
        // required to make it work...
        Dom.s('div.dt-button-background').on('click.dtb-collection', function () { });
        if (options.autoClose) {
            setTimeout(function () {
                dt.on('buttons-action.b-internal', function (e, btn, dt, node) {
                    if (node.get(0) === hostNode.get(0)) {
                        return;
                    }
                    close();
                });
            }, 0);
        }
        display.trigger('buttons-popover.dt');
        dt.on('destroy.dtb-popover', close);
        setTimeout(function () {
            closed = false;
            Dom.s('body')
                .on('click.dtb-collection', function (e) {
                if (closed) {
                    return;
                }
                if (
                // Background click
                Dom.s(e.target).classHas('dt-button-background') ||
                    Dom.s(e.target).classHas('dtb-popover-close') ||
                    // If not the current display element, or in the
                    // modal then somehow they have clicked behind the
                    // background
                    (e.target !== display.get(0) &&
                        display.find(e.target).count() === 0)) {
                    close();
                }
            })
                .on('keyup.dtb-collection', function (e) {
                if (e.keyCode === 27) {
                    close();
                }
            })
                .on('keydown.dtb-collection', function (e) {
                // Focus trap for tab key
                var elements = content.find('a, button');
                var active = document.activeElement;
                var first = elements.eq(0);
                var last = elements.eq(elements.count() - 1);
                if (e.keyCode !== 9) {
                    // tab
                    return;
                }
                if (elements.get().includes(active)) {
                    // If current focus is not inside the popover
                    first.focus();
                    e.preventDefault();
                }
                else if (e.shiftKey) {
                    // Reverse tabbing order when shift key is pressed
                    if (active === elements.get(0)) {
                        last.focus();
                        e.preventDefault();
                    }
                }
                else {
                    if (active === last.get(0)) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            });
        }, 0);
    }
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Public methods
     */
    /**
     * Get / set the action of a button
     * @param node Button element
     * @param action Function to set
     * @return Self for chaining
     */
    action(node, action) {
        var button = this._nodeToButton(node);
        if (action === undefined) {
            return button ? button.conf.action : null;
        }
        if (button) {
            button.conf.action = action;
        }
        return this;
    }
    /**
     * Add an active class to the button to make to look active or get current
     * active state.
     *
     * @param node Button element
     * @param flag Enable / disable flag
     * @return Self for chaining or boolean for getter
     */
    active(node, flag) {
        var button = this._nodeToButton(node);
        var klass = this.c.dom.button.active;
        if (button &&
            button.inCollection &&
            this.c.dom.collection.button &&
            this.c.dom.collection.button.active !== undefined) {
            klass = this.c.dom.collection.button.active;
        }
        if (flag === undefined) {
            return button ? button.node.classHas(klass) : false;
        }
        if (button) {
            button.node.classToggle(klass, flag === undefined ? true : flag);
        }
        return this;
    }
    /**
     * Add a new button
     *
     * @param config Button configuration object, base string name or function
     * @param idx Button index for where to insert the button
     * @param draw Trigger a draw. Set a false when adding lots of buttons,
     *   until the last button.
     * @return Self for chaining
     */
    add(config, idx, draw = true) {
        var buttons = this.s.buttons;
        if (typeof idx === 'string') {
            var parts = idx.split('-');
            var base = this.s;
            for (var i = 0, ien = parts.length - 1; i < ien; i++) {
                base = base.buttons[parseInt(parts[i])];
            }
            buttons = base.buttons;
            idx = parseInt(parts[parts.length - 1]);
        }
        let split = config ? config.split : undefined;
        let node = this._expandButton(buttons, config, split, (!config || !split || split.length === 0) && base, false, idx);
        if (draw === undefined || draw === true) {
            this._draw();
        }
        return node;
    }
    /**
     * Clear buttons from a collection and then insert new buttons
     */
    collectionRebuild(node, newButtons) {
        var button = this._nodeToButton(node);
        if (!button) {
            return;
        }
        if (newButtons !== undefined) {
            var i;
            // Need to reverse the array
            for (i = button.buttons.length - 1; i >= 0; i--) {
                this.remove(button.buttons[i].node);
            }
            // If the collection has prefix and / or postfix buttons we need to add them in
            if (button.conf.prefixButtons) {
                newButtons.unshift.apply(newButtons, button.conf.prefixButtons);
            }
            if (button.conf.postfixButtons) {
                newButtons.push.apply(newButtons, button.conf.postfixButtons);
            }
            for (i = 0; i < newButtons.length; i++) {
                var newBtn = newButtons[i];
                this._expandButton(button.buttons, newBtn, newBtn !== undefined &&
                    newBtn.config !== undefined &&
                    newBtn.config.split !== undefined, true, newBtn.parentConf !== undefined &&
                    newBtn.parentConf.split !== undefined, undefined, newBtn.parentConf);
            }
        }
        this._draw(button.collection, button.buttons);
    }
    /**
     * Get the container node for the buttons
     *
     * @return Buttons node
     */
    container() {
        return this.dom.container;
    }
    /**
     * Disable a button
     * @param node Button node
     * @return Self for chaining
     */
    disable(node) {
        var button = this._nodeToButton(node);
        if (button) {
            if (button.isSplit) {
                button.node
                    .children()
                    .eq(0)
                    .classAdd(this.c.dom.button.disabled)
                    .prop('disabled', true);
            }
            else {
                button.node
                    .classAdd(this.c.dom.button.disabled)
                    .prop('disabled', true);
            }
            button.disabled = true;
            this._checkSplitEnable();
        }
        return this;
    }
    /**
     * Destroy the instance, cleaning up event handlers and removing DOM
     * elements
     * @return {Buttons} Self for chaining
     */
    destroy() {
        // Key event listener
        Dom.s('body').off('keyup.' + this.s.namespace);
        // Individual button destroy (so they can remove their own events if
        // needed). Take a copy as the array is modified by `remove`
        var buttons = this.s.buttons.slice();
        var i, ien;
        for (i = 0, ien = buttons.length; i < ien; i++) {
            this.remove(buttons[i].node.get(0));
        }
        // Container
        this.dom.container.remove();
        // Remove from the settings object collection
        var buttonInsts = this.s.dt.settings()[0]._buttons;
        for (i = 0, ien = buttonInsts.length; i < ien; i++) {
            if (buttonInsts[i].inst === this) {
                buttonInsts.splice(i, 1);
                break;
            }
        }
        return this;
    }
    /**
     * Enable / disable a button
     *
     * @param node Button node
     * @param flag Enable / disable flag
     * @return Self for chaining
     */
    enable(node, flag = true) {
        if (flag === false) {
            return this.disable(node);
        }
        var button = this._nodeToButton(node);
        if (button) {
            if (button.isSplit) {
                button.node
                    .children()
                    .eq(0)
                    .classRemove(this.c.dom.button.disabled)
                    .prop('disabled', false);
            }
            else {
                button.node
                    .classRemove(this.c.dom.button.disabled)
                    .prop('disabled', false);
            }
            button.disabled = false;
            this._checkSplitEnable();
        }
        return this;
    }
    /**
     * Get a button's index
     *
     * This is internally recursive
     *
     * @param node Button to get the index of
     * @return Button index
     */
    index(node, nested, buttons) {
        if (!nested) {
            nested = '';
        }
        if (!buttons) {
            buttons = this.s.buttons;
        }
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            var inner = buttons[i].buttons;
            if (buttons[i].node.get(0) === node) {
                return nested + i;
            }
            if (inner && inner.length) {
                var match = this.index(node, i + '-', inner);
                if (match !== null) {
                    return match;
                }
            }
        }
        return null;
    }
    /**
     * Get the instance name for the button set selector
     *
     * @return Instance name
     */
    name() {
        return this.c.name;
    }
    /**
     * Get a button's node of the buttons container if no button is given
     * @param node Button node
     * @return Button element, or container
     */
    node(node) {
        if (!node) {
            return this.dom.container;
        }
        var button = this._nodeToButton(node);
        return button ? button.node : null;
    }
    /**
     * Set / get a processing class on the selected button
     *
     * @param node Triggering button node
     * @param flag true to add, false to remove, undefined to get
     * @return Getter value or this if a setter.
     */
    processing(node, flag) {
        var dt = this.s.dt;
        var button = this._nodeToButton(node);
        if (flag === undefined) {
            return button ? button.node.classHas('processing') : false;
        }
        if (button) {
            button.node.classToggle('processing', flag);
            Dom.s(dt.table().node()).trigger('buttons-processing.dt', false, [
                flag,
                dt.button(node),
                dt,
                button.node,
                button.conf
            ]);
        }
        return this;
    }
    /**
     * Remove a button.
     *
     * @param node Button node
     * @return Self for chaining
     */
    remove(node) {
        let button = this._nodeToButton(node);
        if (!button) {
            return this;
        }
        let host = this._nodeToHost(node);
        let dt = this.s.dt;
        // Remove any child buttons first
        if (button.buttons.length) {
            for (let i = button.buttons.length - 1; i >= 0; i--) {
                this.remove(button.buttons[i].node.get(0));
            }
        }
        button.conf.destroying = true;
        // Allow the button to remove event handlers, etc
        if (button.conf.destroy) {
            button.conf.destroy.call(dt.button(node), dt, button.node, button.conf);
        }
        this._removeKey(button.conf);
        button.node.remove();
        if (button.inserter) {
            button.inserter.remove();
        }
        if (host) {
            let idx = host.indexOf(button);
            host.splice(idx, 1);
        }
        return this;
    }
    text(node, label) {
        let button = this._nodeToButton(node);
        if (!button) {
            return label === undefined ? '' : this;
        }
        let textNode = button.textNode;
        let dt = this.s.dt;
        let text = function (opt) {
            return typeof opt === 'function'
                ? opt(dt, button.node, button.conf)
                : opt;
        };
        if (label === undefined) {
            return text(button.conf.text || '');
        }
        button.conf.text = label;
        if (textNode) {
            textNode.html(text(label));
        }
        return this;
    }
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Constructor
     */
    constructor(dtIn, configIn) {
        let config;
        let dt = new DataTable.Api(dtIn);
        // If there is no config set it to an empty object
        if (typeof configIn === 'undefined') {
            config = {};
        }
        else if (configIn === true) {
            // Allow a boolean true for defaults
            config = {};
        }
        else if (Array.isArray(configIn)) {
            // For easy configuration of buttons an array can be given
            config = { buttons: configIn };
        }
        else {
            config = configIn;
        }
        this.c = util.object.assignDeep({}, Buttons.defaults, config);
        // Don't want a deep copy for the buttons
        if (config.buttons) {
            this.c.buttons = config.buttons;
        }
        this.s = {
            dt,
            buttons: [],
            listenKeys: '',
            namespace: 'dtb' + _instCounter++
        };
        this.dom = {
            container: Dom.c(this.c.dom.container.tag).classAdd(this.c.dom.container.className)
        };
        var that = this;
        var dtSettings = this.s.dt.settings()[0];
        var buttons = this.c.buttons;
        if (!dtSettings._buttons) {
            dtSettings._buttons = [];
        }
        dtSettings._buttons.push({
            inst: this,
            name: this.c.name
        });
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            this.add(buttons[i]);
        }
        dt.on('destroy', function (e, settings) {
            if (settings === dtSettings) {
                that.destroy();
            }
        });
        // Global key event binding to listen for button keys
        Dom.c('body').on('keyup.' + this.s.namespace, function (e) {
            if (!document.activeElement ||
                document.activeElement === document.body) {
                // Use a string of characters for fast lookup of if we need to
                // handle this
                var character = String.fromCharCode(e.keyCode).toLowerCase();
                if (that.s.listenKeys.toLowerCase().indexOf(character) !== -1) {
                    that._keypress(character, e);
                }
            }
        });
    }
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Private methods
     */
    /**
     * Add a new button to the key press listener
     * @param conf Resolved button configuration object
     */
    _addKey(conf) {
        if (conf.key) {
            this.s.listenKeys += util.is.plainObject(conf.key)
                ? conf.key.key
                : conf.key;
        }
    }
    /**
     * Insert the buttons into the container. Call without parameters!
     *
     * @param container Recursive only - Insert point
     * @param buttons Recursive only - Buttons array
     */
    _draw(container, buttons) {
        if (!container) {
            container = this.dom.container;
        }
        if (!buttons) {
            buttons = this.s.buttons;
        }
        container.children().detach();
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            container.append(buttons[i].inserter);
            container.append(document.createTextNode(' '));
            if (buttons[i].buttons && buttons[i].buttons.length) {
                this._draw(buttons[i].collection, buttons[i].buttons);
            }
        }
    }
    /**
     * Create buttons from an array of buttons
     */
    _expandButton(attachTo, button, split, inCollection, inSplit, attachPoint, parentConf) {
        var dt = this.s.dt;
        var isSplit = false;
        var domCollection = this.c.dom.collection;
        var buttons = !Array.isArray(button) ? [button] : button;
        var lastButton;
        if (button === undefined) {
            buttons = !Array.isArray(split) ? [split] : split;
        }
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            // If the configuration is an array, then expand the buttons at this
            // point
            if (Array.isArray(buttons[i])) {
                this._expandButton(attachTo, buttons[i], undefined, inCollection, parentConf !== undefined && parentConf.split !== undefined, attachPoint, parentConf);
                continue;
            }
            var conf = this._resolveExtends(buttons[i]);
            if (!conf) {
                continue;
            }
            isSplit = conf.split ? true : false;
            // If the configuration is an array, then expand the buttons at this
            // point
            if (Array.isArray(conf)) {
                this._expandButton(attachTo, conf, false, inCollection, parentConf !== undefined && parentConf.split !== undefined, attachPoint, parentConf);
                continue;
            }
            var built = this._buildButton(conf, inCollection, conf.split !== undefined, inSplit);
            if (!built) {
                continue;
            }
            if (attachPoint !== undefined && attachPoint !== null) {
                attachTo.splice(attachPoint, 0, built);
                attachPoint++;
            }
            else {
                attachTo.push(built);
            }
            // Any button type can have a drop icon set
            if (built.conf.dropIcon && !built.conf.split) {
                built.node
                    .classAdd(this.c.dom.button.dropClass)
                    .append(this.c.dom.button.dropHtml);
            }
            // Create the dropdown for a collection
            if (built.conf.buttons) {
                built.collection = Dom.c(domCollection.container.content.tag);
                built.conf._collection = built.collection;
                this._expandButton(built.buttons, built.conf.buttons, built.conf.split, !isSplit, isSplit, attachPoint, built.conf);
            }
            // And the split collection
            if (built.conf.split) {
                built.collection = Dom.c(domCollection.container.tag);
                built.conf._collection = built.collection;
                for (var j = 0; j < built.conf.split.length; j++) {
                    var item = built.conf.split[j];
                    if (typeof item === 'object') {
                        item.parent = parentConf;
                        if (item.collectionLayout === undefined) {
                            item.collectionLayout = built.conf.collectionLayout;
                        }
                        if (item.dropup === undefined) {
                            item.dropup = built.conf.dropup;
                        }
                        if (item.fade === undefined) {
                            item.fade = built.conf.fade;
                        }
                    }
                }
                this._expandButton(built.buttons, built.conf.buttons, built.conf.split, !isSplit, isSplit, attachPoint, built.conf);
            }
            built.conf.parent = parentConf;
            // init call is made here, rather than buildButton as it needs to
            // be selectable, and for that it needs to be in the buttons array
            if (conf.init) {
                conf.init.call(dt.button(built.node), dt, built.node, conf);
            }
            lastButton = built.node;
        }
        return lastButton;
    }
    /**
     * Create an individual button
     *
     * @param config Resolved button configuration
     * @param inCollection `true` if a collection button
     * @param isSplit Is a split button
     * @param inSplit Is a part of a split button
     * @return {object} Completed button description object
     */
    _buildButton(config, inCollection, isSplit, inSplit) {
        var that = this;
        var configDom = this.c.dom;
        var textNode = null;
        var dt = this.s.dt;
        var setLinerTab = false;
        var text = function (opt) {
            return typeof opt === 'function' ? opt(dt, button, config) : opt;
        };
        // Create an object that describes the button which can be in
        // `dom.button`, or `dom.collection.button` or `dom.split.button` or
        // `dom.collection.split.button`! Each should extend from `dom.button`.
        var domStructure = util.object.assignDeep({}, configDom.button);
        if (inCollection && isSplit && configDom.collection.split) {
            util.object.assignDeep(domStructure, configDom.collection.split.action);
        }
        else if (inSplit || inCollection) {
            util.object.assignDeep(domStructure, configDom.collection.button);
        }
        else if (isSplit) {
            util.object.assignDeep(domStructure, configDom.split.button);
        }
        // Spacers don't do much other than insert an element into the DOM
        if (config.spacer) {
            var spacer = Dom.c(domStructure.spacer.tag)
                .classAdd([
                'dt-button-spacer',
                config.style || '',
                domStructure.spacer.className
            ])
                .html(text(config.text || ''));
            return {
                buttons: [],
                collection: null,
                conf: config,
                disabled: false,
                inserter: spacer,
                inSplit: inSplit,
                inCollection: inCollection,
                isCollection: false,
                isSplit: false,
                node: spacer,
                nodeChild: null,
                textNode: spacer
            };
        }
        // Make sure that the button is available based on whatever requirements
        // it has. For example, PDF button require pdfmake
        if (config.available && !config.available(dt, config) && !config.html) {
            return false;
        }
        var button;
        if (!config.html) {
            var run = function (e, dt, button, config, done) {
                var _a;
                (_a = config.action) === null || _a === void 0 ? void 0 : _a.call(dt.button(button), e, dt, button, config, done);
                Dom.s(dt.table().node()).trigger('buttons-action.dt', false, [
                    dt.button(button),
                    dt,
                    button,
                    config
                ]);
            };
            var action = function (e, dt, button, config) {
                if (config.async) {
                    that.processing(button.get(0), true);
                    setTimeout(function () {
                        run(e, dt, button, config, function () {
                            that.processing(button.get(0), false);
                        });
                    }, config.async);
                }
                else {
                    run(e, dt, button, config, () => { });
                }
            };
            var tag = config.tag || domStructure.tag;
            var clickBlurs = config.clickBlurs === undefined ? true : config.clickBlurs;
            button = Dom.c(tag)
                .classAdd(domStructure.className)
                .attr('aria-controls', this.s.dt.table().node().id)
                .on('click.dtb', function (e) {
                e.preventDefault();
                if (!button.classHas(domStructure.disabled) &&
                    config.action) {
                    action(e, dt, button, config, () => { });
                }
                if (clickBlurs) {
                    button.blur();
                }
            })
                .on('keypress.dtb', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    if (!button.classHas(domStructure.disabled) &&
                        config.action) {
                        action(e, dt, button, config, () => { });
                    }
                }
            });
            // Make `a` tags act like a link
            if (tag.toLowerCase() === 'a') {
                button.attr('href', '#');
            }
            // Button tags should have `type=button` so they don't have any default behaviour
            if (tag.toLowerCase() === 'button') {
                button.attr('type', 'button');
            }
            if (domStructure.liner.tag) {
                var lc = domStructure.liner.tag.toLowerCase();
                var liner = Dom.c(lc)
                    .html(text(config.text || ''))
                    .classAdd(domStructure.liner.className);
                if (lc === 'a') {
                    liner.attr('href', '#');
                }
                if (lc === 'a' || lc === 'button') {
                    liner.attr('tabindex', this.s.dt.settings()[0].tabIndex);
                    setLinerTab = true;
                }
                button.append(liner);
                textNode = liner;
            }
            else {
                button.html(text(config.text || ''));
                textNode = button;
            }
            if (!setLinerTab) {
                button.attr('tabindex', this.s.dt.settings()[0].tabIndex);
            }
            if (config.enabled === false) {
                button.classAdd(domStructure.disabled);
            }
            if (config.className) {
                button.classAdd(config.className);
            }
            if (config.titleAttr) {
                button.attr('title', text(config.titleAttr));
            }
            if (config.attr) {
                button.attr(config.attr);
            }
            if (!config.namespace) {
                config.namespace = '.dt-button-' + _buttonCounter++;
            }
        }
        else {
            button = Dom.c('div').html(config.html);
        }
        var buttonContainer = this.c.dom.buttonContainer;
        var inserter;
        if (buttonContainer && buttonContainer.tag) {
            inserter = Dom.c(buttonContainer.tag)
                .classAdd(buttonContainer.className)
                .append(button);
        }
        else {
            inserter = button;
        }
        this._addKey(config);
        // Style integration callback for DOM manipulation
        if (this.c.buttonCreated) {
            inserter = this.c.buttonCreated(config, inserter, inCollection);
        }
        var splitDiv;
        if (isSplit) {
            var dropdownConf = inCollection
                ? util.object.assignDeep(this.c.dom.split, this.c.dom.collection.split)
                : this.c.dom.split;
            var wrapperConf = dropdownConf.wrapper;
            splitDiv = Dom.c(wrapperConf.tag)
                .classAdd(wrapperConf.className)
                .append(button);
            var dropButtonConfig = util.object.assign(config, {
                autoClose: true,
                align: dropdownConf.dropdown.align,
                attr: {
                    'aria-haspopup': 'dialog',
                    'aria-expanded': false
                },
                className: dropdownConf.dropdown.className,
                closeButton: false,
                splitAlignClass: dropdownConf.dropdown.splitAlignClass,
                text: dropdownConf.dropdown.text
            });
            this._addKey(dropButtonConfig);
            var splitAction = function (e, dt, button, config) {
                if (typeof Buttons.buttons.split === 'object' &&
                    Buttons.buttons.split.action) {
                    Buttons.buttons.split.action.call(dt.button(splitDiv), e, dt, button, config, () => { });
                }
                Dom.s(dt.table().node()).trigger('buttons-action.dt', false, [
                    dt.button(button),
                    dt,
                    button,
                    config
                ]);
                button.attr('aria-expanded', true);
            };
            var dropButton = Dom.c('button')
                .classAdd([
                dropdownConf.dropdown.className,
                'dt-button',
                this.c.dom.button.dropClass
            ])
                .html(this.c.dom.button.dropHtml)
                .on('click.dtb', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!dropButton.classHas(domStructure.disabled)) {
                    splitAction(e, dt, dropButton, dropButtonConfig, () => { });
                }
                if (clickBlurs) {
                    dropButton.blur();
                }
            })
                .on('keypress.dtb', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    if (!dropButton.classHas(domStructure.disabled)) {
                        splitAction(e, dt, dropButton, dropButtonConfig, () => { });
                    }
                }
            });
            if (config.split && config.split.length === 0) {
                dropButton.classAdd('dtb-hide-drop');
            }
            if (dropButtonConfig.attr) {
                splitDiv.append(dropButton).attr(dropButtonConfig.attr);
            }
            button = splitDiv;
        }
        return {
            buttons: [],
            collection: null,
            conf: config,
            disabled: false,
            inserter: isSplit ? button : inserter,
            inCollection: inCollection,
            inSplit: inSplit,
            isCollection: false,
            isSplit: isSplit,
            node: button,
            nodeChild: button && button.children && button.children().count()
                ? button.children().get(0)
                : null,
            textNode: textNode
        };
    }
    /**
     * Spin over buttons checking if splits should be enabled or not.
     * @param buttons Array of buttons to check
     */
    _checkSplitEnable(buttons) {
        if (!buttons) {
            buttons = this.s.buttons;
        }
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            // Check if the button is a split one and if so, determine
            // its state
            if (button.isSplit) {
                var splitBtn = button.node.get(0).childNodes[1];
                if (this._checkAnyEnabled(button.buttons)) {
                    // Enable the split
                    Dom.s(splitBtn)
                        .classRemove(this.c.dom.button.disabled)
                        .prop('disabled', false);
                }
                else {
                    Dom.s(splitBtn)
                        .classAdd(this.c.dom.button.disabled)
                        .prop('disabled', false);
                }
            }
            else if (button.isCollection) {
                // Nest down into collections
                this._checkSplitEnable(button.buttons);
            }
        }
    }
    /**
     * Check an array of buttons and see if any are enabled in it
     *
     * @param buttons Button array
     * @returns true if a button is enabled, false otherwise
     */
    _checkAnyEnabled(buttons) {
        for (var i = 0; i < buttons.length; i++) {
            if (!buttons[i].disabled) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get the button object from a node (recursive)
     *
     * @param node Button node
     * @param buttons Button array, uses base if not defined
     * @return Button object
     */
    _nodeToButton(node, buttons) {
        if (!buttons) {
            buttons = this.s.buttons;
        }
        if (util.is.dom(node)) {
            node = node.get(0);
        }
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            if (buttons[i].node.get(0) === node ||
                buttons[i].nodeChild === node) {
                return buttons[i];
            }
            if (buttons[i].buttons.length) {
                var ret = this._nodeToButton(node, buttons[i].buttons);
                if (ret) {
                    return ret;
                }
            }
        }
    }
    /**
     * Get container array for a button from a button node (recursive)
     * @param node Button node
     * @param buttons Button array, uses base if not defined
     * @return Button's host array
     */
    _nodeToHost(node, buttons) {
        if (!buttons) {
            buttons = this.s.buttons;
        }
        if (util.is.dom(node)) {
            node = node.get(0);
        }
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            if (buttons[i].node.get(0) === node) {
                return buttons;
            }
            if (buttons[i].buttons.length) {
                var ret = this._nodeToHost(node, buttons[i].buttons);
                if (ret) {
                    return ret;
                }
            }
        }
    }
    /**
     * Handle a key press - determine if any button's key configured matches
     * what was typed and trigger the action if so.
     *
     * @param character The character pressed
     * @param e Key event that triggered this call
     */
    _keypress(character, e) {
        // Check if this button press already activated on another instance of Buttons
        if (e._buttonsHandled) {
            return;
        }
        var run = function (conf, node) {
            if (!conf.key) {
                return;
            }
            if (conf.key === character) {
                e._buttonsHandled = true;
                node.trigger('click');
            }
            else if (util.is.plainObject(conf.key)) {
                if (conf.key.key !== character) {
                    return;
                }
                if (conf.key.shiftKey && !e.shiftKey) {
                    return;
                }
                if (conf.key.altKey && !e.altKey) {
                    return;
                }
                if (conf.key.ctrlKey && !e.ctrlKey) {
                    return;
                }
                if (conf.key.metaKey && !e.metaKey) {
                    return;
                }
                // Made it this far - it is good
                e._buttonsHandled = true;
                node.trigger('click');
            }
        };
        var recurse = function (a) {
            for (var i = 0, ien = a.length; i < ien; i++) {
                run(a[i].conf, a[i].node);
                if (a[i].buttons.length) {
                    recurse(a[i].buttons);
                }
            }
        };
        recurse(this.s.buttons);
    }
    /**
     * Remove a key from the key listener for this instance (to be used when a
     * button is removed)
     *
     * @param conf Button configuration
     */
    _removeKey(conf) {
        if (conf.key) {
            var character = util.is.plainObject(conf.key)
                ? conf.key.key
                : conf.key;
            // Remove only one character, as multiple buttons could have the
            // same listening key
            var a = this.s.listenKeys.split('');
            var idx = a.indexOf(character);
            a.splice(idx, 1);
            this.s.listenKeys = a.join('');
        }
    }
    /**
     * Resolve a button configuration
     *
     * @param confIn Button config to resolve
     * @return Button configuration
     */
    _resolveExtends(confIn) {
        var that = this;
        var dt = this.s.dt;
        var i, ien;
        var toConfObject = function (base, lastConfig) {
            var loop = 0;
            // Loop until we have resolved to a button configuration, or an
            // array of button configurations (which will be iterated
            // separately)
            while (!util.is.plainObject(base) && !Array.isArray(base)) {
                if (base === undefined) {
                    return false;
                }
                if (typeof base === 'function') {
                    base = base.call(that, dt, lastConfig);
                    if (!base) {
                        return false;
                    }
                }
                else if (typeof base === 'string') {
                    if (!Buttons.buttons[base]) {
                        return { html: base };
                    }
                    base = Buttons.buttons[base];
                }
                loop++;
                if (loop > 30) {
                    // Protect against misconfiguration killing the browser
                    throw 'Buttons: Too many iterations';
                }
            }
            return Array.isArray(base) ? base : util.object.assign({}, base);
        };
        var confRes = toConfObject(confIn, confIn);
        if (confRes === false) {
            return false;
        }
        var conf = confRes;
        while (conf && conf.extend) {
            // Use `toConfObject` in case the button definition being extended
            // is itself a string or a function
            if (!Buttons.buttons[conf.extend]) {
                throw 'Cannot extend unknown button type: ' + conf.extend;
            }
            var objArray = toConfObject(Buttons.buttons[conf.extend], conf);
            if (Array.isArray(objArray)) {
                return objArray;
            }
            if (!objArray) {
                // This is a little brutal as it might be possible to have a
                // valid button without the extend, but if there is no extend
                // then the host button would be acting in an undefined state
                return false;
            }
            // Stash the current class name
            var originalClassName = objArray.className;
            conf = util.object.assign({}, objArray, conf);
            // The extend will have overwritten the original class name if the
            // `conf` object also assigned a class, but we want to concatenate
            // them so they are list that is combined from all extended buttons
            if (originalClassName && conf.className !== originalClassName) {
                conf.className = originalClassName + ' ' + conf.className;
            }
            // Although we want the `conf` object to overwrite almost all of
            // the properties of the object being extended, the `extend`
            // property should come from the object being extended
            conf.extend = objArray.extend;
        }
        // Buttons to be added to a collection  -gives the ability to define
        // if buttons should be added to the start or end of a collection
        var postfixButtons = conf.postfixButtons;
        if (postfixButtons) {
            if (!conf.buttons) {
                conf.buttons = [];
            }
            for (i = 0, ien = postfixButtons.length; i < ien; i++) {
                conf.buttons.push(postfixButtons[i]);
            }
        }
        var prefixButtons = conf.prefixButtons;
        if (prefixButtons) {
            if (!conf.buttons) {
                conf.buttons = [];
            }
            for (i = 0, ien = prefixButtons.length; i < ien; i++) {
                conf.buttons.splice(i, 0, prefixButtons[i]);
            }
        }
        return conf;
    }
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 */
/**
 * Show / hide a background layer behind a collection
 *
 * @param show Flag to indicate if the background should be shown or
 *   hidden
 * @param className Class to assign to the background
 * @param fade Fade time
 * @param insertPoint Define the insert point
 */
Buttons.background = function (show, className = '', fade = 400, insertPoint = document.body) {
    if (show) {
        let div = Dom.c('div').classAdd(className).css('opacity', '0');
        if (insertPoint === document.body) {
            div.appendTo(insertPoint);
        }
        else {
            div.insertAfter(insertPoint);
        }
        fadeIn(div, fade);
    }
    else {
        fadeOut(Dom.s('div.' + className), fade, function () {
            this.classRemove(className).remove();
        });
    }
};
Buttons.buttons = DataTable.ext.buttons;
/**
 * Instance selector - select Buttons instances based on an instance
 * selector value from the buttons assigned to a DataTable. This is only
 * useful if multiple instances are attached to a DataTable.
 *
 * @param group Instance selector - see `instance-selector` documentation on
 *   the DataTables site
 * @param Button instance array that was attached to the DataTables settings
 *   object
 * @return Buttons instances
 */
Buttons.instanceSelector = function (group, buttons) {
    // If no group selector, then return all
    if (group === undefined || group === null) {
        return buttons.map(v => v.inst);
    }
    var ret = [];
    var names = buttons.map(v => v.name);
    // Flatten the group selector into an array of single options
    var process = function (input) {
        if (Array.isArray(input)) {
            for (var i = 0, ien = input.length; i < ien; i++) {
                process(input[i]);
            }
            return;
        }
        if (typeof input === 'string') {
            if (input.indexOf(',') !== -1) {
                // String selector, list of names
                process(input.split(','));
            }
            else {
                // String selector individual name
                var idx = names.indexOf(input.trim());
                if (idx !== -1) {
                    ret.push(buttons[idx].inst);
                }
            }
        }
        else if (typeof input === 'number') {
            // Index selector
            ret.push(buttons[input].inst);
        }
        else if (util.is.element(input)) {
            // Element selector
            for (var j = 0; j < buttons.length; j++) {
                if (buttons[j].inst.dom.container.get(0) === input) {
                    ret.push(buttons[j].inst);
                }
            }
        }
        else if (typeof input === 'object') {
            // Actual instance selector
            ret.push(input);
        }
    };
    process(group);
    return ret;
};
/**
 * Button selector - select one or more buttons from a selector input so some
 * operation can be performed on them.
 * @param Button instances array that the selector should operate on
 * @param Button selector - see
 *   `button-selector` documentation on the DataTables site
 * @return Array of objects containing `inst` and `idx` properties of
 *   the selected buttons so you know which instance each button belongs to.
 */
Buttons.buttonSelector = function (insts, selector) {
    var ret = [];
    var nodeBuilder = function (a, buttons, baseIdx) {
        var button;
        var idx;
        for (var i = 0, ien = buttons.length; i < ien; i++) {
            button = buttons[i];
            if (button) {
                idx = baseIdx !== undefined ? baseIdx + i : i + '';
                a.push({
                    node: button.node,
                    name: button.conf.name,
                    idx: idx
                });
                if (button.buttons) {
                    nodeBuilder(a, button.buttons, idx + '-');
                }
            }
        }
    };
    var run = function (selector, inst) {
        var i, ien;
        var buttons = [];
        nodeBuilder(buttons, inst.s.buttons);
        var nodes = buttons.map(v => v.node.get(0));
        if (util.is.dom(selector)) {
            selector = selector.get();
        }
        if (selector && util.is.arrayLike(selector)) {
            for (i = 0, ien = selector.length; i < ien; i++) {
                run(selector[i], inst);
            }
            return;
        }
        if (selector === null ||
            selector === undefined ||
            selector === '*') {
            // Select all
            for (i = 0, ien = buttons.length; i < ien; i++) {
                ret.push({
                    inst: inst,
                    node: buttons[i].node
                });
            }
        }
        else if (typeof selector === 'number') {
            // Main button index selector
            if (inst.s.buttons[selector]) {
                ret.push({
                    inst: inst,
                    node: inst.s.buttons[selector].node
                });
            }
        }
        else if (typeof selector === 'string') {
            if (selector.indexOf(',') !== -1) {
                // Split
                var a = selector.split(',');
                for (i = 0, ien = a.length; i < ien; i++) {
                    run(a[i].trim(), inst);
                }
            }
            else if (selector.match(/^\d+(\-\d+)*$/)) {
                // Sub-button index selector
                var indexes = buttons.map(v => v.idx);
                ret.push({
                    inst: inst,
                    node: buttons[indexes.indexOf(selector)].node
                });
            }
            else if (selector.indexOf(':name') !== -1) {
                // Button name selector
                var name = selector.replace(':name', '');
                for (i = 0, ien = buttons.length; i < ien; i++) {
                    if (buttons[i].name === name) {
                        ret.push({
                            inst: inst,
                            node: buttons[i].node
                        });
                    }
                }
            }
            else {
                // CSS selector on the nodes
                Dom.s(nodes)
                    .filter(selector)
                    .each(function (el) {
                    ret.push({
                        inst: inst,
                        node: Dom.s(el)
                    });
                });
            }
        }
        else if (util.is.element(selector)) {
            // Node selector
            var idx = nodes.indexOf(selector);
            if (idx !== -1) {
                ret.push({
                    inst: inst,
                    node: Dom.s(nodes[idx])
                });
            }
        }
    };
    for (var i = 0, ien = insts.length; i < ien; i++) {
        var inst = insts[i];
        run(selector, inst);
    }
    return ret;
};
/**
 * Default function used for formatting output data.
 *
 * @param str Data to strip
 */
Buttons.stripData = function (input, config) {
    // If the input is an HTML element, we can use the HTML from it (HTML
    // might be stripped below).
    var str = input !== null &&
        typeof input === 'object' &&
        input.nodeName &&
        input.nodeType
        ? input.innerHTML
        : input;
    if (typeof str !== 'string') {
        return str;
    }
    // Always remove script tags
    str = Buttons.stripHtmlScript(str);
    // Always remove comments
    str = Buttons.stripHtmlComments(str);
    if (!config || config.stripHtml) {
        str = DataTable.util.stripHtml(str);
    }
    if (!config || config.trim) {
        str = str.trim();
    }
    if (!config || config.stripNewlines) {
        str = str.replace(/\n/g, ' ');
    }
    if (!config || config.decodeEntities) {
        if (_entityDecoder) {
            str = _entityDecoder(str);
        }
        else {
            _exportTextarea.innerHTML = str;
            str = _exportTextarea.value;
        }
    }
    // Prevent Excel from running a formula
    if (!config || config.escapeExcelFormula) {
        if (str.match(/^[=@\t\r]/)) {
            str = "'" + str;
        }
    }
    return str;
};
/**
 * Provide a custom entity decoding function - e.g. a regex one, which can
 * be much faster than the built in DOM option, but also larger code size.
 *
 * @param fn
 */
Buttons.entityDecoder = function (fn) {
    _entityDecoder = fn;
};
/**
 * Common function for stripping HTML comments
 *
 * @param input
 * @returns
 */
Buttons.stripHtmlComments = function (input) {
    var previous;
    do {
        previous = input;
        input = input.replace(/(<!--.*?--!?>)|(<!--[\S\s]+?--!?>)|(<!--[\S\s]*?$)/g, '');
    } while (input !== previous);
    return input;
};
/**
 * Common function for stripping HTML script tags
 *
 * @param string input
 * @returns
 */
Buttons.stripHtmlScript = function (input) {
    var previous;
    do {
        previous = input;
        input = input.replace(/<script\b[^<]*(?:(?!<\/script[^>]*>)<[^<]*)*<\/script[^>]*>/gi, '');
    } while (input !== previous);
    return input;
};
/**
 * Buttons defaults. For full documentation, please refer to the docs/option
 * directory or the DataTables site.
 */
Buttons.defaults = {
    buttons: ['copy', 'excel', 'csv', 'pdf', 'print'],
    name: 'main',
    tabIndex: 0,
    dom: {
        button: {
            tag: 'button',
            className: 'dt-button',
            active: 'dt-button-active', // class name
            disabled: 'disabled', // class name
            dropClass: '',
            dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>',
            liner: {
                tag: 'span',
                className: ''
            },
            spacer: {
                className: 'dt-button-spacer',
                tag: 'span'
            }
        },
        container: {
            tag: 'div',
            className: 'dt-buttons'
        },
        collection: {
            container: {
                // The element used for the dropdown
                className: 'dt-button-collection',
                content: {
                    className: '',
                    tag: 'div'
                },
                tag: 'div'
            }
            // optionally
            // , button: IButton - buttons inside the collection container
            // , split: ISplit - splits inside the collection container
        },
        split: {
            action: {
                // action button
                className: 'dt-button-split-drop-button dt-button',
                tag: 'button'
            },
            dropdown: {
                // button to trigger the dropdown
                align: 'split-right',
                className: 'dt-button-split-drop',
                splitAlignClass: 'dt-button-split-left',
                tag: 'button'
            },
            wrapper: {
                // wrap around both
                className: 'dt-button-split',
                tag: 'div'
            }
        }
    }
};
/**
 * Version information
 */
Buttons.version = '4.0.0-beta.1';
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Core Button types
 */
Buttons.buttons.collection = {
    text: function (dt) {
        return dt.i18n('buttons.collection', 'Collection');
    },
    className: 'buttons-collection',
    closeButton: false,
    dropIcon: true,
    init: function (dt, button) {
        button.attr('aria-expanded', false);
    },
    action: function (e, dt, button, config) {
        if (config._collection.isAttached()) {
            this.popover(false, config);
        }
        else {
            this.popover(config._collection, config);
        }
        // When activated using a key - auto focus on the
        // first item in the popover
        if (e.type === 'keypress') {
            config._collection.find('a, button').eq(0).focus();
        }
    },
    attr: {
        'aria-haspopup': 'dialog'
    }
    // Also the popover options, defined in Buttons.popover
};
Buttons.buttons.split = {
    text: function (dt) {
        return dt.i18n('buttons.split', 'Split');
    },
    className: 'buttons-split',
    closeButton: false,
    init: function (dt, button) {
        return button.attr('aria-expanded', false);
    },
    action: function (e, dt, button, config) {
        this.popover(config._collection, config);
    },
    attr: {
        'aria-haspopup': 'dialog'
    }
    // Also the popover options, defined in Buttons.popover
};
Buttons.buttons.copy = function (dt, conf) {
    if (Buttons.buttons.copyHtml5) {
        return 'copyHtml5';
    }
};
Buttons.buttons.csv = function (dt, conf) {
    if (typeof Buttons.buttons.csvHtml5 === 'object' &&
        Buttons.buttons.csvHtml5.available(dt, conf)) {
        return 'csvHtml5';
    }
};
Buttons.buttons.excel = function (dt, conf) {
    if (typeof Buttons.buttons.excelHtml5 === 'object' &&
        Buttons.buttons.excelHtml5.available(dt, conf)) {
        return 'excelHtml5';
    }
};
Buttons.buttons.pdf = function (dt, conf) {
    if (typeof Buttons.buttons.pdfHtml5 === 'object' &&
        Buttons.buttons.pdfHtml5.available(dt, conf)) {
        return 'pdfHtml5';
    }
};
Buttons.buttons.pageLength = function (dt) {
    var lengthMenu = dt.settings()[0].lengthMenu;
    var vals = [];
    var lang = [];
    var text = function (dt) {
        return dt.i18n('buttons.pageLength', {
            '-1': 'Show all rows',
            _: 'Show %d rows'
        }, dt.page.len());
    };
    // Support for DataTables 1.x 2D array
    if (Array.isArray(lengthMenu[0])) {
        vals = lengthMenu[0];
        lang = lengthMenu[1];
    }
    else {
        for (var i = 0; i < lengthMenu.length; i++) {
            var option = lengthMenu[i];
            // Support for DataTables 2 object in the array
            if (util.is.plainObject(option)) {
                vals.push(option.value);
                lang.push(option.label);
            }
            else {
                vals.push(option);
                lang.push(option);
            }
        }
    }
    return {
        extend: 'collection',
        text: text,
        className: 'buttons-page-length',
        autoClose: true,
        buttons: vals.map(function (val, i) {
            return {
                text: lang[i],
                className: 'button-page-length',
                action: function (e, dt) {
                    dt.page.len(val).draw();
                },
                init: function (dt, node, conf) {
                    var that = this;
                    var fn = function () {
                        that.active(dt.page.len() === val);
                    };
                    dt.on('length.dt' + conf.namespace, fn);
                    fn();
                },
                destroy: function (dt, node, conf) {
                    dt.off('length.dt' + conf.namespace);
                }
            };
        }),
        init: function (dt, node, conf) {
            var that = this;
            dt.on('length.dt' + conf.namespace, function () {
                that.text(conf.text);
            });
        },
        destroy: function (dt, node, conf) {
            dt.off('length.dt' + conf.namespace);
        }
    };
};
Buttons.buttons.spacer = {
    style: 'empty',
    spacer: true,
    text: function (dt) {
        return dt.i18n('buttons.spacer', '');
    }
};
Buttons.buttons.colOrder = function (dt, conf) {
    var columns = dt.columns(conf.columns).indexes().toArray();
    return {
        extend: 'collection',
        text: dt.i18n('buttons.order.dropdown', 'Order'),
        className: 'buttons-order',
        autoClose: true,
        buttons: columns.map(idx => ({
            extend: 'columnOrder',
            column: idx
        }))
    };
};
Buttons.buttons.columnOrder = function (dt, conf) {
    let column = dt.column(conf.column);
    let columnIdx = column.index();
    let orderSequence = dt.settings()[0].columns[columnIdx].orderSequence;
    let split = undefined;
    // Split buttons are only relevant if you can order both ways
    if (orderSequence.includes('asc') && orderSequence.includes('desc')) {
        split = [
            {
                text: column.title() +
                    ' ' +
                    dt.i18n('buttons.order.asc', 'ascending'),
                action: () => {
                    column.order('asc').draw();
                },
                init: function () {
                    dt.on('order', () => {
                        this.active(orderActive(dt, columnIdx, 'asc'));
                    });
                }
            },
            {
                text: column.title() +
                    ' ' +
                    dt.i18n('buttons.order.desc', 'descending'),
                action: () => {
                    column.order('desc').draw();
                },
                init: function () {
                    dt.on('order', () => {
                        this.active(orderActive(dt, columnIdx, 'desc'));
                    });
                }
            }
        ];
    }
    return {
        text: column.title(),
        className: 'buttons-column-order',
        action: function (e, dt, node, config, cb) {
            // Toggle between the first and second options in the order
            // sequence
            if (orderActive(dt, columnIdx, orderSequence[0]) &&
                orderSequence.length > 1) {
                column.order(orderSequence[1]).draw();
            }
            else {
                column.order(orderSequence[0]).draw();
            }
        },
        init: function (dt, node, config) {
            dt.on('order', () => {
                this.active(orderActive(dt, columnIdx));
            });
        },
        split: split
    };
};
/**
 * Determine if a column ordering is active
 *
 * @param dt Table in question
 * @param colIdx Column index
 * @param dir Direction. If given, direction is considered, if not any active
 *   ordering on the column is enough.
 * @returns True if the column is being ordered on, false otherwise
 */
function orderActive(dt, colIdx, dir) {
    let applied = dt.order();
    let orderIdx = applied.findIndex(prop => {
        return prop[0] === colIdx;
    });
    if (orderIdx === -1) {
        return false;
    }
    else if (dir) {
        return applied[orderIdx][1] === dir ? true : false;
    }
    return true;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables API
 *
 * For complete documentation, please refer to the docs/api directory or the
 * DataTables site
 */
const buttonSelector = function (group, selector) {
    // Argument shifting
    if (selector === undefined) {
        selector = group;
        group = null;
    }
    this.selector.buttonGroup = group;
    var res = this.iterator(true, 'table', function (ctx) {
        if (ctx._buttons) {
            return Buttons.buttonSelector(Buttons.instanceSelector(group, ctx._buttons), selector);
        }
    }, true);
    res._groupSelector = group;
    return res;
};
// Buttons group and individual button selector
DataTable.Api.register('buttons()', buttonSelector);
// Individual button selector
DataTable.Api.register('button()', function (group, selector) {
    let res = buttonSelector.call(this, group, selector);
    if (res.length > 1) {
        res.splice(1, res.length);
    }
    res._groupSelector = group;
    return res;
});
// Active buttons
DataTable.Api.registerPlural('buttons().active()', 'button().active()', function (flag) {
    if (flag === undefined) {
        return this.map(function (set) {
            return set.inst.active(set.node);
        });
    }
    return this.each(function (set) {
        set.inst.active(set.node, flag);
    });
});
// Get / set button action
DataTable.Api.registerPlural('buttons().action()', 'button().action()', function (action) {
    if (action === undefined) {
        return this.map(function (set) {
            return set.inst.action(set.node);
        });
    }
    return this.each(function (set) {
        set.inst.action(set.node, action);
    });
});
// Collection control
DataTable.Api.registerPlural('buttons().collectionRebuild()', 'button().collectionRebuild()', function (buttons) {
    return this.each(function (set) {
        for (var i = 0; i < buttons.length; i++) {
            if (typeof buttons[i] === 'object') {
                buttons[i].parentConf = set;
            }
        }
        set.inst.collectionRebuild(set.node, buttons);
    });
});
// Enable / disable buttons
DataTable.Api.register(['buttons().enable()', 'button().enable()'], function (flag) {
    return this.each(function (set) {
        set.inst.enable(set.node, flag);
    });
});
// Disable buttons
DataTable.Api.register(['buttons().disable()', 'button().disable()'], function () {
    return this.each(function (set) {
        set.inst.disable(set.node);
    });
});
// Button index
DataTable.Api.register('button().index()', function () {
    var idx = null;
    this.each(function (set) {
        var res = set.inst.index(set.node.get(0));
        if (res !== null) {
            idx = res;
        }
    });
    return idx;
});
// Get button nodes
DataTable.Api.registerPlural('buttons().nodes()', 'button().node()', function () {
    var d = new Dom();
    this.each(function (set) {
        d.add(set.inst.node(set.node).get(0));
    });
    return d;
});
// Get / set button processing state
DataTable.Api.registerPlural('buttons().processing()', 'button().processing()', function (flag) {
    if (flag === undefined) {
        return this.map(function (set) {
            return set.inst.processing(set.node);
        });
    }
    return this.each(function (set) {
        set.inst.processing(set.node, flag);
    });
});
// Get / set button text (i.e. the button labels)
DataTable.Api.registerPlural('buttons().text()', 'button().text()', function (label) {
    if (label === undefined) {
        return this.map(function (set) {
            return set.inst.text(set.node);
        });
    }
    return this.each(function (set) {
        set.inst.text(set.node, label);
    });
});
// Trigger a button's action
DataTable.Api.registerPlural('buttons().trigger()', 'button().trigger()', function () {
    return this.each(function (set) {
        set.inst.node(set.node).trigger('click');
    });
});
// Button resolver to the popover
DataTable.Api.register('button().popover()', function (content, options) {
    return this.map(set => {
        return set.inst.popover(content, this.button(this[0].node), options);
    });
});
// Get the container elements
DataTable.Api.register('buttons().containers()', function () {
    var domInst = new Dom();
    var groupSelector = this._groupSelector;
    // We need to use the group selector directly, since if there are no buttons
    // the result set will be empty
    this.iterator(true, 'table', function (ctx) {
        if (ctx._buttons) {
            var insts = Buttons.instanceSelector(groupSelector, ctx._buttons);
            for (var i = 0, ien = insts.length; i < ien; i++) {
                domInst = domInst.add(insts[i].container().get(0));
            }
        }
    });
    return domInst;
});
DataTable.Api.register('buttons().container()', function () {
    // API level of nesting is `buttons()` so we can zip into the containers method
    return this.containers().eq(0);
});
// Add a new button
DataTable.Api.register('button().add()', function (idx, conf, draw = true) {
    var ctx = this.context;
    var node;
    // Don't use `this` as it could be empty - select the instances directly
    if (ctx.length) {
        var inst = Buttons.instanceSelector(this._groupSelector, ctx[0]._buttons);
        if (inst.length) {
            node = inst[0].add(conf, idx, draw);
        }
    }
    return node ? this.button(this._groupSelector, node) : this;
});
// Destroy the button sets selected
DataTable.Api.register('buttons().destroy()', function () {
    this.pluck('inst')
        .unique()
        .each(function (inst) {
        inst.destroy();
    });
    return this;
});
// Remove a button
DataTable.Api.registerPlural('buttons().remove()', 'button().remove()', function () {
    this.each(function (set) {
        set.inst.remove(set.node);
    });
    return this;
});
// Information box that can be used by buttons
var _infoTimer;
DataTable.Api.register('buttons.info()', function (title, message, time) {
    var that = this;
    let info = Dom.s('#datatables_buttons_info');
    if (title === false) {
        this.off('destroy.btn-info');
        fadeOut(info, 400, function () {
            this.remove();
        });
        if (_infoTimer) {
            clearTimeout(_infoTimer);
            _infoTimer = null;
        }
        return this;
    }
    if (_infoTimer) {
        clearTimeout(_infoTimer);
    }
    info.remove();
    title = title ? '<h2>' + title + '</h2>' : '';
    fadeIn(Dom
        .c('div')
        .attr('id', 'datatables_buttons_info')
        .classAdd('dt-button-info')
        .html(title)
        .append(Dom.c('div')[typeof message === 'string' ? 'html' : 'append'](message))
        .css('display', 'none')
        .appendTo('body'));
    if (time !== undefined && time !== 0) {
        _infoTimer = setTimeout(function () {
            that.buttons.info(false);
        }, time);
    }
    this.on('destroy.btn-info', function () {
        that.buttons.info(false);
    });
    return this;
});
// Get data from the table for export - this is common to a number of plug-in
// buttons so it is included in the Buttons core library
DataTable.Api.register('buttons.exportData()', function (options) {
    if (this.context.length) {
        return _exportData(new DataTable.Api(this.context[0]), options);
    }
});
// Get information about the export that is common to many of the export data
// types (DRY)
DataTable.Api.register('buttons.exportInfo()', function (conf) {
    if (!conf) {
        conf = {};
    }
    return {
        filename: _filename(conf, this),
        title: _title(conf, this),
        messageTop: _message(this, conf, conf.message || conf.messageTop, 'top'),
        messageBottom: _message(this, conf, conf.messageBottom, 'bottom')
    };
});
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interface
 */
// Attach to DataTables objects for global access
DataTable.Buttons = Buttons;
// DataTables creation - check if the buttons have been defined for this table,
// they will have been if the `B` option was used in `dom`, otherwise we should
// create the buttons instance here so they can be inserted into the document
// using the API.
Dom.s(document).on('init.dt plugin-init.dt', function (e, settings) {
    if (e.namespace !== 'dt') {
        return;
    }
    var opts = settings.init.buttons || DataTable.defaults.buttons;
    if (opts && !settings._buttons) {
        new Buttons(settings, opts).container();
    }
});
function _init(settings, options) {
    var api = new DataTable.Api(settings);
    var opts = options
        ? options
        : api.init().buttons || DataTable.defaults.buttons;
    return new Buttons(api, opts).container();
}
// DataTables 1 `dom` feature option
DataTable.ext.feature.push({
    fnInit: _init,
    cFeature: 'B'
});
// DataTables 2 layout feature
if (DataTable.feature) {
    DataTable.feature.register('buttons', _init);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Local support function
 */
/**
 * Get the file name for an exported file.
 *
 * @param config Button configuration
 * @param dt DataTable instance
 */
var _filename = function (config, dt) {
    // Backwards compatibility
    var filename = config.filename === '*' &&
        config.title !== '*' &&
        config.title !== undefined &&
        config.title !== null &&
        config.title !== ''
        ? config.title
        : config.filename;
    if (typeof filename === 'function') {
        filename = filename(config, dt);
    }
    if (filename === undefined || filename === null) {
        return null;
    }
    if (filename.indexOf('*') !== -1) {
        filename = filename.replace(/\*/g, Dom.s('head > title').text()).trim();
    }
    // Strip characters which the OS will object to
    filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, '');
    var extension = _stringOrFunction(config.extension, config, dt);
    if (!extension) {
        extension = '';
    }
    return filename + extension;
};
/**
 * Simply utility method to allow parameters to be given as a function
 *
 * @param option Option
 * @return Resolved value
 */
var _stringOrFunction = function (option, config, dt) {
    if (option === null || option === undefined) {
        return null;
    }
    else if (typeof option === 'function') {
        return option(config, dt);
    }
    return option;
};
/**
 * Get the title for an exported file.
 *
 * @param config Button configuration
 * @param dt DataTable instance
 */
var _title = function (config, dt) {
    var title = _stringOrFunction(config.title, config, dt);
    return title === null
        ? null
        : title.indexOf('*') !== -1
            ? title.replace(/\*/g, Dom.s('head > title').text() || 'Exported data')
            : title;
};
var _message = function (dt, config, option, position) {
    var message = _stringOrFunction(option, config, dt);
    if (message === null) {
        return null;
    }
    var caption = Dom.s(dt.table().container()).find('caption').eq(0);
    if (message === '*') {
        var side = caption.css('caption-side');
        if (side !== position) {
            return null;
        }
        return caption.count() ? caption.text() : '';
    }
    return message;
};
var _exportData = function (dt, inOpts) {
    var config = util.object.assignDeep({}, {
        rows: null,
        columns: '',
        modifier: {
            search: 'applied',
            order: 'applied'
        },
        orthogonal: 'display',
        stripHtml: true,
        stripNewlines: true,
        decodeEntities: true,
        escapeExcelFormula: false,
        trim: true,
        format: {
            header: function (d) {
                return Buttons.stripData(d, config);
            },
            footer: function (d) {
                return Buttons.stripData(d, config);
            },
            body: function (d) {
                return Buttons.stripData(d, config);
            }
        },
        customizeData: null,
        customizeZip: null
    }, inOpts);
    var header = dt
        .columns(config.columns)
        .indexes()
        .map(function (idx) {
        var col = dt.column(idx);
        return config.format.header(col.title(), idx, col.header());
    })
        .toArray();
    var footer = dt.table().footer()
        ? dt
            .columns(config.columns)
            .indexes()
            .map(function (idx) {
            var el = dt.column(idx).footer();
            var val = '';
            if (el) {
                var inner = Dom.s(el).find('.dt-column-title');
                val = inner.count() ? inner.html() : Dom.s(el).html();
            }
            return config.format.footer(val, idx, el);
        })
            .toArray()
        : null;
    // If Select is available on this table, and any rows are selected, limit the export
    // to the selected rows. If no rows are selected, all rows will be exported. Specify
    // a `selected` modifier to control directly.
    var modifier = util.object.assign({}, config.modifier);
    if (dt.select &&
        typeof dt.select.info === 'function' &&
        modifier.selected === undefined) {
        if (dt
            .rows(config.rows, util.object.assign({ selected: true }, modifier))
            .any()) {
            util.object.assign(modifier, { selected: true });
        }
    }
    var rowIndexes = dt.rows(config.rows, modifier).indexes().toArray();
    var selectedCells = dt.cells(rowIndexes, config.columns, {
        order: modifier.order
    });
    var cells = selectedCells.render(config.orthogonal).toArray();
    var cellNodes = selectedCells.nodes().toArray();
    var cellIndexes = selectedCells.indexes().toArray();
    var columns = dt.columns(config.columns).count();
    var rows = columns > 0 ? cells.length / columns : 0;
    var body = [];
    var cellCounter = 0;
    for (var i = 0, ien = rows; i < ien; i++) {
        var row = [columns];
        for (var j = 0; j < columns; j++) {
            row[j] = config.format.body(cells[cellCounter], cellIndexes[cellCounter].row, cellIndexes[cellCounter].column, cellNodes[cellCounter]);
            cellCounter++;
        }
        body[i] = row;
    }
    var data = {
        header: header,
        headerStructure: _headerFormatter(config.format.header, dt.table().header.structure(config.columns)),
        footer: footer,
        footerStructure: _headerFormatter(config.format.footer, dt.table().footer.structure(config.columns)),
        body: body
    };
    if (config.customizeData) {
        config.customizeData(data);
    }
    return data;
};
function _headerFormatter(formatter, struct) {
    for (var i = 0; i < struct.length; i++) {
        for (var j = 0; j < struct[i].length; j++) {
            var item = struct[i][j];
            if (item) {
                item.title = formatter(item.title, j, item.cell);
            }
        }
    }
    return struct;
}


return DataTable;
}));
