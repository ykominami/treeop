import {
	Slickx
} from './slickx.js';

import {
	Jst
} from './jst.js';

$(document).ready(() => {
	const host = 'http://localhost:4567'
	const slickx = new Slickx(
		jQuery,
		"#txtSearch",
		"#myGrid",
		"score",
		'#upbtn',
		'#downbtn',
		'#jquery-ui-autocomplete-input',
		host,
		'/xml/bookmarks_count_json',
		'/xml/bookmarks_json',
		'/xml/add_bookmark',
		'/xml/delete_bookmark'
	);
	const category_url_path = '/xml/categories.json'
	const category_url = `${host}${category_url_path}`
	const jst = new Jst(jQuery, slickx, '#category-search', category_url);

	console.log("slickx.search_field=" + slickx.search_field);
});