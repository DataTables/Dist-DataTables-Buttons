/*!
 * Print button for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



var _link = document.createElement('a');

/**
 * Convert a URL from a relative to an absolute address so it will work
 * correctly in the popup window which has no base URL.
 *
 * @param  {string} href URL
 */
var _relToAbs = function (href) {
	// Assign to a link on the original page so the browser will do all the
	// hard work of figuring out where the file actually is
	_link.href = href;
	var linkHost = _link.host;

	// IE doesn't have a trailing slash on the host
	// Chrome has it on the pathname
	if (linkHost.indexOf('/') === -1 && _link.pathname.indexOf('/') !== 0) {
		linkHost += '/';
	}

	return _link.protocol + '//' + linkHost + _link.pathname + _link.search;
};

DataTable.ext.buttons.print = {
	className: 'buttons-print',

	text: function (dt) {
		return dt.i18n('buttons.print', 'Print');
	},

	action: function (e, dt, button, config, cb) {
		var data = dt.buttons.exportData(
			$.extend({ decodeEntities: false }, config.exportOptions) // XSS protection
		);
		var exportInfo = dt.buttons.exportInfo(config);

		// Get the classes for the columns from the header cells
		var columnClasses = dt
			.columns(config.exportOptions.columns)
			.nodes()
			.map(function (n) {
				return n.className;
			})
			.toArray();

		var addRow = function (d, tag) {
			var str = '<tr>';

			for (var i = 0, ien = d.length; i < ien; i++) {
				// null and undefined aren't useful in the print output
				var dataOut = d[i] === null || d[i] === undefined ? '' : d[i];
				var classAttr = columnClasses[i] ? 'class="' + columnClasses[i] + '"' : '';

				str += '<' + tag + ' ' + classAttr + '>' + dataOut + '</' + tag + '>';
			}

			return str + '</tr>';
		};

		// Construct a table for printing
		var html = '<table class="' + dt.table().node().className + '">';

		if (config.header) {
			var headerRows = data.headerStructure.map(function (row) {
				return (
					'<tr>' +
					row
						.map(function (cell) {
							return cell
								? '<th colspan="' +
										cell.colspan +
										'" rowspan="' +
										cell.rowspan +
										'">' +
										cell.title +
										'</th>'
								: '';
						})
						.join('') +
					'</tr>'
				);
			});

			html += '<thead>' + headerRows.join('') + '</thead>';
		}

		html += '<tbody>';
		for (var i = 0, ien = data.body.length; i < ien; i++) {
			html += addRow(data.body[i], 'td');
		}
		html += '</tbody>';

		if (config.footer && data.footer) {
			var footerRows = data.footerStructure.map(function (row) {
				return (
					'<tr>' +
					row
						.map(function (cell) {
							return cell
								? '<th colspan="' +
										cell.colspan +
										'" rowspan="' +
										cell.rowspan +
										'">' +
										cell.title +
										'</th>'
								: '';
						})
						.join('') +
					'</tr>'
				);
			});

			html += '<tfoot>' + footerRows.join('') + '</tfoot>';
		}
		html += '</table>';

		// Open a new window for the printable table
		var win = window.open('', '');

		if (!win) {
			dt.buttons.info(
				dt.i18n('buttons.printErrorTitle', 'Unable to open print view'),
				dt.i18n(
					'buttons.printErrorMsg',
					'Please allow popups in your browser for this site to be able to view the print view.'
				),
				5000
			);

			return;
		}

		win.document.close();

		// Inject the title and also a copy of the style and link tags from this
		// document so the table can retain its base styling. This avoids
		// issues with Content Security Policy (CSP) and is compatible with modern browsers.
		win.document.title = exportInfo.title;

		$('style, link[rel="stylesheet"]').each(function () {
			let node = this.cloneNode(true);

			if (node.tagName.toLowerCase() === 'link') {
				node.href = _relToAbs(node.href);
			}

			win.document.head.appendChild(node);
		});

		// Add any custom scripts (for example for paged.js)
		if (config.customScripts) {
			config.customScripts.forEach(function (script) {
				var tag = win.document.createElement('script');
				tag.src = script;
				win.document.getElementsByTagName('head')[0].appendChild(tag);
			});
		}

		// Inject the table and other surrounding information
		win.document.body.innerHTML =
			'<h1>' +
			exportInfo.title +
			'</h1>' +
			'<div>' +
			(exportInfo.messageTop || '') +
			'</div>' +
			html +
			'<div>' +
			(exportInfo.messageBottom || '') +
			'</div>';

		$(win.document.body).addClass('dt-print-view');

		$('img', win.document.body).each(function (i, img) {
			img.setAttribute('src', _relToAbs(img.getAttribute('src')));
		});

		if (config.customize) {
			config.customize(win, config, dt);
		}

		// Allow stylesheets time to load
		var autoPrint = function () {
			if (config.autoPrint) {
				win.print(); // blocking - so close will not
				win.close(); // execute until this is done
			}
		};

		win.setTimeout(autoPrint, 1000);

		cb();
	},

	async: 100,

	title: '*',

	messageTop: '*',

	messageBottom: '*',

	exportOptions: {},

	header: true,

	footer: true,

	autoPrint: true,

	customize: null
};


return DataTable;
}));
